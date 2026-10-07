import { useState } from 'react';
import {
  ShoppingCart, Search, Plus, CheckCircle2, Clock, X, PackageCheck,
  Truck, AlertTriangle, Eye, Download, Building2, Printer, FileText,
} from 'lucide-react';
import { formatMoney } from '../api';
import PurchaseOrderDocumentModal, { type PurchaseOrderData } from '../components/PurchaseOrderDocumentModal';
import NewPurchaseOrderModal from '../components/NewPurchaseOrderModal';

type POStatus = 'Brouillon' | 'Envoyé' | 'Confirmé' | 'En transit' | 'Reçu' | 'Annulé';

interface POLine {
  product: string;
  qty_ordered: number;
  qty_received: number;
  unit_price: number;
  unit: string;
}

interface PurchaseOrder {
  id: number;
  ref: string;
  supplier: string;
  supplier_code: string;
  supplier_ice?: string;
  supplier_address?: string;
  warehouse: string;
  date: string;
  expected: string;
  status: POStatus;
  total_ht: number;
  tva: number;
  total_ttc: number;
  lines: POLine[];
  payment_terms?: string;
}

const ORDERS: PurchaseOrder[] = [
  {
    id: 1,
    ref: 'BC-2026-042',
    supplier: 'Lesieur Cristal',
    supplier_code: 'FRN-002',
    warehouse: 'DEP-01 · Casablanca',
    date: '01 Oct 2026',
    expected: '06 Oct 2026',
    status: 'En transit',
    total_ht: 148333.33,
    tva: 29666.67,
    total_ttc: 178000.0,
    lines: [
      { product: 'Huile Végétale 5L', qty_ordered: 500, qty_received: 0, unit_price: 220, unit: 'bidon' },
      { product: 'Huile Olive 1L', qty_ordered: 200, qty_received: 0, unit_price: 85, unit: 'bouteille' },
    ],
  },
  {
    id: 2,
    ref: 'BC-2026-041',
    supplier: 'Cosumar S.A.',
    supplier_code: 'FRN-001',
    warehouse: 'DEP-01 · Casablanca',
    date: '28 Sep 2026',
    expected: '03 Oct 2026',
    status: 'Reçu',
    total_ht: 87500.0,
    tva: 17500.0,
    total_ttc: 105000.0,
    lines: [
      { product: 'Sucre Raffiné 50kg', qty_ordered: 200, qty_received: 200, unit_price: 350, unit: 'sac' },
      { product: 'Sucre Glace 25kg', qty_ordered: 100, qty_received: 100, unit_price: 175, unit: 'sac' },
    ],
  },
  {
    id: 3,
    ref: 'BC-2026-040',
    supplier: 'Minoterie Tazi & Fils',
    supplier_code: 'FRN-003',
    warehouse: 'DEP-02 · Mohammedia',
    date: '25 Sep 2026',
    expected: '02 Oct 2026',
    status: 'Confirmé',
    total_ht: 62500.0,
    tva: 12500.0,
    total_ttc: 75000.0,
    lines: [
      { product: 'Farine T55 50kg', qty_ordered: 150, qty_received: 0, unit_price: 280, unit: 'sac' },
      { product: 'Semoule Fine 25kg', qty_ordered: 100, qty_received: 0, unit_price: 145, unit: 'sac' },
    ],
  },
  {
    id: 4,
    ref: 'BC-2026-039',
    supplier: 'Salines du Gharb',
    supplier_code: 'FRN-004',
    warehouse: 'DEP-01 · Casablanca',
    date: '20 Sep 2026',
    expected: '30 Sep 2026',
    status: 'Reçu',
    total_ht: 28333.33,
    tva: 5666.67,
    total_ttc: 34000.0,
    lines: [
      { product: 'Sel Industriel 25kg', qty_ordered: 200, qty_received: 200, unit_price: 120, unit: 'sac' },
    ],
  },
  {
    id: 5,
    ref: 'BC-2026-038',
    supplier: 'Import Légumes Sec SARL',
    supplier_code: 'FRN-006',
    warehouse: 'DEP-01 · Casablanca',
    date: '15 Sep 2026',
    expected: '22 Sep 2026',
    status: 'Annulé',
    total_ht: 42000.0,
    tva: 8400.0,
    total_ttc: 50400.0,
    lines: [
      { product: 'Lentilles Vertes 25kg', qty_ordered: 120, qty_received: 0, unit_price: 250, unit: 'sac' },
    ],
  },
  {
    id: 6,
    ref: 'BC-2026-043',
    supplier: 'Cosumar S.A.',
    supplier_code: 'FRN-001',
    warehouse: 'DEP-03 · Berrechid',
    date: '04 Oct 2026',
    expected: '10 Oct 2026',
    status: 'Brouillon',
    total_ht: 52083.33,
    tva: 10416.67,
    total_ttc: 62500.0,
    lines: [
      { product: 'Sucre Raffiné 50kg', qty_ordered: 150, qty_received: 0, unit_price: 350, unit: 'sac' },
    ],
  },
];

const STATUS_COLORS: Record<POStatus, string> = {
  Brouillon: 'status-muted',
  Envoyé: 'status-blue',
  Confirmé: 'status-amber',
  'En transit': 'status-amber',
  Reçu: 'status-green',
  Annulé: 'status-red',
};

const STATUS_ICONS: Record<POStatus, React.ReactNode> = {
  Brouillon: <Clock size={12} />,
  Envoyé: <ShoppingCart size={12} />,
  Confirmé: <CheckCircle2 size={12} />,
  'En transit': <Truck size={12} />,
  Reçu: <PackageCheck size={12} />,
  Annulé: <AlertTriangle size={12} />,
};

export default function PurchasingManagement() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [viewDocOrder, setViewDocOrder] = useState<PurchaseOrder | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [receptionMode, setReceptionMode] = useState(false);
  const [recQtys, setRecQtys] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function handleCreatePO(newOrder: PurchaseOrderData) {
    setOrders((prev) => [newOrder as PurchaseOrder, ...prev]);
    notify(`Bon d'Achat ${newOrder.ref} créé avec succès pour ${newOrder.supplier} !`);
  }

  function handleStatusChange(order: PurchaseOrderData, newStatus: PurchaseOrderData['status']) {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: newStatus as POStatus } : o))
    );
    if (viewDocOrder && viewDocOrder.id === order.id) {
      setViewDocOrder((prev) => (prev ? { ...prev, status: newStatus as POStatus } : null));
    }
    notify(`Statut du Bon d'Achat ${order.ref} mis à jour : ${newStatus}`);
  }

  function exportCsv() {
    const csv = [
      'Référence;Fournisseur;Dépôt;Date;Échéance;Statut;Total HT;TVA;Total TTC',
      ...filtered.map(
        (o) =>
          `"${o.ref}";"${o.supplier}";"${o.warehouse}";"${o.date}";"${o.expected}";"${o.status}";"${o.total_ht}";"${o.tva}";"${o.total_ttc}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bons-achat-${Date.now()}.csv`;
    link.click();
    notify('Export CSV des Bons d’Achat téléchargé.');
  }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchQ = !q || o.ref.toLowerCase().includes(q) || o.supplier.toLowerCase().includes(q) || o.warehouse.toLowerCase().includes(q);
    const matchS = statusFilter === 'Tous' || o.status === statusFilter;
    return matchQ && matchS;
  });

  const totalEngaged = orders.filter(o => !['Reçu', 'Annulé'].includes(o.status)).reduce((a, b) => a + b.total_ttc, 0);
  const pendingReception = orders.filter(o => o.status === 'En transit' || o.status === 'Confirmé').length;

  function openReception(po: PurchaseOrder) {
    setSelected(po);
    setReceptionMode(true);
    const init: Record<string, number> = {};
    po.lines.forEach(l => { init[l.product] = l.qty_ordered - l.qty_received; });
    setRecQtys(init);
  }

  function confirmReception() {
    if (!selected) return;
    setOrders(prev => prev.map(o =>
      o.id === selected.id
        ? {
          ...o,
          status: 'Reçu',
          lines: o.lines.map(l => ({ ...l, qty_received: l.qty_ordered })),
        }
        : o
    ));
    setSelected(null);
    setReceptionMode(false);
    notify(`Réception validée pour ${selected.ref}. Stocks mis à jour automatiquement.`);
  }

  return (
    <div className="module-page">
      {/* ── Header ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">ENTREPÔT <span className="heading-slash">/</span> APPROVISIONNEMENT & ACHATS</div>
          <h1>Bons de Commande Fournisseurs & Achats</h1>
          <p>Gestion des bons d'achat (BC), réception de marchandises et mise à jour automatique des stocks.</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={exportCsv}>
            <Download size={14} /> Exporter CSV
          </button>
          <button className="button-primary" onClick={() => setShowNewModal(true)}>
            <Plus size={14} /> Nouveau Bon d'Achat
          </button>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>Commandes totales</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="summary-box">
          <span>Montant engagé</span>
          <strong>{formatMoney(totalEngaged)} DH</strong>
        </div>
        <div className="summary-box">
          <span>En attente réception</span>
          <strong style={{ color: 'var(--accent-amber)' }}>{pendingReception}</strong>
        </div>
        <div className="summary-box">
          <span>Fournisseurs actifs</span>
          <strong>4</strong>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="panel list-panel" style={{ marginTop: 16 }}>
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">COMMANDES FOURNISSEURS</span>
            <h2>Liste ({filtered.length})</h2>
          </div>
          <div className="table-tools">
            <div className="table-tabs">
              {['Tous', 'En transit', 'Confirmé', 'Reçu', 'Brouillon', 'Annulé'].map(s => (
                <button
                  key={s}
                  className={`table-tab ${statusFilter === s ? 'active-tab' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >{s}</button>
              ))}
            </div>
            <div className="search-field">
              <Search size={13} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Réf, fournisseur, dépôt…"
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Fournisseur</th>
                <th>Dépôt</th>
                <th>Date</th>
                <th>Livraison prévue</th>
                <th className="table-amount">Total TTC</th>
                <th>Statut</th>
                <th className="row-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td><code className="table-ref">{o.ref}</code></td>
                  <td>
                    <div className="table-main">{o.supplier}</div>
                    <small className="table-secondary">{o.supplier_code}</small>
                  </td>
                  <td className="table-secondary">{o.warehouse}</td>
                  <td>{o.date}</td>
                  <td className={o.status === 'En transit' ? 'table-amount' : 'table-secondary'}>
                    {o.expected}
                  </td>
                  <td className="table-amount">{formatMoney(o.total_ttc)} DH</td>
                  <td>
                    <span className={`status-pill ${STATUS_COLORS[o.status]}`}>
                      {STATUS_ICONS[o.status]} {o.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="row-action" title="Consulter le Bon d'Achat officiel" onClick={() => setViewDocOrder(o)}>
                        <FileText size={14} style={{ color: '#38bdf8' }} />
                      </button>
                      <button className="row-action" title="Imprimer le Bon d'Achat" onClick={() => setViewDocOrder(o)}>
                        <Printer size={14} />
                      </button>
                      {(o.status === 'En transit' || o.status === 'Confirmé') && (
                        <button
                          className="row-action"
                          title="Pointer et réceptionner en stock"
                          style={{ color: 'var(--accent-green)' }}
                          onClick={() => openReception(o)}
                        >
                          <PackageCheck size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Official Bon d'Achat Document Modal ── */}
      {viewDocOrder && (
        <PurchaseOrderDocumentModal
          order={viewDocOrder as any}
          onClose={() => setViewDocOrder(null)}
          onReceive={(po) => {
            openReception(po as any);
            setViewDocOrder(null);
          }}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* ── New Purchase Order (Nouveau BC) Modal ── */}
      {showNewModal && (
        <NewPurchaseOrderModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreatePO}
        />
      )}

      {/* ── Detail / Reception modal ── */}
      {selected && (
        <div className="modal-backdrop" onClick={() => { setSelected(null); setReceptionMode(false); }}>
          <div className="record-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">{receptionMode ? 'RÉCEPTION MARCHANDISES' : 'BON DE COMMANDE'} · {selected.ref}</span>
                <h2>{receptionMode ? `Réceptionner — ${selected.supplier}` : selected.supplier}</h2>
              </div>
              <button className="icon-button" onClick={() => { setSelected(null); setReceptionMode(false); }}><X size={16} /></button>
            </div>

            {receptionMode && (
              <div className="modal-note" style={{ marginBottom: 12 }}>
                <AlertTriangle size={14} />
                Vérifiez les quantités reçues. Après validation, les stocks seront mis à jour automatiquement.
              </div>
            )}

            <table className="data-table module-table" style={{ marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Commandé</th>
                  <th>Reçu</th>
                  <th>P.U. HT</th>
                  <th className="table-amount">Total HT</th>
                  {receptionMode && <th>Qté reçue</th>}
                </tr>
              </thead>
              <tbody>
                {selected.lines.map(l => (
                  <tr key={l.product}>
                    <td className="table-main">{l.product}</td>
                    <td>{l.qty_ordered} {l.unit}</td>
                    <td style={{ color: l.qty_received === l.qty_ordered ? 'var(--accent-green)' : 'var(--muted)' }}>
                      {l.qty_received} {l.unit}
                    </td>
                    <td>{formatMoney(l.unit_price)} DH</td>
                    <td className="table-amount">{formatMoney(l.qty_ordered * l.unit_price)} DH</td>
                    {receptionMode && (
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={l.qty_ordered}
                          value={recQtys[l.product] ?? l.qty_ordered - l.qty_received}
                          onChange={e => setRecQtys(prev => ({ ...prev, [l.product]: +e.target.value }))}
                          style={{ width: 70, padding: '2px 6px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--navy-2)', color: 'var(--text)' }}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, fontSize: 13, marginBottom: 16 }}>
              <span>HT : <b>{formatMoney(selected.total_ht)} DH</b></span>
              <span>TVA : <b>{formatMoney(selected.tva)} DH</b></span>
              <span>TTC : <b style={{ color: 'var(--accent-blue)' }}>{formatMoney(selected.total_ttc)} DH</b></span>
            </div>

            <div className="modal-actions">
              <button className="button-secondary" onClick={() => { setSelected(null); setReceptionMode(false); }}>Fermer</button>
              {receptionMode && (
                <button className="button-primary" onClick={confirmReception}>
                  <PackageCheck size={14} /> Valider réception &amp; mettre à jour stocks
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
