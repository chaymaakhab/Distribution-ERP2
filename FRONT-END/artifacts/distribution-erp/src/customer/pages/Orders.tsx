import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Package, Loader2, ChevronRight, Repeat, Search, Calendar,
  FileText, Truck, ArrowRight,
} from 'lucide-react';
import { api, type OrderSummary } from '../api';
import { formatMoney, useCart } from '../cart';
import { PageHeader } from '../CustomerApp';
import { StatusBadge } from './Home';

export default function Orders() {
  const [, setLocation] = useLocation();
  const { addMany } = useCart();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.orders().then((r) => setOrders(r.data)).catch(() => setOrders([]));
  }, []);

  const filtered = orders?.filter((o) => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search || o.ref.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }) ?? null;

  async function reorder(ref: string) {
    try {
      const res = await api.reorder(ref);
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

  const tabs = [
    { id: 'all', label: 'Toutes les commandes' },
    { id: 'pending_validation', label: 'À valider' },
    { id: 'confirmed', label: 'Confirmées' },
    { id: 'in_delivery', label: 'En livraison 🚚' },
    { id: 'delivered', label: 'Livrées' },
  ];

  return (
    <div className="cx-page">
      <PageHeader
        kicker="SUIVI DES EXPÉDITIONS"
        title="Historique de vos Commandes"
        description="Consultez l’avancement de vos commandes en temps réel, téléchargez vos bordereaux et recommandez en un clic."
      />

      {/* Filter and Search Bar */}
      <div className="cx-toolbar">
        <div className="cx-cat-row" style={{ flex: 1, margin: 0, padding: 0 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`cx-cat ${filter === t.id ? 'active' : ''}`}
              onClick={() => setFilter(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 220 }}>
          <input
            type="text"
            placeholder="Rechercher par N°..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: 38,
              borderRadius: 9,
              border: '1px solid var(--cx-border)',
              background: 'var(--cx-bg)',
              padding: '0 10px',
              fontSize: 13,
              outline: 'none',
              color: 'var(--cx-text)',
            }}
          />
        </div>
      </div>

      {filtered === null ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cx-muted)' }}>
          <Loader2 className="cx-spin" size={26} style={{ color: 'var(--cx-brand)', margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600 }}>Chargement de vos commandes…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="cx-empty">
          <Package size={40} style={{ color: 'var(--cx-brand)', margin: '0 auto 10px' }} />
          <h2>Aucune commande trouvée</h2>
          <p>Vous n'avez pas de commande correspondant à ces critères.</p>
          <button className="cx-btn cx-btn-primary" onClick={() => setLocation('/customer/catalog')}>
            Commander des articles
          </button>
        </div>
      ) : (
        <div className="cx-b2b-table-wrap">
          <table className="cx-table">
            <thead>
              <tr>
                <th>Réf Commande</th>
                <th>Date</th>
                <th>Contenu</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.ref}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setLocation(`/customer/order/${o.ref}`)}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--cx-brand-soft)', color: 'var(--cx-brand)', display: 'grid', placeItems: 'center' }}>
                        <FileText size={17} />
                      </div>
                      <div>
                        <b style={{ display: 'block', fontSize: 14 }}>{o.ref}</b>
                        <small style={{ color: 'var(--cx-muted)' }}>Hercules Pro</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: 'var(--cx-text)' }}>
                      {new Date(o.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{o.items_count} référence(s)</span>
                  </td>
                  <td>
                    <b style={{ fontSize: 15, color: 'var(--cx-text)' }}>{formatMoney(o.total)}</b>
                  </td>
                  <td>
                    <StatusBadge status={o.status} label={o.status_label} />
                  </td>
                  <td className="right">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <button
                        className="cx-btn cx-btn-ghost sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorder(o.ref);
                        }}
                        title="Recommander les mêmes articles"
                      >
                        <Repeat size={14} /> Recommander
                      </button>
                      <button
                        className="cx-icon-btn"
                        style={{ width: 32, height: 32 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/customer/order/${o.ref}`);
                        }}
                        title="Voir le suivi"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
