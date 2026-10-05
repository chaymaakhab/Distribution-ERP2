import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  BadgeDollarSign, ClipboardList, Truck, AlertTriangle, Wallet, MapPin,
  TrendingUp, TrendingDown, Package, Users, ArrowRight, RotateCcw,
} from 'lucide-react';
import {
  api, formatMoney,
  type OverviewKpis, type RevenueData, type WarehouseNode, type PerformanceData,
} from '../api';
import { useStaffAuth } from '../auth';
import { AreaChart, BarList, ColumnChart } from '../components/Charts';
import { MapCanvas, MapLegend } from '../components/MapCanvas';

type Tab = 'jour' | 'mois';

export default function AdminDashboard() {
  const { user, workspace } = useStaffAuth();
  const [, setLocation] = useLocation();
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseNode[] | null>(null);
  const [perf, setPerf] = useState<PerformanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('jour');

  useEffect(() => {
    let alive = true;
    Promise.all([api.adminOverview(), api.adminRevenue(), api.adminWarehouses(), api.adminPerformance()])
      .then(([o, r, w, p]) => {
        if (!alive) return;
        setKpis(o.data);
        setRevenue(r.data);
        setWarehouses(w.data);
        setPerf(p.data);
      })
      .catch((e) => alive && setError(e?.message ?? 'Impossible de charger les indicateurs.'));
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return (
      <div className="sx-denied">
        <div className="sx-denied-icon"><AlertTriangle size={24} /></div>
        <h2>Données indisponibles</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!kpis || !revenue) return <DashboardSkeleton />;

  const firstName = user?.name.split(' ')[0] ?? '';
  const delta = kpis.ca_month_delta;
  const series = tab === 'jour' ? revenue.by_day : revenue.by_month;

  return (
    <div className="dashboard-page sx-admin">
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">VISION GLOBALE <span className="eyebrow-sep">/</span> HERCULES ERP</span>
          <h1>Bonjour, {firstName}<span className="title-period">.</span></h1>
          <p>Pilotage consolidé de l’ensemble des dépôts et de l’activité commerciale.</p>
        </div>
        <div className="sx-range">
          {(['jour', 'mois'] as Tab[]).map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t === 'jour' ? '30 jours' : '12 mois'}
            </button>
          ))}
        </div>
      </div>

      <div className="sx-kpi-cards">
        <KpiCard icon={BadgeDollarSign} tone="blue" label="CA aujourd’hui" value={`${formatMoney(kpis.ca_today)} DH`} sub={`${kpis.orders_today} commandes du jour`} />
        <KpiCard
          icon={Wallet} tone="green" label="CA du mois" value={`${formatMoney(kpis.ca_month)} DH`}
          sub={delta === null ? 'vs. mois précédent' : `${delta >= 0 ? '+' : ''}${delta}% vs. M-1`}
          trend={delta === null ? undefined : delta >= 0 ? 'up' : 'down'}
        />
        <KpiCard icon={ClipboardList} tone="cyan" label="Commandes" value={String(kpis.orders_total)} sub={`${kpis.orders_to_validate} à valider`} />
        <KpiCard icon={Truck} tone="violet" label="Livraisons" value={String(kpis.deliveries_in_progress)} sub={`${kpis.deliveries_done} terminées`} />
        <KpiCard icon={AlertTriangle} tone="amber" label="Créances" value={`${formatMoney(kpis.receivables)} DH`} sub={`${kpis.unpaid_invoices} factures impayées`} />
        <KpiCard icon={Package} tone="red" label="Ruptures" value={String(kpis.stock_ruptures)} sub={`${kpis.stock_low} références faibles`} />
        <KpiCard icon={Wallet} tone="green" label="Encaissements" value={`${formatMoney(kpis.payments_total)} DH`} sub={`${formatMoney(kpis.payments_today)} DH aujourd’hui`} />
        <KpiCard icon={RotateCcw} tone="slate" label="Retours" value={String(kpis.returns)} sub={`${kpis.customers_count} clients · ${kpis.products_count} produits`} />
      </div>

      <div className="sx-grid-2">
        <section className="panel sx-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">PERFORMANCE COMMERCIALE</span><h2>Chiffre d’affaires</h2></div>
            <span className="sx-chip">{tab === 'jour' ? '30 derniers jours' : '12 derniers mois'}</span>
          </div>
          <AreaChart data={series} />
        </section>

        <section className="panel sx-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">RÉPARTITION</span><h2>CA par dépôt</h2></div>
            <button className="more-button" onClick={() => setLocation(`/${workspace}/warehouses`)}>Carte <ArrowRight size={14} /></button>
          </div>
          <BarList data={revenue.by_warehouse} tone="blue" />
          <div className="panel-heading sx-subhead">
            <div><span className="eyebrow">GEOGRAPHIE</span><h2>CA par ville</h2></div>
          </div>
          <BarList data={revenue.by_city} tone="violet" />
        </section>
      </div>

      <div className="sx-grid-2">
        <section className="panel sx-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">RÉSEAU</span><h2>Carte des dépôts</h2></div>
            <button className="more-button" onClick={() => setLocation(`/${workspace}/warehouses`)}>Agrandir <ArrowRight size={14} /></button>
          </div>
          <div className="sx-map-wrap">
            <MapCanvas warehouses={warehouses ?? []} compact onSelect={(id) => setLocation(`/${workspace}/warehouses?depot=${id}`)} />
            <MapLegend />
          </div>
        </section>

        <section className="panel sx-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">TOP RÉFÉRENCES</span><h2>Ventes par produit</h2></div>
          </div>
          <BarList data={revenue.top_products} tone="green" showMeta="qty" />
          <div className="panel-heading sx-subhead">
            <div><span className="eyebrow">FLUX</span><h2>Évolution des commandes</h2></div>
          </div>
          <ColumnChart data={revenue.orders_evolution} />
        </section>
      </div>

      {perf && (
        <div className="sx-grid-3">
          <PerfTable
            title="Performance commerciale" icon={Users}
            head={['Commercial', 'Cde', 'Clients', 'CA']}
            rows={perf.commercials.map((c) => [c.name, String(c.orders_count), String(c.customers_count), `${formatMoney(c.revenue)} DH`])}
          />
          <PerfTable
            title="Performance dépôts" icon={MapPin}
            head={['Dépôt', 'Cde', 'Stock dispo', 'CA']}
            rows={perf.warehouses.map((w) => [w.name, String(w.orders_count), String(w.stock_available), `${formatMoney(w.revenue)} DH`])}
          />
          <PerfTable
            title="Performance livreurs" icon={Truck}
            head={['Livreur', 'Tour.', 'Livrées', 'Encaissé']}
            rows={perf.drivers.map((d) => [d.name, String(d.deliveries_count), String(d.delivered), `${formatMoney(d.amount)} DH`])}
          />
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon, tone, label, value, sub, trend,
}: {
  icon: typeof BadgeDollarSign; tone: string; label: string; value: string; sub: string; trend?: 'up' | 'down';
}) {
  return (
    <div className={`sx-card tone-${tone}`}>
      <div className="sx-card-top">
        <span>{label}</span>
        <span className="sx-card-icon"><Icon size={16} /></span>
      </div>
      <div className="sx-card-value">{value}</div>
      <div className="sx-card-sub">
        {trend === 'up' && <TrendingUp size={13} className="up" />}
        {trend === 'down' && <TrendingDown size={13} className="down" />}
        {sub}
      </div>
    </div>
  );
}

function PerfTable({ title, icon: Icon, head, rows }: {
  title: string; icon: typeof Users; head: string[]; rows: string[][];
}) {
  return (
    <section className="panel sx-panel">
      <div className="panel-heading">
        <div><span className="eyebrow"><Icon size={11} /> CLASSEMENT</span><h2>{title}</h2></div>
      </div>
      <table className="sx-table">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={head.length} className="sx-empty-inline">Aucune donnée.</td></tr>}
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className={j === 0 ? 'sx-td-main' : 'sx-td-num'}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-page sx-admin">
      <div className="page-heading dash-heading">
        <div><span className="eyebrow">CHARGEMENT</span><h1>Tableau de bord…</h1></div>
      </div>
      <div className="sx-kpi-cards">
        {Array.from({ length: 8 }).map((_, i) => <div className="sx-card sx-skeleton" key={i} />)}
      </div>
      <div className="sx-grid-2">
        <div className="panel sx-panel sx-skeleton sx-skeleton-lg" />
        <div className="panel sx-panel sx-skeleton sx-skeleton-lg" />
      </div>
    </div>
  );
}
