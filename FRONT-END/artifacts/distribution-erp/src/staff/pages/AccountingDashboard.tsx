import { useState } from 'react';
import {
  BadgeDollarSign, CreditCard, Receipt, FileText, CheckCircle2,
  AlertTriangle, Clock, MessageSquare, Download, Plus, Filter,
  Building, Calendar, X, Printer, Search, TrendingUp, ShieldAlert,
  ArrowRight, Check,
} from 'lucide-react';
import { formatMoney } from '../api';
import InvoiceDocumentModal, { type InvoiceData } from '../components/InvoiceDocumentModal';
import NewInvoiceModal from '../components/NewInvoiceModal';
import RegisterPaymentModal from '../components/RegisterPaymentModal';

interface Cheque {
  id: number;
  ref: string;
  client: string;
  bank: string;
  amount: number;
  due_date: string;
  status: 'en_portefeuille' | 'remis_en_banque' | 'encaisse' | 'impaye';
}

const INITIAL_CHEQUES: Cheque[] = [
  {
    id: 1,
    ref: 'CHQ-084731',
    client: 'Atlas Équipements',
    bank: 'Banque Populaire',
    amount: 12500,
    due_date: '05 Mars 2025',
    status: 'en_portefeuille',
  },
  {
    id: 2,
    ref: 'EFF-006841',
    client: 'Maison du Bricolage',
    bank: 'BMCI',
    amount: 9735,
    due_date: '18 Mars 2025',
    status: 'en_portefeuille',
  },
  {
    id: 3,
    ref: 'CHQ-849301',
    client: 'Comptoir Al Amal',
    bank: 'Attijariwafa Bank',
    amount: 32100,
    due_date: '28 Fév 2025',
    status: 'remis_en_banque',
  },
  {
    id: 4,
    ref: 'EFF-004412',
    client: 'Nord Industrie',
    bank: 'Société Générale',
    amount: 6280,
    due_date: '20 Fév 2025',
    status: 'encaisse',
  },
  {
    id: 5,
    ref: 'CHQ-001298',
    client: 'Quincaillerie Saada',
    bank: 'CIH Bank',
    amount: 14500,
    due_date: '15 Fév 2025',
    status: 'impaye', // Impayé -> Alerte CDC !
  },
];

const INITIAL_INVOICES: InvoiceData[] = [
  {
    ref: 'FAC-2025-184',
    order_ref: 'CMD-2406',
    client: 'Atlas Équipements SARL',
    client_ice: '003147829000064',
    client_address: '12, Boulevard Zerktouni',
    client_city: 'Casablanca',
    client_phone: '+212 522 34 78 90',
    date_issued: '24 Fév 2025',
    due_date: '26 Mars 2025',
    payment_method: 'Virement bancaire 30j',
    status: 'Impayée',
    paid_amount: 0.0,
    lines: [
      { sku: 'HRC-0850', name: 'Perceuse à percussion 850W (Carton 4 pcs)', qty: 10, unit_price_ht: 1249.0, tva_rate: 20 },
      { sku: 'CUT-230D', name: 'Disque diamant 230 mm (Lot 10 pcs)', qty: 20, unit_price_ht: 189.5, tva_rate: 20 },
      { sku: 'CAB-3G25', name: 'Câble électrique 3G2.5 (Couronne 100m)', qty: 3, unit_price_ht: 1280.0, tva_rate: 20 },
    ],
  },
  {
    ref: 'FAC-2025-183',
    order_ref: 'CMD-2405',
    client: 'BatiPro Maroc',
    client_ice: '002984123000081',
    client_address: 'Lot 14, Zone Industrielle Takaddoum',
    client_city: 'Rabat',
    client_phone: '+212 537 22 16 40',
    date_issued: '22 Fév 2025',
    due_date: '24 Mars 2025',
    payment_method: 'Chèque bancaire',
    status: 'Partielle',
    paid_amount: 8000.0,
    lines: [
      { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', qty: 6, unit_price_ht: 1249.0, tva_rate: 20 },
      { sku: 'PMP-15HP', name: 'Pompe immergée 1.5 HP', qty: 2, unit_price_ht: 3840.0, tva_rate: 20 },
    ],
  },
  {
    ref: 'FAC-2025-182',
    order_ref: 'CMD-2403',
    client: 'Comptoir Al Amal',
    client_ice: '004128901000092',
    client_address: '45, Rue des Selliers, Medina',
    client_city: 'Fès',
    client_phone: '+212 535 61 20 08',
    date_issued: '20 Fév 2025',
    due_date: '20 Fév 2025 (Échue)',
    payment_method: 'Traite commerciale 60j',
    status: 'En retard',
    paid_amount: 0.0,
    lines: [
      { sku: 'GEN-5000', name: 'Groupe électrogène 5 kVA', qty: 3, unit_price_ht: 8950.0, tva_rate: 20 },
    ],
  },
  {
    ref: 'FAC-2025-181',
    order_ref: 'CMD-2402',
    client: 'Nord Industrie',
    client_ice: '007812934000033',
    client_address: 'Zone Franche de Tanger, Lot 8',
    client_city: 'Tanger',
    client_phone: '+212 539 94 12 30',
    date_issued: '18 Fév 2025',
    due_date: '18 Mars 2025',
    payment_method: 'Virement bancaire',
    status: 'Payée',
    paid_amount: 6280.0,
    lines: [
      { sku: 'CUT-230D', name: 'Disque diamant 230 mm', qty: 27, unit_price_ht: 189.5, tva_rate: 20 },
    ],
  },
];

const AGING_CLIENTS = [
  { client: 'Comptoir Al Amal', ice: '004128901000092', city: 'Fès', current: 0, d30: 0, d60: 32100, d90: 0, dOver: 0, total: 32100, risk: 'Modéré', phone: '+212 535 61 20 08', whatsapp: '212663445566' },
  { client: 'Quincaillerie Saada', ice: '001928374000045', city: 'Casablanca', current: 0, d30: 0, d60: 0, d90: 14500, dOver: 0, total: 14500, risk: 'Élevé (Chèque impayé)', phone: '+212 522 99 88 77', whatsapp: '212661001122' },
  { client: 'Atlas Équipements SARL', ice: '003147829000064', city: 'Casablanca', current: 24860, d30: 0, d60: 0, d90: 0, dOver: 0, total: 24860, risk: 'Faible', phone: '+212 522 34 78 90', whatsapp: '212661234567' },
  { client: 'BatiPro Maroc', ice: '002984123000081', city: 'Rabat', current: 10420.5, d30: 8000, d60: 0, d90: 0, dOver: 0, total: 18420.5, risk: 'Faible', phone: '+212 537 22 16 40', whatsapp: '212661987654' },
  { client: 'Marché Al Matar', ice: '005519820000019', city: 'Casablanca', current: 45200, d30: 12000, d60: 0, d90: 0, dOver: 0, total: 57200, risk: 'Faible (VIP)', phone: '+212 522 88 77 66', whatsapp: '212662334455' },
];

export default function AccountingDashboard() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'cheques' | 'aging' | 'banking'>('invoices');
  const [cheques, setCheques] = useState<Cheque[]>(INITIAL_CHEQUES);
  const [invoices, setInvoices] = useState<InvoiceData[]>(INITIAL_INVOICES);
  const [chequeFilter, setChequeFilter] = useState<string>('all');
  const [invoiceFilter, setInvoiceFilter] = useState<string>('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Modals
  const [viewInvoice, setViewInvoice] = useState<InvoiceData | null>(null);
  const [showNewInvoice, setShowNewInvoice] = useState<boolean>(false);
  const [payInvoice, setPayInvoice] = useState<InvoiceData | null>(null);
  const [slipModal, setSlipModal] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const filteredCheques = cheques.filter(
    (ch) => chequeFilter === 'all' || ch.status === chequeFilter,
  );

  const filteredInvoices = invoices.filter((inv) => {
    const q = invoiceSearch.toLowerCase().trim();
    const matchQ =
      !q ||
      inv.ref.toLowerCase().includes(q) ||
      inv.client.toLowerCase().includes(q) ||
      (inv.client_ice && inv.client_ice.toLowerCase().includes(q));
    const matchS = invoiceFilter === 'all' || inv.status === invoiceFilter;
    return matchQ && matchS;
  });

  const totalPortfolio = cheques
    .filter((c) => c.status === 'en_portefeuille')
    .reduce((a, b) => a + b.amount, 0);
  const totalRemis = cheques
    .filter((c) => c.status === 'remis_en_banque')
    .reduce((a, b) => a + b.amount, 0);
  const totalImpayes = cheques
    .filter((c) => c.status === 'impaye')
    .reduce((a, b) => a + b.amount, 0);

  const totalInvoiced = invoices.reduce((sum, inv) => {
    const ht = inv.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
    return sum + ht * 1.2;
  }, 0);

  const totalCollected = invoices.reduce((sum, inv) => {
    const ht = inv.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
    const ttc = ht * 1.2;
    return sum + (inv.paid_amount ?? (inv.status === 'Payée' ? ttc : 0));
  }, 0);

  const totalReceivables = Math.max(0, totalInvoiced - totalCollected);

  function handleCreateInvoice(newInv: InvoiceData) {
    setInvoices((prev) => [newInv, ...prev]);
    notify(`Facture ${newInv.ref} émise avec succès pour ${newInv.client} !`);
  }

  function handlePaymentConfirm(ref: string, amount: number, method: string, refDoc: string) {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.ref !== ref) return inv;
        const ht = inv.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
        const ttc = ht * 1.2;
        const prevPaid = inv.paid_amount ?? (inv.status === 'Payée' ? ttc : 0);
        const nextPaid = prevPaid + amount;
        const newStatus = nextPaid >= ttc ? 'Payée' : 'Partielle';
        return { ...inv, paid_amount: nextPaid, status: newStatus };
      })
    );

    if (method === 'Chèque' || method === 'Traite') {
      const inv = invoices.find((i) => i.ref === ref);
      setCheques((prev) => [
        {
          id: Date.now(),
          ref: refDoc,
          client: inv?.client || 'Client ERP',
          bank: 'Attijariwafa Bank',
          amount,
          due_date: '30 jours',
          status: 'en_portefeuille',
        },
        ...prev,
      ]);
      notify(`Règlement de ${formatMoney(amount)} DH enregistré et effet ${refDoc} ajouté en portefeuille !`);
    } else {
      notify(`Règlement de ${formatMoney(amount)} DH enregistré pour la facture ${ref} (${method}) !`);
    }
  }

  function exportInvoicesCsv() {
    const csv = [
      'N° Facture;Client;ICE;Total HT;TVA;Total TTC;Réglé;Reste;Statut;Échéance',
      ...filteredInvoices.map((inv) => {
        const ht = inv.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
        const ttc = ht * 1.2;
        const paid = inv.paid_amount ?? (inv.status === 'Payée' ? ttc : 0);
        const rem = Math.max(0, ttc - paid);
        return `"${inv.ref}";"${inv.client}";"${inv.client_ice || ''}";"${ht.toFixed(2)}";"${(ht * 0.2).toFixed(2)}";"${ttc.toFixed(2)}";"${paid.toFixed(2)}";"${rem.toFixed(2)}";"${inv.status}";"${inv.due_date}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `factures-maroc-${Date.now()}.csv`;
    link.click();
    notify('Export CSV des Factures téléchargé.');
  }

  function advanceChequeStatus(id: number) {
    setCheques((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (c.status === 'en_portefeuille') return { ...c, status: 'remis_en_banque' };
          if (c.status === 'remis_en_banque') return { ...c, status: 'encaisse' };
          if (c.status === 'impaye') return { ...c, status: 'remis_en_banque' };
        }
        return c;
      }),
    );
    notify('Statut du chèque/effet mis à jour avec traçabilité.');
  }

  return (
    <div className="dashboard-page accounting-workspace">
      {/* ── Header ── */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">COMPTABILITÉ & TRÉSORERIE <span className="eyebrow-sep">/</span> FACTURATION & EFFETS MAROC</span>
          <h1>Espace Comptable & Facturation<span className="title-period">.</span></h1>
          <p>Conforme aux normes fiscales marocaines (ICE, IF, RC, Patente). Facturation légale, registre des chèques, traites et relances.</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={() => setReminderModal(true)}>
            <MessageSquare size={15} /> Relance impayés WhatsApp
          </button>
          <button className="button-secondary" onClick={() => setSlipModal(true)}>
            <Download size={15} /> Bordereau banque
          </button>
          <button className="button-primary" onClick={() => setShowNewInvoice(true)}>
            <Plus size={15} /> Nouvelle Facture
          </button>
        </div>
      </div>

      {/* ── Sub-navigation Tabs ── */}
      <div className="table-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`table-tab ${activeTab === 'invoices' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FileText size={14} style={{ display: 'inline', marginRight: 5 }} />
          Factures de Vente ({invoices.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'cheques' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('cheques')}
        >
          <CreditCard size={14} style={{ display: 'inline', marginRight: 5 }} />
          Effets & Chèques ({cheques.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'aging' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('aging')}
        >
          <Clock size={14} style={{ display: 'inline', marginRight: 5 }} />
          Balance Âgée & Risque
        </button>
        <button
          className={`table-tab ${activeTab === 'banking' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('banking')}
        >
          <Building size={14} style={{ display: 'inline', marginRight: 5 }} />
          Bordereaux Bancaires
        </button>
      </div>

      {/* ════════════════════ TAB 1 : FACTURES DE VENTE ════════════════════ */}
      {activeTab === 'invoices' && (
        <>
          {/* Facturation KPIs */}
          <div className="metric-grid">
            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>Total Facturé TTC</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <FileText size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalInvoiced)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Total factures émises</span>
              </div>
            </div>

            <div className="metric-card metric-green">
              <div className="metric-top">
                <span>Règlements Encaissés</span>
                <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalCollected)} <small>DH</small></div>
              <div className="metric-foot">
                <span className="metric-change change-up">
                  {Math.round((totalCollected / (totalInvoiced || 1)) * 100)}% encaissé
                </span>
              </div>
            </div>

            <div className="metric-card metric-amber">
              <div className="metric-top">
                <span>Reste à Recouvrer</span>
                <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <Clock size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalReceivables)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Factures ouvertes</span>
              </div>
            </div>

            <div className="metric-card metric-red">
              <div className="metric-top">
                <span>Factures en Retard</span>
                <div className="metric-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="metric-number">
                {invoices.filter((i) => i.status === 'En retard').length} <small>factures</small>
              </div>
              <div className="metric-foot">
                <span className="metric-change change-down">Échéance dépassée</span>
              </div>
            </div>
          </div>

          {/* Moroccan Legal Invoices Section */}
          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">FACTURATION CLIENTS MAROC</span>
                <h2>Registre de Facturation ({filteredInvoices.length} factures)</h2>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="button-secondary" onClick={exportInvoicesCsv} style={{ fontSize: '11.5px', height: '32px' }}>
                  <Download size={13} /> Exporter CSV
                </button>
                <button className="button-primary" onClick={() => setShowNewInvoice(true)} style={{ fontSize: '11.5px', height: '32px' }}>
                  <Plus size={13} /> Nouvelle Facture
                </button>
              </div>
            </div>

            <div className="table-tools">
              <div className="table-tabs">
                {['all', 'Impayée', 'Partielle', 'Payée', 'En retard'].map((st) => (
                  <button
                    key={st}
                    className={`table-tab ${invoiceFilter === st ? 'active-tab' : ''}`}
                    onClick={() => setInvoiceFilter(st)}
                  >
                    {st === 'all' ? 'Toutes les factures' : st}
                  </button>
                ))}
              </div>
              <div className="tool-actions">
                <label className="search-field">
                  <Search size={14} />
                  <input
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    placeholder="Rechercher facture, client, ICE..."
                  />
                </label>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>N° FACTURE</th>
                    <th>CLIENT & ICE</th>
                    <th>TOTAL HT</th>
                    <th>TVA (20%)</th>
                    <th>TOTAL TTC</th>
                    <th>DÉJÀ PAYÉ / RESTE</th>
                    <th>STATUT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((fac) => {
                    const ht = fac.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
                    const tva = ht * 0.2;
                    const ttc = ht + tva;
                    const paid = fac.paid_amount ?? (fac.status === 'Payée' ? ttc : 0);
                    const remaining = Math.max(0, ttc - paid);

                    return (
                      <tr key={fac.ref}>
                        <td>
                          <span className="table-ref">{fac.ref}</span>
                          <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px' }}>
                            Émise : {fac.date_issued}
                          </small>
                        </td>
                        <td>
                          <b className="table-main">{fac.client}</b>
                          <small style={{ display: 'block', color: 'var(--muted)' }}>
                            ICE: {fac.client_ice || '002984123000081'}
                          </small>
                        </td>
                        <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(ht)} DH</td>
                        <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(tva)} DH</td>
                        <td>
                          <b>{formatMoney(ttc)} DH</b>
                        </td>
                        <td>
                          <div style={{ fontSize: '11px' }}>
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>{formatMoney(paid)} DH</span> /{' '}
                            <b style={{ color: remaining > 0 ? '#ef4444' : 'inherit' }}>
                              {formatMoney(remaining)} DH
                            </b>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              fac.status === 'Payée'
                                ? 'status-green'
                                : fac.status === 'Partielle'
                                ? 'status-blue'
                                : fac.status === 'En retard'
                                ? 'status-red'
                                : 'status-amber'
                            }`}
                          >
                            <i /> {fac.status}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="row-action"
                              title="Aperçu & Impression Facture A4"
                              onClick={() => setViewInvoice(fac)}
                              style={{ color: '#38bdf8' }}
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              className="row-action"
                              title="Imprimer"
                              onClick={() => setViewInvoice(fac)}
                            >
                              <Printer size={14} />
                            </button>
                            {remaining > 0 && (
                              <button
                                className="button-primary"
                                style={{
                                  fontSize: '11px',
                                  height: '28px',
                                  padding: '0 8px',
                                  background: '#16a34a',
                                  borderColor: '#15803d',
                                }}
                                onClick={() => setPayInvoice(fac)}
                                title="Encaisser un règlement"
                              >
                                <CreditCard size={12} /> Encaisser
                              </button>
                            )}
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

      {/* ════════════════════ TAB 2 : EFFETS & CHÈQUES ════════════════════ */}
      {activeTab === 'cheques' && (
        <>
          <div className="metric-grid">
            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>En Portefeuille</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalPortfolio)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Chèques et traites reçus</span>
              </div>
            </div>

            <div className="metric-card metric-cyan">
              <div className="metric-top">
                <span>Remis en Banque</span>
                <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <Clock size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalRemis)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Encaissement en cours</span>
              </div>
            </div>

            <div className="metric-card metric-red">
              <div className="metric-top">
                <span>Chèques Impayés</span>
                <div className="metric-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalImpayes)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Solde client réaugmenté</span>
              </div>
            </div>
          </div>

          {/* Cheques & Commercial Papers Register (CDC p.12) */}
          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">REGISTRE DES EFFETS DE COMMERCE</span>
                <h2>Chèques et Traites en circulation ({filteredCheques.length})</h2>
              </div>
              <div className="table-tools" style={{ padding: 0 }}>
                <div className="table-tabs">
                  {['all', 'en_portefeuille', 'remis_en_banque', 'encaisse', 'impaye'].map((st) => (
                    <button
                      key={st}
                      className={`table-tab ${chequeFilter === st ? 'active-tab' : ''}`}
                      onClick={() => setChequeFilter(st)}
                    >
                      {st === 'all'
                        ? 'Tous'
                        : st === 'en_portefeuille'
                        ? 'En portefeuille'
                        : st === 'remis_en_banque'
                        ? 'Remis en banque'
                        : st === 'encaisse'
                        ? 'Encaissés'
                        : 'Impayés'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>N° EFFET / RÉFÉRENCE</th>
                    <th>CLIENT ÉMETTEUR</th>
                    <th>BANQUE TIREUR</th>
                    <th>DATE D'ÉCHÉANCE</th>
                    <th>MONTANT</th>
                    <th>STATUT EFFET</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCheques.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span className="table-ref">{c.ref}</span>
                      </td>
                      <td>
                        <b className="table-main">{c.client}</b>
                      </td>
                      <td>
                        <span>{c.bank}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--app-font-mono)' }}>{c.due_date}</span>
                      </td>
                      <td className="table-amount">
                        <b>{formatMoney(c.amount)} DH</b>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            c.status === 'encaisse'
                              ? 'status-green'
                              : c.status === 'remis_en_banque'
                              ? 'status-blue'
                              : c.status === 'impaye'
                              ? 'status-red'
                              : 'status-amber'
                          }`}
                        >
                          <i />{' '}
                          {c.status === 'encaisse'
                            ? 'Encaissé'
                            : c.status === 'remis_en_banque'
                            ? 'Remis en banque'
                            : c.status === 'impaye'
                            ? 'Impayé (Alerte)'
                            : 'En portefeuille'}
                        </span>
                      </td>
                      <td>
                        {c.status === 'en_portefeuille' && (
                          <button
                            className="button-secondary"
                            style={{ fontSize: '11px', height: '28px', padding: '0 8px' }}
                            onClick={() => advanceChequeStatus(c.id)}
                          >
                            Remettre en banque
                          </button>
                        )}
                        {c.status === 'remis_en_banque' && (
                          <button
                            className="button-secondary"
                            style={{ fontSize: '11px', height: '28px', padding: '0 8px', color: '#22c55e' }}
                            onClick={() => advanceChequeStatus(c.id)}
                          >
                            Valider encaissement
                          </button>
                        )}
                        {c.status === 'impaye' && (
                          <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 600 }}>
                            Rejeté par la banque
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 3 : BALANCE ÂGÉE & RISQUE ════════════════════ */}
      {activeTab === 'aging' && (
        <section className="panel list-panel">
          <div className="list-panel-heading">
            <div>
              <span className="eyebrow">RECOUVREMENT &amp; ANALYSE DU CRÉDIT</span>
              <h2>Balance Âgée des Créances Clients (Normes Maroc)</h2>
            </div>
            <button className="button-secondary" onClick={() => setReminderModal(true)}>
              <MessageSquare size={14} /> Relances groupées WhatsApp
            </button>
          </div>

          <div className="table-container">
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>CLIENT B2B &amp; ICE</th>
                  <th>VILLE</th>
                  <th>NON ÉCHU (&lt;0j)</th>
                  <th>1 À 30 JOURS</th>
                  <th>31 À 60 JOURS</th>
                  <th>61 À 90 JOURS</th>
                  <th>TOTAL ENCOURS</th>
                  <th>NIVEAU DE RISQUE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {AGING_CLIENTS.map((ac) => (
                  <tr key={ac.client}>
                    <td>
                      <b className="table-main">{ac.client}</b>
                      <small style={{ display: 'block', color: 'var(--muted)' }}>ICE: {ac.ice}</small>
                    </td>
                    <td><span className="table-secondary">{ac.city}</span></td>
                    <td style={{ color: ac.current > 0 ? '#22c55e' : 'var(--muted)' }}>
                      {ac.current > 0 ? `${formatMoney(ac.current)} DH` : '—'}
                    </td>
                    <td style={{ color: ac.d30 > 0 ? '#38bdf8' : 'var(--muted)' }}>
                      {ac.d30 > 0 ? `${formatMoney(ac.d30)} DH` : '—'}
                    </td>
                    <td style={{ color: ac.d60 > 0 ? '#f59e0b' : 'var(--muted)' }}>
                      {ac.d60 > 0 ? `${formatMoney(ac.d60)} DH` : '—'}
                    </td>
                    <td style={{ color: ac.d90 > 0 ? '#ef4444' : 'var(--muted)', fontWeight: ac.d90 > 0 ? 700 : 400 }}>
                      {ac.d90 > 0 ? `${formatMoney(ac.d90)} DH` : '—'}
                    </td>
                    <td>
                      <strong style={{ fontSize: 13 }}>{formatMoney(ac.total)} DH</strong>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          ac.risk.includes('Élevé')
                            ? 'status-red'
                            : ac.risk.includes('Modéré')
                            ? 'status-amber'
                            : 'status-green'
                        }`}
                      >
                        {ac.risk}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${ac.whatsapp}?text=Bonjour%20${encodeURIComponent(ac.client)},%20rappel%20de%20facture%20Hercules%20Distribution.`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-secondary"
                        style={{ height: 26, fontSize: 11, padding: '0 8px', color: '#22c55e', gap: 4 }}
                      >
                        <MessageSquare size={12} /> Relancer
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ════════════════════ TAB 4 : BORDEREAUX BANCAIRES ════════════════════ */}
      {activeTab === 'banking' && (
        <section className="panel" style={{ padding: 20 }}>
          <div className="panel-heading" style={{ marginBottom: 14 }}>
            <div>
              <span className="eyebrow">SERVICES BANCAIRES &amp; REMISES</span>
              <h2>Bordereaux de Remise de Chèques &amp; Traites</h2>
            </div>
            <button className="button-primary" onClick={() => setSlipModal(true)}>
              <Download size={14} /> Télécharger Bordereau PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: 'var(--navy-2)', padding: 16, borderRadius: 8, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', marginBottom: 8 }}>
                <Building size={16} />
                <b>Attijariwafa Bank · Agence Mers Sultan</b>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                RIB : <b>007 780 0001234567890123 45</b><br />
                Titulaire : <b>HERCULES DISTRIBUTION SARL</b><br />
                Dernière remise : <b>28 Février 2025 (32 100 DH)</b>
              </p>
            </div>

            <div style={{ background: 'var(--navy-2)', padding: 16, borderRadius: 8, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', marginBottom: 8 }}>
                <Building size={16} />
                <b>Banque Populaire · Agence Ain Sebaâ</b>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                RIB : <b>127 780 0009876543210987 12</b><br />
                Titulaire : <b>HERCULES DISTRIBUTION SARL</b><br />
                Dernière remise : <b>24 Février 2025 (18 420 DH)</b>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Bank Remittance Slip Modal */}
      {slipModal && (
        <div className="modal-backdrop" onClick={() => setSlipModal(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">BORDEREAU OFFICIEL · BANQUE</span>
                <h2>Bordereau de Remise de Chèques & Effets</h2>
              </div>
              <button className="icon-button" onClick={() => setSlipModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">
              Génération automatique pour remise à l'agence bancaire (Attijariwafa Bank / Banque Populaire).
            </p>
            <div style={{ background: 'var(--navy-2)', padding: '14px', borderRadius: '8px', margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Nombre d'effets à remettre :</span>
                <b>2 effets</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
                <span>Montant total de la remise :</span>
                <b style={{ color: '#22c55e' }}>{formatMoney(totalPortfolio)} DH</b>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', borderTop: '1px solid var(--line-soft)', paddingTop: '6px' }}>
                Compte Hercules Distribution SARL : RIB 007 780 0001234567890123 45
              </div>
            </div>
            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setSlipModal(false)}>Fermer</button>
              <button
                className="button-primary"
                onClick={() => {
                  setSlipModal(false);
                  notify('Bordereau PDF généré avec succès pour la banque !');
                }}
              >
                <Download size={14} /> Télécharger PDF Bordereau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Payment Reminder Modal */}
      {reminderModal && (
        <div className="modal-backdrop" onClick={() => setReminderModal(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">RELANCES AUTOMATIQUES MAROC</span>
                <h2>Modèle de Relance WhatsApp / SMS (J+7)</h2>
              </div>
              <button className="icon-button" onClick={() => setReminderModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">Modèle conforme au CDC section 9.7 (Français et Darija).</p>
            <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px', margin: '12px 0', fontSize: '12px', lineHeight: 1.6 }}>
              <b>Modèle Français :</b>
              <p style={{ margin: '4px 0 10px', color: 'var(--text-soft)' }}>
                « Bonjour [Client], sauf erreur de notre part, la facture [N°] de [Montant] DH échue le [Date] reste en attente de règlement. Merci de bien vouloir nous transmettre votre ordre de virement ou confirmer la date de remise de chèque. Hercules Distribution. »
              </p>
              <b>Modèle Darija / Arabe :</b>
              <p style={{ margin: '4px 0 0', color: 'var(--text-soft)', direction: 'rtl', textAlign: 'right' }}>
                « السلام عليكم [Client]، لتذكيركم بأن الفاتورة رقم [N°] بمبلغ [Montant] درهم قد حان أجل سدادها. المرجو تأكيد موعد الأداء مع الموزع. شكراً لكم، شركة Hercules Distribution. »
              </p>
            </div>
            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setReminderModal(false)}>Fermer</button>
              <button
                className="button-primary"
                style={{ background: '#22c55e', borderColor: '#16a34a' }}
                onClick={() => {
                  setReminderModal(false);
                  notify('Campagne de relance WhatsApp envoyée aux 3 clients concernés.');
                }}
              >
                Envoyer les relances par WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Official Invoice Document Modal ── */}
      {viewInvoice && (
        <InvoiceDocumentModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onRecordPayment={(inv) => {
            setPayInvoice(inv);
            setViewInvoice(null);
          }}
        />
      )}

      {/* ── New Invoice Modal ── */}
      {showNewInvoice && (
        <NewInvoiceModal
          onClose={() => setShowNewInvoice(false)}
          onCreate={handleCreateInvoice}
        />
      )}

      {/* ── Register Payment Modal ── */}
      {payInvoice && (
        <RegisterPaymentModal
          invoice={payInvoice}
          onClose={() => setPayInvoice(null)}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
