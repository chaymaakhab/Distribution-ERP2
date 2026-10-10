import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowRight, Package, Receipt, ShoppingBag, TrendingUp, Loader2,
  Repeat, Wallet, Zap, Wrench, Droplets, Settings2, BatteryCharging,
  ShieldCheck, Truck, Headphones, MessageSquare, Sparkles, Check,
  ChevronRight, Search, Plus, Clock, ExternalLink,
} from 'lucide-react';
import { api, type CustomerUser, type OrderSummary, type Product, type Balance } from '../api';
import { formatMoney, useCart } from '../cart';
import { useI18n } from '../i18n';
import ProductCard from '../components/ProductCard';

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const map: Record<string, string> = {
    pending_validation: 'cx-badge-amber',
    confirmed: 'cx-badge-blue',
    prepared: 'cx-badge-blue',
    assigned: 'cx-badge-blue',
    in_delivery: 'cx-badge-amber',
    delivered: 'cx-badge-green',
    cancelled: 'cx-badge-red',
    returned: 'cx-badge-slate',
  };
  return <span className={`cx-badge ${map[status] ?? 'cx-badge-slate'}`}>{label}</span>;
}

export default function Home({ user }: { user: CustomerUser }) {
  const [, setLocation] = useLocation();
  const { add, subtotalHt: totalHt, count } = useCart();
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [added, setAdded] = useState<number | null>(null);
  const [habitualToast, setHabitualToast] = useState(false);

  // Express Quick Order States
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [quickQty, setQuickQty] = useState<number>(1);
  const [quickSuccess, setQuickSuccess] = useState(false);

  useEffect(() => {
    api.products().then((r) => setProducts(r.data)).catch(() => setProducts([]));
    api.orders().then((r) => setOrders(r.data.slice(0, 4))).catch(() => setOrders([]));
    api.balance().then((r) => setBalance(r.data)).catch(() => setBalance(null));
  }, []);

  function handleProductAdd(p: Product, qty: number = 1) {
    add(p, qty);
    setAdded(p.id);
    setTimeout(() => setAdded((a) => (a === p.id ? null : a)), 1200);
  }

  // 1-Click Habitual Order (Commande habituelle)
  function handleHabitualOrder() {
    if (!products || products.length === 0) return;
    products.slice(0, 4).forEach((p) => {
      add(p, p.min_order_qty || 2);
    });
    setHabitualToast(true);
    setTimeout(() => setHabitualToast(false), 3500);
  }

  // Express SKU quick addition
  function handleQuickSkuAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSku || !products) return;
    const target = products.find((p) => p.code === selectedSku || p.sku === selectedSku);
    if (target) {
      add(target, quickQty);
      setQuickSuccess(true);
      setTimeout(() => setQuickSuccess(false), 2000);
      setSelectedSku('');
      setQuickQty(1);
    }
  }

  // Franco progress calculation (threshold 2500 DH HT)
  const FRANCO_THRESHOLD = 2500;
  const francoProgress = Math.min(100, Math.round((totalHt / FRANCO_THRESHOLD) * 100));
  const remainingFranco = Math.max(0, FRANCO_THRESHOLD - totalHt);

  const categories = [
    { code: 'ELEC', name: 'Électricité Industrielle', icon: Zap, count: '38 articles' },
    { code: 'OUTIL', name: 'Outillage & Électroportatif', icon: Wrench, count: '64 articles' },
    { code: 'PLOMB', name: 'Plomberie & Pompage', icon: Droplets, count: '42 articles' },
    { code: 'BAT', name: 'Quincaillerie & Fixations', icon: Settings2, count: '85 articles' },
  ];

  return (
    <div className="cx-page">
      {/* Toast Notification when habitual order is clicked */}
      {habitualToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99,
            background: '#059669',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          <Check size={20} /> Vos articles habituels ont été ajoutés au panier !
          <button
            onClick={() => setLocation('/customer/cart')}
            style={{
              background: '#ffffff',
              color: '#059669',
              border: 0,
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 800,
              cursor: 'pointer',
              marginLeft: '8px',
            }}
          >
            Voir le panier
          </button>
        </div>
      )}

      {/* 1. Executive B2B Hero Banner */}
      <section className="cx-hero-b2b">
        <div className="cx-hero-glow-orb" />
        <div className="cx-hero-content">
          <div className="cx-hero-badge">
            <Sparkles size={14} /> PARTENAIRE GROSSISTE AGRÉÉ · TARIF {user.price_tier.toUpperCase()}
          </div>
          <h1 className="cx-hero-title">
            Bonjour, {user.company || user.name}
          </h1>
          <p className="cx-hero-desc">
            Bénéficiez de vos grilles tarifaires négociées en direct d'usine, d'une expédition prioritaire sous 24-48h et de la facturation certifiée conforme ICE.
          </p>

          {/* Franco de port Tracker */}
          <div className="cx-franco-meter">
            <div className="cx-franco-labels">
              <span>
                {remainingFranco > 0 ? (
                  <>Plus que <b>{formatMoney(remainingFranco)}</b> pour la <b>Livraison Offerte</b></>
                ) : (
                  <span style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Check size={14} /> <b>Félicitations ! Franco de port atteint. Livraison Gratuite.</b>
                  </span>
                )}
              </span>
              <span>{francoProgress}%</span>
            </div>
            <div className="cx-franco-bar">
              <div className="cx-franco-fill" style={{ width: `${francoProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="cx-hero-actions">
          <button className="cx-hero-btn-habitual" onClick={handleHabitualOrder}>
            <Repeat size={18} /> {t('home.habitual_order')}
          </button>
          <button
            className="cx-btn"
            onClick={() => setLocation('/customer/catalog')}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Package size={17} /> {t('home.browse_catalog')}
          </button>
        </div>
      </section>

      {/* 2. Executive KPI Cards Row */}
      {balance && (
        <section className="cx-kpi-grid">
          <div className="cx-kpi-card" onClick={() => setLocation('/customer/invoices')} style={{ cursor: 'pointer' }}>
            <div className="cx-kpi-icon blue">
              <Wallet size={24} />
            </div>
            <div className="cx-kpi-info">
              <small>Crédit disponible</small>
              <b>{formatMoney(balance.credit_available)}</b>
              <span>Plafond : {formatMoney(balance.credit_limit)}</span>
            </div>
          </div>

          <div className="cx-kpi-card" onClick={() => setLocation('/customer/invoices')} style={{ cursor: 'pointer' }}>
            <div className="cx-kpi-icon amber">
              <Receipt size={24} />
            </div>
            <div className="cx-kpi-info">
              <small>Reste à régler</small>
              <b>{formatMoney(balance.remaining)}</b>
              <span>Factures échues ou à terme</span>
            </div>
          </div>

          <div className="cx-kpi-card" onClick={() => setLocation('/customer/orders')} style={{ cursor: 'pointer' }}>
            <div className="cx-kpi-icon green">
              <Truck size={24} />
            </div>
            <div className="cx-kpi-info">
              <small>Dernière commande</small>
              <b>{orders?.[0]?.ref || 'Aucune'}</b>
              <span>{orders?.[0] ? `${orders[0].items_count} articles · ${orders[0].status_label}` : 'En attente'}</span>
            </div>
          </div>

          <div className="cx-kpi-card" onClick={() => setLocation('/customer/profile')} style={{ cursor: 'pointer' }}>
            <div className="cx-kpi-icon purple">
              <Headphones size={24} />
            </div>
            <div className="cx-kpi-info">
              <small>Commercial dédié</small>
              <b>{user.commercial?.name || 'Agence Casablanca'}</b>
              <span style={{ color: '#2563eb', fontWeight: 600 }}>Contacter sur WhatsApp</span>
            </div>
          </div>
        </section>
      )}

      {/* 3. Express SKU / Reference Quick Order Box */}
      <section className="cx-quick-order-widget">
        <div className="cx-quick-order-title">
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--cx-brand-soft)', color: 'var(--cx-brand)', display: 'grid', placeItems: 'center' }}>
            <Zap size={22} />
          </div>
          <div>
            <h3>Saisie Express par Référence / SKU</h3>
            <p>Ajoutez rapidement des références sans naviguer dans tout le catalogue.</p>
          </div>
        </div>

        <form className="cx-quick-order-form" onSubmit={handleQuickSkuAdd}>
          <select
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
            aria-label="Sélectionner un article"
          >
            <option value="">-- Choisir une référence --</option>
            {products?.map((p) => (
              <option key={p.code} value={p.code}>
                [{p.sku || p.code}] {p.name} — {formatMoney(p.price_ht)} HT
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={quickQty}
            onChange={(e) => setQuickQty(Math.max(1, parseInt(e.target.value) || 1))}
            title="Quantité"
          />

          <button
            type="submit"
            className="cx-btn cx-btn-primary"
            disabled={!selectedSku}
          >
            {quickSuccess ? <><Check size={16} /> Ajouté</> : <><Plus size={16} /> Ajouter au panier</>}
          </button>
        </form>
      </section>

      {/* 4. Moroccan B2B Pillars of Trust */}
      <section className="cx-pillars-grid">
        <div className="cx-pillar-item">
          <div className="cx-pillar-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <b>Stock Direct Dépôt</b>
            <small>Disponibilité temps réel certifiée</small>
          </div>
        </div>
        <div className="cx-pillar-item">
          <div className="cx-pillar-icon">
            <Receipt size={20} />
          </div>
          <div>
            <b>Factures Conformes DGI</b>
            <small>ICE, IF et TVA récupérable à 20%</small>
          </div>
        </div>
        <div className="cx-pillar-item">
          <div className="cx-pillar-icon">
            <Truck size={20} />
          </div>
          <div>
            <b>Flotte de Livraison Pro</b>
            <small>Chauffeurs dédiés & tournées régulières</small>
          </div>
        </div>
        <div className="cx-pillar-item">
          <div className="cx-pillar-icon">
            <Headphones size={20} />
          </div>
          <div>
            <b>SAV & Échanges 48h</b>
            <small>Prise en charge directe par l'entrepôt</small>
          </div>
        </div>
      </section>

      {/* 5. Quick Category Navigation */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <span className="cx-eyebrow">RAYONS PRINCIPAUX</span>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '2px 0 0' }}>Explorer nos familles de produits</h2>
          </div>
          <Link href="/customer/catalog" className="cx-btn cx-btn-ghost sm">
            Tout le catalogue <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.code}
                onClick={() => setLocation(`/customer/catalog?category=${cat.code}`)}
                style={{
                  background: 'var(--cx-surface)',
                  border: '1px solid var(--cx-border)',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: 'var(--cx-shadow-sm)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--cx-brand)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--cx-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cx-brand-soft)', color: 'var(--cx-brand)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon size={22} />
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: 14 }}>{cat.name}</b>
                  <small style={{ color: 'var(--cx-muted)' }}>{cat.count}</small>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Bestsellers & Featured Products Grid */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <span className="cx-eyebrow">RÉASSORT RAPIDE</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '2px 0 0' }}>Articles les plus commandés</h2>
          </div>
          <Link href="/customer/catalog" className="cx-btn cx-btn-ghost sm">
            Voir les {products?.length || 12} articles <ArrowRight size={14} />
          </Link>
        </div>

        {products === null ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="cx-spin" size={24} style={{ color: 'var(--cx-brand)' }} />
          </div>
        ) : (
          <div className="cx-product-grid">
            {products.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleProductAdd}
                added={added === product.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* 7. Recent Orders & Tracking Section */}
      {orders && orders.length > 0 && (
        <section style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <span className="cx-eyebrow">HISTORIQUE</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: '2px 0 0' }}>Vos dernières commandes</h2>
            </div>
            <Link href="/customer/orders" className="cx-btn cx-btn-ghost sm">
              Toutes mes commandes <ArrowRight size={14} />
            </Link>
          </div>

          <div className="cx-b2b-table-wrap">
            <table className="cx-table">
              <thead>
                <tr>
                  <th>Réf Commande</th>
                  <th>Date</th>
                  <th>Articles</th>
                  <th>Montant TTC</th>
                  <th>Statut Livraison</th>
                  <th className="right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.ref} style={{ cursor: 'pointer' }} onClick={() => setLocation(`/customer/order/${o.ref}`)}>
                    <td><b>{o.ref}</b></td>
                    <td>{new Date(o.date).toLocaleDateString('fr-FR')}</td>
                    <td>{o.items_count} référence(s)</td>
                    <td><b style={{ color: 'var(--cx-text)' }}>{formatMoney(o.total)}</b></td>
                    <td><StatusBadge status={o.status} label={o.status_label} /></td>
                    <td className="right">
                      <button
                        className="cx-btn cx-btn-ghost sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/customer/order/${o.ref}`);
                        }}
                      >
                        Suivi détaillé <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
