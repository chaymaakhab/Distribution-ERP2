import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Phone, CheckCircle2, Clock, AlertCircle, Building2, User, Search, RotateCcw, Filter, Calendar } from 'lucide-react';

export interface CommercialVisitItem {
  id: number;
  customer: string;
  city: string;
  commercial: string;
  scheduled_at: string;
  type: 'Prospection' | 'Prise de commande' | 'Recouvrement' | 'Litige / Réclamation';
  status: 'Planifiée' | 'En cours' | 'Réalisée' | 'Reportée' | 'Annulée';
  notes: string;
  order_taken?: boolean;
  lat?: number;
  lng?: number;
}

// Known coordinates for clients across Moroccan commercial sectors
const SECTOR_COORDS: Record<string, [number, number]> = {
  'atlas équipements sarl': [33.6025, -7.5312], // Casablanca Aïn Sebaâ
  'comptoir al amal': [34.0410, -5.0080],        // Fès Dokkarat
  'batipro maroc': [34.0040, -6.8520],           // Rabat Agdal
  'nord industrie': [35.7280, -5.8940],          // Tanger Gzenaya
  'maison du bricolage': [31.6360, -8.0120],     // Marrakech Géliz
  'quincaillerie saada': [30.4180, -9.5750],     // Agadir Dakhla
};

// Regional Hubs
const HUBS = [
  { name: 'Hub Commercial Casablanca', coords: [33.5980, -7.5340] as [number, number] },
  { name: 'Hub Commercial Rabat-Salé', coords: [33.9850, -6.8490] as [number, number] },
  { name: 'Hub Commercial Fès-Meknès', coords: [34.0331, -5.0003] as [number, number] },
  { name: 'Hub Commercial Nord Tanger', coords: [35.7595, -5.8340] as [number, number] },
  { name: 'Hub Commercial Sud Marrakech', coords: [31.6595, -8.0211] as [number, number] },
  { name: 'Hub Commercial Souss Agadir', coords: [30.4478, -9.6281] as [number, number] },
];

function getVisitCoords(v: CommercialVisitItem, idx: number): [number, number] {
  if (v.lat && v.lng) return [v.lat, v.lng];
  const lowCust = (v.customer || '').toLowerCase().trim();
  if (SECTOR_COORDS[lowCust]) return SECTOR_COORDS[lowCust];

  const city = (v.city || '').toLowerCase();
  if (city.includes('casa')) return [33.5731 + (idx * 0.015), -7.5898 + (idx * 0.012)];
  if (city.includes('fès') || city.includes('fes')) return [34.0331 + (idx * 0.012), -5.0003 + (idx * 0.015)];
  if (city.includes('rabat')) return [34.0209 + (idx * 0.015), -6.8416 + (idx * 0.012)];
  if (city.includes('tang')) return [35.7595 + (idx * 0.015), -5.8340 + (idx * 0.012)];
  if (city.includes('marrak')) return [31.6295 + (idx * 0.015), -7.9811 + (idx * 0.012)];
  if (city.includes('agad')) return [30.4278 + (idx * 0.015), -9.5981 + (idx * 0.012)];
  return [33.5731 + (idx * 0.02), -7.5898 + (idx * 0.02)];
}

const VISITS_MAP_CSS = `
.commercial-visits-map-container {
  width: 100%;
  height: 520px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}
.visit-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transform: translate(-50%, -100%);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.visit-pin:hover {
  transform: translate(-50%, -110%) scale(1.15);
  z-index: 9999 !important;
}
.visit-pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: visitRadarPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  pointer-events: none;
}
@keyframes visitRadarPulse {
  0% { width: 22px; height: 22px; opacity: 0.9; }
  70% { width: 55px; height: 55px; opacity: 0; }
  100% { width: 60px; height: 60px; opacity: 0; }
}
`;

interface RealCommercialVisitsMapProps {
  visits: CommercialVisitItem[];
  onStatusChange?: (id: number, status: CommercialVisitItem['status']) => void;
}

export function RealCommercialVisitsMap({ visits, onStatusChange }: RealCommercialVisitsMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [repFilter, setRepFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = visits.filter((v) => {
    const matchRep = repFilter === 'all' || v.commercial === repFilter;
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchRep && matchStatus;
  });

  const reps = Array.from(new Set(visits.map((v) => v.commercial)));

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [33.2, -6.8],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    layerGroupRef.current = group;
    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Plot Hubs & Client Visits
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Plot Hubs
    HUBS.forEach((hub) => {
      const hubHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); opacity: 0.85;">
          <div style="padding: 3px 6px; border-radius: 6px; background: #0f172a; border: 1.5px solid #3b82f6; color: #93c5fd; font-size: 10px; font-weight: 700; white-space: nowrap;">
            🏢 ${hub.name}
          </div>
          <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #3b82f6;"></div>
        </div>
      `;
      const hubIcon = L.divIcon({
        html: hubHtml,
        className: 'hub-pin',
        iconSize: [120, 28],
        iconAnchor: [60, 28],
      });
      L.marker(hub.coords, { icon: hubIcon }).addTo(group);
    });

    // 2. Plot Visits
    filtered.forEach((v, idx) => {
      const coords = getVisitCoords(v, idx);

      const isDone = v.status === 'Réalisée';
      const isCurrent = v.status === 'En cours';
      const isPostponed = v.status === 'Reportée' || v.status === 'Annulée';

      const tone = isDone ? '#10b981' : isCurrent ? '#0284c7' : isPostponed ? '#f59e0b' : '#8b5cf6';
      const bgTone = isDone ? '#064e3b' : isCurrent ? '#075985' : isPostponed ? '#78350f' : '#4c1d95';
      const iconSymbol = isDone ? '✓' : isCurrent ? '🚶' : isPostponed ? '⏳' : '📅';

      const visitHtml = `
        <div class="visit-pin" style="position: relative;">
          ${isCurrent ? `<div class="visit-pulse-ring" style="background: rgba(2,132,199,0.4); border: 2px solid #38bdf8;"></div>` : ''}
          <div style="display: flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 18px; background: #090e17; border: 2px solid ${tone}; color: #ffffff; font-size: 11px; font-weight: 800; box-shadow: 0 4px 14px rgba(0,0,0,0.5); white-space: nowrap;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; background: ${bgTone}; font-size: 10px;">${iconSymbol}</span>
            <span>${v.customer}</span>
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${tone};"></div>
        </div>
      `;

      const visitIcon = L.divIcon({
        className: 'commercial-visit-marker',
        html: visitHtml,
        iconSize: [140, 34],
        iconAnchor: [70, 34],
      });

      const marker = L.marker(coords, { icon: visitIcon }).addTo(group);

      const popupHtml = `
        <div style="font-family: inherit; min-width: 230px; padding: 4px; color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 6px;">
            <div>
              <b style="color: #38bdf8; font-size: 13px; display: block;">${v.customer}</b>
              <span style="font-size: 11px; color: #94a3b8;">${v.city}</span>
            </div>
            <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${bgTone}; color: ${tone}; border: 1px solid ${tone};">
              ${v.status}
            </span>
          </div>
          <p style="margin: 0 0 3px; font-size: 11px; color: #cbd5e1;">👤 Commercial: <b>${v.commercial}</b></p>
          <p style="margin: 0 0 3px; font-size: 11px; color: #cbd5e1;">⏰ Horaire: <b>${v.scheduled_at}</b></p>
          <p style="margin: 0 0 6px; font-size: 11px; color: #e2e8f0;">🎯 Type: <b>${v.type}</b></p>
          ${v.notes ? `<p style="margin: 0 0 8px; font-size: 10.5px; color: #cbd5e1; background: rgba(255,255,255,0.06); padding: 5px 8px; border-radius: 6px;">📝 ${v.notes}</p>` : ''}
          ${v.order_taken ? `<p style="margin: 0 0 8px; font-size: 10.5px; color: #34d399; font-weight: 700;">✅ Commande terrain signée</p>` : ''}
          <div style="display: flex; gap: 6px; margin-top: 4px;">
            <button id="btn-in-progress-${v.id}" style="flex: 1; background: #0284c7; color: white; border: none; padding: 5px 6px; border-radius: 6px; font-size: 10.5px; font-weight: 700; cursor: pointer;">
              📍 Check-in
            </button>
            <button id="btn-complete-${v.id}" style="flex: 1; background: #10b981; color: white; border: none; padding: 5px 6px; border-radius: 6px; font-size: 10.5px; font-weight: 700; cursor: pointer;">
              ✓ Réalisée
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btnInProg = document.getElementById(`btn-in-progress-${v.id}`);
        const btnComp = document.getElementById(`btn-complete-${v.id}`);
        if (btnInProg) {
          btnInProg.onclick = () => {
            onStatusChange?.(v.id, 'En cours');
            map.closePopup();
          };
        }
        if (btnComp) {
          btnComp.onclick = () => {
            onStatusChange?.(v.id, 'Réalisée');
            map.closePopup();
          };
        }
      });
    });
  }, [filtered, onStatusChange]);

  const handleResetMorocco = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([33.2, -6.8], 6, { duration: 1 });
  };

  return (
    <div className="commercial-visits-map-container">
      <style>{VISITS_MAP_CSS}</style>

      {/* Floating Toolbar Filter */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          right: 12,
          zIndex: 400,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto', flexWrap: 'wrap' }}>
          {/* Commercial filter */}
          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tous les commerciaux ({reps.length})</option>
            {reps.map((rep) => (
              <option key={rep} value={rep}>{rep}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="En cours">🔵 En cours (sur place)</option>
            <option value="Réalisée">🟢 Réalisée</option>
            <option value="Planifiée">🟣 Planifiée</option>
            <option value="Reportée">🟠 Reportée</option>
          </select>
        </div>

        <button
          onClick={handleResetMorocco}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <RotateCcw size={12} /> Vue Maroc
        </button>
      </div>

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
