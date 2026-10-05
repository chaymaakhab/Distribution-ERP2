import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowRight, Package, Receipt, ShoppingBag, TrendingUp, Loader2, Repeat, Wallet,
} from 'lucide-react';
import { api, type CustomerUser, type OrderSummary, type Product, type Balance } from '../api';
import { formatMoney, useCart } from '../cart';
import { PageHeader } from '../CustomerApp';
import ProductCard from '../components/ProductCard';

export default function Home({ user }: { user: CustomerUser }) {
  const [, setLocation] = useLocation();
  const { add, addMany } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [added, setAdded] = useState<number | null>(null);

  useEffect(() => {
    api.products().then((r) => setProducts(r.data.slice(0, 8))).catch(() => setProducts([]));
    api.orders().then((r) => setOrders(r.data.slice(0, 4))).catch(() => setOrders([]));
    api.balance().then((r) => setBalance(r.data)).catch(() => setBalance(null));
  }, []);

  function quickAdd(p: Product) {
    add(p, p.min_order_qty || 1);
    setAdded(p.id);
    setTimeout(() => setAdded((a) => (a === p.id ? null : a)), 1200);
  }

  return (
    <div className="cx-page">
      <div className="cx-hero">
        <div>
          <span className="cx-eyebrow">Bonjour, {user.name.split(' ')[0]}</span>
          <h1>Bienvenue sur votre espace {user.company || user.name}</h1>
          <p>Consultez vos tarifs {user.price_tier}, passez commande et suivez vos livraisons.</p>
          <div className="cx-hero-actions">
            <button className="cx-btn cx-btn-primary" onClick={() => setLocation('/customer/catalog')}>
              <ShoppingBag size={16} /> Parcourir le catalogue
            </button>
            <button className="cx-btn cx-btn-ghost" onClick={() => setLocation('/customer/orders')}>
              <Package size={16} /> Mes commandes
            </button>
          </div>
        </div>
        {balance && (
          <div className="cx-hero-card">
            <span className="cx-hero-card-label"><Wallet size={15} /> Solde à régler</span>
            <strong>{formatMoney(balance.remaining)}</strong>
            <div className="cx-hero-card-foot">
              <span>Crédit dispo · {formatMoney(balance.credit_available)}</span>
              <a onClick={() => setLocation('/customer/invoices')}>Voir <ArrowRight size={13} /></a>
            </div>
          </div>
        )}
      </div>

      <div className="cx-stat-row">
        <Stat icon={Package} label="Commandes" value={balance ? String(balance.orders_count) : '—'} tone="blue" />
        <Stat icon={Receipt} label="Factures impayées" value={balance ? String(balance.unpaid_invoices) : '—'} tone="amber" />
        <Stat icon={TrendingUp} label="Total facturé" value={balance ? formatMoney(balance.total_invoiced) : '—'} tone="green" />
        <Stat icon={Wallet} label="Crédit autorisé" value={formatMoney(user.credit_limit)} tone="slate" />
      </div>

      <section className="cx-section">
        <div className="cx-section-head">
          <div>
            <span className="cx-eyebrow">SÉLECTION</span>
            <h2>Produits recommandés</h2>
          </div>
          <Link href="/customer/catalog" className="cx-more">Tout le catalogue <ArrowRight size={14} /></Link>
        </div>
        {products === null ? (
          <div className="cx-loading"><Loader2 className="cx-spin" size={20} /> Chargement des produits…</div>
        ) : products.length === 0 ? (
          <div className="cx-empty small"><p>Aucun produit disponible pour le moment.</p></div>
        ) : (
          <div className="cx-product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={quickAdd} added={added === p.id} />
            ))}
          </div>
        )}
      </section>

      <section className="cx-section">
        <div className="cx-section-head">
          <div>
            <span className="cx-eyebrow">HISTORIQUE</span>
            <h2>Dernières commandes</h2>
          </div>
          <Link href="/customer/orders" className="cx-more">Toutes <ArrowRight size={14} /></Link>
        </div>
        {orders === null ? (
          <div className="cx-loading"><Loader2 className="cx-spin" size={20} /> Chargement…</div>
        ) : orders.length === 0 ? (
          <div className="cx-empty small">
            <Package size={22} />
            <p>Vous n’avez pas encore passé de commande.</p>
            <button className="cx-btn cx-btn-primary" onClick={() => setLocation('/customer/catalog')}>Découvrir le catalogue</button>
          </div>
        ) : (
          <div className="cx-order-list">
            {orders.map((o) => (
              <div className="cx-order-row" key={o.ref} onClick={() => setLocation(`/customer/order/${o.ref}`)}>
                <div className="cx-order-main">
                  <b>{o.ref}</b>
                  <small>{o.items_count} article(s) · {new Date(o.date).toLocaleDateString('fr-FR')}</small>
                </div>
                <StatusBadge status={o.status} label={o.status_label} />
                <span className="cx-order-total">{formatMoney(o.total)}</span>
                <button
                  className="cx-btn cx-btn-ghost sm"
                  onClick={(e) => { e.stopPropagation(); reorder(o.ref, addMany, setLocation); }}
                  title="Recommander"
                >
                  <Repeat size={14} /> Recommencer
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

async function reorder(
  ref: string,
  addMany: (lines: import('../cart').CartLine[]) => void,
  setLocation: (p: string) => void,
) {
  try {
    const res = await api.reorder(ref);
    const lines = res.data
      .filter((i) => i.in_stock)
      .map((i) => ({
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
    } else {
      setLocation('/customer/catalog');
    }
  } catch {
    setLocation('/customer/catalog');
  }
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Package; label: string; value: string; tone: string }) {
  return (
    <div className={`cx-stat cx-stat-${tone}`}>
      <span className="cx-stat-icon"><Icon size={17} /></span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
      </div>
    </div>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone =
    /delivered/.test(status) ? 'green'
    : /pending/.test(status) ? 'amber'
    : /cancelled|returned/.test(status) ? 'red'
    : /in_delivery|assigned|prepared|confirmed/.test(status) ? 'blue'
    : 'slate';
  return <span className={`cx-badge cx-badge-${tone}`}>{label}</span>;
}
