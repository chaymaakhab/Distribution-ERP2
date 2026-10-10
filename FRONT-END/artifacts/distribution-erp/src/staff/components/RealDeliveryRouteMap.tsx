import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Truck, MapPin, Navigation, Phone, CheckCircle2, Clock, AlertTriangle, Layers, RotateCcw, Compass } from 'lucide-react';
import { formatMoney } from '../api';
import type { DeliveryStop } from '../pages/DeliveryDashboard';

export type DeliveryRouteStop = DeliveryStop;

// Known coordinates for Moroccan delivery hubs & stops
const CITY_STOP_COORDS: Record<string, [number, number]> = {
  'fès': [34.0331, -5.0003],
  'fes': [34.0331, -5.0003],
  'rabat': [34.0209, -6.8416],
  'casablanca': [33.5731, -7.5898],
  'tanger': [35.7595, -5.8340],
  'marrakech': [31.6295, -7.9811],
  'agadir': [30.4278, -9.5981],
  'kénitra': [34.2610, -6.5802],
  'kenitra': [34.2610, -6.5802],
};

// Precise client stop offsets around their cities to form a realistic tour
const KNOWN_ORDER_COORDS: Record<string, [number, number]> = {
  'CMD-2403': [34.0620, -4.9810], // Fès Bab Boujloud Medina
  'CMD-2405': [33.9850, -6.8490], // Rabat Takaddoum Z.I.
  'CMD-2406': [33.5890, -7.6320], // Casablanca Bd Zerktouni
};

// Starting Base Depot (Casablanca Ain Sebaa Logistic Hub)
const DEPOT_ORIGIN = {
  name: 'Dépôt Central Casablanca (Hub Ain Sebaâ)',
  coords: [33.5980, -7.5340] as [number, number],
};

function getStopCoords(stop: DeliveryRouteStop, index: number): [number, number] {
  if (stop.lat && stop.lng) return [stop.lat, stop.lng];
  if (KNOWN_ORDER_COORDS[stop.order_ref]) return KNOWN_ORDER_COORDS[stop.order_ref];

  const cityKey = (stop.city || '').toLowerCase().trim();
  const base = CITY_STOP_COORDS[cityKey] || [33.5731, -7.5898];
  // Slightly jitter so multiple stops in same city don't completely overlap
  const jitterLat = ((index % 5) - 2) * 0.015;
  const jitterLng = (((index + 2) % 5) - 2) * 0.018;
  return [base[0] + jitterLat, base[1] + jitterLng];
}

const ROUTE_MAP_CSS = `
.delivery-route-map {
  width: 100%;
  height: 440px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}
.route-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translate(-50%, -100%);
}
.route-pin:hover {
  transform: translate(-50%, -110%) scale(1.15);
  z-index: 9999 !important;
}
.route-pin-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 20px;
  background: #090e17;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  border: 2px solid;
  box-shadow: 0 6px 16px rgba(0,0,0,0.5);
  white-space: nowrap;
}
.driver-truck-pin {
  transform: translate(-50%, -50%);
  cursor: pointer;
  z-index: 1000 !important;
}
.driver-radar-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(2, 132, 199, 0.35);
  border: 2px solid #38bdf8;
  animation: driverRadarPulse 2s cubic-bezier(0.1, 0, 0.3, 1) infinite;
  pointer-events: none;
}
@keyframes driverRadarPulse {
  0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
}
`;

export function RealDeliveryRouteMap({
  stops,
  selectedStopId,
  onSelectStop,
  onStartDelivery,
  onOpenValidation,
}: {
  stops: DeliveryRouteStop[];
  selectedStopId?: number | null;
  onSelectStop?: (stop: DeliveryRouteStop) => void;
  onStartDelivery?: (stop: DeliveryRouteStop) => void;
  onOpenValidation?: (stop: DeliveryRouteStop) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [simulatedDriverCoords, setSimulatedDriverCoords] = useState<[number, number]>(() => {
    // Current active stop or origin
    const active = stops.find((s) => s.status === 'in_route' || s.status === 'arrived');
    return active ? getStopCoords(active, 1) : DEPOT_ORIGIN.coords;
  });

  // Init Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [33.8, -6.8],
      zoom: 7,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Plot Depot Origin, Stops, Polylines and Driver Van
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Plot Starting Depot Marker
    const depotHtml = `
      <div class="route-pin">
        <div class="route-pin-badge" style="border-color: #3b82f6; background: #1e3a8a; color: #93c5fd;">
          <span>🏭 DÉPÔT DÉPART</span>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #3b82f6;"></div>
      </div>
    `;
    const depotIcon = L.divIcon({
      className: 'depot-origin-pin',
      html: depotHtml,
      iconSize: [120, 32],
      iconAnchor: [60, 32],
    });
    const depotMarker = L.marker(DEPOT_ORIGIN.coords, { icon: depotIcon }).addTo(group);
    depotMarker.bindPopup(`
      <div style="font-family: system-ui; padding: 4px;">
        <b style="color: #38bdf8; font-size: 13px;">${DEPOT_ORIGIN.name}</b>
        <p style="margin: 4px 0 0; color: #cbd5e1; font-size: 11px;">Point de départ & retour de la tournée TRN-2026-08.</p>
      </div>
    `);

    // 2. Prepare Route Coordinates (Depot -> Stop 1 -> Stop 2 -> Stop 3...)
    const routeCoords: [number, number][] = [DEPOT_ORIGIN.coords];

    // Find current active stop for driver GPS
    const inRouteStop = stops.find((s) => s.status === 'in_route' || s.status === 'arrived');

    stops.forEach((stop, idx) => {
      const coords = getStopCoords(stop, idx);
      routeCoords.push(coords);

      const isDelivered = stop.status === 'delivered';
      const isInRoute = stop.status === 'in_route' || stop.status === 'arrived';
      const isRefused = stop.status === 'refused' || stop.status === 'absent';
      const isSelected = selectedStopId === stop.id;

      const toneBorder = isDelivered ? '#10b981' : isInRoute ? '#0284c7' : isRefused ? '#ef4444' : '#f59e0b';
      const toneBg = isDelivered ? '#064e3b' : isInRoute ? '#075985' : isRefused ? '#7f1d1d' : '#78350f';
      const statusIcon = isDelivered ? '✓' : isInRoute ? '🚚' : isRefused ? '✕' : '⏳';

      const stopHtml = `
        <div class="route-pin" id="stop-pin-${stop.id}">
          <div class="route-pin-badge" style="border-color: ${toneBorder}; background: ${toneBg}; ${isSelected ? 'transform: scale(1.15); box-shadow: 0 0 16px ' + toneBorder : ''}">
            <span style="font-size: 11px;">${statusIcon} #${idx + 1}</span>
            <span style="font-weight: 800;">${stop.client.length > 15 ? stop.client.substring(0, 15) + '…' : stop.client}</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${toneBorder};"></div>
        </div>
      `;

      const stopIcon = L.divIcon({
        className: 'client-stop-pin',
        html: stopHtml,
        iconSize: [140, 34],
        iconAnchor: [70, 34],
      });

      const marker = L.marker(coords, { icon: stopIcon }).addTo(group);

      // Stop Popup with direct interactive actions
      const popupHtml = `
        <div style="min-width: 240px; font-family: system-ui;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
            <b style="color: #38bdf8; font-size: 13px;">Arrêt #${idx + 1} · ${stop.order_ref}</b>
            <span style="font-size: 10px; font-weight: 700; color: ${toneBorder}; text-transform: uppercase;">${stop.status}</span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 14px; color: #f8fafc;">${stop.client}</h4>
          <p style="margin: 0 0 6px; font-size: 11.5px; color: #94a3b8;">📍 ${stop.address}, ${stop.city}</p>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
            <span style="color: #64748b;">À Encaisser:</span>
            <b style="color: #34d399;">${formatMoney(stop.amount_to_collect)} DH</b>
          </div>
          ${stop.client_note ? `<p style="font-size: 10.5px; color: #eab308; background: rgba(234,179,8,0.1); padding: 4px 6px; border-radius: 4px; margin-bottom: 8px;">📝 ${stop.client_note}</p>` : ''}
          <div style="display: flex; gap: 6px;">
            <a href="tel:${stop.phone}" style="flex: 1; text-align: center; background: #1e293b; color: #f8fafc; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 1px solid rgba(255,255,255,0.1);">
              📞 Appel
            </a>
            ${stop.status === 'in_route' || stop.status === 'arrived' ? `
            <button id="btn-val-${stop.id}" style="flex: 2; background: #0284c7; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              Valider Livraison →
            </button>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        onSelectStop?.(stop);
      });

      marker.on('popupopen', () => {
        const btnVal = document.getElementById(`btn-val-${stop.id}`);
        if (btnVal) {
          btnVal.onclick = () => {
            onOpenValidation?.(stop);
            map.closePopup();
          };
        }
      });
    });

    // 3. Draw Route Polyline
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
    }
    if (routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#0284c7',
        weight: 3.5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);
      routePolylineRef.current = polyline;
    }

    // 4. Plot Driver Van Live Marker
    const driverLoc = inRouteStop ? getStopCoords(inRouteStop, 1) : DEPOT_ORIGIN.coords;
    setSimulatedDriverCoords(driverLoc);

    const driverHtml = `
      <div class="driver-truck-pin" style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div class="driver-radar-ring"></div>
        <div style="width: 38px; height: 38px; border-radius: 50%; background: #0284c7; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.7); z-index: 10;">
          <span style="font-size: 18px;">🚚</span>
        </div>
      </div>
    `;

    const driverIcon = L.divIcon({
      className: 'live-driver-icon',
      html: driverHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const driverMarker = L.marker(driverLoc, { icon: driverIcon }).addTo(group);
    driverMarker.bindPopup(`
      <div style="font-family: system-ui; padding: 4px; min-width: 200px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
          <b style="color: #38bdf8; font-size: 13px;">Chauffeur Mehdi Lahlou</b>
        </div>
        <p style="margin: 0; font-size: 11.5px; color: #e2e8f0;">Renault Master (23-A-54321)</p>
        <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">Vitesse: 45 km/h · Prochain arrêt: ${inRouteStop ? inRouteStop.client : 'Tournée terminée'}</p>
      </div>
    `);
  }, [stops, selectedStopId, onSelectStop, onOpenValidation]);

  // Zoom to selected stop if provided
  useEffect(() => {
    if (!selectedStopId || !mapRef.current) return;
    const stop = stops.find((s) => s.id === selectedStopId);
    if (stop) {
      const idx = stops.indexOf(stop);
      const coords = getStopCoords(stop, idx);
      mapRef.current.flyTo(coords, 10, { duration: 1 });
    }
  }, [selectedStopId, stops]);

  const handleCenterDriver = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(simulatedDriverCoords, 11, { duration: 1.2 });
  };

  const handleFitEntireTour = () => {
    if (!mapRef.current) return;
    const allCoords = [DEPOT_ORIGIN.coords, ...stops.map((s, i) => getStopCoords(s, i))];
    const bounds = L.latLngBounds(allCoords);
    mapRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  const deliveredCount = stops.filter((s) => s.status === 'delivered').length;

  return (
    <div className="delivery-route-map">
      <style>{ROUTE_MAP_CSS}</style>

      {/* Floating GPS Route Header */}
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
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <b style={{ color: '#f8fafc', fontSize: '12px' }}>Suivi GPS Live Tournée</b>
          </div>
          <span style={{ color: '#64748b', fontSize: '11px' }}>|</span>
          <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 700 }}>
            {deliveredCount}/{stops.length} Livraisons effectuées
          </span>
        </div>

        <div style={{ pointerEvents: 'auto', display: 'flex', gap: 6 }}>
          <button
            onClick={handleCenterDriver}
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #0284c7',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <Compass size={13} />
            Centrer sur Chauffeur
          </button>
          <button
            onClick={handleFitEntireTour}
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: '11px',
              fontWeight: 700,
              padding: '6px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <RotateCcw size={13} />
            Vue Globale Trajet
          </button>
        </div>
      </div>

      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Legend on Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
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
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
          Dépôt
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          Livré
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284c7' }} />
          En route / Arrivé
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          En attente
        </span>
      </div>
    </div>
  );
}
