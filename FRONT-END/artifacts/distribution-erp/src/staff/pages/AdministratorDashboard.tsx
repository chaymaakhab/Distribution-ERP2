import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Building2, ClipboardCheck, Truck, AlertTriangle, Boxes,
  TrendingUp, Users, ArrowRight, CheckCircle2, XCircle,
  ShoppingBag, ShieldAlert, FileText, Plus, Phone,
} from 'lucide-react';
import {
  api, formatMoney,
  type OverviewKpis, type RevenueData, type WarehouseNode, type PerformanceData,
} from '../api';
import { useStaffAuth } from '../auth';
import { AreaChart, BarList } from '../components/Charts';
import '../admin.css';

interface PendingApprovalOrder {
  id: number;
  ref: string;
  client: string;
  city: string;
  total: number;
  commercial: string;
  credit_status: 'ok' | 'depasse';
  credit_limit: number;
  current_balance: number;
  stock_status: 'disponible' | 'partiel';
}

const PENDING_APPROVALS: PendingApprovalOrder[] = [
  {
    id: 1,
    ref: 'CMD-2406',
    client: 'Atlas Équipements SARL',
    city: 'Casablanca',
    total: 24860.0,
    commercial: 'Youssef Bennani',
    credit_status: 'ok',
    credit_limit: 80000,
    current_balance: 42650,
    stock_status: 'disponible',
  },
  {
    id: 2,
    ref: 'CMD-2408',
    client: 'Maison du Bricolage',
    city: 'Marrakech',
    total: 12450.0,
    commercial: 'Ahmed Idrissi',
    credit_status: 'depasse',
    credit_limit: 35000,
    current_balance: 38200,
    stock_status: 'disponible',
  },
  {
    id: 3,
    ref: 'CMD-2409',
    client: 'Comptoir Al Amal',
    city: 'Fès',
    total: 32100.0,
    commercial: 'Youssef Bennani',
    credit_status: 'depasse',
    credit_limit: 100000,
    current_balance: 104500,
    stock_status: 'partiel',
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

export default function AdministratorDashboard() {
  const { user, workspace } = useStaffAuth();
  const [, setLocation] = useLocation();
  const [kpis, setKpis] = useState<OverviewKpis>(MOCK_KPIS);
  const [revenue, setRevenue] = useState<RevenueData>(MOCK_REVENUE);
  const [perf, setPerf] = useState<PerformanceData | null>(null);
  const [pendingOrders, setPendingOrders] = useState<PendingApprovalOrder[]>(PENDING_APPROVALS);
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    let alive = true;
    Promise.all([api.adminOverview(), api.adminRevenue(), api.adminPerformance()])
      .then(([o, r, p]) => {
        if (!alive) return;
        if (o?.data) setKpis(o.data);
        if (r?.data) setRevenue(r.data);
        if (p?.data) setPerf(p.data);
      })
      .catch(() => {
        // Fallback to rich mock stats
      });
    return () => {
      alive = false;
    };
  }, []);

  function handleApprove(order: PendingApprovalOrder) {
    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
    notify(`Commande ${order.ref} approuvée ! Transmise à l’entrepôt pour préparation.`);
  }

  function handleReject(order: PendingApprovalOrder) {
    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
    notify(`Commande ${order.ref} rejetée. Commercial et client notifiés.`);
  }

  return (
    <div className="dashboard-page sx-admin admin-workspace">
      {/* Operations Header */}
      <div className="page-heading dash-heading" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="eyebrow">PILOTAGE OPÉRATIONNEL <span className="eyebrow-sep">/</span> ADMINISTRATEUR</span>
            <span className="status-pill status-blue" style={{ fontSize: '10px' }}>
              <Building2 size={11} /> Gestion Opérationnelle
            </span>
          </div>
          <h1>Cockpit Opérations & Ventes<span className="title-period">.</span></h1>
          <p>Supervision des flux de commandes, approbations d'encours, gestion des tournées et performance commerciale.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="button-secondary" onClick={() => setLocation(`/${workspace}/orders`)}>
            <ClipboardCheck size={14} /> Toutes les commandes
          </button>
          <button className="button-primary" onClick={() => setLocation(`/${workspace}/customers`)}>
            <Users size={14} /> CRM Clients & Encours
          </button>
        </div>
      </div>

      {/* Operational KPIs */}
      <div className="sx-kpi-cards">
        <div className="sx-card tone-blue">
          <div className="sx-card-top">
            <span>Commandes à Valider</span>
            <span className="sx-card-icon"><ClipboardCheck size={16} /></span>
          </div>
          <div className="sx-card-value">{pendingOrders.length}</div>
          <div className="sx-card-sub">
            {formatMoney(pendingOrders.reduce((a, b) => a + b.total, 0))} DH en attente
          </div>
        </div>

        <div className="sx-card tone-green">
          <div className="sx-card-top">
            <span>Ventes Réalisées ce mois</span>
            <span className="sx-card-icon"><TrendingUp size={16} /></span>
          </div>
          <div className="sx-card-value">{formatMoney(kpis?.ca_month ?? 1284650)} DH</div>
          <div className="sx-card-sub">
            <span className="positive-pill">+12.8% vs. M-1</span>
          </div>
        </div>

        <div className="sx-card tone-violet">
          <div className="sx-card-top">
            <span>Tournées de Livraison</span>
            <span className="sx-card-icon"><Truck size={16} /></span>
          </div>
          <div className="sx-card-value">{kpis?.deliveries_in_progress ?? 4} en cours</div>
          <div className="sx-card-sub">
            {kpis?.deliveries_done ?? 23} livraisons terminées
          </div>
        </div>

        <div className="sx-card tone-amber">
          <div className="sx-card-top">
            <span>Créances & Risques</span>
            <span className="sx-card-icon"><AlertTriangle size={16} /></span>
          </div>
          <div className="sx-card-value">{formatMoney(kpis?.receivables ?? 428560)} DH</div>
          <div className="sx-card-sub">
            {kpis?.unpaid_invoices ?? 11} factures échues
          </div>
        </div>
      </div>

      {/* Main Grid: Approvals Queue & Quick Operations */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: '16px', marginBottom: '16px' }}>
        {/* Approvals Queue */}
        <section className="panel" style={{ padding: '16px' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">FILE D’ATTENTE D’APPROBATION</span>
              <h2>Commandes nécessitant validation administrative ({pendingOrders.length})</h2>
            </div>
            <span className="status-pill status-amber">
              <i /> {pendingOrders.length} à traiter
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <CheckCircle2 size={32} style={{ color: '#22c55e', margin: '0 auto 8px' }} />
              <b>Toutes les commandes sont validées !</b>
              <span>Aucun dossier en attente d'approbation.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {pendingOrders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    background: 'var(--navy-2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="table-ref">{ord.ref}</span>
                        <b style={{ fontSize: '13px' }}>{ord.client}</b>
                        <small style={{ color: 'var(--muted)' }}>({ord.city})</small>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>
                        Commercial : <b>{ord.commercial}</b> · Stock :{' '}
                        <span style={{ color: ord.stock_status === 'disponible' ? '#22c55e' : '#f59e0b' }}>
                          {ord.stock_status === 'disponible' ? 'Entièrement disponible' : 'Partiellement disponible'}
                        </span>
                      </div>
                      {ord.credit_status === 'depasse' && (
                        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '3px', fontWeight: 600 }}>
                          Encours {formatMoney(ord.current_balance)} DH dépasse le plafond ({formatMoney(ord.credit_limit)} DH)
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--text)' }}>
                        {formatMoney(ord.total)} DH
                      </strong>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button
                          className="button-secondary"
                          style={{ height: '28px', padding: '0 8px', fontSize: '11px', color: '#ef4444' }}
                          onClick={() => handleReject(ord)}
                        >
                          <XCircle size={13} /> Rejeter
                        </button>
                        <button
                          className="button-primary"
                          style={{ height: '28px', padding: '0 10px', fontSize: '11px', background: '#22c55e', borderColor: '#16a34a' }}
                          onClick={() => handleApprove(ord)}
                        >
                          <CheckCircle2 size={13} /> Approuver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Commercial Leaderboard */}
        <section className="panel" style={{ padding: '16px' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">EQUIPE COMMERCIALE</span>
              <h2>Classement des Ventes</h2>
            </div>
            <button className="more-button" onClick={() => setLocation(`/${workspace}/reports`)}>
              Rapports <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {(perf?.commercials ?? [
              { name: 'Youssef Bennani', orders_count: 48, customers_count: 14, revenue: 584200 },
              { name: 'Salma Idrissi', orders_count: 34, customers_count: 11, revenue: 342100 },
              { name: 'Omar Tazi', orders_count: 26, customers_count: 8, revenue: 218900 },
              { name: 'Hicham Alaoui', orders_count: 18, customers_count: 6, revenue: 139450 },
            ]).map((c, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '7px',
                  border: '1px solid var(--line)',
                  background: 'var(--navy-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: idx === 0 ? '#f59e0b' : '#3b82f6', color: '#fff', fontSize: '10.5px', fontWeight: 800, display: 'grid', placeItems: 'center' }}>
                    {idx + 1}
                  </span>
                  <div>
                    <b style={{ fontSize: '12px' }}>{c.name}</b>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px' }}>
                      {c.orders_count} commandes · {c.customers_count} clients
                    </small>
                  </div>
                </div>
                <strong style={{ fontSize: '13px', color: '#22c55e' }}>
                  {formatMoney(c.revenue)} DH
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Analytics Chart */}
      <section className="panel sx-panel" style={{ marginBottom: '16px' }}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">ANALYSE CONSOLIDÉE</span>
            <h2>Évolution des Ventes</h2>
          </div>
          <span className="sx-chip">30 derniers jours</span>
        </div>
        <AreaChart data={revenue?.by_day ?? []} />
      </section>

      {/* Operational Modules Navigation */}
      <section className="panel sx-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">MODULES OPÉRATIONNELS</span>
            <h2>Gestion quotidienne</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/orders`)}>
            <span className="sx-mod-icon"><ClipboardCheck size={18} /></span>
            <span className="sx-mod-copy">
              <b>Commandes</b>
              <small>Validation & suivi</small>
            </span>
            <ArrowRight size={15} />
          </button>

          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/inventory`)}>
            <span className="sx-mod-icon"><Boxes size={18} /></span>
            <span className="sx-mod-copy">
              <b>Stocks & Transferts</b>
              <small>Disponibilités dépôts</small>
            </span>
            <ArrowRight size={15} />
          </button>

          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/deliveries`)}>
            <span className="sx-mod-icon"><Truck size={18} /></span>
            <span className="sx-mod-copy">
              <b>Tournées & Livraisons</b>
              <small>Suivi POD & chauffeurs</small>
            </span>
            <ArrowRight size={15} />
          </button>

          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/finance`)}>
            <span className="sx-mod-icon"><FileText size={18} /></span>
            <span className="sx-mod-copy">
              <b>Facturation & Effets</b>
              <small>Factures & chèques</small>
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
