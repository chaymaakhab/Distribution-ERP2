import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronRight, Loader2, Package, CalendarDays, MessageSquare, Repeat,
  Printer, ArrowLeft, CheckCircle2, Truck, FileText, User, MapPin,
} from 'lucide-react';
import { api, type OrderDetail as OrderDetailType } from '../api';
import { formatMoney, useCart } from '../cart';
import { StatusBadge } from './Home';

const TIMELINE = ['pending_validation', 'confirmed', 'prepared', 'assigned', 'in_delivery', 'delivered'];

function stepLabel(step: string): string {
  const map: Record<string, string> = {
    pending_validation: 'Commande transmise',
    confirmed: 'Validée par l’ERP',
    prepared: 'Préparée au dépôt',
    assigned: 'Assignée au camion',
    in_delivery: 'En cours de tournée 🚚',
    delivered: 'Livrée & Réceptionnée',
  };
  return map[step] || step;
}

export default function OrderDetail({ ref_ }: { ref_: string }) {
  const [, setLocation] = useLocation();
  const { addMany } = useCart();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.order(ref_).then((r) => setOrder(r.data)).catch(() => setOrder(null)).finally(() => setLoading(false));
  }, [ref_]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--cx-muted)' }}>
        <Loader2 className="cx-spin" size={28} style={{ color: 'var(--cx-brand)', margin: '0 auto 10px' }} />
        <p style={{ fontWeight: 600 }}>Chargement du détail de la commande…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="cx-empty">
        <Package size={40} style={{ color: 'var(--cx-brand)', margin: '0 auto 10px' }} />
        <h2>Commande introuvable</h2>
        <button className="cx-btn cx-btn-primary" onClick={() => setLocation('/customer/orders')}>
          Retour à mes commandes
        </button>
      </div>
    );
  }

  async function handleReorder() {
    try {
      const res = await api.reorder(order!.ref);
      const lines = res.data.filter((i) => i.in_stock).map((i) => ({
        product_id: i.product_id,
        code: i.code,
        name: i.name,
        image: i.image,
        unit: i.unit,
        price_ht: i.price_ht,
        vat_rate: i.vat_rate,
        available_qty: i.available_qty,
        quantity: Math.min(i.quantity, i.available_qty),
      }));
      if (lines.length) {
        addMany(lines);
        setLocation('/customer/cart');
      }
    } catch {
      /* ignore */
    }
  }

  const stepIndex = TIMELINE.indexOf(order.status);

  return (
    <div className="cx-page">
      {/* Breadcrumb Navigation */}
      <nav className="cx-breadcrumb">
        <Link href="/customer/orders">Mes commandes</Link>
        <ChevronRight size={13} />
        <span>{order.ref}</span>
      </nav>

      {/* Header with Title and Actions */}
      <div className="cx-page-head">
        <div>
          <span className="cx-eyebrow">
            BON DE COMMANDE B2B · {new Date(order.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          <h1>{order.ref}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <StatusBadge status={order.status} label={order.status_label} />
            {order.desired_date && (
              <span className="cx-badge cx-badge-slate">
                <CalendarDays size={13} /> Livraison demandée pour le {new Date(order.desired_date).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>

        <div className="cx-page-actions">
          <button className="cx-btn cx-btn-ghost" onClick={() => window.print()}>
            <Printer size={15} /> Imprimer Bon
          </button>
          <button className="cx-btn cx-btn-primary" onClick={handleReorder}>
            <Repeat size={15} /> Recommander
          </button>
        </div>
      </div>

      {/* Modern Multi-step Timeline */}
      {stepIndex >= 0 && (
        <div className="cx-timeline">
          {TIMELINE.map((step, i) => (
            <div
              key={step}
              className={`cx-step ${i <= stepIndex ? 'done' : ''} ${i === stepIndex ? 'current' : ''}`}
            >
              <span className="cx-step-dot" />
              <small>{stepLabel(step)}</small>
            </div>
          ))}
        </div>
      )}

      {/* Order Items Table */}
      <div className="cx-b2b-table-wrap">
        <div style={{ padding: '16px 20px', background: 'var(--cx-bg)', borderBottom: '1px solid var(--cx-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <b style={{ fontSize: 14 }}>Détail des Articles Commandés ({order.items.length})</b>
          <span style={{ fontSize: 12, color: 'var(--cx-muted)' }}>Montants en DH</span>
        </div>

        <table className="cx-table">
          <thead>
            <tr>
              <th>Désignation Article</th>
              <th>Référence</th>
              <th>Quantité</th>
              <th>P.U. HT</th>
              <th className="right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, idx) => (
              <tr key={idx}>
                <td><b>{it.name}</b></td>
                <td><span style={{ fontFamily: 'var(--cx-font-mono)', fontSize: 12, color: 'var(--cx-muted)' }}>{it.code}</span></td>
                <td><span style={{ fontWeight: 700 }}>{it.quantity} {it.unit}</span></td>
                <td>{formatMoney(it.unit_price)}</td>
                <td className="right"><b>{formatMoney(it.total)}</b></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Summary Footer */}
        <div style={{ padding: '20px', background: 'var(--cx-bg)', borderTop: '1px solid var(--cx-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--cx-muted)' }}>
              <span>Sous-total HT</span>
              <b>{formatMoney(order.total / 1.2)}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--cx-muted)' }}>
              <span>TVA (20%)</span>
              <b>{formatMoney(order.total - (order.total / 1.2))}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 900, color: 'var(--cx-brand)', borderTop: '1px solid var(--cx-border)', paddingTop: 8 }}>
              <span>Total TTC</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Instructions or Notes */}
      {order.delivery_note && (
        <div style={{ background: 'var(--cx-surface)', border: '1px solid var(--cx-border)', borderRadius: 14, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <MessageSquare size={16} style={{ color: 'var(--cx-brand)' }} />
            <b style={{ fontSize: 14 }}>Instructions de Livraison & Règlement</b>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--cx-text-secondary)', background: 'var(--cx-bg)', padding: 12, borderRadius: 10 }}>
            {order.delivery_note}
          </p>
        </div>
      )}
    </div>
  );
}
