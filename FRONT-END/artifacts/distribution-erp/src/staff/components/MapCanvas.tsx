import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { WarehouseNode } from '../api';
import { formatMoney } from '../api';
import { MapPin, Search, Maximize2, RotateCcw, Building2, Phone, User, Package, Navigation, Layers } from 'lucide-react';

// Coordinates for Moroccan major logistic hubs (fallback if lat/lng is missing)
const MOROCCO_CITY_COORDS: Record<string, [number, number]> = {
  casablanca: [33.5731, -7.5898],
  rabat: [34.0209, -6.8416],
  tanger: [35.7595, -5.8340],
  marrakech: [31.6295, -7.9811],
  'fès': [34.0331, -5.0003],
  fes: [34.0331, -5.0003],
  agadir: [30.4278, -9.5981],
  oujda: [34.6814, -1.9086],
  kenitra: [34.2610, -6.5802],
  meknes: [33.8938, -5.5516],
  tetouan: [35.5785, -5.3684],
  laayoune: [27.1536, -13.2033],
};

function getWarehouseCoords(w: WarehouseNode): [number, number] {
  if (w.lat && w.lng && !isNaN(Number(w.lat)) && !isNaN(Number(w.lng))) {
    return [Number(w.lat), Number(w.lng)];
  }
  const cityKey = (w.city || '').toLowerCase().trim();
  if (MOROCCO_CITY_COORDS[cityKey]) {
    return MOROCCO_CITY_COORDS[cityKey];
  }
  return [33.5731, -7.5898]; // Default Casablanca
}

function statusColor(status: string): { bg: string; border: string; glow: string; text: string } {
  const s = (status || '').toLowerCase();
  if (s.includes('satur') || s.includes('warn')) {
    return { bg: '#f59e0b', border: '#d97706', glow: 'rgba(245, 158, 11, 0.45)', text: '#fbbf24' };
  }
  if (s.includes('inact') || s.includes('ferm')) {
    return { bg: '#ef4444', border: '#dc2626', glow: 'rgba(239, 68, 68, 0.45)', text: '#f87171' };
  }
  return { bg: '#10b981', border: '#059669', glow: 'rgba(16, 185, 129, 0.45)', text: '#34d399' };
}

// Injected CSS for Leaflet styling, custom pins and popups
const MAP_STYLES = `
.leaflet-container {
  font-family: inherit !important;
  background-color: #0b1320 !important;
  border-radius: 12px;
  overflow: hidden;
  z-index: 1;
}
.sx-real-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.sx-real-marker:hover {
  transform: translate(-50%, -108%) scale(1.12);
  z-index: 1000 !important;
}
.sx-marker-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 20px;
  background: #0f172a;
  border: 2px solid;
  color: #f8fafc;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(0,0,0,0.5);
  white-space: nowrap;
}
.sx-marker-pointer {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 7px solid #0f172a;
  margin-top: -1px;
}
.sx-marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: markerPulsePing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  pointer-events: none;
}
@keyframes markerPulsePing {
  0% { width: 20px; height: 20px; opacity: 0.8; }
  70% { width: 50px; height: 50px; opacity: 0; }
  100% { width: 55px; height: 55px; opacity: 0; }
}
.leaflet-popup-content-wrapper {
  background: rgba(15, 23, 42, 0.95) !important;
  color: #f8fafc !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(12px) !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.6) !important;
  padding: 0 !important;
}
.leaflet-popup-content {
  margin: 14px 16px !important;
  line-height: 1.4 !important;
}
.leaflet-popup-tip {
  background: rgba(15, 23, 42, 0.95) !important;
}
.leaflet-container a.leaflet-popup-close-button {
  color: #94a3b8 !important;
  padding: 8px 10px !important;
}
.leaflet-container a.leaflet-popup-close-button:hover {
  color: #f8fafc !important;
}
`;

export function MapCanvas({
  warehouses,
  selectedId,
  onSelect,
  compact = false,
}: {
  warehouses: WarehouseNode[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.Polyline | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'actif' | 'sature'>('all');
  const [mapTheme, setMapTheme] = useState<'voyager' | 'dark' | 'osm'>('voyager');

  // Filtered warehouses
  const filtered = warehouses.filter((w) => {
    const matchSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'actif'
        ? w.status.toLowerCase().includes('actif')
        : w.status.toLowerCase().includes('satur');
    return matchSearch && matchStatus;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center of Morocco
    const center: [number, number] = [31.7917, -7.0926];
    const initialZoom = compact ? 5 : 6;

    const map = L.map(containerRef.current, {
      center,
      zoom: initialZoom,
      zoomControl: !compact,
      attributionControl: false,
      scrollWheelZoom: !compact,
    });

    // Tile Layer: CartoDB Voyager (clean, modern, fast tiles)
    const getTileUrl = (theme: string) => {
      if (theme === 'dark') return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      if (theme === 'osm') return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    };

    const tileLayer = L.tileLayer(getTileUrl(mapTheme), {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Fix possible render issues when loaded in tabs/panels
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [compact]);

  // Update Markers when warehouses or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const plottable = filtered.filter((w) => w.lat !== null && w.lng !== null);
    if (plottable.length === 0) return;

    // Draw inter-depot transit corridor polyline
    const depotCoords = plottable.map(getWarehouseCoords);
    if (corridorsLayerRef.current) {
      corridorsLayerRef.current.remove();
    }

    if (!compact && depotCoords.length > 1) {
      // Create connecting corridors between central logistic spine
      const centralSpine = depotCoords.slice(0, 5);
      const corridors = L.polyline(centralSpine, {
        color: '#0284c7',
        weight: 2,
        opacity: 0.5,
        dashArray: '6, 8',
      }).addTo(map);
      corridorsLayerRef.current = corridors;
    }

    plottable.forEach((w) => {
      const coords = getWarehouseCoords(w);
      const tone = statusColor(w.status);
      const isSelected = selectedId === w.id;

      // Custom HTML Marker with Pulse & Badge
      const html = `
        <div class="sx-real-marker" id="depot-marker-${w.id}">
          ${isSelected ? `<div class="sx-marker-pulse" style="background: ${tone.bg};"></div>` : ''}
          <div class="sx-marker-badge" style="border-color: ${tone.border}; box-shadow: 0 6px 14px ${tone.glow};">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${tone.bg}; flex-shrink: 0;"></span>
            <span>${compact ? w.code : `${w.city} (${w.code})`}</span>
          </div>
          <div class="sx-marker-pointer" style="border-top-color: ${tone.border};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-warehouse-pin',
        html,
        iconSize: [120, 36],
        iconAnchor: [60, 36],
      });

      const marker = L.marker(coords, { icon: customIcon }).addTo(markersGroup);

      // Warehouse Coverage Zone (Radius Circle)
      if (!compact) {
        L.circle(coords, {
          radius: 40000, // 40 km coverage
          color: tone.border,
          fillColor: tone.bg,
          fillOpacity: isSelected ? 0.16 : 0.07,
          weight: 1,
          dashArray: '4, 6',
        }).addTo(markersGroup);
      }

      // Rich Interactive Popup
      const popupHtml = `
        <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 10px;">
            <div>
              <span style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">${w.code}</span>
              <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #f8fafc;">${w.name}</h3>
            </div>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 12px; background: ${tone.bg}22; color: ${tone.text}; border: 1px solid ${tone.border};">
              ${w.status}
            </span>
          </div>

          <div style="font-size: 12px; color: #94a3b8; display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #64748b;">📍</span>
              <span style="color: #cbd5e1;">${w.address || w.city}</span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: #64748b;">Valeur Stock / CA:</span>
              <strong style="color: #38bdf8; font-weight: 700;">${formatMoney(w.revenue)} DH</strong>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="color: #64748b;">Stock dispo:</span>
              <strong style="color: #10b981;">${w.stock_available ?? 0} unités</strong>
            </div>
            ${w.manager_name ? `
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
              <span style="color: #64748b;">👤</span>
              <span style="color: #e2e8f0;">${w.manager_name} ${w.phone ? `(${w.phone})` : ''}</span>
            </div>` : ''}
          </div>

          <button id="btn-select-depot-${w.id}" style="width: 100%; background: #0284c7; color: #ffffff; border: none; padding: 7px 12px; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.15s ease;">
            Inspecter ce dépôt & Stock →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelect?.(w.id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-depot-${w.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelect?.(w.id);
            map.closePopup();
          };
        }
      });
    });
  }, [filtered, selectedId, compact, onSelect]);

  // Pan to selected depot when selectedId changes
  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current) return;
    const target = warehouses.find((w) => w.id === selectedId);
    if (target) {
      const coords = getWarehouseCoords(target);
      mapInstanceRef.current.flyTo(coords, compact ? 7 : 8, { duration: 1.2 });
    }
  }, [selectedId, warehouses, compact]);

  // Reset to full Morocco view
  const handleFitMorocco = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([31.7917, -7.0926], compact ? 5 : 6, { duration: 1.2 });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: compact ? 260 : 540, borderRadius: 12, overflow: 'hidden' }}>
      <style>{MAP_STYLES}</style>

      {/* Interactive Map Header Controls (Non-compact only) */}
      {!compact && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
            pointerEvents: 'none',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 8,
              padding: '4px 10px',
              gap: 8,
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            }}
          >
            <Search size={14} color="#94a3b8" />
            <input
              type="text"
              placeholder="Filtrer dépôt, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '12px',
                outline: 'none',
                width: 160,
              }}
            />
          </div>

          {/* Quick Actions */}
          <div style={{ pointerEvents: 'auto', display: 'flex', gap: 6 }}>
            <button
              onClick={handleFitMorocco}
              title="Recadrer sur l'ensemble du Royaume du Maroc"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              }}
            >
              <RotateCcw size={13} color="#38bdf8" />
              Vue Royaume ({warehouses.length} Dépôts)
            </button>
          </div>
        </div>
      )}

      {/* The Leaflet Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Status Indicator on Bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 8,
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: '10.5px',
          color: '#cbd5e1',
          pointerEvents: 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          Actif
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          Saturé
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          Inactif
        </span>
      </div>
    </div>
  );
}

export function MapLegend() {
  return (
    <div className="sx-map-legend" style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '11px', color: '#94a3b8' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        Dépôt Opérationnel
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
        Seuil Alerte Stock
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
        Fermé / Maintenance
      </span>
    </div>
  );
}
