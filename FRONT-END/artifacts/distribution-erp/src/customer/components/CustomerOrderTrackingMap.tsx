import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Truck, Warehouse, MapPin, Phone, ShieldCheck, Clock, Navigation, Play, Pause, RotateCcw } from 'lucide-react';
import type { OrderDepotInfo, OrderDestinationInfo, OrderTrackingInfo } from '../api';

const TRACKING_MAP_CSS = `
.cx-tracking-map-wrapper {
  background: var(--cx-surface, #ffffff);
  border: 1px solid var(--cx-border, #e2e8f0);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}
.cx-map-container {
  width: 100%;
  height: 380px;
  position: relative;
  z-index: 1;
}
.cx-depot-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  cursor: pointer;
}
.cx-dest-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -100%);
  cursor: pointer;
}
.cx-truck-pin {
  transform: translate(-50%, -50%);
  cursor: pointer;
}
.cx-truck-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(2, 132, 199, 0.35);
  border: 2px solid #0284c7;
  animation: cxRadarPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  pointer-events: none;
}
@keyframes cxRadarPulse {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
}
`;

interface CustomerOrderTrackingMapProps {
  orderRef: string;
  orderStatus: string;
  depot?: OrderDepotInfo;
  destination?: OrderDestinationInfo;
  tracking?: OrderTrackingInfo | null;
}

export function CustomerOrderTrackingMap({
  orderRef,
  orderStatus,
  depot,
  destination,
  tracking,
}: CustomerOrderTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);

  // Fallbacks for Moroccan coords
  const depotCoords: [number, number] = [
    depot?.lat ?? 33.598,
    depot?.lng ?? -7.534,
  ];
  const destCoords: [number, number] = [
    destination?.lat ?? 33.5731,
    destination?.lng ?? -7.5898,
  ];

  // Animated truck progression (from 0 to 1 along the line)
  const isDelivered = orderStatus === 'delivered';
  const initialProg = isDelivered ? 1 : (orderStatus === 'in_delivery' ? 0.65 : 0.2);
  const [progress, setProgress] = useState<number>(initialProg);
  const [isSimulating, setIsSimulating] = useState<boolean>(orderStatus === 'in_delivery');

  // Compute live truck coords by linear interpolation
  const currentTruckLat = depotCoords[0] + (destCoords[0] - depotCoords[0]) * progress;
  const currentTruckLng = depotCoords[1] + (destCoords[1] - depotCoords[1]) * progress;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    // Center midpoint
    const midLat = (depotCoords[0] + destCoords[0]) / 2;
    const midLng = (depotCoords[1] + destCoords[1]) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [midLat, midLng],
      zoom: 12,
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
      const bounds = L.latLngBounds([depotCoords, destCoords]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers & Polylines
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Draw Route Polyline
    L.polyline([depotCoords, destCoords], {
      color: '#0284c7',
      weight: 4,
      opacity: 0.8,
      dashArray: isDelivered ? undefined : '8, 8',
    }).addTo(group);

    // 2. Depot Marker
    const depotHtml = `
      <div class="cx-depot-pin">
        <div style="background: #0f172a; color: #38bdf8; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 12px; border: 2px solid #38bdf8; box-shadow: 0 4px 10px rgba(0,0,0,0.25); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
          <span>🏭</span> <span>${depot?.name ?? 'Dépôt Expéditeur'}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #38bdf8;"></div>
      </div>
    `;
    const depotIcon = L.divIcon({
      html: depotHtml,
      className: 'depot-marker-icon',
      iconSize: [160, 36],
      iconAnchor: [80, 36],
    });
    L.marker(depotCoords, { icon: depotIcon })
      .addTo(group)
      .bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <b style="color: #0284c7; font-size: 13px;">🏭 ${depot?.name ?? 'Dépôt Central'}</b>
          <p style="margin: 4px 0 0; color: #64748b;">${depot?.address ?? 'Zone Industrielle'}, ${depot?.city ?? 'Maroc'}</p>
          <span style="font-size: 10.5px; color: #10b981; font-weight: 700;">Expédié et contrôlé</span>
        </div>
      `);

    // 3. Client Destination Marker
    const destHtml = `
      <div class="cx-dest-pin">
        <div style="background: #0f172a; color: #10b981; font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 12px; border: 2px solid #10b981; box-shadow: 0 4px 10px rgba(0,0,0,0.25); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
          <span>📍</span> <span>Votre Adresse</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #10b981;"></div>
      </div>
    `;
    const destIcon = L.divIcon({
      html: destHtml,
      className: 'dest-marker-icon',
      iconSize: [120, 36],
      iconAnchor: [60, 36],
    });
    L.marker(destCoords, { icon: destIcon })
      .addTo(group)
      .bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <b style="color: #10b981; font-size: 13px;">🏢 ${destination?.company ?? destination?.client_name ?? 'Votre Point de Vente'}</b>
          <p style="margin: 4px 0 0; color: #64748b;">${destination?.address ?? 'Adresse de livraison'}, ${destination?.city ?? ''}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #0284c7;">📞 ${destination?.phone ?? ''}</p>
        </div>
      `);

    // 4. Live Driver Truck Marker
    const truckHtml = `
      <div class="cx-truck-pin" style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div class="cx-truck-pulse"></div>
        <div style="width: 38px; height: 38px; border-radius: 50%; background: #0284c7; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.7); z-index: 10;">
          <span style="font-size: 18px;">🚚</span>
        </div>
      </div>
    `;
    const truckIcon = L.divIcon({
      html: truckHtml,
      className: 'truck-marker-icon',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const truckMarker = L.marker([currentTruckLat, currentTruckLng], { icon: truckIcon }).addTo(group);
    truckMarkerRef.current = truckMarker;

    truckMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 190px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <b style="color: #0284c7; font-size: 13px;">🚚 Livreur en Approche</b>
          <span style="background: #0284c722; color: #0284c7; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 800;">EN DIRECT</span>
        </div>
        <p style="margin: 0 0 2px; font-weight: 700; color: #1e293b;">${tracking?.driver_name ?? 'Chauffeur Hercules ERP'}</p>
        <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">Véhicule : ${tracking?.vehicle_model ?? 'Renault Master'} (${tracking?.vehicle_plate ?? '12345-A-6'})</p>
        <div style="display: flex; justify-content: space-between; font-size: 11px; background: #f8fafc; padding: 4px 6px; border-radius: 6px; margin-top: 4px;">
          <span>Vitesse : <b>${tracking?.speed_kmh ?? 45} km/h</b></span>
          <span style="color: #10b981; font-weight: 700;">ETA : ~${Math.max(5, Math.round((1 - progress) * (tracking?.eta_minutes ?? 30)))} min</span>
        </div>
        ${tracking?.driver_phone ? `
          <a href="tel:${tracking.driver_phone}" style="display: block; text-align: center; background: #0284c7; color: white; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-top: 6px;">
            📞 Appeler le chauffeur
          </a>
        ` : ''}
      </div>
    `);
  }, [currentTruckLat, currentTruckLng, isDelivered]);

  // Live simulation tick
  useEffect(() => {
    if (!isSimulating || isDelivered) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.96) {
          return 0.96; // Arrived nearby
        }
        return prev + 0.015;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [isSimulating, isDelivered]);

  function handleCenterTruck() {
    if (!mapRef.current) return;
    mapRef.current.flyTo([currentTruckLat, currentTruckLng], 14, { duration: 1 });
  }

  return (
    <div className="cx-tracking-map-wrapper">
      <style>{TRACKING_MAP_CSS}</style>

      {/* Header bar */}
      <div style={{ padding: '14px 20px', background: 'var(--cx-bg, #f8fafc)', borderBottom: '1px solid var(--cx-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0284c71a', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <b style={{ fontSize: 14 }}>Suivi GPS en Temps Réel de votre Livraison</b>
              <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 12, background: isDelivered ? '#10b98122' : '#0284c722', color: isDelivered ? '#10b981' : '#0284c7' }}>
                {isDelivered ? 'LIVRÉE' : 'EN ROUTE'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--cx-muted, #64748b)' }}>
              Depuis {depot?.name ?? 'Hub Casablanca'} vers {destination?.company ?? destination?.client_name ?? 'Votre établissement'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isDelivered && (
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: isSimulating ? '#e0f2fe' : '#ffffff',
                border: '1px solid #bae6fd',
                color: '#0284c7',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title={isSimulating ? 'Mettre en pause la simulation de mouvement' : 'Activer le mouvement en temps réel'}
            >
              {isSimulating ? <Pause size={13} /> : <Play size={13} />}
              {isSimulating ? 'Pause GPS' : 'Simuler Direct'}
            </button>
          )}

          <button
            onClick={handleCenterTruck}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Truck size={13} /> Centrer Camion
          </button>
        </div>
      </div>

      {/* Map Body */}
      <div ref={mapContainerRef} className="cx-map-container" />

      {/* Footer Info Strip */}
      <div style={{ padding: '12px 20px', background: 'var(--cx-surface, #ffffff)', borderTop: '1px solid var(--cx-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 12.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cx-text-secondary, #475569)' }}>
            <Warehouse size={14} style={{ color: '#0284c7' }} />
            <span>Dépôt : <b>{depot?.city ?? 'Casablanca'} ({depot?.code ?? 'DEP-01'})</b></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--cx-text-secondary, #475569)' }}>
            <Truck size={14} style={{ color: '#0284c7' }} />
            <span>Chauffeur : <b>{tracking?.driver_name ?? 'Mehdi Lahlou'}</b> ({tracking?.vehicle_plate ?? '12345-A-6'})</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} style={{ color: '#10b981' }} />
            <span style={{ color: '#10b981', fontWeight: 700 }}>
              {isDelivered ? 'Commande remise avec succès' : `Arrivée estimée : ~${Math.max(5, Math.round((1 - progress) * (tracking?.eta_minutes ?? 30)))} min`}
            </span>
          </div>
          {tracking?.driver_phone && (
            <a
              href={`tel:${tracking.driver_phone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: '#0284c7',
                textDecoration: 'none',
                fontWeight: 700,
                background: '#0284c714',
                padding: '4px 10px',
                borderRadius: 6,
              }}
            >
              <Phone size={13} /> {tracking.driver_phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
