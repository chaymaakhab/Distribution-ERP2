import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Truck, Warehouse, MapPin, Navigation, Phone, RotateCcw, Filter, Compass, ShieldCheck } from 'lucide-react';
import { formatMoney } from '../api';
import type { WarehouseDriver } from '../pages/WarehouseDashboard';

// Real Moroccan cities coordinates
const LOGISTICS_DEPOTS = [
  { id: 1, code: 'DEP-01', name: 'Casablanca Ain Sebaâ (Central)', city: 'Casablanca', coords: [33.5980, -7.5340] as [number, number], capacity: '85 000 m³', stockVal: 1850000, status: 'Actif', tone: '#10b981' },
  { id: 2, code: 'DEP-02', name: 'Rabat Takaddoum Hub', city: 'Rabat', coords: [33.9850, -6.8490] as [number, number], capacity: '42 000 m³', stockVal: 920000, status: 'Actif', tone: '#10b981' },
  { id: 3, code: 'DEP-03', name: 'Tanger Med Logistique', city: 'Tanger', coords: [35.7595, -5.8340] as [number, number], capacity: '65 000 m³', stockVal: 1450000, status: 'Saturé', tone: '#f59e0b' },
  { id: 4, code: 'DEP-04', name: 'Fès Sidi Brahim Dépôt', city: 'Fès', coords: [34.0331, -5.0003] as [number, number], capacity: '35 000 m³', stockVal: 680000, status: 'Actif', tone: '#10b981' },
  { id: 5, code: 'DEP-05', name: 'Marrakech Sidi Ghanem Hub', city: 'Marrakech', coords: [31.6595, -8.0211] as [number, number], capacity: '48 000 m³', stockVal: 1120000, status: 'Actif', tone: '#10b981' },
  { id: 6, code: 'DEP-06', name: 'Agadir Anza Distribution', city: 'Agadir', coords: [30.4478, -9.6281] as [number, number], capacity: '30 000 m³', stockVal: 540000, status: 'Actif', tone: '#10b981' },
  { id: 7, code: 'DEP-07', name: 'Oujda Angad Hub Régional', city: 'Oujda', coords: [34.6814, -1.9086] as [number, number], capacity: '25 000 m³', stockVal: 390000, status: 'Actif', tone: '#10b981' },
];

// Logistics corridors linking the regional depots
const TRANSIT_CORRIDORS: Array<{ from: [number, number]; to: [number, number]; name: string }> = [
  { from: [33.5980, -7.5340], to: [33.9850, -6.8490], name: 'Axe Casablanca - Rabat' },
  { from: [33.9850, -6.8490], to: [35.7595, -5.8340], name: 'Axe Rabat - Tanger Med' },
  { from: [33.9850, -6.8490], to: [34.0331, -5.0003], name: 'Axe Rabat - Fès' },
  { from: [33.5980, -7.5340], to: [31.6595, -8.0211], name: 'Axe Casablanca - Marrakech' },
  { from: [31.6595, -8.0211], to: [30.4478, -9.6281], name: 'Axe Marrakech - Agadir' },
  { from: [34.0331, -5.0003], to: [34.6814, -1.9086], name: 'Axe Fès - Oujda' },
];

export function RealLogisticsFleetMap({
  drivers,
  onSelectDriver,
}: {
  drivers: WarehouseDriver[];
  onSelectDriver?: (driver: WarehouseDriver) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'depot_to_client' | 'depot_to_depot' | 'pre_seller'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'available'>('all');

  const filteredDrivers = drivers.filter((d) => {
    const matchType = filterType === 'all' || d.driver_type === filterType;
    const matchStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'active'
        ? d.status === 'en_tournee' || d.status === 'en_transit'
        : d.status === 'disponible';
    return matchType && matchStatus;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [32.5, -6.8],
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

    // 1. Draw Transit Corridors (Aéroports / Autoroutes A1, A2, A3)
    TRANSIT_CORRIDORS.forEach((c) => {
      L.polyline([c.from, c.to], {
        color: '#0284c7',
        weight: 2.5,
        opacity: 0.6,
        dashArray: '8, 8',
      }).addTo(group);
    });

    // 2. Plot Warehouses
    LOGISTICS_DEPOTS.forEach((dep) => {
      const depHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 8px; background: #0f172a; border: 2px solid ${dep.tone}; color: #ffffff; font-size: 11px; font-weight: 800; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${dep.tone};"></span>
            <span>🏭 ${dep.code} · ${dep.city}</span>
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${dep.tone};"></div>
        </div>
      `;

      const depIcon = L.divIcon({
        className: 'warehouse-fleet-pin',
        html: depHtml,
        iconSize: [140, 36],
        iconAnchor: [70, 36],
      });

      const marker = L.marker(dep.coords, { icon: depIcon }).addTo(group);

      // Depot coverage
      L.circle(dep.coords, {
        radius: 35000,
        color: dep.tone,
        fillColor: dep.tone,
        fillOpacity: 0.08,
        weight: 1,
        dashArray: '4, 6',
      }).addTo(group);

      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 200px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <b style="color: #38bdf8; font-size: 13px;">${dep.code} - ${dep.name}</b>
            <span style="font-size: 10px; font-weight: 700; color: ${dep.tone}; padding: 2px 6px; background: ${dep.tone}22; border-radius: 4px;">${dep.status}</span>
          </div>
          <p style="margin: 0 0 4px; font-size: 11px; color: #cbd5e1;">Capacité de stockage: <b>${dep.capacity}</b></p>
          <p style="margin: 0; font-size: 11px; color: #10b981;">Valeur du stock: <b>${formatMoney(dep.stockVal)} DH</b></p>
        </div>
      `);
    });

    // 3. Plot Active Drivers & Vehicles
    filteredDrivers.forEach((driver, i) => {
      // Find driver location based on assigned depot or route
      let baseCoords: [number, number] = [33.5980, -7.5340];
      const matchDepot = LOGISTICS_DEPOTS.find((d) => driver.base_depot.toLowerCase().includes(d.city.toLowerCase()));
      if (matchDepot) baseCoords = matchDepot.coords;

      // Add realistic offset depending on whether they're in transit or in tour
      const angle = (i * 1.2);
      const dist = driver.status === 'disponible' ? 0.03 : 0.22 + (i % 3) * 0.15;
      const driverLat = baseCoords[0] + Math.sin(angle) * dist;
      const driverLng = baseCoords[1] + Math.cos(angle) * dist;

      const isTransit = driver.driver_type === 'depot_to_depot';
      const isPreSeller = driver.driver_type === 'pre_seller';
      const isMoving = driver.status === 'en_tournee' || driver.status === 'en_transit';

      const typeBadge = isTransit ? '🚛 Transit Inter-Dépôt' : isPreSeller ? '🛍️ Pré-vendeur' : '🚚 Dépôt → Clients';
      const tone = isMoving ? '#0284c7' : '#10b981';

      const driverHtml = `
        <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
          ${isMoving ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(2,132,199,0.3); border: 2px solid #38bdf8; animation: markerPulsePing 2s infinite; pointer-events: none;"></div>` : ''}
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #0f172a; border: 2px solid ${tone}; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 2;">
            ${isTransit ? '🚛' : '🚚'}
          </div>
          <span style="font-size: 9.5px; font-weight: 800; background: #0f172a; color: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); margin-top: 3px; white-space: nowrap;">
            ${driver.name}
          </span>
        </div>
      `;

      const driverIcon = L.divIcon({
        className: 'driver-fleet-pin',
        html: driverHtml,
        iconSize: [60, 48],
        iconAnchor: [30, 24],
      });

      const dMarker = L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(group);

      dMarker.bindPopup(`
        <div style="font-family: system-ui; min-width: 220px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
            <b style="color: #38bdf8; font-size: 13px;">${driver.name}</b>
            <span style="font-size: 10px; font-weight: 700; color: ${tone}; text-transform: uppercase;">${driver.status}</span>
          </div>
          <p style="margin: 0 0 3px; font-size: 11px; color: #cbd5e1;">Rôle: <b>${typeBadge}</b></p>
          <p style="margin: 0 0 3px; font-size: 11px; color: #cbd5e1;">Véhicule: <b>${driver.vehicle_model} (${driver.vehicle_plate})</b></p>
          <p style="margin: 0 0 4px; font-size: 11px; color: #94a3b8;">Base: ${driver.base_depot} · Trajet: ${driver.assigned_city_or_route}</p>
          ${driver.current_mission ? `<p style="margin: 0 0 6px; font-size: 10.5px; color: #eab308; background: rgba(234,179,8,0.1); padding: 4px 6px; border-radius: 4px;">📦 Mission: ${driver.current_mission}</p>` : ''}
          <a href="tel:${driver.phone}" style="display: block; text-align: center; background: #0284c7; color: white; text-decoration: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-top: 4px;">
            📞 Appeler ${driver.phone}
          </a>
        </div>
      `);

      dMarker.on('click', () => {
        onSelectDriver?.(driver);
      });
    });
  }, [filteredDrivers, onSelectDriver]);

  const handleFitMorocco = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([32.5, -6.8], 6, { duration: 1.2 });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 480, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      {/* Top Filter Bar */}
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
        {/* Type Filter Buttons */}
        <div
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
            padding: '4px',
            display: 'flex',
            gap: 4,
          }}
        >
          <button
            onClick={() => setFilterType('all')}
            style={{
              background: filterType === 'all' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Tous ({drivers.length})
          </button>
          <button
            onClick={() => setFilterType('depot_to_client')}
            style={{
              background: filterType === 'depot_to_client' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Dépôt → Clients
          </button>
          <button
            onClick={() => setFilterType('depot_to_depot')}
            style={{
              background: filterType === 'depot_to_depot' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Transit Inter-Dépôts
          </button>
          <button
            onClick={() => setFilterType('pre_seller')}
            style={{
              background: filterType === 'pre_seller' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Pré-vendeurs
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ pointerEvents: 'auto', display: 'flex', gap: 6 }}>
          <button
            onClick={handleFitMorocco}
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(8px)',
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
            }}
          >
            <RotateCcw size={13} color="#38bdf8" />
            Vue Globale Maroc
          </button>
        </div>
      </div>

      {/* Leaflet DOM container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Bottom Bar Stats */}
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
          gap: 14,
          fontSize: '11px',
          color: '#cbd5e1',
          pointerEvents: 'none',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          7 Dépôts Connectés
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284c7' }} />
          {filteredDrivers.filter((d) => d.status === 'en_tournee' || d.status === 'en_transit').length} Véhicules en Mouvement
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
          6 Couloirs de Transit
        </span>
      </div>
    </div>
  );
}
