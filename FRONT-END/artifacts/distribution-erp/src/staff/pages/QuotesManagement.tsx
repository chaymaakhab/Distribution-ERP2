import { useState, useEffect } from 'react';
import {
  FileText, Search, Filter, Plus, CheckCircle2, XCircle,
  Eye, Download, Calendar, ArrowRight, Printer, Check,
  Clock, AlertCircle, ShoppingCart, User, Building2,
} from 'lucide-react';
import { api, formatMoney } from '../api';

interface QuoteItem {
  id: number;
  ref: string;
  customer: string;
  city: string;
  ice?: string;
  date: string;
  valid_until: string;
  total_ht: number;
  total_ttc: number;
  status: 'Brouillon' | 'Transmis' | 'Accepté' | 'Refusé' | 'Converti';
  items_count: number;
  commercial: string;
}

const INITIAL_QUOTES: QuoteItem[] = [
  { id: 1, ref: 'DEV-2025-084', customer: 'Atlas Équipements SARL', city: 'Casablanca', ice: '001524389000045', date: '28 Fév 2025', valid_until: '15 Mar 2025', total_ht: 38400.0, total_ttc: 46080.0, status: 'Transmis', items_count: 6, commercial: 'Youssef Bennani' },
  { id: 2, ref: 'DEV-2025-083', customer: 'BatiPro Maroc', city: 'Rabat', ice: '002495810000078', date: '27 Fév 2025', valid_until: '14 Mar 2025', total_ht: 22150.0, total_ttc: 26580.0, status: 'Accepté', items_count: 4, commercial: 'Youssef Bennani' },
  { id: 3, ref: 'DEV-2025-082', customer: 'Nord Industrie', city: 'Tanger', ice: '002871040000091', date: '26 Fév 2025', valid_until: '12 Mar 2025', total_ht: 64200.0, total_ttc: 77040.0, status: 'Converti', items_count: 10, commercial: 'Mehdi Lahlou' },
  { id: 4, ref: 'DEV-2025-081', customer: 'Comptoir Al Amal', city: 'Fès', ice: '003147829000064', date: '25 Fév 2025', valid_until: '10 Mar 2025', total_ht: 15800.0, total_ttc: 18960.0, status: 'Transmis', items_count: 3, commercial: 'Youssef Bennani' },
  { id: 5, ref: 'DEV-2025-080', customer: 'Maison du Bricolage', city: 'Marrakech', ice: '001984220000063', date: '24 Fév 2025', valid_until: '08 Mar 2025', total_ht: 9800.0, total_ttc: 11760.0, status: 'Brouillon', items_count: 2, commercial: 'Hamid El Meskini' },
  { id: 6, ref: 'DEV-2025-079', customer: 'Quincaillerie Saada', city: 'Agadir', ice: '004128900000019', date: '22 Fév 2025', valid_until: '05 Mar 2025', total_ht: 42100.0, total_ttc: 50520.0, status: 'Refusé', items_count: 7, commercial: 'Hamid El Meskini' },
];

export default function QuotesManagement({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [quotes, setQuotes] = useState<QuoteItem[]>(INITIAL_QUOTES);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const [activeQuote, setActiveQuote] = useState<QuoteItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleConvert(quote: QuoteItem) {
    setQuotes((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: 'Converti' as const } : q))
    );
    notify(`Devis ${quote.ref} converti avec succès en Commande officielle !`);
  }

  function handleStatusChange(id: number, newStatus: QuoteItem['status']) {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
    );
    notify(`Statut du devis mis à jour : ${newStatus}`);
  }

  const filtered = quotes.filter((q) => {
    const matchQ =
      q.ref.toLowerCase().includes(query.toLowerCase()) ||
      q.customer.toLowerCase().includes(query.toLowerCase()) ||
      q.city.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || q.status === statusFilter;
    return matchQ && matchS;
  });

  const totalHt = quotes.reduce((acc, q) => acc + q.total_ht, 0);
  const acceptedCount = quotes.filter((q) => q.status === 'Accepté' || q.status === 'Converti').length;
  const conversionRate = quotes.length ? Math.round((acceptedCount / quotes.length) * 100) : 0;

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">VENTES & NÉGOCIATION / DEVIS & PROFORMAS</div>
          <h1>Devis & Proformas</h1>
          <p>Créez, éditez et convertissez les propositions commerciales en commandes fermes.</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={() => window.print()}>
            <Printer size={15} /> Imprimer registre
          </button>
          <button className="button-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Nouveau devis
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>Devis Émis (Total)</span>
          <strong className="blue">{quotes.length} devis</strong>
        </div>
        <div className="summary-box">
          <span>Montant Total Proforma HT</span>
          <strong className="neutral">{formatMoney(totalHt)}</strong>
        </div>
        <div className="summary-box">
          <span>Taux de Transformation</span>
          <strong className="green">{conversionRate}% ({acceptedCount} convertis)</strong>
        </div>
        <div className="summary-box">
          <span>En Attente Client</span>
          <strong className="amber">{quotes.filter((q) => q.status === 'Transmis').length} devis</strong>
        </div>
      </div>

      {/* Main List Panel */}
      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">REGISTRE DES DEVIS</span>
            <h2>Tous les devis en cours</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} devis affichés
          </div>
        </div>

        <div className="table-tools">
          <div className="tool-actions" style={{ width: '100%', display: 'flex', gap: 12 }}>
            <label className="search-field" style={{ flex: 1 }}>
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par référence devis, client ou ville…"
              />
            </label>

            <select
              className="select-compact"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="all">Tous les statuts</option>
              <option value="Brouillon">Brouillon</option>
              <option value="Transmis">Transmis</option>
              <option value="Accepté">Accepté</option>
              <option value="Converti">Converti en commande</option>
              <option value="Refusé">Refusé</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>RÉF. DEVIS</th>
                <th>CLIENT & VILLE</th>
                <th>DATE & VALIDITÉ</th>
                <th>COMMERCIAL</th>
                <th>MONTANT HT</th>
                <th>MONTANT TTC</th>
                <th>STATUT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id}>
                  <td>
                    <span className="table-ref">{q.ref}</span>
                    <small className="under-ref">{q.items_count} articles</small>
                  </td>
                  <td>
                    <b className="table-main">{q.customer}</b>
                    <small>{q.city} {q.ice ? `· ICE ${q.ice}` : ''}</small>
                  </td>
                  <td>
                    <span>{q.date}</span>
                    <small>Valide jusqu'au {q.valid_until}</small>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{q.commercial}</span>
                  </td>
                  <td className="table-amount">{formatMoney(q.total_ht)}</td>
                  <td className="table-amount" style={{ fontWeight: 800 }}>{formatMoney(q.total_ttc)}</td>
                  <td>
                    <span className={`status-pill ${
                      q.status === 'Converti' ? 'status-green' :
                      q.status === 'Accepté' ? 'status-green' :
                      q.status === 'Transmis' ? 'status-blue' :
                      q.status === 'Brouillon' ? 'status-amber' : 'status-red'
                    }`}>
                      <i /> {q.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {q.status === 'Accepté' && (
                        <button
                          className="button-primary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => handleConvert(q)}
                          title="Convertir immédiatement en commande ferme"
                        >
                          <ShoppingCart size={12} /> Convertir
                        </button>
                      )}
                      {q.status === 'Transmis' && (
                        <button
                          className="button-secondary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => handleStatusChange(q.id, 'Accepté')}
                          title="Marquer accepté par le client"
                        >
                          <Check size={12} /> Valider
                        </button>
                      )}
                      <button
                        className="button-secondary"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                        onClick={() => setActiveQuote(q)}
                        title="Imprimer / Afficher la proforma"
                      >
                        <Eye size={12} /> Proforma
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Proforma View Modal */}
      {activeQuote && (
        <div className="modal-backdrop" onClick={() => setActiveQuote(null)}>
          <div className="record-modal" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">DOCUMENT PROFORMA</span>
                <h2>Devis N° {activeQuote.ref}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setActiveQuote(null)}>✕</button>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <div>
                  <small style={{ color: 'var(--muted)' }}>Client destinataire</small>
                  <b style={{ display: 'block', fontSize: 15 }}>{activeQuote.customer}</b>
                  <span>{activeQuote.city} · ICE : {activeQuote.ice}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <small style={{ color: 'var(--muted)' }}>Commercial référent</small>
                  <b style={{ display: 'block' }}>{activeQuote.commercial}</b>
                  <span>Validité : {activeQuote.valid_until}</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle, #f8fafc)', padding: 14, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Total Hors Taxe (HT) :</span>
                  <b>{formatMoney(activeQuote.total_ht)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>TVA 20% légale :</span>
                  <b>{formatMoney(activeQuote.total_ttc - activeQuote.total_ht)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px dashed #cbd5e1', fontSize: 16 }}>
                  <span>Net à Payer TTC :</span>
                  <strong style={{ color: 'var(--brand, #0284c7)' }}>{formatMoney(activeQuote.total_ttc)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={() => setActiveQuote(null)}>Fermer</button>
              <button type="button" className="button-primary" onClick={() => window.print()}>
                <Printer size={15} /> Imprimer Proforma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Quote Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <form
            className="record-modal"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const newQ: QuoteItem = {
                id: Date.now(),
                ref: `DEV-2025-${Math.floor(100 + Math.random() * 900)}`,
                customer: String(form.get('customer')),
                city: String(form.get('city')),
                date: 'Aujourd’hui',
                valid_until: 'Dans 15 jours',
                total_ht: Number(form.get('total_ht')) || 12000,
                total_ttc: (Number(form.get('total_ht')) || 12000) * 1.2,
                status: 'Brouillon',
                items_count: 3,
                commercial: 'Youssef Bennani',
              };
              setQuotes([newQ, ...quotes]);
              setShowCreateModal(false);
              notify(`Nouveau devis ${newQ.ref} créé avec succès.`);
            }}
          >
            <div className="modal-top">
              <div>
                <span className="eyebrow">CRÉATION COMMERCIALE</span>
                <h2>Émettre un nouveau devis</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <label className="field-label">
              Client
              <input name="customer" placeholder="Ex: Atlas Équipements SARL" required />
            </label>
            <label className="field-label">
              Ville
              <input name="city" placeholder="Ex: Casablanca" required />
            </label>
            <label className="field-label">
              Montant estimé HT (DH)
              <input name="total_ht" type="number" step="0.01" placeholder="15000.00" required />
            </label>

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={() => setShowCreateModal(false)}>Annuler</button>
              <button type="submit" className="button-primary">Créer le devis</button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast-note"><Check size={16} />{toast}</div>}
    </div>
  );
}
