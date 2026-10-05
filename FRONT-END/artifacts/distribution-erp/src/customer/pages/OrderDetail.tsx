import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronRight, Loader2, Package, CalendarDays, MessageSquare, Repeat } from 'lucide-react';
import { api, type OrderDetail as OrderDetailType } from '../api';
import { formatMoney, useCart } from '../cart';
import { StatusBadge } from './Home';

const TIMELINE = ['pending_validation', 'confirmed', 'prepared', 'assigned', 'in_delivery', 'delivered'];

export default function OrderDetail({ ref_ }: { ref_: string }) {
  const [, setLocation] = useLocation();
  const { addMany } = useCart();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.order(ref_).then((r) => setOrder(r.data)).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [ref_]);

  if (loading) return <div className="cx-loading"><Loader2 className="cx-spin" size={20} /> Chargement…</div>;
  if (!order) return (
    <div className="cx-empty"><Package size={26} /><h2>Commande introuvable</h2>
      <button className="cx-btn cx-btn-primary" onClick={() => setLocation('/customer/orders')}>Mes commandes</button></div>
  );

  async function reorder() {
    try {
      const res = await api.reorder(order!.ref);
      const lines = res.data.filter((i) => i.in_stock).map((i) => ({
        product_id: i.product_id, code: i.code, name: i.name, image: i.image,
        unit: i.unit, price_ht: i.price_ht, vat_rate: i.vat_rate,
        available_qty: i.available_qty, quantity: Math.min(i.quantity, i.available_qty),
      }));
      if (lines.length) { addMany(lines); setLocation('/customer/cart'); }
    } catch { /* ignore */ }
  }

  const stepIndex = TIMELINE.indexOf(order.status);

  return (
    <div className="cx-page">
      <nav className="cx-breadcrumb">
        <Link href="/customer/orders">Mes commandes</Link>
        <ChevronRight size={13} />
        <span>{order.ref}</span>
      </nav>

      <div className="cx-page-head">
        <div>
          <span className="cx-eyebrow">COMMANDE · {new Date(order.date).toLocaleDateString('fr-FR')}</span>
          <h1>{order.ref}</h1>
          <div className="cx-od-badges">
            <StatusBadge status={order.status} label={order.status_label} />
            {order.desired_date && <span className="cx-chip"><CalendarDays size={13} /> Livraison souhaitée {new Date(order.desired_date).toLocaleDateString('fr-FR')}</span>}
          </div>
        </div>
        <button className="cx-btn cx-btn-ghost" onClick={reorder}><Repeat size={15} /> Recommencer</button>
      </div>

      {stepIndex >= 0 && (
        <div className="cx-timeline">
          {TIMELINE.map((step, i) => (
            <div key={step} className={`cx-step ${i <= stepIndex ? 'done' : ''} ${i === stepIndex ? 'current' : ''}`}>
              <span className="cx-step-dot" />
              <small>{stepLabel(step)}</small>
            </div>
          ))}
        </div>
      )}

      <div className="cx-panel">
        <div className="cx-panel-head"><h2>Articles</h2><span>{order.items.length} ligne(s)</span></div>
        <table className="cx-table">
          <thead><tr><th>Produit</th><th>Qté</th><th>P.U. HT</th><th className="right">Total HT</th></tr></thead>
          <tbody>
            {order.items.map((it, idx) => (
              <tr key={idx}>
                <td><b>{it.name}</b><small>{it.code}</small></td>
                <td>{it.quantity} {it.unit}</td>
                <td>{formatMoney(it.unit_price)}</td>
                <td className="right">{formatMoney(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cx-totals">
          {order.discount > 0 && <div className="cx-sum-row"><span>Remise</span><strong>− {formatMoney(order.discount)}</strong></div>}
          <div className="cx-sum-row cx-sum-total"><span>Total</span><strong>{formatMoney(order.total)}</strong></div>
        </div>
      </div>

      {order.delivery_note && (
        <div className="cx-panel">
          <div className="cx-panel-head"><h2><MessageSquare size={15} /> Note de livraison</h2></div>
          <p className="cx-note">{order.delivery_note}</p>
        </div>
      )}
    </div>
  );
}

function stepLabel(step: string): string {
  return ({
    pending_validation: 'À valider',
    confirmed: 'Confirmée',
    prepared: 'Préparée',
    assigned: 'Affectée',
    in_delivery: 'En livraison',
    delivered: 'Livrée',
  } as Record<string, string>)[step] ?? step;
}
