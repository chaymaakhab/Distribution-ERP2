import { useEffect, useState } from 'react';
import {
  Receipt, Loader2, Download, Wallet, TrendingUp, CheckCircle2,
  Clock, AlertTriangle, ArrowRight, Printer, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import { api, type InvoiceSummary, type Balance } from '../api';
import { formatMoney } from '../cart';
import { PageHeader } from '../CustomerApp';

export default function Invoices() {
  const [invoices, setInvoices] = useState<InvoiceSummary[] | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, { items: { name: string | null; quantity: number; unit_price: number; total: number }[] }>>({});

  useEffect(() => {
    api.invoices().then((r) => setInvoices(r.data)).catch(() => setInvoices([]));
    api.balance().then((r) => setBalance(r.data)).catch(() => setBalance(null));
  }, []);

  async function toggle(ref: string) {
    if (open === ref) {
      setOpen(null);
      return;
    }
    setOpen(ref);
    if (!detail[ref]) {
      try {
        const r = await api.invoice(ref);
        setDetail((d) => ({ ...d, [ref]: { items: r.data.items } }));
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="cx-page">
      <PageHeader
        kicker="GESTION COMPTABLE & TRÉSORERIE"
        title="Factures & Relevé de Compte"
        description="Consultez vos factures conformes DGI, suivez vos échéances de paiement et vérifiez votre encours de crédit autorisé."
      />

      {/* 1. High-End Financial Balance KPIs */}
      {balance && (
        <section className="cx-kpi-grid">
          <div className="cx-kpi-card">
            <div className="cx-kpi-icon blue">
              <TrendingUp size={24} />
            </div>
            <div className="cx-kpi-info">
              <small>Total Facturé</small>
              <b>{formatMoney(balance.total_invoiced)}</b>
              <span>Toutes commandes confondues</span>
            </div>
          </div>

          <div className="cx-kpi-card">
            <div className="cx-kpi-icon green">
              <CheckCircle2 size={24} />
            </div>
            <div className="cx-kpi-info">
              <small>Total Réglé</small>
              <b>{formatMoney(balance.total_paid)}</b>
              <span>Paiements encaissés</span>
            </div>
          </div>

          <div className="cx-kpi-card">
            <div className="cx-kpi-icon amber">
              <AlertTriangle size={24} />
            </div>
            <div className="cx-kpi-info">
              <small>Reste à Régler</small>
              <b>{formatMoney(balance.remaining)}</b>
              <span>Factures en cours d'échéance</span>
            </div>
          </div>

          <div className="cx-kpi-card">
            <div className="cx-kpi-icon purple">
              <Wallet size={24} />
            </div>
            <div className="cx-kpi-info">
              <small>Crédit Disponible</small>
              <b>{formatMoney(balance.credit_available)}</b>
              <span>Sur plafond {formatMoney(balance.credit_limit)}</span>
            </div>
          </div>
        </section>
      )}

      {/* 2. Invoices List */}
      {invoices === null ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--cx-muted)' }}>
          <Loader2 className="cx-spin" size={26} style={{ color: 'var(--cx-brand)', margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600 }}>Chargement de vos factures…</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="cx-empty">
          <Receipt size={40} style={{ color: 'var(--cx-brand)', margin: '0 auto 10px' }} />
          <h2>Aucune facture enregistrée</h2>
          <p>Vos factures apparaîtront ici après la validation et livraison de vos commandes.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {invoices.map((inv) => {
            const expanded = open === inv.ref;
            const isPaid = inv.status === 'Payée';
            const isPartial = inv.status === 'Partielle';

            return (
              <div
                key={inv.ref}
                style={{
                  background: 'var(--cx-surface)',
                  border: '1px solid var(--cx-border)',
                  borderRadius: 14,
                  boxShadow: 'var(--cx-shadow-sm)',
                  overflow: 'hidden',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div
                  onClick={() => toggle(inv.ref)}
                  style={{
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    cursor: 'pointer',
                    background: expanded ? 'var(--cx-bg)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: isPaid ? '#ecfdf5' : '#eff6ff',
                        color: isPaid ? '#059669' : '#2563eb',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <b style={{ fontSize: 15, display: 'block' }}>{inv.ref}</b>
                      <small style={{ color: 'var(--cx-muted)', fontSize: 12 }}>
                        {inv.order_ref ? `Commande ${inv.order_ref} · ` : ''}Échéance : {new Date(inv.due_date).toLocaleDateString('fr-FR')}
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span
                      className={`cx-badge ${isPaid ? 'cx-badge-green' : isPartial ? 'cx-badge-amber' : 'cx-badge-red'}`}
                    >
                      {inv.status}
                    </span>

                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <b style={{ fontSize: 16, display: 'block', color: 'var(--cx-text)' }}>
                        {formatMoney(inv.total_ttc)}
                      </b>
                      <small style={{ fontSize: 11.5, color: inv.remaining > 0 ? '#d97706' : '#059669', fontWeight: 600 }}>
                        {inv.remaining > 0 ? `Reste : ${formatMoney(inv.remaining)}` : 'Soldée ✓'}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="cx-icon-btn"
                      title="Imprimer / Télécharger Facture"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.print();
                      }}
                    >
                      <Download size={16} />
                    </button>

                    <span style={{ color: 'var(--cx-muted)' }}>
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>
                </div>

                {/* Expanded Invoice Details */}
                {expanded && (
                  <div style={{ padding: '20px 24px', borderTop: '1px solid var(--cx-border)' }}>
                    {detail[inv.ref]?.items?.length ? (
                      <table className="cx-table">
                        <thead>
                          <tr>
                            <th>Désignation Article</th>
                            <th>Quantité</th>
                            <th>P.U. HT</th>
                            <th className="right">Total TTC</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail[inv.ref].items.map((it, i) => (
                            <tr key={i}>
                              <td><b>{it.name}</b></td>
                              <td>{it.quantity}</td>
                              <td>{formatMoney(it.unit_price)}</td>
                              <td className="right"><b>{formatMoney(it.total)}</b></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--cx-muted)' }}>
                        <Loader2 className="cx-spin" size={20} style={{ margin: '0 auto 6px' }} />
                        <span>Chargement des lignes de la facture…</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--cx-bg)', padding: 14, borderRadius: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: 'var(--cx-muted)' }}>Total Facture TTC</span>
                          <b>{formatMoney(inv.total_ttc)}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#059669' }}>
                          <span>Montant Réglé</span>
                          <b>{formatMoney(inv.paid_amount)}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: inv.remaining > 0 ? '#b45309' : '#059669', borderTop: '1px solid var(--cx-border)', paddingTop: 6 }}>
                          <span>Solde Restant</span>
                          <span>{formatMoney(inv.remaining)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
