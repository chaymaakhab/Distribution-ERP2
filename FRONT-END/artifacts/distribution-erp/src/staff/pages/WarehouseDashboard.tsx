import { useState } from 'react';
import {
  Boxes, Warehouse, ArrowDownRight, ArrowUpRight, ArrowLeftRight,
  AlertTriangle, CheckCircle2, Clock, Plus, Download, ShieldCheck,
  Calendar, Layers, X, Truck, User, Phone, MapPin, Building2,
  Navigation, Search, Filter, MessageSquare, ChevronRight,
} from 'lucide-react';
import { formatMoney } from '../api';

// ── Types ───────────────────────────────────────────────────────────────────

interface StockItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  warehouse: 'Casablanca (DEP-01)' | 'Rabat (DEP-02)';
  physical: number;
  reserved: number;
  available: number;
  min_threshold: number;
  unit: string;
  unit_price: number;
  lot_number?: string;
  expiry_date?: string;
}

export type DriverType = 'depot_to_client' | 'depot_to_depot';

export interface WarehouseDriver {
  id: number;
  name: string;
  phone: string;
  cin: string;
  license_number: string;
  driver_type: DriverType;
  base_depot: string;
  assigned_city_or_route: string;
  vehicle_model: string;
  vehicle_plate: string;
  capacity: string;
  status: 'disponible' | 'en_tournee' | 'en_transit' | 'en_repos';
  current_mission?: string;
}

// ── Données initiales ───────────────────────────────────────────────────────

const INITIAL_STOCKS: StockItem[] = [
  {
    id: 1,
    sku: 'HRC-0850',
    name: 'Perceuse à percussion 850W',
    category: 'Outillage',
    warehouse: 'Casablanca (DEP-01)',
    physical: 120,
    reserved: 18,
    available: 102,
    min_threshold: 20,
    unit: 'Carton 4 pcs',
    unit_price: 1249,
    lot_number: 'LOT-2025-019',
    expiry_date: 'N/A',
  },
  {
    id: 2,
    sku: 'PMP-15HP',
    name: 'Pompe immergée 1.5 HP',
    category: 'Plomberie',
    warehouse: 'Casablanca (DEP-01)',
    physical: 8,
    reserved: 3,
    available: 5,
    min_threshold: 10,
    unit: 'Pièce',
    unit_price: 3840,
    lot_number: 'LOT-2025-004',
    expiry_date: 'N/A',
  },
  {
    id: 3,
    sku: 'CUT-230D',
    name: 'Disque diamant 230 mm',
    category: 'Outillage',
    warehouse: 'Rabat (DEP-02)',
    physical: 64,
    reserved: 12,
    available: 52,
    min_threshold: 15,
    unit: 'Pièce',
    unit_price: 189.5,
    lot_number: 'LOT-2024-890',
    expiry_date: 'N/A',
  },
  {
    id: 4,
    sku: 'CAB-3G25',
    name: 'Câble électrique 3G2.5',
    category: 'Électricité',
    warehouse: 'Casablanca (DEP-01)',
    physical: 480,
    reserved: 60,
    available: 420,
    min_threshold: 100,
    unit: 'Mètre',
    unit_price: 12.8,
    lot_number: 'LOT-CAB-2025',
    expiry_date: 'N/A',
  },
  {
    id: 5,
    sku: 'GEN-5000',
    name: 'Groupe électrogène 5 kVA',
    category: 'Énergie',
    warehouse: 'Casablanca (DEP-01)',
    physical: 3,
    reserved: 2,
    available: 1,
    min_threshold: 5,
    unit: 'Pièce',
    unit_price: 8950,
    lot_number: 'LOT-GEN-99',
    expiry_date: 'N/A',
  },
  {
    id: 6,
    sku: 'CHA-100I',
    name: 'Charnière inox 100 mm',
    category: 'Quincaillerie',
    warehouse: 'Rabat (DEP-02)',
    physical: 210,
    reserved: 15,
    available: 195,
    min_threshold: 30,
    unit: 'Sachet 6 pcs',
    unit_price: 15.5,
    lot_number: 'LOT-QUI-2025',
    expiry_date: 'N/A',
  },
];

const INITIAL_DRIVERS: WarehouseDriver[] = [
  {
    id: 1,
    name: 'Mehdi Lahlou',
    phone: '+212 661 23 45 67',
    cin: 'BK458921',
    license_number: 'PERM-45129',
    driver_type: 'depot_to_client',
    base_depot: 'DEP-01 Casablanca Central',
    assigned_city_or_route: 'Grand Casablanca & Ain Sebaâ',
    vehicle_model: 'Renault Master 3.5T',
    vehicle_plate: '23-A-54321',
    capacity: '3.5 T / 4 Palettes',
    status: 'en_tournee',
    current_mission: 'Tournée TRN-2026-08 (3 clients)',
  },
  {
    id: 2,
    name: 'Rachid Tazi',
    phone: '+212 663 88 99 00',
    cin: 'BE321908',
    license_number: 'PERM-18273',
    driver_type: 'depot_to_client',
    base_depot: 'DEP-01 Casablanca Central',
    assigned_city_or_route: 'Casablanca Sud & Sidi Maarouf',
    vehicle_model: 'Peugeot Boxer 3.5T',
    vehicle_plate: '18-B-12984',
    capacity: '3.5 T / 4 Palettes',
    status: 'disponible',
  },
  {
    id: 3,
    name: 'Youssef Berrada',
    phone: '+212 661 55 44 33',
    cin: 'BA871234',
    license_number: 'PERM-99214',
    driver_type: 'depot_to_depot',
    base_depot: 'DEP-01 Casablanca Central',
    assigned_city_or_route: 'Casablanca ↔ Mohammedia (Ligne 1)',
    vehicle_model: 'Isuzu Forward 8T',
    vehicle_plate: '14-A-87654',
    capacity: '8.0 T / 12 Palettes',
    status: 'en_transit',
    current_mission: 'Transfert TRF-0012 en cours',
  },
  {
    id: 4,
    name: 'Hassan Benmoussa',
    phone: '+212 662 44 11 22',
    cin: 'BJ129034',
    license_number: 'PERM-66381',
    driver_type: 'depot_to_depot',
    base_depot: 'DEP-01 Casablanca Central',
    assigned_city_or_route: 'Casablanca ↔ Berrechid ↔ Settat (Ligne 2)',
    vehicle_model: 'Volvo FL 12T',
    vehicle_plate: '06-D-45210',
    capacity: '12.0 T / 16 Palettes',
    status: 'disponible',
  },
  {
    id: 5,
    name: 'Karim Mansour',
    phone: '+212 665 77 66 55',
    cin: 'BM543219',
    license_number: 'PERM-77219',
    driver_type: 'depot_to_client',
    base_depot: 'DEP-02 Mohammedia',
    assigned_city_or_route: 'Mohammedia & Mansouria',
    vehicle_model: 'Citroën Jumper 3.5T',
    vehicle_plate: '33-C-76512',
    capacity: '3.5 T / 4 Palettes',
    status: 'disponible',
  },
  {
    id: 6,
    name: 'Tariq El Ouazzani',
    phone: '+212 664 12 34 56',
    cin: 'BL908712',
    license_number: 'PERM-33290',
    driver_type: 'depot_to_depot',
    base_depot: 'DEP-03 Berrechid',
    assigned_city_or_route: 'Berrechid ↔ Casablanca (Ligne 3)',
    vehicle_model: 'Mitsubishi Fuso 7.5T',
    vehicle_plate: '28-A-99123',
    capacity: '7.5 T / 10 Palettes',
    status: 'en_repos',
  },
];

const MOVEMENTS = [
  { type: 'Réception Achat', ref: 'ACH-0097', prod: 'Perceuse 850W', qty: '+24', depot: 'Casablanca', time: '10:45' },
  { type: 'Réservation Vente', ref: 'CMD-2406', prod: 'Pompe 1.5 HP', qty: '-3', depot: 'Casablanca', time: '10:15' },
  { type: 'Transfert Inter-Dépôts', ref: 'TRF-0012', prod: 'Disque diamant', qty: '-16 (Sortie)', depot: 'Casa → Rabat', time: '09:20' },
  { type: 'Ajustement Inventaire', ref: 'INV-0225', prod: 'Câble 3G2.5', qty: '+5 (Écart)', depot: 'Rabat', time: 'Hier' },
];

export default function WarehouseDashboard() {
  const [activeTab, setActiveTab] = useState<'stocks' | 'drivers' | 'movements'>('stocks');
  const [stocks, setStocks] = useState<StockItem[]>(INITIAL_STOCKS);
  const [drivers, setDrivers] = useState<WarehouseDriver[]>(INITIAL_DRIVERS);
  const [selectedDepot, setSelectedDepot] = useState<'all' | 'Casablanca (DEP-01)' | 'Rabat (DEP-02)'>('all');

  // Drivers filtering
  const [driverTypeFilter, setDriverTypeFilter] = useState<'all' | DriverType>('all');
  const [driverCityFilter, setDriverCityFilter] = useState<string>('all');
  const [driverSearch, setDriverSearch] = useState('');

  // Modals
  const [transferModal, setTransferModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [newDriverModal, setNewDriverModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Driver Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('+212 6');
  const [formCin, setFormCin] = useState('');
  const [formLicense, setFormLicense] = useState('');
  const [formType, setFormType] = useState<DriverType>('depot_to_client');
  const [formBaseDepot, setFormBaseDepot] = useState('DEP-01 Casablanca Central');
  const [formRoute, setFormRoute] = useState('');
  const [formVehicle, setFormVehicle] = useState('Renault Master 3.5T');
  const [formPlate, setFormPlate] = useState('');
  const [formCapacity, setFormCapacity] = useState('3.5 T / 4 Palettes');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // Stock calculations
  const filteredStocks = stocks.filter((s) => selectedDepot === 'all' || s.warehouse === selectedDepot);
  const totalValue = filteredStocks.reduce((acc, s) => acc + s.physical * s.unit_price, 0);
  const lowStockCount = filteredStocks.filter((s) => s.available <= s.min_threshold).length;
  const totalPhysical = filteredStocks.reduce((acc, s) => acc + s.physical, 0);
  const totalReserved = filteredStocks.reduce((acc, s) => acc + s.reserved, 0);
  const totalAvailable = filteredStocks.reduce((acc, s) => acc + s.available, 0);

  // Drivers calculations & filtering
  const filteredDrivers = drivers.filter((d) => {
    const matchType = driverTypeFilter === 'all' || d.driver_type === driverTypeFilter;
    const matchCity =
      driverCityFilter === 'all' ||
      d.assigned_city_or_route.toLowerCase().includes(driverCityFilter.toLowerCase()) ||
      d.base_depot.toLowerCase().includes(driverCityFilter.toLowerCase());
    const q = driverSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.vehicle_plate.toLowerCase().includes(q) ||
      d.assigned_city_or_route.toLowerCase().includes(q);
    return matchType && matchCity && matchSearch;
  });

  const clientDriversCount = drivers.filter((d) => d.driver_type === 'depot_to_client').length;
  const interDepotDriversCount = drivers.filter((d) => d.driver_type === 'depot_to_depot').length;
  const onMissionCount = drivers.filter((d) => d.status === 'en_tournee' || d.status === 'en_transit').length;

  function handleCreateDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formPlate.trim()) return;

    const newDriver: WarehouseDriver = {
      id: Date.now(),
      name: formName.trim(),
      phone: formPhone.trim(),
      cin: formCin.trim().toUpperCase() || 'BK000000',
      license_number: formLicense.trim() || 'PERM-0000',
      driver_type: formType,
      base_depot: formBaseDepot,
      assigned_city_or_route: formRoute.trim() || (formType === 'depot_to_client' ? 'Grand Casablanca' : 'Casablanca ↔ Mohammedia'),
      vehicle_model: formVehicle.trim(),
      vehicle_plate: formPlate.trim(),
      capacity: formCapacity.trim(),
      status: 'disponible',
    };

    setDrivers((prev) => [newDriver, ...prev]);
    notify(
      `Livreur « ${newDriver.name} » ajouté (${newDriver.driver_type === 'depot_to_client' ? 'Dépôt → Client' : 'Navette Inter-Dépôts'}) !`
    );
    setNewDriverModal(false);

    // Reset form
    setFormName('');
    setFormPhone('+212 6');
    setFormCin('');
    setFormLicense('');
    setFormRoute('');
    setFormPlate('');
  }

  function toggleDriverStatus(driverId: number) {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const nextStatus = d.status === 'disponible' ? 'en_repos' : 'disponible';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
    notify('Statut du livreur mis à jour.');
  }

  return (
    <div className="dashboard-page warehouse-workspace">
      {/* ── Page Header ── */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">RESPONSABLE DÉPÔT <span className="eyebrow-sep">/</span> GESTION DES STOCKS & FLOTTE</span>
          <h1>Espace Entrepôt & Flotte Logistique<span className="title-period">.</span></h1>
          <p>Supervision des stocks disponibles, réapprovisionnements et gestion des 2 types de livreurs (Clients & Navettes Inter-Dépôts).</p>
        </div>
        <div className="heading-actions">
          {activeTab === 'drivers' ? (
            <button className="button-primary" onClick={() => setNewDriverModal(true)}>
              <Plus size={15} /> Ajouter un livreur
            </button>
          ) : (
            <>
              <button className="button-secondary" onClick={() => setClosingModal(true)}>
                <ShieldCheck size={15} /> Clôture caisse dépôt
              </button>
              <button className="button-primary" onClick={() => setTransferModal(true)}>
                <ArrowLeftRight size={16} /> Transfert inter-dépôts
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Main Tab Navigation ── */}
      <div className="table-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`table-tab ${activeTab === 'stocks' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('stocks')}
        >
          <Boxes size={14} style={{ display: 'inline', marginRight: 6 }} />
          Stocks & Disponibilités
        </button>
        <button
          className={`table-tab ${activeTab === 'drivers' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('drivers')}
        >
          <Truck size={14} style={{ display: 'inline', marginRight: 6 }} />
          Flotte & Livreurs ({drivers.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'movements' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          <ArrowLeftRight size={14} style={{ display: 'inline', marginRight: 6 }} />
          Mouvements & Transferts
        </button>
      </div>

      {/* ════════════════════ TAB 1: STOCKS ════════════════════ */}
      {activeTab === 'stocks' && (
        <>
          {/* KPI Strip */}
          <div className="metric-grid">
            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>Stock Réel Disponible</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <Boxes size={16} />
                </div>
              </div>
              <div className="metric-number">{totalAvailable} <small>unités</small></div>
              <div className="metric-foot">
                <span>Physique: {totalPhysical} · Réservé: {totalReserved}</span>
              </div>
            </div>

            <div className="metric-card metric-green">
              <div className="metric-top">
                <span>Valorisation du stock</span>
                <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <Warehouse size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalValue)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Périmètre : {selectedDepot === 'all' ? 'Tous dépôts' : selectedDepot}</span>
              </div>
            </div>

            <div className="metric-card metric-amber">
              <div className="metric-top">
                <span>Sous seuil minimum</span>
                <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="metric-number">{lowStockCount} <small>articles</small></div>
              <div className="metric-foot">
                <span className="metric-change change-down">Alerte réassort</span>
              </div>
            </div>

            <div className="metric-card metric-cyan">
              <div className="metric-top">
                <span>Dépôts Opérationnels</span>
                <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <Layers size={16} />
                </div>
              </div>
              <div className="metric-number">2 <small>dépôts</small></div>
              <div className="metric-foot">
                <span>Casablanca (Principal) & Rabat</span>
              </div>
            </div>
          </div>

          {/* CDC Equation Banner */}
          <div className="inventory-note" style={{ margin: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
              <b>Règle de gestion CDC Maroc :</b>
              <code>Stock Disponible = Stock Physique − Stock Réservé (Commandes validées)</code>
            </div>
          </div>

          {/* Stocks Table */}
          <section className="panel list-panel" style={{ marginTop: '14px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">INVENTAIRE TEMPS RÉEL</span>
                <h2>Articles en stock ({filteredStocks.length})</h2>
              </div>
              <div className="table-tools" style={{ padding: 0 }}>
                <div className="table-tabs">
                  {(['all', 'Casablanca (DEP-01)', 'Rabat (DEP-02)'] as const).map((dp) => (
                    <button
                      key={dp}
                      className={`table-tab ${selectedDepot === dp ? 'active-tab' : ''}`}
                      onClick={() => setSelectedDepot(dp)}
                    >
                      {dp === 'all' ? 'Tous dépôts' : dp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>RÉFÉRENCE / SKU</th>
                    <th>DÉSIGNATION ARTICLE</th>
                    <th>DÉPÔT</th>
                    <th>PHYSIQUE</th>
                    <th>RÉSERVÉ</th>
                    <th>DISPONIBLE</th>
                    <th>SEUIL MIN.</th>
                    <th>VALEUR TOTALE</th>
                    <th>STATUT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((s) => (
                    <tr key={s.id}>
                      <td><code className="table-ref">{s.sku}</code></td>
                      <td>
                        <b className="table-main">{s.name}</b>
                        <small style={{ display: 'block', color: 'var(--muted)' }}>{s.category} · Lot: {s.lot_number}</small>
                      </td>
                      <td><span className="table-secondary">{s.warehouse}</span></td>
                      <td><b>{s.physical}</b> <small>{s.unit}</small></td>
                      <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>{s.reserved}</span></td>
                      <td>
                        <strong style={{ color: s.available <= s.min_threshold ? '#ef4444' : '#22c55e', fontSize: '13px' }}>
                          {s.available}
                        </strong>
                      </td>
                      <td><span style={{ color: 'var(--muted)' }}>{s.min_threshold}</span></td>
                      <td className="table-amount">{formatMoney(s.physical * s.unit_price)} DH</td>
                      <td>
                        <span className={`status-pill ${s.available <= s.min_threshold ? 'status-red' : 'status-green'}`}>
                          {s.available <= s.min_threshold ? 'Seuil critique' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 2: FLOTTE & LIVREURS ════════════════════ */}
      {activeTab === 'drivers' && (
        <>
          {/* Driver KPIs */}
          <div className="metric-grid">
            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>Total Chauffeurs</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <User size={16} />
                </div>
              </div>
              <div className="metric-number">{drivers.length} <small>chauffeurs</small></div>
              <div className="metric-foot">
                <span>Affectés aux dépôts régionaux</span>
              </div>
            </div>

            <div className="metric-card metric-cyan">
              <div className="metric-top">
                <span>Livreurs Dépôt → Client</span>
                <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <Truck size={16} />
                </div>
              </div>
              <div className="metric-number">{clientDriversCount} <small>livreurs</small></div>
              <div className="metric-foot">
                <span>Distribution locale & dernier km</span>
              </div>
            </div>

            <div className="metric-card metric-violet">
              <div className="metric-top">
                <span>Navettes Dépôt → Dépôt</span>
                <div className="metric-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
                  <Building2 size={16} />
                </div>
              </div>
              <div className="metric-number">{interDepotDriversCount} <small>navettes</small></div>
              <div className="metric-foot">
                <span>Transferts inter-villes & lignes</span>
              </div>
            </div>

            <div className="metric-card metric-green">
              <div className="metric-top">
                <span>Actuellement en Mission</span>
                <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <Navigation size={16} />
                </div>
              </div>
              <div className="metric-number">{onMissionCount} <small>en route</small></div>
              <div className="metric-foot">
                <span className="metric-change change-up">Tournées ou transferts actifs</span>
              </div>
            </div>
          </div>

          {/* Drivers Filter & Search Panel */}
          <section className="panel list-panel" style={{ marginTop: '14px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">GESTION FLOTTE & DISPATCH</span>
                <h2>Registre des Chauffeurs & Affectation ({filteredDrivers.length})</h2>
              </div>
              <div className="heading-actions">
                <button className="button-primary" onClick={() => setNewDriverModal(true)}>
                  <Plus size={14} /> Nouveau livreur
                </button>
              </div>
            </div>

            {/* Filter toolbars */}
            <div className="table-tools" style={{ flexWrap: 'wrap', gap: 10 }}>
              <div className="table-tabs">
                <button
                  className={`table-tab ${driverTypeFilter === 'all' ? 'active-tab' : ''}`}
                  onClick={() => setDriverTypeFilter('all')}
                >
                  Tous types ({drivers.length})
                </button>
                <button
                  className={`table-tab ${driverTypeFilter === 'depot_to_client' ? 'active-tab' : ''}`}
                  onClick={() => setDriverTypeFilter('depot_to_client')}
                  style={{ color: '#38bdf8' }}
                >
                  <Truck size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Dépôt → Client ({clientDriversCount})
                </button>
                <button
                  className={`table-tab ${driverTypeFilter === 'depot_to_depot' ? 'active-tab' : ''}`}
                  onClick={() => setDriverTypeFilter('depot_to_depot')}
                  style={{ color: '#a855f7' }}
                >
                  <Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Navette Dépôt → Dépôt ({interDepotDriversCount})
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
                <select
                  className="select-compact"
                  value={driverCityFilter}
                  onChange={(e) => setDriverCityFilter(e.target.value)}
                  style={{ height: 32 }}
                >
                  <option value="all">Toutes les villes & lignes</option>
                  <option value="Casablanca">Casablanca</option>
                  <option value="Mohammedia">Mohammedia</option>
                  <option value="Berrechid">Berrechid</option>
                  <option value="Settat">Settat</option>
                </select>

                <div className="search-field" style={{ minWidth: 200 }}>
                  <Search size={13} />
                  <input
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    placeholder="Chauffeur, matricule, trajet…"
                  />
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>CHAUFFEUR & CONTACT</th>
                    <th>TYPE DE LIVREUR</th>
                    <th>DÉPÔT D'ATTACHE</th>
                    <th>VILLE / LIGNE ASSIGNÉE</th>
                    <th>VÉHICULE & IMMATRICULATION</th>
                    <th>CAPACITÉ</th>
                    <th>STATUT</th>
                    <th className="row-actions">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => {
                    const isClientType = driver.driver_type === 'depot_to_client';
                    return (
                      <tr key={driver.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: isClientType ? 'rgba(56,189,248,0.15)' : 'rgba(168,85,247,0.15)',
                                color: isClientType ? '#38bdf8' : '#a855f7',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 700,
                                fontSize: 11,
                              }}
                            >
                              {driver.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <b className="table-main">{driver.name}</b>
                              <small style={{ display: 'block', color: 'var(--muted)' }}>
                                CIN: {driver.cin} · {driver.phone}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${isClientType ? 'status-blue' : 'status-violet'}`}
                            style={{
                              background: isClientType ? 'rgba(56,189,248,0.12)' : 'rgba(168,85,247,0.12)',
                              color: isClientType ? '#38bdf8' : '#c084fc',
                              borderColor: isClientType ? 'rgba(56,189,248,0.3)' : 'rgba(168,85,247,0.3)',
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          >
                            {isClientType ? <Truck size={12} /> : <Building2 size={12} />}
                            {isClientType ? 'Dépôt → Client' : 'Dépôt → Dépôt'}
                          </span>
                        </td>
                        <td>
                          <span className="table-secondary">{driver.base_depot}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={13} style={{ color: isClientType ? '#38bdf8' : '#a855f7', flex: 'none' }} />
                            <b style={{ fontSize: 12 }}>{driver.assigned_city_or_route}</b>
                          </div>
                          {driver.current_mission && (
                            <small style={{ display: 'block', color: '#f59e0b', marginTop: 2 }}>
                              {driver.current_mission}
                            </small>
                          )}
                        </td>
                        <td>
                          <div>{driver.vehicle_model}</div>
                          <code className="table-ref">{driver.vehicle_plate}</code>
                        </td>
                        <td>
                          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{driver.capacity}</span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              driver.status === 'en_tournee' || driver.status === 'en_transit'
                                ? 'status-green'
                                : driver.status === 'disponible'
                                ? 'status-blue'
                                : 'status-muted'
                            }`}
                          >
                            <i />
                            {driver.status === 'en_tournee'
                              ? 'En tournée'
                              : driver.status === 'en_transit'
                              ? 'En transit navette'
                              : driver.status === 'disponible'
                              ? 'Disponible'
                              : 'En repos'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <a
                              href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(driver.name)},%20message%20du%20responsable%20dépôt.`}
                              target="_blank"
                              rel="noreferrer"
                              className="row-action"
                              style={{ color: '#22c55e' }}
                              title="Contacter sur WhatsApp"
                            >
                              <MessageSquare size={13} />
                            </a>
                            <button
                              className="button-secondary"
                              style={{ height: 26, fontSize: 11, padding: '0 8px' }}
                              onClick={() => toggleDriverStatus(driver.id)}
                            >
                              {driver.status === 'disponible' ? 'Mettre en repos' : 'Rendre disponible'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 3: MOUVEMENTS ════════════════════ */}
      {activeTab === 'movements' && (
        <section className="panel list-panel">
          <div className="list-panel-heading">
            <div>
              <span className="eyebrow">JOURNAL DES STOCKS</span>
              <h2>Derniers mouvements & transferts inter-dépôts</h2>
            </div>
          </div>
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>TYPE MOUVEMENT</th>
                <th>RÉFÉRENCE</th>
                <th>PRODUIT</th>
                <th>QUANTITÉ</th>
                <th>DÉPÔT / TRAJET</th>
                <th>HORODATAGE</th>
              </tr>
            </thead>
            <tbody>
              {MOVEMENTS.map((m, idx) => (
                <tr key={idx}>
                  <td><b>{m.type}</b></td>
                  <td><code className="table-ref">{m.ref}</code></td>
                  <td className="table-main">{m.prod}</td>
                  <td style={{ fontWeight: 700, color: m.qty.includes('+') ? '#22c55e' : '#f59e0b' }}>{m.qty}</td>
                  <td>{m.depot}</td>
                  <td className="table-secondary">{m.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ════════════════════ MODAL : NOUVEAU LIVREUR ════════════════════ */}
      {newDriverModal && (
        <div className="modal-backdrop" onClick={() => setNewDriverModal(false)}>
          <form className="record-modal" onSubmit={handleCreateDriver} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">AFFECTATION DU PERSONNEL · FLOTTE</span>
                <h2>Ajouter un livreur au dépôt</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setNewDriverModal(false)}>
                <X size={16} />
              </button>
            </div>

            <p className="modal-note">
              Sélectionnez le type de livreur selon sa mission opérationnelle : livraison client final ou navette inter-dépôts par ville.
            </p>

            {/* Selector: Driver Type (Crucial user request!) */}
            <div style={{ margin: '14px 0' }}>
              <span className="field-label" style={{ marginBottom: 6 }}>
                Type de chauffeur (Requis) :
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div
                  onClick={() => setFormType('depot_to_client')}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: formType === 'depot_to_client' ? '2px solid #38bdf8' : '1px solid var(--line)',
                    background: formType === 'depot_to_client' ? 'rgba(56,189,248,0.1)' : 'var(--navy-2)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#38bdf8', fontWeight: 700, fontSize: 13 }}>
                    <Truck size={15} />
                    <span>Dépôt → Client</span>
                  </div>
                  <small style={{ display: 'block', color: 'var(--muted)', marginTop: 4, fontSize: 11, lineHeight: 1.4 }}>
                    Distribution locale directe aux clients, magasins & chantiers.
                  </small>
                </div>

                <div
                  onClick={() => setFormType('depot_to_depot')}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: formType === 'depot_to_depot' ? '2px solid #a855f7' : '1px solid var(--line)',
                    background: formType === 'depot_to_depot' ? 'rgba(168,85,247,0.1)' : 'var(--navy-2)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c084fc', fontWeight: 700, fontSize: 13 }}>
                    <Building2 size={15} />
                    <span>Navette Dépôt → Dépôt</span>
                  </div>
                  <small style={{ display: 'block', color: 'var(--muted)', marginTop: 4, fontSize: 11, lineHeight: 1.4 }}>
                    Liaisons régulières et transferts de palettes entre dépôts régionaux.
                  </small>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
              <label className="field-label">
                Nom complet du livreur
                <input
                  required
                  placeholder="Ex. Youssef Berrada"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </label>

              <label className="field-label">
                N° Téléphone
                <input
                  required
                  placeholder="+212 6..."
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              <label className="field-label">
                N° CIN
                <input
                  placeholder="Ex. BK451290"
                  value={formCin}
                  onChange={(e) => setFormCin(e.target.value)}
                />
              </label>

              <label className="field-label">
                N° Permis de conduire
                <input
                  placeholder="Ex. PERM-88214"
                  value={formLicense}
                  onChange={(e) => setFormLicense(e.target.value)}
                />
              </label>
            </div>

            {/* Depot & Route */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              <label className="field-label">
                Dépôt d'attache
                <select
                  className="select-compact"
                  style={{ width: '100%', height: 38 }}
                  value={formBaseDepot}
                  onChange={(e) => setFormBaseDepot(e.target.value)}
                >
                  <option>DEP-01 Casablanca Central</option>
                  <option>DEP-02 Mohammedia</option>
                  <option>DEP-03 Berrechid</option>
                  <option>DEP-04 Settat</option>
                </select>
              </label>

              <label className="field-label">
                {formType === 'depot_to_client' ? 'Zone / Ville de livraison client' : 'Ligne / Villes reliées'}
                <input
                  required
                  placeholder={
                    formType === 'depot_to_client'
                      ? 'Ex. Grand Casablanca & Ain Sebaâ'
                      : 'Ex. Casablanca ↔ Berrechid (Ligne 2)'
                  }
                  value={formRoute}
                  onChange={(e) => setFormRoute(e.target.value)}
                />
              </label>
            </div>

            {/* Vehicle Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10, marginTop: 8 }}>
              <label className="field-label">
                Modèle du véhicule
                <input
                  placeholder="Ex. Renault Master 3.5T"
                  value={formVehicle}
                  onChange={(e) => setFormVehicle(e.target.value)}
                />
              </label>

              <label className="field-label">
                Immatriculation
                <input
                  required
                  placeholder="Ex. 23-A-54321"
                  value={formPlate}
                  onChange={(e) => setFormPlate(e.target.value)}
                />
              </label>

              <label className="field-label">
                Capacité utile
                <input
                  placeholder="Ex. 3.5 T / 4 Pal."
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value)}
                />
              </label>
            </div>

            <div className="modal-actions" style={{ marginTop: 18 }}>
              <button type="button" className="button-secondary" onClick={() => setNewDriverModal(false)}>
                Annuler
              </button>
              <button type="submit" className="button-primary">
                <Plus size={14} /> Enregistrer le livreur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inter-depot Transfer Modal */}
      {transferModal && (
        <div className="modal-backdrop" onClick={() => setTransferModal(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">LOGISTIQUE INTERNE · TRANSFERT</span>
                <h2>Bon de Transfert Inter-Dépôts</h2>
              </div>
              <button className="icon-button" onClick={() => setTransferModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">
              Mouvement en 2 étapes : Sortie du dépôt source puis réception confirmée au dépôt destinataire.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '12px 0' }}>
              <label className="field-label">
                Dépôt Source (Départ)
                <select className="select-compact" style={{ width: '100%', height: 36 }}>
                  <option>Casablanca (DEP-01)</option>
                  <option>Rabat (DEP-02)</option>
                  <option>Berrechid (DEP-03)</option>
                </select>
              </label>
              <label className="field-label">
                Dépôt Destinataire
                <select className="select-compact" style={{ width: '100%', height: 36 }}>
                  <option>Rabat (DEP-02)</option>
                  <option>Casablanca (DEP-01)</option>
                  <option>Berrechid (DEP-03)</option>
                </select>
              </label>
            </div>
            <label className="field-label">
              Chauffeur Navette Dépôt → Dépôt
              <select className="select-compact" style={{ width: '100%', height: 36 }}>
                {drivers
                  .filter((d) => d.driver_type === 'depot_to_depot')
                  .map((d) => (
                    <option key={d.id}>
                      {d.name} — {d.vehicle_model} ({d.assigned_city_or_route})
                    </option>
                  ))}
              </select>
            </label>
            <div className="modal-actions" style={{ marginTop: 14 }}>
              <button className="button-secondary" onClick={() => setTransferModal(false)}>Annuler</button>
              <button
                className="button-primary"
                onClick={() => {
                  setTransferModal(false);
                  notify('Ordre de transfert TRF-0013 créé et assigné au chauffeur navette.');
                }}
              >
                Créer l'ordre de transfert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash closing modal */}
      {closingModal && (
        <div className="modal-backdrop" onClick={() => setClosingModal(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">CLÔTURE JOURNALIÈRE · CAISSE DÉPÔT</span>
                <h2>Clôture de Caisse du Dépôt</h2>
              </div>
              <button className="icon-button" onClick={() => setClosingModal(false)}><X size={16} /></button>
            </div>
            <p className="modal-note">Contrôle des encaissements physiques avant versement bancaire.</p>
            <div style={{ background: 'var(--navy-2)', padding: 12, borderRadius: 8, margin: '12px 0', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total espèces dépôt :</span>
                <b>42 800 DH</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span>Total chèques reçus (3 effets) :</span>
                <b>68 450 DH</b>
              </div>
            </div>
            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setClosingModal(false)}>Annuler</button>
              <button
                className="button-primary"
                onClick={() => {
                  setClosingModal(false);
                  notify('Caisse du dépôt clôturée et horodatée.');
                }}
              >
                Valider la clôture
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
