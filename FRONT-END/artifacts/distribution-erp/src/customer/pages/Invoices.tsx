import { useEffect, useState } from 'react';
import { Receipt, Loader2, Download, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';
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
    if (open === ref) { setOpen(null); return; }
    setOpen(ref);
    if (!detail[ref]) {
      try {
        const r = await api.invoice(ref);
        setDetail((d) => ({ ...d, [ref]: { items: r.data.items } }));
      } catch { /* ignore */ }
    }
  }

  return (
    <div className="cx-page">
      <PageHeader kicker="COMPTABILITÉ" title="Factures & solde" description="Consultez vos factures, vos paiements et votre encours." />

      {balance && (
        <div className="cx-stat-row">
          <div className="cx-stat cx-stat-blue"><span className="cx-stat-icon"><TrendingUp size={17} /></span><div><small>Total facturé</small><b>{formatMoney(balance.total_invoiced)}</b></div></div>
          <div className="cx-stat cx-stat-green"><span className="cx-stat-icon"><CheckCircle2 size={17} /></span><div><small>Total payé</small><b>{formatMoney(balance.total_paid)}</b></div></div>
          <div className="cx-stat cx-stat-amber"><span className="cx-stat-icon"><Wallet size={17} /></span><div><small>Reste à régler</small><b>{formatMoney(balance.remaining)}</b></div></div>
          <div className="cx-stat cx-stat-slate"><span className="cx-stat-icon"><Wallet size={17} /></span><div><small>Crédit disponible</small><b>{formatMoney(balance.credit_available)}</b></div></div>
        </div>
      )}

      {invoices === null ? (
        <div className="cx-loading"><Loader2 className="cx-spin" size={20} /> Chargement…</div>
      ) : invoices.length === 0 ? (
        <div className="cx-empty"><Receipt size={26} /><h2>Aucune facture</h2><p>Vos factures apparaîtront ici après validation de vos commandes.</p></div>
      ) : (
        <div className="cx-invoice-list">
          {invoices.map((inv) => {
            const expanded = open === inv.ref;
            return (
              <div className="cx-invoice" key={inv.ref}>
                <button className="cx-invoice-head" onClick={() => toggle(inv.ref)}>
                  <div className="cx-invoice-main">
                    <b>{inv.ref}</b>
                    <small>{inv.order_ref ? `Commande ${inv.order_ref} · ` : ''}Échéance {new Date(inv.due_date).toLocaleDateString('fr-FR')}</small>
                  </div>
                  <span className={`cx-badge ${inv.status === 'Payée' ? 'cx-badge-green' : inv.status === 'Partielle' ? 'cx-badge-amber' : 'cx-badge-red'}`}>{inv.status}</span>
                  <div className="cx-invoice-amounts">
                    <span className="cx-inv-total">{formatMoney(inv.total_ttc)}</span>
                    <small>Reste {formatMoney(inv.remaining)}</small>
                  </div>
                  <button
                    className="cx-icon-btn"
                    title="Télécharger (PDF)"
                    onClick={(e) => { e.stopPropagation(); window.print(); }}
                  ><Download size={16} /></button>
                </button>
                {expanded && (
                  <div className="cx-invoice-body">
                    {detail[inv.ref]?.items?.length ? (
                      <table className="cx-table">
                        <thead><tr><th>Produit</th><th>Qté</th><th>P.U. HT</th><th className="right">Total</th></tr></thead>
                        <tbody>
                          {detail[inv.ref].items.map((it, i) => (
                            <tr key={i}><td>{it.name}</td><td>{it.quantity}</td><td>{formatMoney(it.unit_price)}</td><td className="right">{formatMoney(it.total)}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="cx-loading"><Loader2 className="cx-spin" size={16} /> Chargement du détail…</div>
                    )}
                    <div className="cx-totals">
                      <div className="cx-sum-row"><span>Total TTC</span><strong>{formatMoney(inv.total_ttc)}</strong></div>
                      <div className="cx-sum-row"><span>Payé</span><strong>{formatMoney(inv.paid_amount)}</strong></div>
                      <div className="cx-sum-row cx-sum-total"><span>Reste à payer</span><strong>{formatMoney(inv.remaining)}</strong></div>
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
