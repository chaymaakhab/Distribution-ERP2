import { useEffect, useState, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  ShoppingCart, Home as HomeIcon, LayoutGrid, Package, Receipt, User as UserIcon,
  LogOut, Menu, X, Search, Bell, ChevronRight, Store, Sun, Moon, LogIn,
  Phone, MessageSquare, ShieldCheck, Truck, Sparkles, Building2, FileText, CreditCard, ArrowRight,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { CartProvider, useCart } from './cart';
import { I18nProvider, useI18n } from './i18n';
import { api, clearSession, getStoredUser, getToken, type CustomerUser, type Balance } from './api';
import CustomerLogin from './pages/Login';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Invoices from './pages/Invoices';
import Profile from './pages/Profile';
import CustomerQuotes from './pages/CustomerQuotes';
import './customer.css';

export default function CustomerApp() {
  return (
    <I18nProvider>
      <CartProvider>
        <CustomerRoot />
      </CartProvider>
    </I18nProvider>
  );
}

function CustomerRoot() {
  const [location] = useLocation();
  const [user, setUser] = useState<CustomerUser | null>(getStoredUser());
  const [checking, setChecking] = useState<boolean>(!!getToken());

  // Validate stored token on first mount.
  useEffect(() => {
    if (!getToken()) {
      setChecking(false);
      return;
    }
    api.me()
      .then((res) => setUser(res.user))
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const isLoginRoute = location === '/customer/login';

  if (checking) {
    return (
      <div className="cx-splash" style={{ display: 'grid', placeItems: 'center', height: '100vh', background: 'var(--cx-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="cx-spinner cx-spin" style={{ width: 40, height: 40, border: '4px solid var(--cx-border)', borderTopColor: 'var(--cx-brand)', borderRadius: '50%', margin: '0 auto 16px' }} />
          <p style={{ fontWeight: 600, color: 'var(--cx-muted)' }}>Chargement de votre espace client…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <CustomerLogin onAuthenticated={(u) => setUser(u)} />;
  }

  if (isLoginRoute) {
    return <Home user={user} />;
  }

  return <CustomerShell user={user} onLogout={() => setUser(null)} onUpdated={(u) => setUser(u)} />;
}

function CustomerShell({
  user,
  onLogout,
  onUpdated,
}: {
  user: CustomerUser;
  onLogout: () => void;
  onUpdated: (u: CustomerUser) => void;
}) {
  const [location, setLocation] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [balance, setBalance] = useState<Balance | null>(null);
  const { count, totalTtc } = useCart();
  const { toggleTheme, isLight } = useTheme();
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    api.balance().then((r) => setBalance(r.data)).catch(() => setBalance(null));
  }, []);

  const navItems = [
    { href: '/customer/home', label: t('nav.home'), icon: HomeIcon },
    { href: '/customer/catalog', label: t('nav.catalog'), icon: LayoutGrid },
    { href: '/customer/cart', label: 'Panier / Commande', icon: ShoppingCart, countBadge: count },
    { href: '/customer/orders', label: t('nav.orders'), icon: Package },
    { href: '/customer/quotes', label: 'Devis & Proformas', icon: FileText },
    { href: '/customer/invoices', label: t('nav.invoices'), icon: Receipt },
    { href: '/customer/profile', label: t('nav.profile'), icon: UserIcon },
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/customer/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    clearSession();
    onLogout();
    setLocation('/customer/login');
  }

  const commercialPhone = user.commercial?.email ? '+212 522 35 44 00' : '+212 522 35 44 00';

  return (
    <div className="cx-app">
      {/* 1. Top Announcement Marquee (Trust & Moroccan Logistics) */}
      <div className="cx-trust-bar">
        <div className="cx-trust-marquee">
          <span className="cx-trust-pill">
            🇲🇦 <b>ATLAS DISTRIBUTION</b> · Réseau grossiste officiel
          </span>
          <span className="cx-trust-pill highlight">
            <Truck size={13} /> Livraison express 24-48h Casablanca, Rabat, Marrakech, Tanger & Fès
          </span>
          <span className="cx-trust-pill">
            <Sparkles size={13} /> <b>Franco de port dès 2 500 DH HT</b>
          </span>
        </div>
        <div className="cx-trust-contact">
          <span>Assistance pro :</span>
          <a href={`tel:${commercialPhone.replace(/\s+/g, '')}`}>
            <Phone size={12} /> {commercialPhone}
          </a>
          <span style={{ opacity: 0.4 }}>|</span>
          <a
            href="https://wa.me/212661234567"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#22c55e' }}
          >
            WhatsApp Pro
          </a>
        </div>
      </div>

      {/* 2. Glassmorphic Main Topbar */}
      <header className="cx-topbar">
        <button className="cx-icon-btn cx-mobile-only" onClick={() => setMobileNav(true)} aria-label="Menu">
          <Menu size={20} />
        </button>

        <Link href="/customer/home" className="cx-brand">
          <span className="cx-brand-mark">
            <Store size={20} />
          </span>
          <span className="cx-brand-copy">
            <b>
              HERCULES <span className="cx-pro-tag">PRO</span>
            </b>
            <small>{user.company || user.name}</small>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="cx-topnav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href !== '/customer/home' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`cx-toplink ${active ? 'active' : ''}`}>
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Global Catalog Search in Header */}
        <form className="cx-header-search" onSubmit={handleSearchSubmit}>
          <Search size={15} className="cx-search-icon" />
          <input
            type="text"
            placeholder="Rechercher réf, article, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="cx-search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </form>

        <div className="cx-top-actions">
          {/* Outstanding Balance Pill (Encours) */}
          {balance && (
            <div
              className="cx-encours-pill"
              onClick={() => setLocation('/customer/invoices')}
              title="Cliquer pour voir vos factures et votre encours"
            >
              <span className="dot" />
              <div>
                <small>Crédit dispo</small>
                <b>{new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(balance.credit_available)} DH</b>
              </div>
            </div>
          )}

          {/* Bilingual FR / AR Switcher */}
          <div className="cx-lang-switcher" title="Changer de langue / تغيير اللغة">
            <button
              type="button"
              className={`cx-lang-btn ${lang === 'fr' ? 'active' : ''}`}
              onClick={() => setLang('fr')}
            >
              FR
            </button>
            <span className="cx-lang-sep">|</span>
            <button
              type="button"
              className={`cx-lang-btn ${lang === 'ar' ? 'active' : ''}`}
              onClick={() => setLang('ar')}
            >
              العربية
            </button>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            className="cx-icon-btn"
            onClick={toggleTheme}
            title={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
            aria-label="Mode sombre/clair"
          >
            {isLight ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          {/* Shopping Cart Button */}
          <Link href="/customer/cart" className="cx-cart-btn" aria-label="Mon Panier">
            <ShoppingCart size={18} />
            <span>Panier</span>
            {count > 0 && <span className="cx-cart-badge">{count}</span>}
          </Link>

          {/* User Account Chip */}
          <div className="cx-user-chip" onClick={() => setLocation('/customer/profile')} style={{ cursor: 'pointer' }}>
            <span className="cx-avatar">{initials(user.name)}</span>
            <span className="cx-user-meta">
              <b>{user.name.split(' ')[0]}</b>
              <small>{user.price_tier.toUpperCase()}</small>
            </span>
          </div>

          <Link href="/login" className="cx-icon-btn" title="Accès Interne Staff / Administration ERP" aria-label="Staff ERP">
            <LogIn size={17} />
          </Link>

          <button className="cx-icon-btn" onClick={handleLogout} title={t('nav.logout')} aria-label="Se déconnecter">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* 3. Mobile Navigation Drawer */}
      {mobileNav && (
        <div className="cx-drawer-backdrop" onClick={() => setMobileNav(false)}>
          <aside className="cx-drawer" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--cx-surface)', width: 280, height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid var(--cx-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="cx-avatar lg">{initials(user.name)}</span>
                <div>
                  <b style={{ display: 'block', fontSize: 14 }}>{user.name}</b>
                  <small style={{ color: 'var(--cx-muted)' }}>{user.company || 'Compte Grossiste'}</small>
                </div>
              </div>
              <button className="cx-icon-btn" onClick={() => setMobileNav(false)}><X size={18} /></button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNav(false)}
                    className="cx-toplink"
                    style={{ fontSize: 14, padding: '10px 14px' }}
                  >
                    <Icon size={18} /> {item.label}
                  </Link>
                );
              })}
              <Link
                href="/customer/cart"
                onClick={() => setMobileNav(false)}
                className="cx-toplink"
                style={{ fontSize: 14, padding: '10px 14px', color: 'var(--cx-brand)', fontWeight: 700 }}
              >
                <ShoppingCart size={18} /> Mon Panier ({count})
              </Link>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--cx-border)' }}>
              <button
                className="cx-btn cx-btn-ghost cx-btn-block"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 4. Body Layout with Desktop Sidebar & Main Content */}
      <div className="cx-body-wrapper">
        <aside className="cx-desktop-sidebar">
          <div className="cx-sidebar-section">
            <span className="cx-sidebar-heading">ESPACE CLIENT PRO</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.href || (item.href !== '/customer/home' && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={`cx-sidebar-link ${active ? 'active' : ''}`}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.countBadge !== undefined && item.countBadge > 0 && (
                    <span className="badge-count">{item.countBadge}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Credit & Encours Widget */}
          <div className="cx-sidebar-widget">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--cx-muted)' }}>CRÉDIT DISPONIBLE</span>
              <span className="cx-badge cx-badge-green" style={{ fontSize: 10, padding: '1px 6px' }}>Actif</span>
            </div>
            <b style={{ fontSize: 16, color: 'var(--cx-brand)', fontWeight: 800 }}>
              {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(balance?.credit_available || user.credit_limit)} DH
            </b>
            <small style={{ color: 'var(--cx-muted)', fontSize: 11 }}>
              Plafond : {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(user.credit_limit)} DH
            </small>
            <div style={{ borderTop: '1px dashed var(--cx-border)', paddingTop: 6, marginTop: 2 }}>
              <span style={{ fontSize: 11, color: 'var(--cx-text-secondary)' }}>
                Franco dès <b>1 000 DH HT</b>
              </span>
            </div>
          </div>

          {/* Commercial & Staff Quick Links */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a
              href="https://wa.me/212661234567"
              target="_blank"
              rel="noreferrer"
              className="cx-btn cx-btn-emerald cx-btn-block sm"
              style={{ fontSize: 12 }}
            >
              <MessageSquare size={14} /> WhatsApp Commercial
            </a>
            <Link
              href="/login"
              className="cx-btn cx-btn-ghost cx-btn-block sm"
              style={{ fontSize: 11.5 }}
            >
              <Store size={14} /> Accès Staff ERP
            </Link>
          </div>
        </aside>

        <div className="cx-main-content">
          <main className="cx-main">
            <Switch>
              <Route path="/customer" component={() => <Home user={user} />} />
              <Route path="/customer/" component={() => <Home user={user} />} />
              <Route path="/customer/home" component={() => <Home user={user} />} />
              <Route path="/customer/catalog" component={() => <Catalog />} />
              <Route path="/customer/product/:code">
                {(params: { code: string }) => <ProductDetail code={params.code} />}
              </Route>
              <Route path="/customer/cart" component={() => <Cart user={user} />} />
              <Route path="/customer/orders" component={() => <Orders />} />
              <Route path="/customer/order/:ref">
                {(params: { ref: string }) => <OrderDetail ref_={params.ref} />}
              </Route>
              <Route path="/customer/quotes" component={() => <CustomerQuotes />} />
              <Route path="/customer/invoices" component={() => <Invoices />} />
              <Route path="/customer/profile">
                {() => <Profile user={user} onUpdated={onUpdated} />}
              </Route>
              <Route component={() => <NotFound onHome={() => setLocation('/customer/home')} />} />
            </Switch>
          </main>

          <footer className="cx-footer">
            <div>
              <b>© 2026 HERCULES DISTRIBUTION MAROC SARL</b> · Plateforme Grossistes &amp; Revendeurs Agréés.
            </div>
            <div className="cx-footer-links">
              <Link href="/customer/orders">Suivi Commandes</Link>
              <ChevronRight size={12} />
              <Link href="/customer/quotes">Devis</Link>
              <ChevronRight size={12} />
              <Link href="/customer/invoices">Relevé Factures</Link>
              <ChevronRight size={12} />
              <Link href="/customer/profile">Conditions &amp; ICE</Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function NotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className="cx-empty">
      <Search size={32} style={{ color: 'var(--cx-brand)' }} />
      <h2>Page introuvable</h2>
      <p>Cette page n’existe pas dans votre espace client.</p>
      <button className="cx-btn cx-btn-primary" onClick={onHome}>
        Retour au tableau de bord
      </button>
    </div>
  );
}

function initials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function PageHeader({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="cx-page-head">
      <div>
        {kicker && <span className="cx-eyebrow">{kicker}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="cx-page-actions">{children}</div>}
    </div>
  );
}

export { Bell };
