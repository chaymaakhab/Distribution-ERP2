import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Package, Truck, Warehouse, CheckCircle2, Clock, AlertTriangle, Layers, RotateCcw, MapPin, Eye } from 'lucide-react';
import { formatMoney } from '../api';

export interface OrderExpeditionItem {
  ref: string;
  customer: string;
  city: string;
  date: string;
  total: number;
  status: 'À valider' | 'Confirmée' | 'En préparation' | 'Préparée' | 'En livraison' | 'Livrée' | 'Annulée';
  source: string;
  items_count: number;
}

const CITY_COORDS: Record<string, [number, number]> = {
  casablanca: [33.5731, -7.5898],
  rabat: [34.0209, -6.8416],
  marrakech: [31.6295, -7.9811],
  'fès': [34.0331, -5.0003],
  fes: [34.0331, -5.0003],
  tanger: [35.7595, -5.8340],
  agadir: [30.4278, -9.5981],
  'meknès': [33.8938, -5.5516],
  meknes: [33.8938, -5.5516],
  'kénitra': [34.2610, -6.5802],
  kenitra: [34.2610, -6.5802],
  oujda: [34.6814, -1.9086],
};

const DISPATCH_DEPOTS = [
  { name: 'Dépôt Central Casablanca', city: 'casablanca', coords: [33.5980, -7.5340] as [number, number] },
  { name: 'Hub Régional Rabat', city: 'rabat', coords: [33.9850, -6.8490] as [number, number] },
  { name: 'Hub Nord Tanger Med', city: 'tanger', coords: [35.7595, -5.8340] as [number, number] },
  { name: 'Hub Fès-Meknès', city: 'fès', coords: [34.0331, -5.0003] as [number, number] },
  { name: 'Hub Marrakech-Sud', city: 'marrakech', coords: [31.6595, -8.0211] as [number, number] },
  { name: 'Hub Souss Agadir', city: 'agadir', coords: [30.4478, -9.6281] as [number, number] },
];

function getDispatchDepotForCity(city: string) {
  const c = city.toLowerCase();
  if (c.includes('rabat') || c.includes('kénitra') || c.includes('kenitra')) return DISPATCH_DEPOTS[1];
  if (c.includes('tang')) return DISPATCH_DEPOTS[2];
  if (c.includes('fès') || c.includes('fes') || c.includes('mekn')) return DISPATCH_DEPOTS[3];
  if (c.includes('marrak')) return DISPATCH_DEPOTS[4];
  if (c.includes('agad')) return DISPATCH_DEPOTS[5];
  return DISPATCH_DEPOTS[0]; // Casablanca default
}

const ORDERS_MAP_CSS = `
.orders-expedition-map-container {
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  margin-bottom: 20px;
}
.order-exp-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transform: translate(-50%, -100%);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.order-exp-pin:hover {
  transform: translate(-50%, -110%) scale(1.15);
  z-index: 9999 !important;
}
.order-pulse-beacon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  animation: orderPulseBeacon 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  pointer-events: none;
}
@keyframes orderPulseBeacon {
  0% { width: 20px; height: 20px; opacity: 0.9; }
  100% { width: 55px; height: 55px; opacity: 0; }
}
`;

export function RealOrdersExpeditionMap({
  orders,
  onInspectOrder,
}: {
  orders: OrderExpeditionItem[];
  onInspectOrder?: (order: OrderExpeditionItem) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'in_delivery') return o.status === 'En livraison';
    if (statusFilter === 'prep') return o.status === 'En préparation' || o.status === 'Préparée';
    if (statusFilter === 'delivered') return o.status === 'Livrée';
    if (statusFilter === 'pending') return o.status === 'À valider' || o.status === 'Confirmée';
    return true;
  });

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

  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Plot Warehouses / Hubs
    DISPATCH_DEPOTS.forEach((dep) => {
      const depHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="padding: 3px 6px; border-radius: 6px; background: #0f172a; border: 1.5px solid #3b82f6; color: #93c5fd; font-size: 10px; font-weight: 800; white-space: nowrap;">
            🏭 ${dep.name}
          </div>
          <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #3b82f6;"></div>
        </div>
      `;
      const depIcon = L.divIcon({
        html: depHtml,
        className: 'warehouse-pin',
        iconSize: [140, 28],
        iconAnchor: [70, 28],
      });
      L.marker(dep.coords, { icon: depIcon }).addTo(group);
    });

    // 2. Plot Orders
    filtered.forEach((o, idx) => {
      const cityKey = o.city.toLowerCase().trim();
      const baseCoords = CITY_COORDS[cityKey] || [33.5731, -7.5898];
      const offsetLat = ((idx % 4) - 1.5) * 0.02;
      const offsetLng = (((idx + 1) % 4) - 1.5) * 0.025;
      const clientCoords: [number, number] = [baseCoords[0] + offsetLat, baseCoords[1] + offsetLng];

      const dep = getDispatchDepotForCity(o.city);

      // Draw corridor line
      const isInDelivery = o.status === 'En livraison';
      const isDelivered = o.status === 'Livrée';
      const isPrep = o.status === 'En préparation' || o.status === 'Préparée';

      const tone = isDelivered ? '#10b981' : isInDelivery ? '#0284c7' : isPrep ? '#f59e0b' : '#a855f7';
      const bgTone = isDelivered ? '#064e3b' : isInDelivery ? '#075985' : isPrep ? '#78350f' : '#581c87';
      const iconSymbol = isDelivered ? '✓' : isInDelivery ? '🚚' : isPrep ? '📦' : '⏳';

      if (isInDelivery || isPrep) {
        L.polyline([dep.coords, clientCoords], {
          color: tone,
          weight: 2.5,
          opacity: 0.6,
          dashArray: '6, 6',
        }).addTo(group);
      }

      const orderHtml = `
        <div class="order-exp-pin" style="position: relative;">
          ${isInDelivery ? `<div class="order-pulse-beacon" style="background: rgba(2,132,199,0.35); border: 2px solid #38bdf8;"></div>` : ''}
          <div style="display: flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 16px; background: #090e17; border: 2px solid ${tone}; color: #ffffff; font-size: 11px; font-weight: 800; box-shadow: 0 4px 12px rgba(0,0,0,0.5); white-space: nowrap;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; background: ${bgTone}; font-size: 10px;">${iconSymbol}</span>
            <span>${o.ref} · ${o.customer}</span>
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${tone};"></div>
        </div>
      `;

      const orderIcon = L.divIcon({
        className: 'order-pin-marker',
        html: orderHtml,
        iconSize: [160, 32],
        iconAnchor: [80, 32],
      });

      const marker = L.marker(clientCoords, { icon: orderIcon }).addTo(group);

      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 210px; padding: 4px; color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 4px;">
            <b style="color: #38bdf8; font-size: 13px;">${o.ref}</b>
            <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${bgTone}; color: ${tone};">${o.status}</span>
          </div>
          <p style="margin: 0 0 2px; font-size: 12px; font-weight: 700;">🏢 ${o.customer}</p>
          <p style="margin: 0 0 4px; font-size: 11px; color: #94a3b8;">📍 Ville : ${o.city} · Dépôt : ${dep.name}</p>
          <div style="display: flex; justify-content: space-between; font-size: 11.5px; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 6px; margin: 4px 0 6px;">
            <span>Articles : <b>${o.items_count} réf</b></span>
            <span style="color: #34d399; font-weight: 700;">${formatMoney(o.total)} DH</span>
          </div>
          <button id="btn-inspect-${o.ref}" style="width: 100%; background: #0284c7; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
            Consulter les documents →
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${o.ref}`);
        if (btn) {
          btn.onclick = () => {
            onInspectOrder?.(o);
            map.closePopup();
          };
        }
      });
    });
  }, [filtered, onInspectOrder]);

  const handleResetMorocco = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([33.2, -6.8], 6, { duration: 1 });
  };

  return (
    <div className="orders-expedition-map-container">
      <style>{ORDERS_MAP_CSS}</style>

      {/* Floating Toolbar */}
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
            <option value="all">Toutes les commandes ({orders.length})</option>
            <option value="in_delivery">🚚 En livraison active</option>
            <option value="prep">📦 En préparation dépôt</option>
            <option value="delivered">🟢 Livrées</option>
            <option value="pending">🟣 À valider / Confirmées</option>
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
          }}
        >
          <RotateCcw size={12} /> Vue Maroc
        </button>
      </div>

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
