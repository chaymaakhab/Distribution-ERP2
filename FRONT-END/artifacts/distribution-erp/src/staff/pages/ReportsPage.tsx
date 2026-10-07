import { useState } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, ShoppingBag, Users, Package, Truck,
  Download, RefreshCw, Calendar, Filter, ChevronDown, ArrowUp, ArrowDown,
  Building2, Printer, CheckCircle2, Clock, DollarSign, PieChart,
  Layers, ArrowLeftRight, Check,
} from 'lucide-react';
import { AreaChart, BarList, ColumnChart } from '../components/Charts';
import { formatMoney } from '../api';

// ── Données ─────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct'];

const revenueData = MONTHS.map((m, i) => ({
  month: m,
  CA: Math.round(180000 + Math.sin(i / 2) * 60000 + i * 8000 + (i === 9 ? 35000 : 15000)),
  Encaissé: Math.round(150000 + Math.sin(i / 2) * 40000 + i * 6000 + (i === 9 ? 28000 : 10000)),
}));

const topProducts = [
  { name: 'Huile Végétale 5L', value: 342500, qty: 1550, cat: 'Huiles' },
  { name: 'Sucre Raffiné 50kg', value: 289800, qty: 828, cat: 'Épicerie' },
  { name: 'Farine T55 50kg', value: 215600, qty: 770, cat: 'Minoterie' },
  { name: 'Sel Industriel 25kg', value: 178400, qty: 1480, cat: 'Épicerie' },
  { name: 'Riz Long Grain 50kg', value: 156200, qty: 624, cat: 'Épicerie' },
  { name: 'Lentilles Vertes 25kg', value: 134900, qty: 540, cat: 'Légumineuses' },
];

const topClients = [
  { name: 'Marché Al Matar', value: 218400, city: 'Casablanca', orders: 48, status: 'VIP' },
  { name: 'Épicerie Centrale Saïd', value: 184600, city: 'Mohammedia', orders: 36, status: 'Régulier' },
  { name: 'Grossiste Anfa', value: 152300, city: 'Casablanca', orders: 28, status: 'Grossiste' },
  { name: 'Dist. Ould Hmad', value: 141800, city: 'Berrechid', orders: 25, status: 'Régulier' },
  { name: 'Commerce Général Tazi', value: 128700, city: 'Settat', orders: 22, status: 'Régulier' },
];

const commercials = [
  { name: 'Ahmed Benjelloun', orders: 124, ca: 342800, target: 400000, collected: 296000, rate: 86 },
  { name: 'Fatima Zahra Idrissi', orders: 108, ca: 298500, target: 350000, collected: 274000, rate: 92 },
  { name: 'Khalid Mansouri', orders: 97, ca: 241600, target: 300000, collected: 198000, rate: 82 },
  { name: 'Nadia Boutaleb', orders: 85, ca: 196400, target: 280000, collected: 162000, rate: 82 },
];

const paymentMethodsDistribution = [
  { method: 'Chèques & Effets bancaires', amount: 486200, pct: 45, color: '#38bdf8' },
  { method: 'Espèces (Contre-Remboursement COD)', amount: 378400, pct: 35, color: '#22c55e' },
  { method: 'Virements bancaires B2B', amount: 151360, pct: 14, color: '#a855f7' },
  { method: 'Traites commerciales à terme (60j)', amount: 64840, pct: 6, color: '#f59e0b' },
];

const depotPerformance = [
  { code: 'DEP-01', name: 'Dépôt Central Ain Sebaâ', city: 'Casablanca', orders: 218, ca: 542800, delivered: 204, onTime: 97.2, status: 'Actif' },
  { code: 'DEP-02', name: 'Dépôt Régional Mohammedia', city: 'Mohammedia', orders: 112, ca: 248600, delivered: 108, onTime: 96.4, status: 'Actif' },
  { code: 'DEP-03', name: 'Dépôt Berrechid & Chaouia', city: 'Berrechid', orders: 56, ca: 124300, delivered: 51, onTime: 94.8, status: 'Actif' },
  { code: 'DEP-04', name: 'Plateforme Settat Sud', city: 'Settat', orders: 28, ca: 62400, delivered: 26, onTime: 93.1, status: 'Actif' },
];

type Period = '7j' | '30j' | '3m' | '12m';
type ReportTab = 'sales' | 'products' | 'clients' | 'logistics';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [period, setPeriod] = useState<Period>('30j');
  const [selectedDepot, setSelectedDepot] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState<'ca' | 'orders'>('ca');
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      notify('Données analytiques actualisées depuis la base ERP.');
    }, 800);
  }

  function handleExportCsv() {
    const csvContent = [
      'Indicateur;Valeur',
      'Chiffre d Affaires Total;1080800 DH',
      'Encaissements Reçus;898000 DH',
      'Taux de Recouvrement;87.4 %',
      'Commandes Livrées;389',
      'Taux de Ponctualité Tournées;96.4 %',
      '',
      'Mois;Chiffre d Affaires (DH);Encaissements (DH)',
      ...revenueData.map((d) => `${d.month};${d.CA};${d.Encaissé}`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Rapport-ERP-Hercules-${period}.csv`;
    link.click();
    notify('Rapport exporté au format CSV avec succès.');
  }

  function handlePrint() {
    window.print();
  }

  const chartData = revenueData.slice(-8).map((d) => ({
    label: d.month,
    value: d.CA,
  }));

  const monthlyColumns = MONTHS.slice(-8).map((m, i) => ({
    label: m,
    value: Math.round(130 + i * 12 + Math.random() * 20),
  }));

  return (
    <div className="module-page reports-page">
      {/* ── Page Header ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">PILOTAGE &amp; ANALYTICS <span className="heading-slash">/</span> TABLEAUX DE BORD DÉCISIONNELS</div>
          <h1>Rapports d'Activité &amp; Performance</h1>
          <p>Consolidation du Chiffre d'Affaires, encaissements, rotation de stock et performance logistique multi-dépôts.</p>
        </div>
        <div className="heading-actions">
          <div className="rp-period-tabs">
            {(['7j', '30j', '3m', '12m'] as Period[]).map((p) => (
              <button
                key={p}
                className={`table-tab ${period === p ? 'active-tab' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <select
            className="select-compact"
            value={selectedDepot}
            onChange={(e) => setSelectedDepot(e.target.value)}
            style={{ height: 32 }}
          >
            <option value="all">Tous les dépôts nationaux</option>
            <option value="DEP-01">DEP-01 Casablanca Central</option>
            <option value="DEP-02">DEP-02 Mohammedia</option>
            <option value="DEP-03">DEP-03 Berrechid</option>
            <option value="DEP-04">DEP-04 Settat</option>
          </select>

          <button className="button-secondary" onClick={handleRefresh} disabled={refreshing} title="Actualiser">
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            Actualiser
          </button>
          <button className="button-secondary" onClick={handlePrint} title="Imprimer le rapport">
            <Printer size={14} /> Imprimer (A4)
          </button>
          <button className="button-primary" onClick={handleExportCsv} title="Exporter les données">
            <Download size={14} /> Exporter CSV
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="metric-grid" style={{ marginBottom: 16 }}>
        <div className="metric-card metric-blue">
          <div className="metric-top">
            <span>Chiffre d'Affaires (CA)</span>
            <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="metric-number">{formatMoney(1080800)} <small>DH</small></div>
          <div className="metric-foot">
            <span className="metric-change change-up">+8.4% vs période précédente</span>
          </div>
        </div>

        <div className="metric-card metric-green">
          <div className="metric-top">
            <span>Encaissements Réels</span>
            <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="metric-number">{formatMoney(898000)} <small>DH</small></div>
          <div className="metric-foot">
            <span className="metric-change change-up">87.4% taux de recouvrement</span>
          </div>
        </div>

        <div className="metric-card metric-cyan">
          <div className="metric-top">
            <span>Commandes Traitées</span>
            <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="metric-number">414 <small>commandes</small></div>
          <div className="metric-foot">
            <span>Panier moyen : 2 610 DH</span>
          </div>
        </div>

        <div className="metric-card metric-amber">
          <div className="metric-top">
            <span>Taux de Ponctualité Tournées</span>
            <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <Truck size={16} />
            </div>
          </div>
          <div className="metric-number">96.4 <small>%</small></div>
          <div className="metric-foot">
            <span>389 livraisons réussies sur 404</span>
          </div>
        </div>
      </div>

      {/* ── Sub-navigation Tabs ── */}
      <div className="table-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`table-tab ${activeTab === 'sales' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <TrendingUp size={13} style={{ display: 'inline', marginRight: 5 }} />
          Ventes &amp; Financement
        </button>
        <button
          className={`table-tab ${activeTab === 'products' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={13} style={{ display: 'inline', marginRight: 5 }} />
          Produits &amp; Stocks
        </button>
        <button
          className={`table-tab ${activeTab === 'clients' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <Users size={13} style={{ display: 'inline', marginRight: 5 }} />
          Clients &amp; Équipe Commerciale
        </button>
        <button
          className={`table-tab ${activeTab === 'logistics' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('logistics')}
        >
          <Truck size={13} style={{ display: 'inline', marginRight: 5 }} />
          Logistique &amp; Dépôts
        </button>
      </div>

      {/* ════════════════════ TAB 1 : VENTES & FINANCEMENT ════════════════════ */}
      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="rp-charts-row">
            {/* Revenue Chart */}
            <div className="panel rp-chart-panel" style={{ flex: 2 }}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">ÉVOLUTION COMMERCIALE</span>
                  <h2>Chiffre d'Affaires vs Encaissements Réalisés</h2>
                </div>
                <div className="heading-actions">
                  <button
                    className={`table-tab ${activeChart === 'ca' ? 'active-tab' : ''}`}
                    onClick={() => setActiveChart('ca')}
                  >
                    CA (DH)
                  </button>
                  <button
                    className={`table-tab ${activeChart === 'orders' ? 'active-tab' : ''}`}
                    onClick={() => setActiveChart('orders')}
                  >
                    Volumes (Cmds)
                  </button>
                </div>
              </div>
              <div className="rp-chart-wrap">
                {activeChart === 'ca' ? (
                  <AreaChart
                    data={chartData}
                    color="var(--accent-blue)"
                    valueFormat={(v: number) => formatMoney(v)}
                  />
                ) : (
                  <ColumnChart
                    data={monthlyColumns}
                    color="var(--accent-violet)"
                  />
                )}
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="panel rp-chart-panel" style={{ flex: 1.2 }}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">TRÉSORERIE &amp; MODES DE RÈGLEMENT</span>
                  <h2>Encaissements par canal</h2>
                </div>
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {paymentMethodsDistribution.map((pm) => (
                  <div key={pm.method} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ fontWeight: 600 }}>{pm.method}</span>
                      <b>{formatMoney(pm.amount)} DH ({pm.pct}%)</b>
                    </div>
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pm.pct}%`,
                          height: '100%',
                          background: pm.color,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: 10, borderRadius: 6, background: 'var(--navy-2)', border: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)' }}>
                  <b>Observation CDC :</b> Forte prédominance des chèques et espèces à la livraison (80% du total). Les relances automatiques J+7 sécurisent le recouvrement.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ TAB 2 : PRODUITS & STOCKS ════════════════════ */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="rp-charts-row">
            {/* Top Products */}
            <div className="panel rp-chart-panel" style={{ flex: 1 }}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">PALMARÈS DES VENTES</span>
                  <h2>Top 6 Références par Chiffre d'Affaires</h2>
                </div>
              </div>
              <div className="rp-bar-wrap">
                <BarList
                  data={topProducts.map((p) => ({ label: p.name, value: p.value }))}
                  valueFormat={(v: number) => formatMoney(v)}
                  tone="green"
                />
              </div>
            </div>

            {/* Product Details Table */}
            <div className="panel rp-chart-panel" style={{ flex: 1.5 }}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">VOLUMÉTRIE &amp; ROTATION</span>
                  <h2>Détail des articles phares</h2>
                </div>
              </div>
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>ARTICLE</th>
                    <th>CATÉGORIE</th>
                    <th>QUANTITÉ VENDUE</th>
                    <th className="table-amount">CA RÉALISÉ</th>
                    <th>ROTATION</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.name}>
                      <td className="table-main"><b>{p.name}</b></td>
                      <td><span className="status-pill status-muted">{p.cat}</span></td>
                      <td><b>{p.qty}</b> unités</td>
                      <td className="table-amount">{formatMoney(p.value)} DH</td>
                      <td>
                        <span className="status-pill status-green">
                          <TrendingUp size={11} /> Forte rotation
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ TAB 3 : CLIENTS & COMMERCIAUX ════════════════════ */}
      {activeTab === 'clients' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="rp-charts-row">
            {/* Top Clients */}
            <div className="panel rp-chart-panel" style={{ flex: 1 }}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">PORTEFEUILLE B2B</span>
                  <h2>Top Clients par CA Généré</h2>
                </div>
              </div>
              <div className="rp-bar-wrap">
                <BarList
                  data={topClients.map((c) => ({ label: `${c.name} (${c.city})`, value: c.value }))}
                  valueFormat={(v: number) => formatMoney(v)}
                  tone="blue"
                />
              </div>
            </div>

            {/* Commercial Leaderboard */}
            <div className="panel rp-chart-panel" style={{ flex: 2 }}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">ÉQUIPE COMMERCIALE</span>
                  <h2>Performance &amp; Objectifs par Commercial</h2>
                </div>
              </div>
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Commercial</th>
                    <th>Commandes</th>
                    <th className="table-amount">CA Réalisé</th>
                    <th className="table-amount">Objectif Mensuel</th>
                    <th className="table-amount">Encaissé</th>
                    <th>Atteinte Objectif</th>
                  </tr>
                </thead>
                <tbody>
                  {commercials.map((c, i) => {
                    const pct = Math.round((c.ca / c.target) * 100);
                    return (
                      <tr key={c.name}>
                        <td><strong>#{i + 1}</strong></td>
                        <td className="table-main">{c.name}</td>
                        <td>{c.orders} cmd</td>
                        <td className="table-amount">{formatMoney(c.ca)} DH</td>
                        <td className="table-amount table-secondary">{formatMoney(c.target)} DH</td>
                        <td className="table-amount" style={{ color: '#22c55e' }}>{formatMoney(c.collected)} DH</td>
                        <td>
                          <div className="rp-progress-wrap">
                            <div className="rp-progress-bar">
                              <div
                                className="rp-progress-fill"
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  background: pct >= 90 ? 'var(--accent-green)' : pct >= 75 ? 'var(--accent-blue)' : 'var(--accent-amber)',
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
        </div>
      )}

      {/* ════════════════════ TAB 4 : LOGISTIQUE & DÉPÔTS ════════════════════ */}
      {activeTab === 'logistics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">RÉSEAU MULTI-DÉPÔTS MAROC</span>
                <h2>Performance Logistique &amp; Taux de Livraison par Dépôt</h2>
              </div>
            </div>
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Dépôt Régional</th>
                  <th>Ville / Région</th>
                  <th>Commandes Assignées</th>
                  <th className="table-amount">CA Expédié</th>
                  <th>Livraisons Réalisées</th>
                  <th>Taux Ponctualité</th>
                  <th>Statut Opérationnel</th>
                </tr>
              </thead>
              <tbody>
                {depotPerformance.map((d) => (
                  <tr key={d.code}>
                    <td><code className="table-ref">{d.code}</code></td>
                    <td className="table-main"><b>{d.name}</b></td>
                    <td className="table-secondary">{d.city}</td>
                    <td>{d.orders} commandes</td>
                    <td className="table-amount">{formatMoney(d.ca)} DH</td>
                    <td><b>{d.delivered}</b> livrées</td>
                    <td>
                      <span style={{ color: d.onTime >= 95 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
                        {d.onTime}%
                      </span>
                    </td>
                    <td>
                      <span className="status-pill status-green">
                        <Check size={11} /> {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
