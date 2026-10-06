import { useState } from 'react';
import {
  BadgeDollarSign, CreditCard, Receipt, FileText, CheckCircle2,
  AlertTriangle, Clock, MessageSquare, Download, Plus, Filter,
  Building, Calendar, X,
} from 'lucide-react';
import { formatMoney } from '../api';

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

const INVOICES = [
  {
    ref: 'FAC-2025-184',
    client: 'Atlas Équipements',
    ice: '003147829000064',
    total_ht: 20716.67,
    tva: 4143.33,
    total_ttc: 24860.0,
    paid: 0.0,
    remaining: 24860.0,
    due_date: '26 Mars 2025',
    status: 'Impayée',
  },
  {
    ref: 'FAC-2025-183',
    client: 'BatiPro Maroc',
    ice: '002984123000081',
    total_ht: 15350.42,
    tva: 3070.08,
    total_ttc: 18420.5,
    paid: 8000.0,
    remaining: 10420.5,
    due_date: '24 Mars 2025',
    status: 'Partielle',
  },
  {
    ref: 'FAC-2025-182',
    client: 'Comptoir Al Amal',
    ice: '004128901000092',
    total_ht: 26750.0,
    tva: 5350.0,
    total_ttc: 32100.0,
    paid: 0.0,
    remaining: 32100.0,
    due_date: '20 Fév 2025 (Échue)',
    status: 'En retard',
  },
];

export default function AccountingDashboard() {
  const [cheques, setCheques] = useState<Cheque[]>(INITIAL_CHEQUES);
  const [chequeFilter, setChequeFilter] = useState<string>('all');
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

  const totalPortfolio = cheques
    .filter((c) => c.status === 'en_portefeuille')
    .reduce((a, b) => a + b.amount, 0);
  const totalRemis = cheques
    .filter((c) => c.status === 'remis_en_banque')
    .reduce((a, b) => a + b.amount, 0);
  const totalImpayes = cheques
    .filter((c) => c.status === 'impaye')
    .reduce((a, b) => a + b.amount, 0);

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
      {/* Header */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">COMPTABILITÉ & TRÉSORERIE <span className="eyebrow-sep">/</span> FACTURES & EFFETS MAROC</span>
          <h1>Espace Comptable & Finance<span className="title-period">.</span></h1>
          <p>Conforme aux normes fiscales marocaines (ICE, IF, RC, Patente). Registre des chèques, traites et relances.</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={() => setReminderModal(true)}>
            <MessageSquare size={15} /> Relance impayés WhatsApp
          </button>
          <button className="button-primary" onClick={() => setSlipModal(true)}>
            <Download size={15} /> Bordereau remise en banque
          </button>
        </div>
      </div>

      {/* KPI Cards */}
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

        <div className="metric-card metric-amber">
          <div className="metric-top">
            <span>Créances Clients Échues</span>
            <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="metric-number">428 560 <small>DH</small></div>
          <div className="metric-foot">
            <span className="metric-change change-down">11 factures échues</span>
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

      {/* Moroccan Legal Invoices Section */}
      <section className="panel list-panel" style={{ marginTop: '16px' }}>
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">FACTURATION CLIENTS MAROC</span>
            <h2>Dernières Factures Émises (ICE, IF, RC, TVA détaillée)</h2>
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
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((fac) => (
                <tr key={fac.ref}>
                  <td>
                    <span className="table-ref">{fac.ref}</span>
                  </td>
                  <td>
                    <b className="table-main">{fac.client}</b>
                    <small style={{ display: 'block', color: 'var(--muted)' }}>ICE: {fac.ice}</small>
                  </td>
                  <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(fac.total_ht)} DH</td>
                  <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(fac.tva)} DH</td>
                  <td>
                    <b>{formatMoney(fac.total_ttc)} DH</b>
                  </td>
                  <td>
                    <div style={{ fontSize: '11px' }}>
                      <span style={{ color: '#22c55e' }}>{formatMoney(fac.paid)} DH</span> /{' '}
                      <b style={{ color: fac.remaining > 0 ? '#ef4444' : 'inherit' }}>{formatMoney(fac.remaining)} DH</b>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        fac.status === 'Payée'
                          ? 'status-green'
                          : fac.status === 'Partielle'
                          ? 'status-blue'
                          : 'status-red'
                      }`}
                    >
                      <i /> {fac.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
