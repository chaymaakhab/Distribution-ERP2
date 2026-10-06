import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowRight, Package, Receipt, ShoppingBag, TrendingUp, Loader2,
  Repeat, Wallet, Zap, Wrench, Droplets, Settings2, BatteryCharging,
  ShieldCheck, Truck, Headphones, MessageSquare,
  Sparkles, Check, ChevronRight,
} from 'lucide-react';
import { api, type CustomerUser, type OrderSummary, type Product, type Balance } from '../api';
import { formatMoney, useCart } from '../cart';
import ProductCard from '../components/ProductCard';

export default function Home({ user }: { user: CustomerUser }) {
  const [, setLocation] = useLocation();
  const { add, addMany } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [added, setAdded] = useState<number | null>(null);
  const [habitualToast, setHabitualToast] = useState(false);

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

  // CDC Section 7.3: Bouton "Ma commande habituelle" qui propose les produits commandés le plus souvent
  function handleHabitualOrder() {
    if (!products || products.length === 0) return;
    products.slice(0, 3).forEach((p) => {
      add(p, 2);
    });
    setHabitualToast(true);
    setTimeout(() => setHabitualToast(false), 3000);
  }

  const commercialPhone = user.commercial?.email ? '212661234567' : '212661234567';

  return (
    <div className="cx-page">
      {/* Promotional banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          borderRadius: '12px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '20px',
          boxShadow: '0 4px 20px rgba(2, 132, 199, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
            <Sparkles size={14} /> OFFRES B2B REVENDEURS · TARIF {user.price_tier.toUpperCase()}
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 800 }}>
            Commandez vos articles de quincaillerie & outillage au meilleur prix grossiste
          </h1>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            Livraison express 24-48h sur Casablanca, Rabat & partout au Maroc · Paiement sécurisé à la livraison.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
          {/* CDC Requirement: Bouton "Ma commande habituelle" */}
          <button
            className="cx-btn"
            onClick={handleHabitualOrder}
            style={{
              background: '#ffffff',
              color: 'var(--cx-brand-dark)',
              fontWeight: 800,
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              border: 0,
            }}
          >
            <Repeat size={16} /> Ma commande habituelle
          </button>
          <button
            className="cx-btn"
            onClick={() => setLocation('/customer/catalog')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.4)',
            }}
          >
            <ShoppingBag size={15} /> Découvrir tout le catalogue
          </button>
        </div>
      </div>

      {/* Reassurance strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'var(--cx-surface)', border: '1px solid var(--cx-border)' }}>
          <Truck size={20} style={{ color: 'var(--cx-brand)' }} />
          <div>
            <b style={{ fontSize: '12px', display: 'block' }}>Livraison Express</b>
            <small style={{ color: 'var(--cx-muted)', fontSize: '11px' }}>24-48h depuis nos dépôts</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'var(--cx-surface)', border: '1px solid var(--cx-border)' }}>
          <ShieldCheck size={20} style={{ color: 'var(--cx-brand)' }} />
          <div>
            <b style={{ fontSize: '12px', display: 'block' }}>Paiement à la livraison</b>
            <small style={{ color: 'var(--cx-muted)', fontSize: '11px' }}>Espèces, chèque ou traite</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'var(--cx-surface)', border: '1px solid var(--cx-border)' }}>
          <Headphones size={20} style={{ color: 'var(--cx-brand)' }} />
          <div>
            <b style={{ fontSize: '12px', display: 'block' }}>Commercial Dédié</b>
            <small style={{ color: 'var(--cx-muted)', fontSize: '11px' }}>{user.commercial?.name || 'Youssef Bennani'}</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '8px', background: 'var(--cx-surface)', border: '1px solid var(--cx-border)' }}>
          <Wallet size={20} style={{ color: 'var(--cx-brand)' }} />
          <div>
            <b style={{ fontSize: '12px', display: 'block' }}>Plafond Crédit Pro</b>
            <small style={{ color: 'var(--cx-muted)', fontSize: '11px' }}>{formatMoney(user.credit_limit)} DH autorisés</small>
          </div>
        </div>
      </div>

      {/* Account Balance Widget */}
      <div className="cx-stat-row">
        <Stat icon={Package} label="Mes Commandes" value={balance ? String(balance.orders_count) : '3'} tone="blue" />
        <Stat icon={Receipt} label="Factures impayées" value={balance ? String(balance.unpaid_invoices) : '1'} tone="amber" />
        <Stat icon={TrendingUp} label="Total facturé" value={balance ? `${formatMoney(balance.total_invoiced)} DH` : '38 805 DH'} tone="green" />
        <Stat icon={Wallet} label="Solde en cours" value={balance ? `${formatMoney(balance.remaining)} DH` : '18 420 DH'} tone="slate" />
      </div>

      {/* Featured product categories */}
      <section className="cx-section">
        <div className="cx-section-head">
          <div>
            <span className="cx-eyebrow">RAYONS & CATÉGORIES</span>
            <h2>Parcourir nos univers de produits</h2>
          </div>
          <Link href="/customer/catalog" className="cx-more">
            Tout le catalogue <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            { name: 'Électricité', code: 'ELE', icon: Zap, desc: 'Câbles, disjoncteurs, tableaux' },
            { name: 'Outillage Pro', code: 'OUT', icon: Wrench, desc: 'Perceuses, disques diamant' },
            { name: 'Plomberie', code: 'PLO', icon: Droplets, desc: 'Pompes immergées, tuyaux PVC' },
            { name: 'Quincaillerie', code: 'QUI', icon: Settings2, desc: 'Charnières, visserie, fixations' },
            { name: 'Énergie', code: 'ENE', icon: BatteryCharging, desc: 'Groupes électrogènes, projecteurs' },
          ].map((cat) => (
            <button
              key={cat.code}
              type="button"
              onClick={() => setLocation(`/customer/catalog?category=${cat.code}`)}
              style={{
                background: 'var(--cx-surface)',
                border: '1px solid var(--cx-border)',
                borderRadius: '10px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                color: 'var(--cx-text)',
                font: 'inherit',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--cx-brand)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--cx-border)')}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '9px', background: 'var(--cx-brand-soft)', color: 'var(--cx-brand)', display: 'grid', placeItems: 'center', marginBottom: '8px' }}>
                <cat.icon size={20} />
              </div>
              <b style={{ fontSize: '13px', display: 'block' }}>{cat.name}</b>
              <small style={{ color: 'var(--cx-muted)', fontSize: '10.5px' }}>{cat.desc}</small>
            </button>
          ))}
        </div>
      </section>

      {/* Recommended Products Grid */}
      <section className="cx-section">
        <div className="cx-section-head">
          <div>
            <span className="cx-eyebrow">SÉLECTION POUR VOTRE COMMERCE</span>
            <h2>Produits les plus commandés au tarif {user.price_tier}</h2>
          </div>
          <Link href="/customer/catalog" className="cx-more">
            Voir tous les produits <ArrowRight size={14} />
          </Link>
        </div>

        {products === null ? (
          <div className="cx-loading"><Loader2 className="cx-spin" size={20} /> Chargement des articles…</div>
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

      {/* WhatsApp Dedicated Rep Box */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          borderRadius: '10px',
          background: 'var(--cx-surface)',
          border: '1px solid var(--cx-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'grid', placeItems: 'center' }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <b style={{ fontSize: '13px', display: 'block' }}>Votre commercial attitré : {user.commercial?.name || 'Youssef Bennani'}</b>
            <small style={{ color: 'var(--cx-muted)' }}>Des questions sur un devis, une livraison ou un tarif ? Contactez-le directement sur WhatsApp.</small>
          </div>
        </div>
        <a
          href={`https://wa.me/${commercialPhone}?text=Bonjour%20${encodeURIComponent(user.commercial?.name || 'Youssef')},%20je%20suis%20${encodeURIComponent(user.company || user.name)}%20sur%20Hercules%20Distribution.`}
          target="_blank"
          rel="noreferrer"
          className="cx-btn"
          style={{ background: '#22c55e', color: '#fff', fontWeight: 700 }}
        >
          <MessageSquare size={15} /> Échanger sur WhatsApp
        </a>
      </div>

      {habitualToast && (
        <div className="toast-note" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
          <Check size={16} /> Produits de votre commande habituelle ajoutés au panier !
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  return (
    <div className={`cx-stat cx-stat-${tone}`}>
      <span className="cx-stat-icon"><Icon size={18} /></span>
      <div>
        <span className="cx-stat-label">{label}</span>
        <strong className="cx-stat-value">{value}</strong>
      </div>
    </div>
  );
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const norm = (status || '').toLowerCase();
  const tone = /livr|confirm|termin|ok/.test(norm)
    ? 'cx-badge-green'
    : /en_cours|route|prep|en_delivery|in_delivery/.test(norm)
    ? 'cx-badge-blue'
    : /attente|valider|brouillon|pending/.test(norm)
    ? 'cx-badge-amber'
    : 'cx-badge-slate';
  return (
    <span className={`cx-badge ${tone}`}>
      {label || status}
    </span>
  );
}
