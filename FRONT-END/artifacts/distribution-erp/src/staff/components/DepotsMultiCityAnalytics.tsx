import React, { useState, useMemo } from 'react';
import {
  Warehouse, Building2, MapPin, Boxes, Package, TrendingUp,
  AlertTriangle, CheckCircle2, Layers, ArrowRight, Truck, Wallet,
  BarChart3, RefreshCw, Filter, ShieldCheck, ChevronRight, Activity,
  PieChart, Phone, User
} from 'lucide-react';
import { formatMoney } from '../api';
import { ColumnChart, DonutChart, MultiSegmentProgress } from './Charts';

export interface CityDepotData {
  id: number;
  code: string;
  name: string;
  city: string;
  region: string;
  address: string;
  manager_name: string;
  phone: string;
  status: 'Actif' | 'Saturé' | 'Réapprovisionnement';
  occupancy_pct: number; // 0 to 100
  total_capacity_units: number;
  stock_on_hand: number;
  stock_available: number;
  stock_reserved: number;
  stock_value: number; // MAD
  revenue: number; // MAD
  products_count: number;
  fleet_trucks: number;
  pending_orders: number;
  in_delivery_orders: number;
  delivered_orders: number;
}

export const MOROCCAN_CITIES_DEPOTS: CityDepotData[] = [
  {
    id: 1,
    code: 'DEP-01',
    name: 'Dépôt Central Casablanca',
    city: 'Casablanca',
    region: 'Casablanca-Settat',
    address: 'Zone Industrielle Aïn Sebaâ, Voie Principale',
    manager_name: 'Nadia El Amrani',
    phone: '+212 522 00 00 01',
    status: 'Actif',
    occupancy_pct: 84,
    total_capacity_units: 50000,
    stock_on_hand: 42500,
    stock_available: 38200,
    stock_reserved: 4300,
    stock_value: 3850000,
    revenue: 584200,
    products_count: 1248,
    fleet_trucks: 6,
    pending_orders: 14,
    in_delivery_orders: 8,
    delivered_orders: 84,
  },
  {
    id: 2,
    code: 'DEP-02',
    name: 'Dépôt Régional Rabat',
    city: 'Rabat',
    region: 'Rabat-Salé-Kénitra',
    address: 'Hay Nahda, Zone Activités Commerciales',
    manager_name: 'Saïd Amrani',
    phone: '+212 537 00 00 02',
    status: 'Actif',
    occupancy_pct: 68,
    total_capacity_units: 40000,
    stock_on_hand: 28400,
    stock_available: 26100,
    stock_reserved: 2300,
    stock_value: 2420000,
    revenue: 342100,
    products_count: 850,
    fleet_trucks: 4,
    pending_orders: 9,
    in_delivery_orders: 5,
    delivered_orders: 51,
  },
  {
    id: 3,
    code: 'DEP-03',
    name: 'Dépôt Sidi Ghanem Marrakech',
    city: 'Marrakech',
    region: 'Marrakech-Safi',
    address: 'Quartier Industriel Sidi Ghanem, Rue Principale',
    manager_name: 'Hind Benjelloun',
    phone: '+212 524 00 00 03',
    status: 'Actif',
    occupancy_pct: 72,
    total_capacity_units: 26000,
    stock_on_hand: 18900,
    stock_available: 17200,
    stock_reserved: 1700,
    stock_value: 1680000,
    revenue: 218900,
    products_count: 620,
    fleet_trucks: 3,
    pending_orders: 6,
    in_delivery_orders: 4,
    delivered_orders: 32,
  },
  {
    id: 4,
    code: 'DEP-04',
    name: 'Dépôt Zone Franche Tanger',
    city: 'Tanger',
    region: 'Tanger-Tétouan-Al Hoceïma',
    address: 'Zone Franche Gzenaya, Lot 44',
    manager_name: 'Omar Chérif',
    phone: '+212 539 00 00 04',
    status: 'Saturé',
    occupancy_pct: 91,
    total_capacity_units: 16000,
    stock_on_hand: 14560,
    stock_available: 13100,
    stock_reserved: 1460,
    stock_value: 1190000,
    revenue: 139450,
    products_count: 490,
    fleet_trucks: 3,
    pending_orders: 5,
    in_delivery_orders: 3,
    delivered_orders: 19,
  },
  {
    id: 5,
    code: 'DEP-05',
    name: 'Dépôt Dokkarat Fès',
    city: 'Fès',
    region: 'Fès-Meknès',
    address: 'Quartier Industriel Dokkarat, Rue 12',
    manager_name: 'Yassine Chraïbi',
    phone: '+212 535 00 00 05',
    status: 'Actif',
    occupancy_pct: 62,
    total_capacity_units: 25000,
    stock_on_hand: 15500,
    stock_available: 14200,
    stock_reserved: 1300,
    stock_value: 1450000,
    revenue: 165800,
    products_count: 530,
    fleet_trucks: 2,
    pending_orders: 4,
    in_delivery_orders: 3,
    delivered_orders: 22,
  },
  {
    id: 6,
    code: 'DEP-06',
    name: 'Dépôt Anza Agadir',
    city: 'Agadir',
    region: 'Souss-Massa',
    address: 'Zone Industrielle Anza, Voie Express',
    manager_name: 'Fatima Zahra Idrissi',
    phone: '+212 528 00 00 06',
    status: 'Actif',
    occupancy_pct: 55,
    total_capacity_units: 22000,
    stock_on_hand: 12100,
    stock_available: 11300,
    stock_reserved: 800,
    stock_value: 980000,
    revenue: 122400,
    products_count: 410,
    fleet_trucks: 2,
    pending_orders: 3,
    in_delivery_orders: 2,
    delivered_orders: 16,
  },
  {
    id: 7,
    code: 'DEP-07',
    name: 'Dépôt Al Boustane Oujda',
    city: 'Oujda',
    region: 'L’Oriental',
    address: 'Parc Industriel Al Boustane, Quai Est',
    manager_name: 'Mourad Bennani',
    phone: '+212 536 00 00 07',
    status: 'Actif',
    occupancy_pct: 48,
    total_capacity_units: 18000,
    stock_on_hand: 8640,
    stock_available: 8100,
    stock_reserved: 540,
    stock_value: 740000,
    revenue: 98600,
    products_count: 350,
    fleet_trucks: 2,
    pending_orders: 2,
    in_delivery_orders: 1,
    delivered_orders: 14,
  },
];

interface DepotsMultiCityAnalyticsProps {
  onNavigateToWarehouse?: (code: string) => void;
  title?: string;
  subtitle?: string;
}

export default function DepotsMultiCityAnalytics({
  onNavigateToWarehouse,
  title = 'Réseau National des Dépôts · Supervision Toutes Villes',
  subtitle = 'Statistiques consolidées, niveaux de stock et taux d’occupation par ville marocaine.',
}: DepotsMultiCityAnalyticsProps) {
  const [selectedCityId, setSelectedCityId] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Actif' | 'Saturé'>('all');
  const [metricTab, setMetricTab] = useState<'ca' | 'stock_value' | 'occupancy'>('ca');

  const filteredDepots = useMemo(() => {
    if (statusFilter === 'all') return MOROCCAN_CITIES_DEPOTS;
    return MOROCCAN_CITIES_DEPOTS.filter((d) => d.status === statusFilter);
  }, [statusFilter]);

  const selectedDepot = useMemo(() => {
    return MOROCCAN_CITIES_DEPOTS.find((d) => d.id === selectedCityId) || MOROCCAN_CITIES_DEPOTS[0];
  }, [selectedCityId]);

  // Aggregate stats
  const totalStockValue = MOROCCAN_CITIES_DEPOTS.reduce((acc, d) => acc + d.stock_value, 0);
  const totalRevenue = MOROCCAN_CITIES_DEPOTS.reduce((acc, d) => acc + d.revenue, 0);
  const totalUnits = MOROCCAN_CITIES_DEPOTS.reduce((acc, d) => acc + d.stock_on_hand, 0);
  const avgOccupancy = Math.round(
    MOROCCAN_CITIES_DEPOTS.reduce((acc, d) => acc + d.occupancy_pct, 0) / MOROCCAN_CITIES_DEPOTS.length
  );
  const saturatedCount = MOROCCAN_CITIES_DEPOTS.filter((d) => d.occupancy_pct >= 85).length;

  // Chart data
  const revenueChartData = useMemo(() => {
    return MOROCCAN_CITIES_DEPOTS.map((d) => ({
      label: d.city,
      value: metricTab === 'ca' ? d.revenue : metricTab === 'stock_value' ? Math.round(d.stock_value / 1000) : d.occupancy_pct,
    }));
  }, [metricTab]);

  return (
    <section
      className="panel"
      style={{
        padding: '18px',
        marginBottom: '20px',
        background: 'var(--navy-1)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Section Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          borderBottom: '1px solid var(--line)',
          paddingBottom: 14,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Warehouse size={13} /> GÉO-LOGISTIQUE MAROC · 7 DÉPÔTS
            </span>
            <span
              style={{
                background: saturatedCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                color: saturatedCount > 0 ? '#ef4444' : '#22c55e',
                fontSize: 10.5,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {saturatedCount > 0 ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
              {saturatedCount > 0 ? `${saturatedCount} Dépôt saturé (>85%)` : 'Réseau équilibré'}
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>{subtitle}</p>
        </div>

        {/* Aggregate Network Quick Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--navy-2)',
              border: '1px solid var(--line)',
              textAlign: 'right',
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Valeur Stock National
            </span>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>
              {formatMoney(totalStockValue)} DH
            </div>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--navy-2)',
              border: '1px solid var(--line)',
              textAlign: 'right',
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              CA Réseau Global
            </span>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#22c55e' }}>
              {formatMoney(totalRevenue)} DH
            </div>
          </div>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--navy-2)',
              border: '1px solid var(--line)',
              textAlign: 'right',
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Taux Moyen d'Occupation
            </span>
            <div style={{ fontSize: 13, fontWeight: 800, color: avgOccupancy > 75 ? '#f59e0b' : '#38bdf8' }}>
              {avgOccupancy}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Cities Horizontal Scroll / Select Strip ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {MOROCCAN_CITIES_DEPOTS.map((d) => {
          const isSelected = d.id === selectedCityId;
          const isSaturated = d.occupancy_pct >= 85;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedCityId(d.id)}
              type="button"
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                textAlign: 'left',
                border: isSelected
                  ? '2px solid #0284c7'
                  : '1px solid var(--line)',
                background: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'var(--navy-2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: isSelected ? '#38bdf8' : 'var(--muted)' }}>
                  {d.code}
                </span>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isSaturated ? '#ef4444' : '#22c55e',
                  }}
                  title={isSaturated ? 'Dépôt saturé (>85%)' : 'Dépôt normal'}
                />
              </div>
              <strong style={{ fontSize: 13, color: isSelected ? 'var(--text)' : 'var(--text)', whiteSpace: 'nowrap' }}>
                {d.city}
              </strong>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--muted)' }}>
                <span>{d.occupancy_pct}% occupé</span>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>{Math.round(d.revenue / 1000)}k DH</span>
              </div>
              {/* Mini capacity bar */}
              <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${d.occupancy_pct}%`,
                    height: '100%',
                    background: isSaturated ? '#ef4444' : d.occupancy_pct > 70 ? '#f59e0b' : '#38bdf8',
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main 2-Column Layout : Drilldown Card & Visualization Chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        {/* Left Card: Selected Depot Detailed Metrics */}
        <div
          style={{
            background: 'var(--navy-2)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <code style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>{selectedDepot.code}</code>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {selectedDepot.region}</span>
                </div>
                <h3 style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                  {selectedDepot.name}
                </h3>
              </div>
              <span
                className={`status-pill ${
                  selectedDepot.status === 'Saturé'
                    ? 'status-red'
                    : selectedDepot.status === 'Réapprovisionnement'
                    ? 'status-amber'
                    : 'status-green'
                }`}
                style={{ fontSize: 10.5 }}
              >
                {selectedDepot.status === 'Saturé' ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                {selectedDepot.status}
              </span>
            </div>

            <div style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={12} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>{selectedDepot.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <User size={12} style={{ color: '#38bdf8', flexShrink: 0 }} />
                <span>Responsable : <strong>{selectedDepot.manager_name}</strong> ({selectedDepot.phone})</span>
              </div>
            </div>

            {/* Capacity Progress Bar with details */}
            <div
              style={{
                background: 'rgba(0,0,0,0.18)',
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Capacité &amp; Remplissage Dépôt
                </span>
                <b
                  style={{
                    fontSize: 12,
                    color:
                      selectedDepot.occupancy_pct >= 85
                        ? '#ef4444'
                        : selectedDepot.occupancy_pct > 70
                        ? '#f59e0b'
                        : '#22c55e',
                  }}
                >
                  {selectedDepot.occupancy_pct}% ({selectedDepot.stock_on_hand.toLocaleString()} / {selectedDepot.total_capacity_units.toLocaleString()} unités)
                </b>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${selectedDepot.occupancy_pct}%`,
                    height: '100%',
                    background:
                      selectedDepot.occupancy_pct >= 85
                        ? 'linear-gradient(90deg, #ea580c, #ef4444)'
                        : selectedDepot.occupancy_pct > 70
                        ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                        : 'linear-gradient(90deg, #0284c7, #22c55e)',
                    borderRadius: 4,
                  }}
                />
              </div>
              {selectedDepot.occupancy_pct >= 85 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#ef4444', fontSize: 10.5, marginTop: 6 }}>
                  <AlertTriangle size={12} />
                  <span>Dépôt saturé : Déclencher un transfert vers Rabat ou Fès recommandé.</span>
                </div>
              )}
            </div>

            {/* Metric Grids for Selected City */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div style={{ background: 'var(--navy-1)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>VALEUR MARCHANDISE</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
                  {formatMoney(selectedDepot.stock_value)} DH
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{selectedDepot.products_count} références actives</div>
              </div>

              <div style={{ background: 'var(--navy-1)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>CA CHIFFRE D'AFFAIRES</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e', marginTop: 2 }}>
                  {formatMoney(selectedDepot.revenue)} DH
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Ce mois · Facturé TTC</div>
              </div>

              <div style={{ background: 'var(--navy-1)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>STOCK DISPONIBLE</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
                  {selectedDepot.stock_available.toLocaleString()} <small style={{ fontSize: 10, color: 'var(--muted)' }}>unités</small>
                </div>
                <div style={{ fontSize: 10, color: '#f59e0b', marginTop: 2 }}>{selectedDepot.stock_reserved} réservées</div>
              </div>

              <div style={{ background: 'var(--navy-1)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>FLOTTE LIVRAISON</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
                  {selectedDepot.fleet_trucks} <small style={{ fontSize: 10, color: 'var(--muted)' }}>camions</small>
                </div>
                <div style={{ fontSize: 10, color: '#38bdf8', marginTop: 2 }}>{selectedDepot.in_delivery_orders} tournées en cours</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              Commandes : <strong>{selectedDepot.pending_orders}</strong> en attente · <strong>{selectedDepot.delivered_orders}</strong> livrées
            </span>
            {onNavigateToWarehouse && (
              <button
                type="button"
                className="button-secondary"
                onClick={() => onNavigateToWarehouse(selectedDepot.code)}
                style={{ fontSize: 11.5, height: 30, gap: 5 }}
              >
                <span>Détail dépôt</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Right Card: Comparative Multi-City Visualizations */}
        <div
          style={{
            background: 'var(--navy-2)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BarChart3 size={15} style={{ color: '#38bdf8' }} />
                <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
                  Comparatif Multi-Villes
                </h4>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setMetricTab('ca')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: metricTab === 'ca' ? '#0284c7' : 'rgba(255,255,255,0.06)',
                    color: metricTab === 'ca' ? '#ffffff' : 'var(--muted)',
                    border: 0,
                  }}
                >
                  CA (DH)
                </button>
                <button
                  type="button"
                  onClick={() => setMetricTab('stock_value')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: metricTab === 'stock_value' ? '#0284c7' : 'rgba(255,255,255,0.06)',
                    color: metricTab === 'stock_value' ? '#ffffff' : 'var(--muted)',
                    border: 0,
                  }}
                >
                  Valeur Stock (kDH)
                </button>
                <button
                  type="button"
                  onClick={() => setMetricTab('occupancy')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: metricTab === 'occupancy' ? '#0284c7' : 'rgba(255,255,255,0.06)',
                    color: metricTab === 'occupancy' ? '#ffffff' : 'var(--muted)',
                    border: 0,
                  }}
                >
                  Occupation %
                </button>
              </div>
            </div>

            {/* Bar List Comparison across all 7 cities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {MOROCCAN_CITIES_DEPOTS.map((d) => {
                const val =
                  metricTab === 'ca'
                    ? d.revenue
                    : metricTab === 'stock_value'
                    ? d.stock_value
                    : d.occupancy_pct;
                const maxVal =
                  metricTab === 'ca'
                    ? 600000
                    : metricTab === 'stock_value'
                    ? 4000000
                    : 100;
                const pct = Math.min(100, Math.round((val / maxVal) * 100));
                const isSelected = d.id === selectedCityId;

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedCityId(d.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 6,
                      background: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                      <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#38bdf8' : 'var(--text)' }}>
                        {d.city} <small style={{ color: 'var(--muted)' }}>({d.code})</small>
                      </span>
                      <strong style={{ color: metricTab === 'ca' ? '#22c55e' : metricTab === 'stock_value' ? '#38bdf8' : d.occupancy_pct > 85 ? '#ef4444' : 'var(--text)' }}>
                        {metricTab === 'occupancy'
                          ? `${d.occupancy_pct}%`
                          : `${formatMoney(val)} DH`}
                      </strong>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background:
                            metricTab === 'occupancy'
                              ? d.occupancy_pct >= 85
                                ? '#ef4444'
                                : d.occupancy_pct > 70
                                ? '#f59e0b'
                                : '#38bdf8'
                              : isSelected
                              ? '#38bdf8'
                              : 'rgba(56, 189, 248, 0.65)',
                          borderRadius: 3,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: '8px 10px',
              borderRadius: 6,
              background: 'rgba(0,0,0,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 11,
              color: 'var(--muted)',
            }}
          >
            <span>7 Villes couvertes : Casa, Rabat, Marrakech, Tanger, Fès, Agadir, Oujda</span>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>Tous les dépôts connectés</span>
          </div>
        </div>
      </div>
    </section>
  );
}
