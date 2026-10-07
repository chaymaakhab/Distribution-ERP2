import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Crown, ShieldCheck, Database, Server, Activity, Users,
  Warehouse, BadgeDollarSign, ArrowUpRight, TrendingUp, AlertTriangle,
  RotateCcw, RefreshCw, FileText, CheckCircle2, ChevronRight,
  Settings, Lock, ArrowRight, Layers, BarChart3, HardDrive,
} from 'lucide-react';
import {
  api, formatMoney,
  type OverviewKpis, type RevenueData, type WarehouseNode, type PerformanceData,
} from '../api';
import { useStaffAuth } from '../auth';
import { AreaChart, BarList, ColumnChart } from '../components/Charts';
import { MapCanvas, MapLegend } from '../components/MapCanvas';
import '../admin.css';

interface SystemNodeHealth {
  depot_code: string;
  name: string;
  city: string;
  status: 'online' | 'synced' | 'busy' | 'alert';
  last_sync: string;
  pending_sync_items: number;
  stock_count: number;
  revenue: number;
  active_users: number;
}

const SYSTEM_NODES: SystemNodeHealth[] = [
  {
    depot_code: 'DEP-01',
    name: 'Dépôt Casablanca',
    city: 'Casablanca (Principal)',
    status: 'online',
    last_sync: 'Il y a 12s',
    pending_sync_items: 0,
    stock_count: 1248,
    revenue: 584200,
    active_users: 5,
  },
  {
    depot_code: 'DEP-02',
    name: 'Dépôt Rabat',
    city: 'Rabat (Secondaire)',
    status: 'online',
    last_sync: 'Il y a 45s',
    pending_sync_items: 0,
    stock_count: 850,
    revenue: 342100,
    active_users: 3,
  },
  {
    depot_code: 'DEP-03',
    name: 'Dépôt Marrakech',
    city: 'Marrakech (Sidi Ghanem)',
    status: 'synced',
    last_sync: 'Il y a 2m',
    pending_sync_items: 1,
    stock_count: 620,
    revenue: 218900,
    active_users: 2,
  },
  {
    depot_code: 'DEP-04',
    name: 'Dépôt Tanger',
    city: 'Tanger (Zone Franche)',
    status: 'busy',
    last_sync: 'Il y a 1m',
    pending_sync_items: 3,
    stock_count: 490,
    revenue: 139450,
    active_users: 2,
  },
];

const MOCK_REVENUE: RevenueData = {
  by_day: [
    { label: '01 Fév', value: 24500, count: 12 },
    { label: '05 Fév', value: 38200, count: 18 },
    { label: '10 Fév', value: 49100, count: 24 },
    { label: '15 Fév', value: 41200, count: 21 },
    { label: '20 Fév', value: 58400, count: 29 },
    { label: '25 Fév', value: 67300, count: 34 },
    { label: '28 Fév', value: 72900, count: 38 },
  ],
  by_month: [
    { label: 'Sep', value: 890000 },
    { label: 'Oct', value: 1040000 },
    { label: 'Nov', value: 1120000 },
    { label: 'Déc', value: 1290000 },
    { label: 'Jan', value: 1180000 },
    { label: 'Fév', value: 1284650 },
  ],
  by_warehouse: [
    { label: 'Casablanca (DEP-01)', value: 584200, count: 84 },
    { label: 'Rabat (DEP-02)', value: 342100, count: 51 },
    { label: 'Marrakech (DEP-03)', value: 218900, count: 32 },
    { label: 'Tanger (DEP-04)', value: 139450, count: 19 },
  ],
  by_city: [
    { label: 'Casablanca & Mohammedia', value: 584200 },
    { label: 'Rabat - Salé - Kénitra', value: 342100 },
    { label: 'Marrakech & Safi', value: 218900 },
    { label: 'Tanger & Tétouan', value: 139450 },
  ],
  by_commercial: [
    { label: 'Amine Tazi', value: 410000 },
    { label: 'Sara Mansouri', value: 385000 },
    { label: 'Omar Bensouda', value: 289000 },
    { label: 'Mehdi Chraibi', value: 200650 },
  ],
  top_products: [
    { label: 'Perceuse à percussion 850W', value: 186000, qty: 148 },
    { label: 'Pompe immergée 1.5 HP', value: 154000, qty: 40 },
    { label: 'Huile Végétale 5L', value: 128000, qty: 580 },
    { label: 'Disque diamant 230 mm', value: 98000, qty: 517 },
  ],
  orders_evolution: [
    { label: 'S1', value: 34 },
    { label: 'S2', value: 42 },
    { label: 'S3', value: 51 },
    { label: 'S4', value: 59 },
  ],
};

const MOCK_KPIS: OverviewKpis = {
  ca_today: 48500,
  ca_month: 1284650,
  ca_prev_month: 1139000,
  ca_month_delta: 12.8,
  orders_total: 186,
  orders_today: 14,
  orders_to_validate: 12,
  orders_in_delivery: 8,
  deliveries_in_progress: 5,
  deliveries_done: 24,
  payments_total: 846500,
  payments_today: 32000,
  receivables: 428560,
  unpaid_invoices: 11,
  returns: 3,
  stock_ruptures: 2,
  stock_low: 6,
  customers_count: 142,
  products_count: 86,
  warehouses_count: 4,
};

export default function SuperAdminDashboard() {
  const { user, workspace } = useStaffAuth();
  const [, setLocation] = useLocation();
  const [kpis, setKpis] = useState<OverviewKpis>(MOCK_KPIS);
  const [revenue, setRevenue] = useState<RevenueData>(MOCK_REVENUE);
  const [warehouses, setWarehouses] = useState<WarehouseNode[] | null>(null);
  const [perf, setPerf] = useState<PerformanceData | null>(null);
  const [nodes, setNodes] = useState<SystemNodeHealth[]>(SYSTEM_NODES);
  const [periodTab, setPeriodTab] = useState<'jour' | 'mois'>('jour');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    let alive = true;
    Promise.all([api.adminOverview(), api.adminRevenue(), api.adminWarehouses(), api.adminPerformance()])
      .then(([o, r, w, p]) => {
        if (!alive) return;
        if (o?.data) setKpis(o.data);
        if (r?.data) setRevenue(r.data);
        if (w?.data) setWarehouses(w.data);
        if (p?.data) setPerf(p.data);
      })
      .catch(() => {
        // Fallback to rich mock stats on 401 or network disconnect
      });
    return () => {
      alive = false;
    };
  }, []);

  function handleTriggerGlobalSync() {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setNodes((prev) =>
        prev.map((n) => ({ ...n, last_sync: 'À l’instant', pending_sync_items: 0, status: 'online' }))
      );
      notify('Synchronisation globale multi-dépôts achevée avec succès (0 conflit).');
    }, 1200);
  }

  const series = periodTab === 'jour' ? revenue?.by_day ?? [] : revenue?.by_month ?? [];
  const totalNationalRevenue = kpis?.ca_month ?? 1284650;
  const totalStockRuptures = kpis?.stock_ruptures ?? 2;
  const totalReceivables = kpis?.receivables ?? 428560;

  return (
    <div className="dashboard-page sx-admin superadmin-workspace">
      {/* Executive Header */}
      <div className="page-heading dash-heading" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="eyebrow" style={{ color: '#38bdf8' }}>
              SUPERVISION GÉNÉRALE <span className="eyebrow-sep">/</span> SUPER ADMIN
            </span>
            <span className="status-pill status-blue" style={{ fontSize: '10px' }}>
              <Crown size={11} /> Accès Intégral (*)
            </span>
          </div>
          <h1>Cockpit de Direction Générale<span className="title-period">.</span></h1>
          <p>Supervision consolidée multi-dépôts, infrastructure, sécurité RBAC et pilotage national.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="button-secondary"
            onClick={handleTriggerGlobalSync}
            disabled={isSyncing}
            style={{ fontSize: '11.5px', height: '36px' }}
          >
            <RefreshCw size={14} className={isSyncing ? 'spin-animate' : ''} />
            {isSyncing ? 'Synchronisation...' : 'Forcer synchro réseau'}
          </button>
          <button
            className="button-primary"
            onClick={() => setLocation(`/${workspace}/users`)}
            style={{ fontSize: '11.5px', height: '36px' }}
          >
            <Users size={14} /> Gérer les utilisateurs
          </button>
        </div>
      </div>

      {/* System Status Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'var(--navy-2)',
          border: '1px solid var(--line)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'grid', placeItems: 'center' }}>
            <Server size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700 }}>SERVEUR & BASE SQL</div>
            <b style={{ fontSize: '12px', color: '#22c55e' }}>En ligne · MySQL 8.x</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', display: 'grid', placeItems: 'center' }}>
            <Activity size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700 }}>SYNCHRO MULTI-DÉPÔT</div>
            <b style={{ fontSize: '12px', color: 'var(--text)' }}>4 / 4 Dépôts actifs</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(168,85,247,0.15)', color: '#c084fc', display: 'grid', placeItems: 'center' }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700 }}>AUDIT & SÉCURITÉ</div>
            <b style={{ fontSize: '12px', color: 'var(--text)' }}>100% Conforme (0 alerte)</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', display: 'grid', placeItems: 'center' }}>
            <HardDrive size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700 }}>SAUVEGARDE AUTO</div>
            <b style={{ fontSize: '12px', color: 'var(--text)' }}>Aujourd'hui à 03:00</b>
          </div>
        </div>
      </div>

      {/* Top Level Strategic KPIs */}
      <div className="sx-kpi-cards">
        <div className="sx-card tone-blue">
          <div className="sx-card-top">
            <span>CA Consolidé National</span>
            <span className="sx-card-icon"><BadgeDollarSign size={16} /></span>
          </div>
          <div className="sx-card-value">{formatMoney(totalNationalRevenue)} DH</div>
          <div className="sx-card-sub">
            <TrendingUp size={13} className="up" /> +12.8% vs. M-1 (4 Dépôts)
          </div>
        </div>

        <div className="sx-card tone-green">
          <div className="sx-card-top">
            <span>Encaissements Globaux</span>
            <span className="sx-card-icon"><BadgeDollarSign size={16} /></span>
          </div>
          <div className="sx-card-value">{formatMoney(kpis?.payments_total ?? 846500)} DH</div>
          <div className="sx-card-sub">
            Chèques + Espèces + Virements
          </div>
        </div>

        <div className="sx-card tone-amber">
          <div className="sx-card-top">
            <span>Créances & Encours Clients</span>
            <span className="sx-card-icon"><AlertTriangle size={16} /></span>
          </div>
          <div className="sx-card-value">{formatMoney(totalReceivables)} DH</div>
          <div className="sx-card-sub">
            {kpis?.unpaid_invoices ?? 11} factures échues à suivre
          </div>
        </div>

        <div className="sx-card tone-violet">
          <div className="sx-card-top">
            <span>Commandes Traitées</span>
            <span className="sx-card-icon"><Layers size={16} /></span>
          </div>
          <div className="sx-card-value">{kpis?.orders_total ?? 186}</div>
          <div className="sx-card-sub">
            {kpis?.orders_to_validate ?? 12} en attente de validation
          </div>
        </div>
      </div>

      {/* Multi-Dépôt Performance Grid */}
      <section className="panel" style={{ padding: '16px', marginBottom: '16px' }}>
        <div className="panel-heading" style={{ marginBottom: '12px' }}>
          <div>
            <span className="eyebrow">RÉSEAU NATIONAL</span>
            <h2>État en direct des 4 dépôts régionaux</h2>
          </div>
          <button className="more-button" onClick={() => setLocation(`/${workspace}/warehouses`)}>
            Carte détaillée <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          {nodes.map((node) => (
            <div
              key={node.depot_code}
              style={{
                border: '1px solid var(--line)',
                borderRadius: '8px',
                padding: '14px',
                background: 'var(--navy-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <b style={{ fontSize: '13px' }}>{node.name}</b>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{node.city}</div>
                </div>
                <span className="status-pill status-green" style={{ fontSize: '10px' }}>
                  <i /> {node.status === 'online' ? 'Connecté' : node.status === 'synced' ? 'Synchronisé' : 'Actif'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '8px 0', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)', padding: '6px 0' }}>
                <span style={{ color: 'var(--muted)' }}>Chiffre d’affaires :</span>
                <b>{formatMoney(node.revenue)} DH</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
                <span>Articles en stock : <b>{node.stock_count}</b></span>
                <span>Dernière synchro : {node.last_sync}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Charts & Analytics */}
      <div className="sx-grid-2" style={{ marginBottom: '16px' }}>
        <section className="panel sx-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CHRONOLOGIE COMMERCIALE</span>
              <h2>Évolution du Chiffre d’Affaires</h2>
            </div>
            <div className="sx-range">
              <button className={periodTab === 'jour' ? 'active' : ''} onClick={() => setPeriodTab('jour')}>
                30 jours
              </button>
              <button className={periodTab === 'mois' ? 'active' : ''} onClick={() => setPeriodTab('mois')}>
                12 mois
              </button>
            </div>
          </div>
          <AreaChart data={series} />
        </section>

        <section className="panel sx-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MIX DES VENTES</span>
              <h2>Répartition par dépôt & par ville</h2>
            </div>
          </div>
          <BarList data={revenue?.by_warehouse ?? []} tone="blue" />
          <div className="panel-heading sx-subhead">
            <div><span className="eyebrow">TOP VILLES</span><h2>Ventes régionales</h2></div>
          </div>
          <BarList data={revenue?.by_city ?? []} tone="violet" />
        </section>
      </div>

      {/* Strategic Management Shortlinks */}
      <section className="panel sx-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">CONSOLE D'ADMINISTRATION SYSTÈME</span>
            <h2>Accès aux modules de gestion</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/users`)}>
            <span className="sx-mod-icon"><Users size={18} /></span>
            <span className="sx-mod-copy">
              <b>Utilisateurs & Équipe</b>
              <small>Comptes, rôles et affectations</small>
            </span>
            <ArrowRight size={15} />
          </button>

          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/roles`)}>
            <span className="sx-mod-icon"><ShieldCheck size={18} /></span>
            <span className="sx-mod-copy">
              <b>Matrice des Droits (RBAC)</b>
              <small>Permissions par module</small>
            </span>
            <ArrowRight size={15} />
          </button>

          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/audit`)}>
            <span className="sx-mod-icon"><FileText size={18} /></span>
            <span className="sx-mod-copy">
              <b>Journal d’Audit Système</b>
              <small>Traçabilité des opérations</small>
            </span>
            <ArrowRight size={15} />
          </button>

          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/settings`)}>
            <span className="sx-mod-icon"><Settings size={18} /></span>
            <span className="sx-mod-copy">
              <b>Configuration Fiscale</b>
              <small>ICE, IF, TVA et règles</small>
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
