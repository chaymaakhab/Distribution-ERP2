import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Package, Loader2, ChevronRight, Repeat } from 'lucide-react';
import { api, type OrderSummary } from '../api';
import { formatMoney, useCart } from '../cart';
import { PageHeader } from '../CustomerApp';
import { StatusBadge } from './Home';

export default function Orders() {
  const [, setLocation] = useLocation();
  const { addMany } = useCart();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.orders().then((r) => setOrders(r.data)).catch(() => setOrders([]));
  }, []);

  const filtered = orders?.filter((o) => filter === 'all' || o.status === filter) ?? null;

  async function reorder(ref: string) {
    try {
      const res = await api.reorder(ref);
      const lines = res.data.filter((i) => i.in_stock).map((i) => ({
        product_id: i.product_id, code: i.code, name: i.name, image: i.image,
        unit: i.unit, price_ht: i.price_ht, vat_rate: i.vat_rate,
        available_qty: i.available_qty, quantity: Math.min(i.quantity, i.available_qty),
      }));
      if (lines.length) { addMany(lines); setLocation('/customer/cart'); }
    } catch { /* ignore */ }
  }

  const tabs = [
    { id: 'all', label: 'Toutes' },
    { id: 'pending_validation', label: 'À valider' },
    { id: 'confirmed', label: 'Confirmées' },
    { id: 'in_delivery', label: 'En livraison' },
    { id: 'delivered', label: 'Livrées' },
  ];

  return (
    <div className="cx-page">
      <PageHeader kicker="SUIVI" title="Mes commandes" description="Consultez l’état de chacune de vos commandes." />

      <div className="cx-cat-row">
        {tabs.map((t) => (
          <button key={t.id} className={`cx-cat ${filter === t.id ? 'active' : ''}`} onClick={() => setFilter(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered === null ? (
        <div className="cx-loading"><Loader2 className="cx-spin" size={20} /> Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="cx-empty">
          <Package size={26} />
          <h2>Aucune commande</h2>
          <button className="cx-btn cx-btn-primary" onClick={() => setLocation('/customer/catalog')}>Passer une commande</button>
        </div>
      ) : (
        <div className="cx-order-list">
          {filtered.map((o) => (
            <div className="cx-order-row" key={o.ref} onClick={() => setLocation(`/customer/order/${o.ref}`)}>
              <div className="cx-order-main">
                <b>{o.ref}</b>
                <small>{o.items_count} article(s) · {new Date(o.date).toLocaleDateString('fr-FR')}</small>
              </div>
              <StatusBadge status={o.status} label={o.status_label} />
              <span className="cx-order-total">{formatMoney(o.total)}</span>
              <button className="cx-btn cx-btn-ghost sm" onClick={(e) => { e.stopPropagation(); reorder(o.ref); }} title="Recommander">
                <Repeat size={14} />
              </button>
              <ChevronRight size={16} className="cx-order-chevron" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
