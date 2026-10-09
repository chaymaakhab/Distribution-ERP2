import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  FileText, Loader2, ChevronRight, Check, Printer, Eye,
  ShoppingCart, Calendar, AlertCircle, Building2,
} from 'lucide-react';
import { formatMoney, useCart } from '../cart';
import { PageHeader } from '../CustomerApp';

interface CustomerQuote {
  id: number;
  ref: string;
  date: string;
  valid_until: string;
  total_ht: number;
  total_ttc: number;
  status: 'Brouillon' | 'Transmis' | 'Accepté' | 'Converti';
  items_count: number;
  items: Array<{ code: string; name: string; qty: number; price_ht: number }>;
}

const DEMO_QUOTES: CustomerQuote[] = [
  {
    id: 1,
    ref: 'DEV-2025-084',
    date: '28 Fév 2025',
    valid_until: '15 Mar 2025',
    total_ht: 38400,
    total_ttc: 46080,
    status: 'Transmis',
    items_count: 3,
    items: [
      { code: 'HRC-0850', name: 'Perceuse à percussion 850W Pro', qty: 20, price_ht: 1040.83 },
      { code: 'CAB-3G25', name: 'Câble électrique 3G2.5 (100m)', qty: 15, price_ht: 1067.00 },
      { code: 'GEN-5000', name: 'Groupe électrogène 5 kVA', qty: 1, price_ht: 7458.33 },
    ],
  },
  {
    id: 2,
    ref: 'DEV-2025-071',
    date: '10 Fév 2025',
    valid_until: '25 Fév 2025',
    total_ht: 24860,
    total_ttc: 29832,
    status: 'Converti',
    items_count: 2,
    items: [
      { code: 'CUT-230D', name: 'Disque diamant 230 mm', qty: 40, price_ht: 157.92 },
      { code: 'PMP-15HP', name: 'Pompe immergée 1.5 HP Inox', qty: 5, price_ht: 3368.42 },
    ],
  },
];

export default function CustomerQuotes() {
  const [, setLocation] = useLocation();
  const [quotes, setQuotes] = useState<CustomerQuote[]>(DEMO_QUOTES);
  const [filter, setFilter] = useState('all');
  const [activeQuote, setActiveQuote] = useState<CustomerQuote | null>(null);
  const [acceptedToast, setAcceptedToast] = useState<string | null>(null);

  function handleAccept(quote: CustomerQuote) {
    setQuotes((prev) =>
      prev.map((q) => (q.id === quote.id ? { ...q, status: 'Accepté' as const } : q))
    );
    setAcceptedToast(`Devis ${quote.ref} validé ! Votre commercial en a été notifié pour confirmation.`);
    setTimeout(() => setAcceptedToast(null), 3500);
  }

  const filtered = quotes.filter((q) => {
    if (filter === 'all') return true;
    return q.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="cx-page">
      <PageHeader
        kicker="VENTES & OFFRES"
        title="Mes Devis & Proformas"
        description="Consultez les offres commerciales personnalisées, téléchargez vos factures proforma et validez-les en ligne."
      />

      {acceptedToast && (
        <div className="cx-alert cx-alert-success" style={{ marginBottom: 16 }}>
          <Check size={16} /> {acceptedToast}
        </div>
      )}

      {/* Tabs */}
      <div className="cx-toolbar">
        <div className="cx-cat-row" style={{ flex: 1, margin: 0, padding: 0 }}>
          <button
            type="button"
            className={`cx-cat ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous les devis <small>{quotes.length}</small>
          </button>
          <button
            type="button"
            className={`cx-cat ${filter === 'transmis' ? 'active' : ''}`}
            onClick={() => setFilter('transmis')}
          >
            En attente de votre accord <small>{quotes.filter((q) => q.status === 'Transmis').length}</small>
          </button>
          <button
            type="button"
            className={`cx-cat ${filter === 'accepté' ? 'active' : ''}`}
            onClick={() => setFilter('accepté')}
          >
            Validés <small>{quotes.filter((q) => q.status === 'Accepté').length}</small>
          </button>
          <button
            type="button"
            className={`cx-cat ${filter === 'converti' ? 'active' : ''}`}
            onClick={() => setFilter('converti')}
          >
            Commandes générées <small>{quotes.filter((q) => q.status === 'Converti').length}</small>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="cx-empty">
          <FileText size={32} style={{ color: 'var(--cx-brand)', margin: '0 auto 10px' }} />
          <h2>Aucun devis dans cette catégorie</h2>
          <p>Vous n'avez pas de proposition commerciale en cours actuellement.</p>
          <button className="cx-btn cx-btn-primary" onClick={() => setLocation('/customer/catalog')}>
            Parcourir le catalogue
          </button>
        </div>
      ) : (
        <div className="cx-b2b-table-wrap">
          <table className="cx-table">
            <thead>
              <tr>
                <th>RÉFÉRENCE</th>
                <th>DATE D'ÉMISSION</th>
                <th>VALIDITÉ</th>
                <th>ARTICLES</th>
                <th>TOTAL HT</th>
                <th>TOTAL TTC</th>
                <th>STATUT</th>
                <th className="right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--cx-font-mono)', fontWeight: 800, color: 'var(--cx-brand)' }}>
                      {q.ref}
                    </span>
                  </td>
                  <td>{q.date}</td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--cx-muted)' }}>Jusqu'au {q.valid_until}</span>
                  </td>
                  <td>
                    <b>{q.items_count} articles</b>
                  </td>
                  <td>
                    <b>{formatMoney(q.total_ht)} HT</b>
                  </td>
                  <td>
                    <b style={{ color: 'var(--cx-brand)' }}>{formatMoney(q.total_ttc)} TTC</b>
                  </td>
                  <td>
                    <span className={`cx-badge ${
                      q.status === 'Converti' ? 'cx-badge-green' :
                      q.status === 'Accepté' ? 'cx-badge-green' :
                      q.status === 'Transmis' ? 'cx-badge-amber' : 'cx-badge-slate'
                    }`}>
                      {q.status === 'Transmis' ? 'À valider par vous' : q.status}
                    </span>
                  </td>
                  <td className="right">
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {q.status === 'Transmis' && (
                        <button
                          type="button"
                          className="cx-btn cx-btn-emerald sm"
                          onClick={() => handleAccept(q)}
                          title="Accepter cette proposition commerciale"
                        >
                          <Check size={13} /> Valider
                        </button>
                      )}
                      <button
                        type="button"
                        className="cx-btn cx-btn-ghost sm"
                        onClick={() => setActiveQuote(q)}
                      >
                        <Eye size={13} /> Proforma
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Proforma Modal */}
      {activeQuote && (
        <div className="cx-drawer-backdrop" onClick={() => setActiveQuote(null)}>
          <div
            className="cx-panel"
            style={{ maxWidth: 600, margin: '60px auto', background: 'var(--cx-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cx-panel-head">
              <h2><FileText size={16} /> Facture Proforma N° {activeQuote.ref}</h2>
              <button type="button" className="cx-icon-btn sm" onClick={() => setActiveQuote(null)}>✕</button>
            </div>

            <div style={{ padding: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <small style={{ color: 'var(--cx-muted)' }}>Date d'émission</small>
                  <p style={{ margin: 0, fontWeight: 700 }}>{activeQuote.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <small style={{ color: 'var(--cx-muted)' }}>Valable jusqu'au</small>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--cx-brand)' }}>{activeQuote.valid_until}</p>
                </div>
              </div>

              <div className="cx-b2b-table-wrap" style={{ marginBottom: 14 }}>
                <table className="cx-table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Quantité</th>
                      <th className="right">Prix Unitaire HT</th>
                      <th className="right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeQuote.items.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <b>{it.name}</b>
                          <small style={{ display: 'block', color: 'var(--cx-muted)' }}>{it.code}</small>
                        </td>
                        <td>{it.qty}</td>
                        <td className="right">{formatMoney(it.price_ht)}</td>
                        <td className="right"><b>{formatMoney(it.price_ht * it.qty)}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: 'var(--cx-bg)', padding: 14, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Sous-total HT :</span>
                  <b>{formatMoney(activeQuote.total_ht)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>TVA (20%) déductible :</span>
                  <b>{formatMoney(activeQuote.total_ttc - activeQuote.total_ht)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, borderTop: '1px dashed var(--cx-border)', paddingTop: 8 }}>
                  <span>Total TTC :</span>
                  <strong style={{ color: 'var(--cx-brand)' }}>{formatMoney(activeQuote.total_ttc)}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="button" className="cx-btn cx-btn-ghost" onClick={() => window.print()}>
                <Printer size={15} /> Imprimer Proforma
              </button>
              {activeQuote.status === 'Transmis' && (
                <button
                  type="button"
                  className="cx-btn cx-btn-emerald"
                  onClick={() => {
                    handleAccept(activeQuote);
                    setActiveQuote(null);
                  }}
                >
                  <Check size={15} /> Confirmer & Accepter
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
