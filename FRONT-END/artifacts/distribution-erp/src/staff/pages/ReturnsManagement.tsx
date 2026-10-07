import { useState } from 'react';
import {
  Undo2, Search, Plus, X, CheckCircle2, Eye, AlertTriangle,
  PackageCheck, Clock, Ban, RefreshCw,
} from 'lucide-react';
import { formatMoney } from '../api';

type ReturnStatus = 'En cours' | 'Reçu' | 'Validé' | 'Refusé' | 'Réintégré';
type ReturnReason = 'Produit endommagé' | 'Erreur commande' | 'Produit périmé' | 'Refus client' | 'Surplus' | 'Qualité insuffisante';

interface ReturnLine {
  product: string;
  qty: number;
  unit_price: number;
  reintegrate: boolean;
}

interface ReturnRequest {
  id: number;
  ref: string;
  order_ref: string;
  client: string;
  driver: string;
  date: string;
  reason: ReturnReason;
  status: ReturnStatus;
  total: number;
  lines: ReturnLine[];
  notes: string;
}

const RETURNS: ReturnRequest[] = [
  {
    id: 1,
    ref: 'RET-2026-018',
    order_ref: 'CMD-2026-1248',
    client: 'Épicerie Centrale Saïd',
    driver: 'Hamid Moukrim',
    date: '05 Oct 2026',
    reason: 'Produit endommagé',
    status: 'Reçu',
    total: 3300,
    lines: [
      { product: 'Huile Végétale 5L', qty: 15, unit_price: 220, reintegrate: false },
    ],
    notes: 'Bidons fissurés lors du transport. Photos envoyées par chauffeur.',
  },
  {
    id: 2,
    ref: 'RET-2026-017',
    order_ref: 'CMD-2026-1235',
    client: 'Grossiste Anfa',
    driver: 'Youssef Berrada',
    date: '04 Oct 2026',
    reason: 'Erreur commande',
    status: 'Réintégré',
    total: 8750,
    lines: [
      { product: 'Sucre Raffiné 50kg', qty: 25, unit_price: 350, reintegrate: true },
    ],
    notes: 'Le client avait commandé Sucre Glace, pas raffiné. Retour accepté.',
  },
  {
    id: 3,
    ref: 'RET-2026-016',
    order_ref: 'CMD-2026-1221',
    client: 'Marché Al Matar',
    driver: 'Hamid Moukrim',
    date: '03 Oct 2026',
    reason: 'Refus client',
    status: 'Refusé',
    total: 5600,
    lines: [
      { product: 'Farine T55 50kg', qty: 20, unit_price: 280, reintegrate: false },
    ],
    notes: 'Retour refusé — aucune justification valable fournie par le client.',
  },
  {
    id: 4,
    ref: 'RET-2026-015',
    order_ref: 'CMD-2026-1198',
    client: 'Dist. Ould Hmad',
    driver: 'Khalid Fassi',
    date: '01 Oct 2026',
    reason: 'Surplus',
    status: 'Validé',
    total: 4200,
    lines: [
      { product: 'Sel Industriel 25kg', qty: 35, unit_price: 120, reintegrate: true },
    ],
    notes: 'Trop de stock chez le client. Retour partiel autorisé.',
  },
  {
    id: 5,
    ref: 'RET-2026-014',
    order_ref: 'CMD-2026-1184',
    client: 'Commerce Général Tazi',
    driver: 'Youssef Berrada',
    date: '29 Sep 2026',
    reason: 'Qualité insuffisante',
    status: 'En cours',
    total: 6250,
    lines: [
      { product: 'Riz Long Grain 50kg', qty: 25, unit_price: 250, reintegrate: false },
    ],
    notes: 'Infestation signalée. Lot en quarantaine en attente inspection qualité.',
  },
];

const STATUS_META: Record<ReturnStatus, { color: string; icon: React.ReactNode }> = {
  'En cours': { color: 'status-amber', icon: <Clock size={12} /> },
  'Reçu': { color: 'status-blue', icon: <PackageCheck size={12} /> },
  'Validé': { color: 'status-green', icon: <CheckCircle2 size={12} /> },
  'Refusé': { color: 'status-red', icon: <Ban size={12} /> },
  'Réintégré': { color: 'status-green', icon: <RefreshCw size={12} /> },
};

export default function ReturnsManagement() {
  const [returns, setReturns] = useState<ReturnRequest[]>(RETURNS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  const filtered = returns.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.ref.toLowerCase().includes(q) || r.client.toLowerCase().includes(q) || r.order_ref.toLowerCase().includes(q);
    const matchS = statusFilter === 'Tous' || r.status === statusFilter;
    return matchQ && matchS;
  });

  const totalPending = returns.filter(r => r.status === 'En cours' || r.status === 'Reçu').reduce((a, b) => a + b.total, 0);
  const pendingCount = returns.filter(r => r.status === 'En cours' || r.status === 'Reçu').length;

  function advanceStatus(id: number, newStatus: ReturnStatus) {
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    const r = returns.find(r => r.id === id)!;
    notify(`Retour ${r.ref} — statut mis à jour : ${newStatus}`);
    setSelected(null);
  }

  return (
    <div className="module-page">
      {/* ── Header ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">DISTRIBUTION <span className="heading-slash">/</span> LITIGES</div>
          <h1>Gestion des Retours</h1>
          <p>Traitement des retours clients, validation et réintégration en stock.</p>
        </div>
        <div className="heading-actions">
          <button className="button-primary" onClick={() => notify('Formulaire retour — à connecter avec livraisons')}>
            <Plus size={14} /> Déclarer retour
          </button>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>Total retours</span>
          <strong>{returns.length}</strong>
        </div>
        <div className="summary-box">
          <span>En attente traitement</span>
          <strong style={{ color: 'var(--accent-amber)' }}>{pendingCount}</strong>
        </div>
        <div className="summary-box">
          <span>Valeur en attente</span>
          <strong>{formatMoney(totalPending)} DH</strong>
        </div>
        <div className="summary-box">
          <span>Réintégrés au stock</span>
          <strong style={{ color: 'var(--accent-green)' }}>{returns.filter(r => r.status === 'Réintégré').length}</strong>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="panel list-panel" style={{ marginTop: 16 }}>
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">REGISTRE DES RETOURS</span>
            <h2>Liste ({filtered.length})</h2>
          </div>
          <div className="table-tools">
            <div className="table-tabs">
              {['Tous', 'En cours', 'Reçu', 'Validé', 'Réintégré', 'Refusé'].map(s => (
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
                placeholder="Réf, client, commande…"
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Commande d'origine</th>
                <th>Client</th>
                <th>Chauffeur</th>
                <th>Motif</th>
                <th>Date</th>
                <th className="table-amount">Valeur</th>
                <th>Statut</th>
                <th className="row-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const meta = STATUS_META[r.status];
                return (
                  <tr key={r.id}>
                    <td><code className="table-ref">{r.ref}</code></td>
                    <td><code className="table-ref">{r.order_ref}</code></td>
                    <td className="table-main">{r.client}</td>
                    <td className="table-secondary">{r.driver}</td>
                    <td>
                      <span className="status-pill status-muted" style={{ fontSize: 10 }}>{r.reason}</span>
                    </td>
                    <td>{r.date}</td>
                    <td className="table-amount">{formatMoney(r.total)} DH</td>
                    <td>
                      <span className={`status-pill ${meta.color}`}>
                        {meta.icon} {r.status}
                      </span>
                    </td>
                    <td>
                      <button className="row-action" title="Voir détail" onClick={() => setSelected(r)}>
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="record-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">RETOUR · {selected.ref}</span>
                <h2>{selected.client}</h2>
              </div>
              <button className="icon-button" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div className="frn-field">
                <span className="field-label">Commande origine</span>
                <code>{selected.order_ref}</code>
              </div>
              <div className="frn-field">
                <span className="field-label">Chauffeur</span>
                <span>{selected.driver}</span>
              </div>
              <div className="frn-field">
                <span className="field-label">Date retour</span>
                <span>{selected.date}</span>
              </div>
              <div className="frn-field">
                <span className="field-label">Motif</span>
                <span>{selected.reason}</span>
              </div>
              {selected.notes && (
                <div className="frn-field" style={{ gridColumn: '1/-1' }}>
                  <span className="field-label">Observations</span>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.5 }}>{selected.notes}</p>
                </div>
              )}
            </div>

            <table className="data-table module-table" style={{ marginBottom: 14 }}>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Qté retournée</th>
                  <th className="table-amount">P.U.</th>
                  <th className="table-amount">Total</th>
                  <th>Réintégration stock</th>
                </tr>
              </thead>
              <tbody>
                {selected.lines.map(l => (
                  <tr key={l.product}>
                    <td className="table-main">{l.product}</td>
                    <td>{l.qty}</td>
                    <td className="table-amount">{formatMoney(l.unit_price)} DH</td>
                    <td className="table-amount">{formatMoney(l.qty * l.unit_price)} DH</td>
                    <td>
                      <span className={`status-pill ${l.reintegrate ? 'status-green' : 'status-muted'}`}>
                        {l.reintegrate ? 'Oui' : 'Non'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', marginBottom: 14, fontSize: 13 }}>
              Valeur totale retour : <strong>{formatMoney(selected.total)} DH</strong>
            </div>

            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setSelected(null)}>Fermer</button>
              {selected.status === 'En cours' && (
                <button className="button-secondary" onClick={() => advanceStatus(selected.id, 'Refusé')}>
                  <Ban size={14} /> Refuser
                </button>
              )}
              {selected.status === 'En cours' && (
                <button className="button-primary" onClick={() => advanceStatus(selected.id, 'Reçu')}>
                  <PackageCheck size={14} /> Marquer reçu
                </button>
              )}
              {selected.status === 'Reçu' && (
                <button className="button-primary" onClick={() => advanceStatus(selected.id, 'Réintégré')}>
                  <RefreshCw size={14} /> Valider &amp; réintégrer stock
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
