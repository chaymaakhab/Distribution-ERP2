import { useState } from 'react';
import {
  Undo2, Search, Plus, X, CheckCircle2, Eye, AlertTriangle,
  PackageCheck, Clock, Ban, RefreshCw, Printer, ArrowLeft,
  Truck, Building2, FileText, ChevronRight, ShieldAlert,
} from 'lucide-react';
import { formatMoney } from '../api';
import ReturnSlipDocumentModal, { type ReturnSlipData } from '../components/ReturnSlipDocumentModal';

export type ReturnStatus = 'En cours' | 'Reçu' | 'Validé' | 'Refusé' | 'Réintégré';
export type ReturnReason =
  | 'Produit endommagé'
  | 'Erreur commande'
  | 'Produit périmé'
  | 'Refus client'
  | 'Surplus'
  | 'Qualité insuffisante';

export interface ReturnLine {
  product: string;
  qty: number;
  unit_price: number;
  reintegrate: boolean;
  reason_detail?: string;
}

export interface ReturnRequest {
  id: number;
  ref: string;
  order_ref: string;
  client: string;
  client_ice?: string;
  client_city?: string;
  driver: string;
  driver_type: 'depot_to_client' | 'depot_to_depot';
  depot: string;
  date: string;
  reason: ReturnReason;
  status: ReturnStatus;
  total: number;
  lines: ReturnLine[];
  notes: string;
}

const INITIAL_RETURNS: ReturnRequest[] = [
  {
    id: 1,
    ref: 'RET-2026-018',
    order_ref: 'CMD-2026-1248',
    client: 'Épicerie Centrale Saïd',
    client_ice: '003291845000012',
    client_city: 'Mohammedia',
    driver: 'Hamid Moukrim',
    driver_type: 'depot_to_client',
    depot: 'DEP-02 Mohammedia',
    date: '05 Oct 2026',
    reason: 'Produit endommagé',
    status: 'Reçu',
    total: 3300,
    lines: [
      { product: 'Huile Végétale 5L', qty: 15, unit_price: 220, reintegrate: false, reason_detail: 'Bidons percés lors du transport' },
    ],
    notes: 'Bidons fissurés lors du transport. Photos envoyées par le chauffeur.',
  },
  {
    id: 2,
    ref: 'RET-2026-017',
    order_ref: 'CMD-2026-1235',
    client: 'Grossiste Anfa',
    client_ice: '001928473000054',
    client_city: 'Casablanca',
    driver: 'Youssef Berrada',
    driver_type: 'depot_to_client',
    depot: 'DEP-01 Casablanca Central',
    date: '04 Oct 2026',
    reason: 'Erreur commande',
    status: 'Réintégré',
    total: 8750,
    lines: [
      { product: 'Sucre Raffiné 50kg', qty: 25, unit_price: 350, reintegrate: true, reason_detail: 'Erreur saisie référence bon de commande' },
    ],
    notes: 'Le client avait commandé Sucre Glace, pas raffiné. Retour scellé accepté et réintégré.',
  },
  {
    id: 3,
    ref: 'RET-2026-016',
    order_ref: 'CMD-2026-1221',
    client: 'Marché Al Matar',
    client_ice: '002819304000091',
    client_city: 'Casablanca',
    driver: 'Hassan Benmoussa',
    driver_type: 'depot_to_depot',
    depot: 'DEP-01 Casablanca Central',
    date: '03 Oct 2026',
    reason: 'Refus client',
    status: 'Refusé',
    total: 5600,
    lines: [
      { product: 'Farine T55 50kg', qty: 20, unit_price: 280, reintegrate: false, reason_detail: 'Refus non motivé' },
    ],
    notes: 'Retour refusé au quai — aucune justification valable fournie par le client, délai dépassé.',
  },
  {
    id: 4,
    ref: 'RET-2026-015',
    order_ref: 'CMD-2026-1198',
    client: 'Dist. Ould Hmad',
    client_ice: '004192837000088',
    client_city: 'Berrechid',
    driver: 'Khalid Fassi',
    driver_type: 'depot_to_client',
    depot: 'DEP-03 Berrechid',
    date: '01 Oct 2026',
    reason: 'Surplus',
    status: 'Validé',
    total: 4200,
    lines: [
      { product: 'Sel Industriel 25kg', qty: 35, unit_price: 120, reintegrate: true, reason_detail: 'Surstock chez le client' },
    ],
    notes: 'Trop de stock chez le client. Retour partiel autorisé par la direction commerciale.',
  },
  {
    id: 5,
    ref: 'RET-2026-014',
    order_ref: 'CMD-2026-1184',
    client: 'Commerce Général Tazi',
    client_ice: '001552910000037',
    client_city: 'Settat',
    driver: 'Tariq El Ouazzani',
    driver_type: 'depot_to_depot',
    depot: 'DEP-04 Settat',
    date: '29 Sep 2026',
    reason: 'Qualité insuffisante',
    status: 'En cours',
    total: 6250,
    lines: [
      { product: 'Riz Long Grain 50kg', qty: 25, unit_price: 250, reintegrate: false, reason_detail: 'Humidité excessive constatée' },
    ],
    notes: 'Signalement humidité. Lot en quarantaine au dépôt Settat en attente inspection qualité.',
  },
];

const STATUS_META: Record<ReturnStatus, { color: string; icon: React.ReactNode }> = {
  'En cours': { color: 'status-amber', icon: <Clock size={12} /> },
  'Reçu': { color: 'status-blue', icon: <PackageCheck size={12} /> },
  'Validé': { color: 'status-green', icon: <CheckCircle2 size={12} /> },
  'Refusé': { color: 'status-red', icon: <Ban size={12} /> },
  'Réintégré': { color: 'status-green', icon: <RefreshCw size={12} /> },
};

interface ReturnsManagementProps {
  onNavigate?: (segment: string) => void;
}

export default function ReturnsManagement({ onNavigate }: ReturnsManagementProps) {
  const [returns, setReturns] = useState<ReturnRequest[]>(INITIAL_RETURNS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [depotFilter, setDepotFilter] = useState('all');
  const [driverTypeFilter, setDriverTypeFilter] = useState<'all' | 'depot_to_client' | 'depot_to_depot'>('all');
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [printDoc, setPrintDoc] = useState<ReturnSlipData | null>(null);
  const [newReturnModal, setNewReturnModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New return form state
  const [formOrderRef, setFormOrderRef] = useState('CMD-2403');
  const [formClient, setFormClient] = useState('Comptoir Al Amal');
  const [formClientIce, setFormClientIce] = useState('004128901000092');
  const [formClientCity, setFormClientCity] = useState('Fès');
  const [formDriver, setFormDriver] = useState('Hamid Moukrim');
  const [formDriverType, setFormDriverType] = useState<'depot_to_client' | 'depot_to_depot'>('depot_to_client');
  const [formDepot, setFormDepot] = useState('DEP-01 Casablanca Central');
  const [formReason, setFormReason] = useState<ReturnReason>('Produit endommagé');
  const [formProduct, setFormProduct] = useState('Huile Végétale 5L');
  const [formQty, setFormQty] = useState(5);
  const [formPrice, setFormPrice] = useState(220);
  const [formReintegrate, setFormReintegrate] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function handleBack() {
    if (onNavigate) {
      onNavigate('deliveries');
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/staff';
    }
  }

  const filtered = returns.filter((r) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      r.ref.toLowerCase().includes(q) ||
      r.client.toLowerCase().includes(q) ||
      r.order_ref.toLowerCase().includes(q) ||
      r.driver.toLowerCase().includes(q) ||
      r.lines.some((l) => l.product.toLowerCase().includes(q));

    const matchS = statusFilter === 'Tous' || r.status === statusFilter;
    const matchDepot = depotFilter === 'all' || r.depot.includes(depotFilter);
    const matchDriverType = driverTypeFilter === 'all' || r.driver_type === driverTypeFilter;

    return matchQ && matchS && matchDepot && matchDriverType;
  });

  const totalValue = returns.reduce((a, b) => a + b.total, 0);
  const totalPending = returns
    .filter((r) => r.status === 'En cours' || r.status === 'Reçu')
    .reduce((a, b) => a + b.total, 0);
  const pendingCount = returns.filter((r) => r.status === 'En cours' || r.status === 'Reçu').length;
  const reintegratedCount = returns.filter((r) => r.status === 'Réintégré').length;
  const scrapCount = returns.filter((r) => r.status === 'Refusé' || (!r.lines[0]?.reintegrate && r.status === 'Validé')).length;

  function advanceStatus(id: number, newStatus: ReturnStatus) {
    setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    const target = returns.find((r) => r.id === id);
    if (target) {
      notify(`Retour ${target.ref} mis à jour : Statut « ${newStatus} ».`);
    }
    if (selected && selected.id === id) {
      setSelected({ ...selected, status: newStatus });
    }
  }

  function handleCreateReturn(e: React.FormEvent) {
    e.preventDefault();
    const totalLine = Number(formQty) * Number(formPrice);
    const newRef = `RET-2026-0${19 + returns.length}`;

    const newReq: ReturnRequest = {
      id: Date.now(),
      ref: newRef,
      order_ref: formOrderRef.trim().toUpperCase(),
      client: formClient.trim(),
      client_ice: formClientIce.trim(),
      client_city: formClientCity.trim(),
      driver: formDriver.trim(),
      driver_type: formDriverType,
      depot: formDepot,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      reason: formReason,
      status: 'Reçu',
      total: totalLine,
      lines: [
        {
          product: formProduct,
          qty: Number(formQty),
          unit_price: Number(formPrice),
          reintegrate: formReintegrate,
          reason_detail: formNotes || formReason,
        },
      ],
      notes: formNotes.trim() || `Retour déclaré au quai ${formDepot}.`,
    };

    setReturns((prev) => [newReq, ...prev]);
    notify(`Retour ${newRef} enregistré avec succès (${formatMoney(totalLine)} DH) !`);
    setNewReturnModal(false);
    setFormNotes('');
  }

  function openPrintDoc(req: ReturnRequest) {
    setPrintDoc({
      ref: req.ref,
      order_ref: req.order_ref,
      client: req.client,
      client_ice: req.client_ice,
      client_city: req.client_city,
      driver: req.driver,
      driver_type: req.driver_type,
      depot: req.depot,
      date: req.date,
      reason: req.reason,
      status: req.status,
      total: req.total,
      lines: req.lines,
      notes: req.notes,
    });
  }

  return (
    <div className="module-page" style={{ paddingBottom: 40 }}>
      {/* ── Top Breadcrumb & Return Action Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          padding: '8px 12px',
          background: 'var(--navy-2)',
          border: '1px solid var(--line)',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="button-secondary"
            onClick={handleBack}
            title="Revenir à la page précédente"
            style={{ height: 32, padding: '0 12px', gap: 6, fontWeight: 600 }}
          >
            <ArrowLeft size={14} />
            <span>Retour</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
            <span>Distribution</span>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>Registre des Retours & Avoirs</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onNavigate && (
            <button
              className="button-secondary"
              onClick={() => onNavigate('deliveries')}
              style={{ height: 32, padding: '0 10px', fontSize: 12, gap: 5 }}
            >
              <Truck size={13} /> Tournées de livraison
            </button>
          )}
          {onNavigate && (
            <button
              className="button-secondary"
              onClick={() => onNavigate('dashboard')}
              style={{ height: 32, padding: '0 10px', fontSize: 12 }}
            >
              Tableau de bord
            </button>
          )}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">DISTRIBUTION <span className="heading-slash">/</span> SERVICE APRÈS-VENTE & LITIGES</div>
          <h1>Gestion des Retours Marchandises</h1>
          <p>
            Constatations des avaries, réintégrations en stock d'entrepôt, gestion des rebuts et génération d'avoirs clients.
          </p>
        </div>
        <div className="heading-actions">
          <button className="button-primary" onClick={() => setNewReturnModal(true)}>
            <Plus size={15} /> Déclarer un retour marchandise
          </button>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div className="summary-box">
          <span>Total Dossiers Retours</span>
          <strong>{returns.length}</strong>
        </div>
        <div className="summary-box">
          <span>En attente de traitement</span>
          <strong style={{ color: '#f59e0b' }}>{pendingCount}</strong>
        </div>
        <div className="summary-box">
          <span>Valeur des litiges en cours</span>
          <strong style={{ color: '#38bdf8' }}>{formatMoney(totalPending)} DH</strong>
        </div>
        <div className="summary-box">
          <span>Réintégrés au stock dépôt</span>
          <strong style={{ color: '#22c55e' }}>{reintegratedCount}</strong>
        </div>
        <div className="summary-box">
          <span>Rebuts & Avaries détruits</span>
          <strong style={{ color: '#ef4444' }}>{scrapCount}</strong>
        </div>
      </div>

      {/* ── Table & Filters ── */}
      <div className="panel list-panel" style={{ marginTop: 16 }}>
        <div className="list-panel-heading" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="eyebrow">REGISTRE DES RETOURS & CONSTATS DE RÉCEPTION</span>
            <h2>Liste des retours ({filtered.length})</h2>
          </div>

          <div className="table-tools" style={{ flexWrap: 'wrap', gap: 8 }}>
            {/* Status Tabs */}
            <div className="table-tabs">
              {['Tous', 'En cours', 'Reçu', 'Validé', 'Réintégré', 'Refusé'].map((s) => (
                <button
                  key={s}
                  className={`table-tab ${statusFilter === s ? 'active-tab' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Depot Selector */}
            <select
              className="select-compact"
              value={depotFilter}
              onChange={(e) => setDepotFilter(e.target.value)}
              style={{ height: 32, fontSize: 12 }}
            >
              <option value="all">Tous dépôts</option>
              <option value="DEP-01">DEP-01 Casablanca</option>
              <option value="DEP-02">DEP-02 Mohammedia</option>
              <option value="DEP-03">DEP-03 Berrechid</option>
              <option value="DEP-04">DEP-04 Settat</option>
            </select>

            {/* Driver Type Selector */}
            <select
              className="select-compact"
              value={driverTypeFilter}
              onChange={(e) => setDriverTypeFilter(e.target.value as any)}
              style={{ height: 32, fontSize: 12 }}
            >
              <option value="all">Tous types chauffeurs</option>
              <option value="depot_to_client">Livreur Dépôt → Client</option>
              <option value="depot_to_depot">Navette Dépôt → Dépôt</option>
            </select>

            {/* Search Input */}
            <div className="search-field" style={{ minWidth: 220 }}>
              <Search size={13} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Réf, client, commande, chauffeur…"
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>Réf Retour</th>
                <th>Commande d'origine</th>
                <th>Client</th>
                <th>Dépôt</th>
                <th>Chauffeur & Type</th>
                <th>Motif principal</th>
                <th>Date</th>
                <th className="table-amount">Montant Avoir</th>
                <th>Statut</th>
                <th className="row-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const meta = STATUS_META[r.status];
                const isNavette = r.driver_type === 'depot_to_depot';
                return (
                  <tr key={r.id}>
                    <td>
                      <code className="table-ref" style={{ color: '#f59e0b', fontWeight: 700 }}>
                        {r.ref}
                      </code>
                    </td>
                    <td>
                      <code className="table-ref">{r.order_ref}</code>
                    </td>
                    <td className="table-main">
                      <strong>{r.client}</strong>
                      {r.client_city && <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>{r.client_city}</small>}
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={12} /> {r.depot.split(' ')[0]}
                      </span>
                    </td>
                    <td className="table-secondary">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {isNavette ? <Building2 size={13} style={{ color: '#a855f7' }} /> : <Truck size={13} style={{ color: '#38bdf8' }} />}
                        <span>{r.driver}</span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: isNavette ? 'rgba(168,85,247,0.1)' : 'rgba(56,189,248,0.1)',
                          color: isNavette ? '#c084fc' : '#38bdf8',
                          display: 'inline-block',
                          marginTop: 2,
                        }}
                      >
                        {isNavette ? 'Navette Inter-Dépôts' : 'Dépôt → Client'}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill status-muted" style={{ fontSize: 11, fontWeight: 500 }}>
                        {r.reason}
                      </span>
                    </td>
                    <td>{r.date}</td>
                    <td className="table-amount" style={{ fontWeight: 700, color: 'var(--text)' }}>
                      {formatMoney(r.total)} DH
                    </td>
                    <td>
                      <span className={`status-pill ${meta.color}`}>
                        {meta.icon} {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          className="row-action"
                          title="Consulter le détail du litige"
                          onClick={() => setSelected(r)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="row-action"
                          title="Imprimer le Bon de Retour / Avoir officiel"
                          style={{ color: '#38bdf8' }}
                          onClick={() => openPrintDoc(r)}
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                    Aucun dossier de retour trouvé selon ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620 }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">DOSSIER DE RETOUR · {selected.ref}</span>
                <h2>{selected.client}</h2>
              </div>
              <button className="icon-button" onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 0' }}>
              <div className="frn-field">
                <span className="field-label">Commande & BL d'origine</span>
                <code style={{ fontSize: 13, color: 'var(--text)' }}>{selected.order_ref}</code>
              </div>
              <div className="frn-field">
                <span className="field-label">Dépôt récepteur</span>
                <span>{selected.depot}</span>
              </div>
              <div className="frn-field">
                <span className="field-label">Chauffeur assigné</span>
                <span>
                  {selected.driver} ({selected.driver_type === 'depot_to_depot' ? 'Navette Inter-Dépôts' : 'Livreur Dépôt → Client'})
                </span>
              </div>
              <div className="frn-field">
                <span className="field-label">Date du retour</span>
                <span>{selected.date}</span>
              </div>
              <div className="frn-field" style={{ gridColumn: '1/-1' }}>
                <span className="field-label">Motif de non-conformité / avarie</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>{selected.reason}</span>
              </div>
              {selected.notes && (
                <div className="frn-field" style={{ gridColumn: '1/-1' }}>
                  <span className="field-label">Observations constatées au déchargement</span>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text)', background: 'var(--navy-2)', padding: 8, borderRadius: 6 }}>
                    {selected.notes}
                  </p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <span className="field-label" style={{ marginBottom: 6 }}>Articles retournés & Décision de réintégration :</span>
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th style={{ textAlign: 'center' }}>Qté</th>
                    <th className="table-amount">P.U.</th>
                    <th className="table-amount">Total</th>
                    <th style={{ textAlign: 'center' }}>Sort du stock</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.lines.map((l, idx) => (
                    <tr key={idx}>
                      <td className="table-main">{l.product}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{l.qty}</td>
                      <td className="table-amount">{formatMoney(l.unit_price)} DH</td>
                      <td className="table-amount">{formatMoney(l.qty * l.unit_price)} DH</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`status-pill ${l.reintegrate ? 'status-green' : 'status-red'}`}>
                          {l.reintegrate ? 'Réintégré stock' : 'Mis au rebut / Avarie'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--line)' }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Statut actuel : </span>
                <span className={`status-pill ${STATUS_META[selected.status].color}`}>
                  {STATUS_META[selected.status].icon} {selected.status}
                </span>
              </div>
              <div style={{ fontSize: 14 }}>
                Montant total Avoir : <strong style={{ color: '#38bdf8' }}>{formatMoney(selected.total)} DH</strong>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 14 }}>
              <button className="button-secondary" onClick={() => setSelected(null)}>
                Fermer
              </button>
              <button
                className="button-secondary"
                style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}
                onClick={() => {
                  openPrintDoc(selected);
                  setSelected(null);
                }}
              >
                <Printer size={14} /> Imprimer Bon de Retour
              </button>
              {selected.status === 'En cours' && (
                <button className="button-secondary" style={{ color: '#ef4444' }} onClick={() => advanceStatus(selected.id, 'Refusé')}>
                  <Ban size={14} /> Refuser le retour
                </button>
              )}
              {selected.status === 'En cours' && (
                <button className="button-primary" onClick={() => advanceStatus(selected.id, 'Reçu')}>
                  <PackageCheck size={14} /> Confirmer réception quai
                </button>
              )}
              {selected.status === 'Reçu' && (
                <button className="button-primary" style={{ background: '#16a34a', borderColor: '#15803d' }} onClick={() => advanceStatus(selected.id, 'Réintégré')}>
                  <RefreshCw size={14} /> Réintégrer au stock disponible
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── New Return Modal ── */}
      {newReturnModal && (
        <div className="modal-backdrop" onClick={() => setNewReturnModal(false)}>
          <form className="record-modal" onSubmit={handleCreateReturn} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">DÉCLARATION RETOUR MARCHANDISE</span>
                <h2>Enregistrer un retour client</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setNewReturnModal(false)}>
                <X size={16} />
              </button>
            </div>

            <p className="modal-note">
              Renseignez les détails de la commande retournée par le chauffeur. Vous pouvez décider de réintégrer les produits conformes au stock ou de les affecter au rebut.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <label className="field-label">
                N° Commande / BL d'origine
                <input
                  required
                  value={formOrderRef}
                  onChange={(e) => setFormOrderRef(e.target.value)}
                  placeholder="Ex. CMD-2403"
                />
              </label>

              <label className="field-label">
                Client destinataire
                <input
                  required
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  placeholder="Ex. Comptoir Al Amal"
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              <label className="field-label">
                ICE Client
                <input
                  value={formClientIce}
                  onChange={(e) => setFormClientIce(e.target.value)}
                  placeholder="003147829000064"
                />
              </label>

              <label className="field-label">
                Ville
                <input
                  value={formClientCity}
                  onChange={(e) => setFormClientCity(e.target.value)}
                  placeholder="Ex. Casablanca, Fès, Rabat..."
                />
              </label>
            </div>

            {/* Transport & Chauffeur */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              <label className="field-label">
                Dépôt de réception
                <select
                  className="select-compact"
                  style={{ width: '100%', height: 38 }}
                  value={formDepot}
                  onChange={(e) => setFormDepot(e.target.value)}
                >
                  <option>DEP-01 Casablanca Central</option>
                  <option>DEP-02 Mohammedia</option>
                  <option>DEP-03 Berrechid</option>
                  <option>DEP-04 Settat</option>
                </select>
              </label>

              <label className="field-label">
                Type de chauffeur
                <select
                  className="select-compact"
                  style={{ width: '100%', height: 38 }}
                  value={formDriverType}
                  onChange={(e) => setFormDriverType(e.target.value as any)}
                >
                  <option value="depot_to_client">Livreur Dépôt → Client</option>
                  <option value="depot_to_depot">Navette Dépôt → Dépôt</option>
                </select>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              <label className="field-label">
                Nom du chauffeur
                <input
                  required
                  value={formDriver}
                  onChange={(e) => setFormDriver(e.target.value)}
                  placeholder="Ex. Hamid Moukrim"
                />
              </label>

              <label className="field-label">
                Motif principal de retour
                <select
                  className="select-compact"
                  style={{ width: '100%', height: 38 }}
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value as ReturnReason)}
                >
                  <option value="Produit endommagé">Produit endommagé / Avarie</option>
                  <option value="Erreur commande">Erreur de référence commande</option>
                  <option value="Produit périmé">Date limite proche / Périmé</option>
                  <option value="Refus client">Refus client (litige prix ou délai)</option>
                  <option value="Surplus">Surplus de stock non commandé</option>
                  <option value="Qualité insuffisante">Non-conformité qualité</option>
                </select>
              </label>
            </div>

            {/* Articles Details */}
            <div style={{ background: 'var(--navy-2)', padding: 12, borderRadius: 8, marginTop: 12, border: '1px solid var(--line)' }}>
              <span className="field-label" style={{ marginBottom: 8, color: '#38bdf8' }}>
                Ligne d'article retournée :
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                <label className="field-label">
                  Désignation article
                  <input
                    required
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    placeholder="Ex. Huile Végétale 5L"
                  />
                </label>
                <label className="field-label">
                  Quantité retour
                  <input
                    type="number"
                    min={1}
                    required
                    value={formQty}
                    onChange={(e) => setFormQty(Number(e.target.value))}
                  />
                </label>
                <label className="field-label">
                  P.U. HT (DH)
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={formReintegrate}
                    onChange={(e) => setFormReintegrate(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#22c55e' }}
                  />
                  <span>Réintégrer immédiatement en stock disponible (produit intact)</span>
                </label>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  Total ligne : <span style={{ color: '#38bdf8' }}>{formatMoney(formQty * formPrice)} DH</span>
                </div>
              </div>
            </div>

            <label className="field-label" style={{ marginTop: 10 }}>
              Observations & constatation du chauffeur
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Ex. Déchargé au quai de Mohammedia, emballage intact, motif confirmé par le gérant."
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  background: 'var(--navy-2)',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              />
            </label>

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button type="button" className="button-secondary" onClick={() => setNewReturnModal(false)}>
                Annuler
              </button>
              <button type="submit" className="button-primary">
                <Plus size={15} /> Enregistrer le retour
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Official Print Modal ── */}
      {printDoc && (
        <ReturnSlipDocumentModal
          slip={printDoc}
          onClose={() => setPrintDoc(null)}
        />
      )}

      {/* ── Toast notification ── */}
      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
