import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, ShoppingBag, Users, Package, Truck,
  Download, RefreshCw, Calendar, Filter, ChevronDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { AreaChart, BarList, ColumnChart } from '../components/Charts';
import { formatMoney } from '../api';

// ─── Mock data ──────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct'];

const revenueData = MONTHS.map((m, i) => ({
  month: m,
  CA: Math.round(180000 + Math.sin(i / 2) * 60000 + i * 8000 + Math.random() * 20000),
  Encaissé: Math.round(150000 + Math.sin(i / 2) * 40000 + i * 6000 + Math.random() * 15000),
}));

const topProducts = [
  { name: 'Huile Végétale 5L', value: 342500 },
  { name: 'Sucre Raffiné 50kg', value: 289800 },
  { name: 'Farine T55 50kg', value: 215600 },
  { name: 'Sel Industriel 25kg', value: 178400 },
  { name: 'Riz Long Grain 50kg', value: 156200 },
  { name: 'Lentilles Vertes 25kg', value: 134900 },
];

const topClients = [
  { name: 'Marché Al Matar', value: 218400, city: 'Casablanca' },
  { name: 'Épicerie Centrale Saïd', value: 184600, city: 'Mohammedia' },
  { name: 'Grossiste Anfa', value: 152300, city: 'Casablanca' },
  { name: 'Dist. Ould Hmad', value: 141800, city: 'Berrechid' },
  { name: 'Commerce Général Tazi', value: 128700, city: 'Settat' },
];

const commercials = [
  { name: 'Ahmed Benjelloun', orders: 124, ca: 342800, target: 400000, collected: 296000 },
  { name: 'Fatima Zahra Idrissi', orders: 108, ca: 298500, target: 350000, collected: 274000 },
  { name: 'Khalid Mansouri', orders: 97, ca: 241600, target: 300000, collected: 198000 },
  { name: 'Nadia Boutaleb', orders: 85, ca: 196400, target: 280000, collected: 162000 },
];

const monthlyColumns = MONTHS.map((m, i) => ({
  label: m,
  value: Math.round(120 + i * 8 + Math.random() * 30),
}));

const KPIs = [
  { label: 'CA Mensuel', value: formatMoney(247800), delta: +8.4, icon: TrendingUp, color: 'var(--accent-green)' },
  { label: 'Commandes', value: '414', delta: +12.1, icon: ShoppingBag, color: 'var(--accent-blue)' },
  { label: 'Clients actifs', value: '96', delta: +3.7, icon: Users, color: 'var(--accent-violet)' },
  { label: 'Livraisons', value: '389', delta: -2.1, icon: Truck, color: 'var(--accent-amber)' },
  { label: 'Produits vendus', value: '2 148', delta: +15.3, icon: Package, color: 'var(--accent-cyan)' },
  { label: 'Taux recouvrement', value: '87 %', delta: +1.2, icon: TrendingDown, color: 'var(--accent-red)' },
];

type Period = '7j' | '30j' | '3m' | '12m';

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('30j');
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState<'ca' | 'orders'>('ca');

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }

  const chartData = revenueData.slice(-8).map(d => ({
    label: d.month,
    value: d.CA,
    value2: d.Encaissé,
  }));

  return (
    <div className="module-page">
      {/* ── Header ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">PILOTAGE <span className="heading-slash">/</span> ANALYTICS</div>
          <h1>Rapports &amp; Analyses</h1>
          <p>Vue consolidée de la performance commerciale et opérationnelle.</p>
        </div>
        <div className="heading-actions">
          <div className="rp-period-tabs">
            {(['7j', '30j', '3m', '12m'] as Period[]).map(p => (
              <button
                key={p}
                className={`table-tab ${period === p ? 'active-tab' : ''}`}
                onClick={() => setPeriod(p)}
              >{p}</button>
            ))}
          </div>
          <button className="button-secondary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            Actualiser
          </button>
          <button className="button-secondary">
            <Download size={14} /> Exporter
          </button>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="rp-kpi-row">
        {KPIs.map(k => (
          <div key={k.label} className="rp-kpi-box">
            <div className="rp-kpi-icon" style={{ background: k.color + '18', color: k.color }}>
              <k.icon size={16} />
            </div>
            <div className="rp-kpi-body">
              <span className="rp-kpi-label">{k.label}</span>
              <strong className="rp-kpi-value">{k.value}</strong>
              <span className={`rp-kpi-delta ${k.delta >= 0 ? 'pos' : 'neg'}`}>
                {k.delta >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {Math.abs(k.delta)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main charts row ── */}
      <div className="rp-charts-row">
        {/* Revenue area chart */}
        <div className="panel rp-chart-panel" style={{ flex: 2 }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">ÉVOLUTION</span>
              <h2>Chiffre d'Affaires vs Encaissements</h2>
            </div>
            <div className="heading-actions">
              <button
                className={`table-tab ${activeChart === 'ca' ? 'active-tab' : ''}`}
                onClick={() => setActiveChart('ca')}
              >CA</button>
              <button
                className={`table-tab ${activeChart === 'orders' ? 'active-tab' : ''}`}
                onClick={() => setActiveChart('orders')}
              >Commandes</button>
            </div>
          </div>
          <div className="rp-chart-wrap">
            {activeChart === 'ca' ? (
              <AreaChart
                data={chartData}
                color="var(--accent-blue)"
                formatter={(v: number) => formatMoney(v)}
              />
            ) : (
              <ColumnChart
                data={monthlyColumns.slice(-8)}
                color="var(--accent-violet)"
                formatter={(v: number) => `${v} cmd`}
              />
            )}
          </div>
        </div>

        {/* Top clients */}
        <div className="panel rp-chart-panel" style={{ flex: 1 }}>
          <div className="panel-heading">
            <div><span className="eyebrow">CLASSEMENT</span><h2>Top clients</h2></div>
          </div>
          <div className="rp-bar-wrap">
            <BarList
              data={topClients.map(c => ({ name: c.name, value: c.value }))}
              formatter={(v: number) => formatMoney(v)}
            />
          </div>
        </div>
      </div>

      {/* ── Second row ── */}
      <div className="rp-charts-row">
        {/* Top products */}
        <div className="panel rp-chart-panel" style={{ flex: 1 }}>
          <div className="panel-heading">
            <div><span className="eyebrow">VENTES</span><h2>Top produits</h2></div>
          </div>
          <div className="rp-bar-wrap">
            <BarList
              data={topProducts.map(p => ({ name: p.name, value: p.value }))}
              formatter={(v: number) => formatMoney(v)}
              color="var(--accent-green)"
            />
          </div>
        </div>

        {/* Commercials leaderboard */}
        <div className="panel rp-chart-panel" style={{ flex: 2 }}>
          <div className="panel-heading">
            <div><span className="eyebrow">PERFORMANCE</span><h2>Équipe commerciale</h2></div>
          </div>
          <table className="data-table module-table" style={{ marginTop: 4 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Commercial</th>
                <th>Commandes</th>
                <th className="table-amount">CA réalisé</th>
                <th className="table-amount">Objectif</th>
                <th className="table-amount">Encaissé</th>
                <th>Atteinte</th>
              </tr>
            </thead>
            <tbody>
              {commercials.map((c, i) => {
                const pct = Math.round((c.ca / c.target) * 100);
                return (
                  <tr key={c.name}>
                    <td><strong>#{i + 1}</strong></td>
                    <td className="table-main">{c.name}</td>
                    <td>{c.orders}</td>
                    <td className="table-amount">{formatMoney(c.ca)}</td>
                    <td className="table-amount table-secondary">{formatMoney(c.target)}</td>
                    <td className="table-amount">{formatMoney(c.collected)}</td>
                    <td>
                      <div className="rp-progress-wrap">
                        <div className="rp-progress-bar">
                          <div
                            className="rp-progress-fill"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: pct >= 100 ? 'var(--accent-green)' : pct >= 70 ? 'var(--accent-amber)' : 'var(--accent-red)',
                            }}
                          />
                        </div>
                        <span className="rp-progress-label">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Depot breakdown ── */}
      <div className="panel">
        <div className="panel-heading">
          <div><span className="eyebrow">DÉPÔTS</span><h2>Répartition par dépôt</h2></div>
        </div>
        <table className="data-table module-table">
          <thead>
            <tr>
              <th>Dépôt</th>
              <th>Ville</th>
              <th>Commandes</th>
              <th className="table-amount">CA</th>
              <th className="table-amount">Livré</th>
              <th>Taux livraison</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {[
              { code: 'DEP-01', name: 'Dépôt Principal', city: 'Casablanca', orders: 218, ca: 542800, delivered: 204, status: 'Actif' },
              { code: 'DEP-02', name: 'Dépôt Mohammedia', city: 'Mohammedia', orders: 112, ca: 248600, delivered: 108, status: 'Actif' },
              { code: 'DEP-03', name: 'Dépôt Berrechid', city: 'Berrechid', orders: 56, ca: 124300, delivered: 51, status: 'Actif' },
              { code: 'DEP-04', name: 'Dépôt Settat', city: 'Settat', orders: 28, ca: 62400, delivered: 26, status: 'Limité' },
            ].map(d => (
              <tr key={d.code}>
                <td><code className="table-ref">{d.code}</code></td>
                <td className="table-main">{d.name}</td>
                <td className="table-secondary">{d.city}</td>
                <td>{d.orders} cmd</td>
                <td className="table-amount">{formatMoney(d.ca)}</td>
                <td>{d.delivered} livrées</td>
                <td>
                  <span className={`status-pill ${d.status === 'Actif' ? 'status-green' : 'status-amber'}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
