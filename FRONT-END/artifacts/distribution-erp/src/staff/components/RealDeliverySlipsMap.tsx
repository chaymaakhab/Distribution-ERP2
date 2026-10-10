import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatMoney } from '../api';
import { RotateCcw } from 'lucide-react';

export interface DeliverySlipMapItem {
  id: number;
  ref: string;
  order_ref: string;
  customer: string;
  city: string;
  driver: string;
  truck_plate: string;
  packages_count: number;
  date: string;
  status: 'En préparation' | 'Chargé' | 'En tournée' | 'Livré & Signé' | 'Litige';
  pod_signed: boolean;
  total_ttc: number;
}

const CITY_COORDS: Record<string, [number, number]> = {
  'fès': [34.0331, -5.0003],
  'fes': [34.0331, -5.0003],
  'rabat': [34.0209, -6.8416],
  'casablanca': [33.5731, -7.5898],
  'tanger': [35.7595, -5.8340],
  'marrakech': [31.6295, -7.9811],
  'agadir': [30.4278, -9.5981],
  'kénitra': [34.2610, -6.5802],
  'kenitra': [34.2610, -6.5802],
  'oujda': [34.6814, -1.9086],
  'meknès': [33.8938, -5.5516],
};

export function RealDeliverySlipsMap({
  slips,
  onSign,
}: {
  slips: DeliverySlipMapItem[];
  onSign?: (id: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [33.5, -6.5],
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

    slips.forEach((slip, idx) => {
      const cityKey = (slip.city || '').toLowerCase().trim();
      const baseCoords = CITY_COORDS[cityKey] || [33.5731, -7.5898];
      // small jitter for multiple slips in same city
      const jitterLat = ((idx % 3) - 1) * 0.02;
      const jitterLng = (((idx + 1) % 3) - 1) * 0.02;
      const coords: [number, number] = [baseCoords[0] + jitterLat, baseCoords[1] + jitterLng];

      const isDelivered = slip.status === 'Livré & Signé';
      const isInTour = slip.status === 'En tournée' || slip.status === 'Chargé';
      const tone = isDelivered ? '#10b981' : isInTour ? '#0284c7' : '#f59e0b';

      const html = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 8px; background: #0f172a; border: 2px solid ${tone}; color: #ffffff; font-size: 11px; font-weight: 800; box-shadow: 0 6px 14px rgba(0,0,0,0.4); white-space: nowrap;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${tone};"></span>
            <span>${slip.ref} · ${slip.customer}</span>
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${tone};"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'slip-map-pin',
        html,
        iconSize: [140, 34],
        iconAnchor: [70, 34],
      });

      const marker = L.marker(coords, { icon }).addTo(group);

      const popupHtml = `
        <div style="font-family: system-ui; min-width: 220px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
            <b style="color: #38bdf8; font-size: 13px;">${slip.ref}</b>
            <span style="font-size: 10px; font-weight: 700; color: ${tone};">${slip.status}</span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 14px; color: #f8fafc;">${slip.customer}</h4>
          <p style="margin: 0 0 3px; font-size: 11px; color: #94a3b8;">Destination: <b>${slip.city}</b></p>
          <p style="margin: 0 0 3px; font-size: 11px; color: #cbd5e1;">Chauffeur: <b>${slip.driver}</b></p>
          <p style="margin: 0 0 3px; font-size: 11px; color: #94a3b8;">Immatriculation: <code>${slip.truck_plate}</code></p>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
            <span style="color: #64748b;">Valeur TTC:</span>
            <b style="color: #10b981;">${formatMoney(slip.total_ttc)} DH</b>
          </div>
          ${!slip.pod_signed ? `
          <button id="btn-sign-${slip.id}" style="width: 100%; margin-top: 8px; background: #0284c7; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
            ✓ Valider Signature POD
          </button>` : '<div style="margin-top: 8px; font-size: 11px; color: #10b981; text-align: center; font-weight: 700;">✓ POD Signé & Enregistré</div>'}
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-sign-${slip.id}`);
        if (btn) {
          btn.onclick = () => {
            onSign?.(slip.id);
            map.closePopup();
          };
        }
      });
    });
  }, [slips, onSign]);

  const handleFit = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([33.5, -6.5], 6, { duration: 1.2 });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 440, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      {/* Top Header Controls */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          zIndex: 400,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: '11px',
            color: '#f8fafc',
            fontWeight: 700,
          }}
        >
          {slips.length} Expéditions Cartographiées
        </div>
        <button
          onClick={handleFit}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            fontSize: '11px',
            fontWeight: 700,
            padding: '5px 10px',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <RotateCcw size={12} color="#38bdf8" />
          Vue Maroc
        </button>
      </div>

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
