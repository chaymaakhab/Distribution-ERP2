import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ArrowLeftRight, Warehouse, Truck, RefreshCw, Layers, ShieldCheck, Box } from 'lucide-react';
import { formatMoney } from '../api';

export interface InterDepotTransfer {
  id: number;
  ref: string;
  source: string;
  destination: string;
  product: string;
  quantity: number;
  unit: string;
  driver_name: string;
  vehicle_plate: string;
  status: 'en_transit' | 'receptionne' | 'planifie';
  departure_time: string;
  eta: string;
}

const DEFAULT_TRANSFERS: InterDepotTransfer[] = [
  {
    id: 1,
    ref: 'TRF-2026-081',
    source: 'Casablanca (DEP-01)',
    destination: 'Rabat (DEP-02)',
    product: 'Perceuse à percussion 850W',
    quantity: 24,
    unit: 'Carton 4 pcs',
    driver_name: 'Hassan Amrani',
    vehicle_plate: '24890-B-1',
    status: 'en_transit',
    departure_time: '08:45',
    eta: '10:30',
  },
  {
    id: 2,
    ref: 'TRF-2026-082',
    source: 'Rabat (DEP-02)',
    destination: 'Tanger (DEP-03)',
    product: 'Câble électrique 3G2.5',
    quantity: 40,
    unit: 'Couronne 100m',
    driver_name: 'Tariq Belkacem',
    vehicle_plate: '99412-A-1',
    status: 'en_transit',
    departure_time: '07:15',
    eta: '11:45',
  },
  {
    id: 3,
    ref: 'TRF-2026-083',
    source: 'Casablanca (DEP-01)',
    destination: 'Marrakech (DEP-05)',
    product: 'Pompe immergée 1.5 HP',
    quantity: 6,
    unit: 'Pièce',
    driver_name: 'Rachid Daoudi',
    vehicle_plate: '11834-D-26',
    status: 'en_transit',
    departure_time: '09:00',
    eta: '12:30',
  },
  {
    id: 4,
    ref: 'TRF-2026-084',
    source: 'Fès (DEP-04)',
    destination: 'Oujda (DEP-07)',
    product: 'Disque diamant 230 mm',
    quantity: 50,
    unit: 'Boîte 10 pcs',
    driver_name: 'Brahim Naciri',
    vehicle_plate: '44520-C-3',
    status: 'planifie',
    departure_time: '14:00',
    eta: '17:30',
  },
];

const DEPOTS_COORDS: Record<string, { name: string; city: string; coords: [number, number]; capacity: string; stockVal: number }> = {
  'Casablanca (DEP-01)': { name: 'Casablanca Ain Sebaâ', city: 'Casablanca', coords: [33.5980, -7.5340], capacity: '85 000 m³', stockVal: 1850000 },
  'Rabat (DEP-02)': { name: 'Rabat Takaddoum Hub', city: 'Rabat', coords: [33.9850, -6.8490], capacity: '42 000 m³', stockVal: 920000 },
  'Tanger (DEP-03)': { name: 'Tanger Med Logistique', city: 'Tanger', coords: [35.7595, -5.8340], capacity: '65 000 m³', stockVal: 1450000 },
  'Fès (DEP-04)': { name: 'Fès Sidi Brahim Hub', city: 'Fès', coords: [34.0331, -5.0003], capacity: '35 000 m³', stockVal: 680000 },
  'Marrakech (DEP-05)': { name: 'Marrakech Sidi Ghanem', city: 'Marrakech', coords: [31.6595, -8.0211], capacity: '48 000 m³', stockVal: 1120000 },
  'Agadir (DEP-06)': { name: 'Agadir Anza Hub', city: 'Agadir', coords: [30.4478, -9.6281], capacity: '30 000 m³', stockVal: 540000 },
  'Oujda (DEP-07)': { name: 'Oujda Angad Hub', city: 'Oujda', coords: [34.6814, -1.9086], capacity: '25 000 m³', stockVal: 390000 },
};

const TRANSFERS_MAP_CSS = `
.transfers-map-container {
  width: 100%;
  height: 480px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  margin-bottom: 20px;
}
.transit-van-pin {
  transform: translate(-50%, -50%);
  cursor: pointer;
}
.transit-radar-ping {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(2, 132, 199, 0.35);
  border: 2px solid #38bdf8;
  animation: transitRadarPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  pointer-events: none;
}
@keyframes transitRadarPulse {
  0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}
`;

export function RealInterDepotTransfersMap({
  transfers = DEFAULT_TRANSFERS,
  onOpenTransferModal,
}: {
  transfers?: InterDepotTransfer[];
  onOpenTransferModal?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Animated van positions along transit lines
  const [transitProgress, setTransitProgress] = useState<number>(0.5);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitProgress((p) => (p >= 0.95 ? 0.05 : p + 0.02));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [33.0, -6.8],
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

  // Update map contents
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Plot All Depots
    Object.entries(DEPOTS_COORDS).forEach(([key, d]) => {
      // Calculate outgoing and incoming transfers
      const outCount = transfers.filter((t) => t.source.includes(d.city) && t.status === 'en_transit').length;
      const inCount = transfers.filter((t) => t.destination.includes(d.city) && t.status === 'en_transit').length;

      const depHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 8px; background: #0f172a; border: 2px solid #10b981; color: #ffffff; font-size: 11px; font-weight: 800; box-shadow: 0 6px 14px rgba(0,0,0,0.5); white-space: nowrap;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
            <span>${d.name}</span>
            ${outCount > 0 ? `<span style="background: #0284c7; color: white; padding: 1px 5px; border-radius: 10px; font-size: 9.5px;">▲ ${outCount}</span>` : ''}
            ${inCount > 0 ? `<span style="background: #10b981; color: white; padding: 1px 5px; border-radius: 10px; font-size: 9.5px;">▼ ${inCount}</span>` : ''}
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #10b981;"></div>
        </div>
      `;

      const depIcon = L.divIcon({
        className: 'depot-transfer-pin',
        html: depHtml,
        iconSize: [160, 36],
        iconAnchor: [80, 36],
      });

      const marker = L.marker(d.coords, { icon: depIcon }).addTo(group);

      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 210px; padding: 4px; color: #f8fafc;">
          <b style="color: #38bdf8; font-size: 13px;">${d.name}</b>
          <p style="margin: 3px 0; font-size: 11px; color: #cbd5e1;">Capacité : <b>${d.capacity}</b></p>
          <p style="margin: 0 0 6px; font-size: 11px; color: #10b981;">Valeur Stock : <b>${formatMoney(d.stockVal)} DH</b></p>
          <div style="font-size: 11px; background: rgba(255,255,255,0.06); padding: 5px 8px; border-radius: 6px;">
            <div>Expéditions en transit : <b>${outCount} navette(s)</b></div>
            <div>Réceptions attendues : <b>${inCount} navette(s)</b></div>
          </div>
        </div>
      `);
    });

    // 2. Draw Transfer Corridors & Moving Shuttle Vans
    transfers.forEach((t) => {
      const src = Object.entries(DEPOTS_COORDS).find(([k]) => t.source.toLowerCase().includes(k.split(' ')[0].toLowerCase()))?.[1];
      const dst = Object.entries(DEPOTS_COORDS).find(([k]) => t.destination.toLowerCase().includes(k.split(' ')[0].toLowerCase()))?.[1];

      if (!src || !dst) return;

      // Polyline for transit
      L.polyline([src.coords, dst.coords], {
        color: t.status === 'en_transit' ? '#0284c7' : '#94a3b8',
        weight: 3,
        opacity: 0.75,
        dashArray: '8, 8',
      }).addTo(group);

      // If in transit, plot moving navette
      if (t.status === 'en_transit') {
        const vanLat = src.coords[0] + (dst.coords[0] - src.coords[0]) * transitProgress;
        const vanLng = src.coords[1] + (dst.coords[1] - src.coords[1]) * transitProgress;

        const vanHtml = `
          <div class="transit-van-pin" style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div class="transit-radar-ping"></div>
            <div style="width: 30px; height: 30px; border-radius: 50%; background: #0284c7; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(2,132,199,0.7); z-index: 10;">
              <span style="font-size: 9.5px; font-weight: 800; color: #ffffff;">NAV</span>
            </div>
          </div>
        `;

        const vanIcon = L.divIcon({
          className: 'van-icon',
          html: vanHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const vanMarker = L.marker([vanLat, vanLng], { icon: vanIcon }).addTo(group);

        vanMarker.bindPopup(`
          <div style="font-family: inherit; min-width: 220px; padding: 4px; color: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <b style="color: #38bdf8; font-size: 12.5px;">${t.ref} · Navette Inter-Dépôt</b>
              <span style="font-size: 10px; background: #0284c7; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 700;">EN ROUTE</span>
            </div>
            <p style="margin: 0 0 2px; font-size: 11.5px; font-weight: 700;">${t.quantity} ${t.unit} · ${t.product}</p>
            <p style="margin: 0 0 4px; font-size: 11px; color: #cbd5e1;">De : <b>${t.source}</b> → Vers : <b>${t.destination}</b></p>
            <p style="margin: 0 0 4px; font-size: 11px; color: #94a3b8;">Chauffeur : ${t.driver_name} (${t.vehicle_plate})</p>
            <div style="display: flex; justify-content: space-between; font-size: 11px; background: rgba(255,255,255,0.06); padding: 4px 6px; border-radius: 6px;">
              <span>Départ : ${t.departure_time}</span>
              <span style="color: #34d399; font-weight: 700;">Arrivée estimée : ~${t.eta}</span>
            </div>
          </div>
        `);
      }
    });
  }, [transfers, transitProgress]);

  return (
    <div className="transfers-map-container">
      <style>{TRANSFERS_MAP_CSS}</style>

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
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 700,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8' }}></span>
          <span>Corridors de Transferts Inter-Dépôts ({transfers.filter((t) => t.status === 'en_transit').length} navettes en transit)</span>
        </div>

        {onOpenTransferModal && (
          <button
            onClick={onOpenTransferModal}
            style={{
              pointerEvents: 'auto',
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2,132,199,0.5)',
            }}
          >
            <ArrowLeftRight size={13} /> + Nouveau Transfert Inter-Dépôts
          </button>
        )}
      </div>

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
