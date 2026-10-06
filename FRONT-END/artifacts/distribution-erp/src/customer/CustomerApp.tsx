import { useEffect, useState, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  ShoppingCart, Home as HomeIcon, LayoutGrid, Package, Receipt, User as UserIcon,
  LogOut, Menu, X, Search, Bell, ChevronRight, Store, Sun, Moon, LogIn,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { CartProvider, useCart } from './cart';
import { api, clearSession, getStoredUser, getToken, type CustomerUser } from './api';
import CustomerLogin from './pages/Login';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Invoices from './pages/Invoices';
import Profile from './pages/Profile';
import './customer.css';

const NAV = [
  { href: '/customer/home', label: 'Accueil', icon: HomeIcon },
  { href: '/customer/catalog', label: 'Catalogue', icon: LayoutGrid },
  { href: '/customer/orders', label: 'Mes commandes', icon: Package },
  { href: '/customer/invoices', label: 'Factures & solde', icon: Receipt },
  { href: '/customer/profile', label: 'Profil', icon: UserIcon },
];

export default function CustomerApp() {
  return (
    <CartProvider>
      <CustomerRoot />
    </CartProvider>
  );
}

function CustomerRoot() {
  const [location] = useLocation();
  const [user, setUser] = useState<CustomerUser | null>(getStoredUser());
  const [checking, setChecking] = useState<boolean>(!!getToken());

  // Validate the stored token on first mount.
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
      <div className="cx-splash">
        <div className="cx-spinner" />
        <p>Chargement de votre espace…</p>
      </div>
    );
  }

  if (!user) {
    return <CustomerLogin onAuthenticated={(u) => setUser(u)} />;
  }

  if (isLoginRoute) {
    // Already signed in → go home.
    return <Home user={user} />;
  }

  return <CustomerShell user={user} onLogout={() => setUser(null)} onUpdated={(u) => setUser(u)} />;
}

function CustomerShell({ user, onLogout, onUpdated }: { user: CustomerUser; onLogout: () => void; onUpdated: (u: CustomerUser) => void }) {
  const [location, setLocation] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const { count } = useCart();
  const { theme, toggleTheme, isLight } = useTheme();

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

  return (
    <div className="cx-app">
      <header className="cx-topbar">
        <button className="cx-icon-btn cx-mobile-only" onClick={() => setMobileNav(true)} aria-label="Menu">
          <Menu size={20} />
        </button>
        <Link href="/customer/home" className="cx-brand">
          <span className="cx-brand-mark"><Store size={16} /></span>
          <span className="cx-brand-copy">
            <b>GESTION ERP</b>
            <small>Espace client · {user.company || user.name}</small>
          </span>
        </Link>

        <nav className="cx-topnav">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || location.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} className={`cx-toplink ${active ? 'active' : ''}`}>
                <Icon size={15} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="cx-top-actions">
          <button
            className="cx-icon-btn"
            onClick={toggleTheme}
            title={isLight ? 'Activer le mode sombre' : 'Activer le mode clair'}
            aria-label="Basculer le thème"
          >
            {isLight ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <Link href="/customer/cart" className="cx-cart-btn" aria-label="Panier">
            <ShoppingCart size={19} />
            {count > 0 && <span className="cx-cart-badge">{count}</span>}
          </Link>
          <div className="cx-user-chip">
            <span className="cx-avatar">{initials(user.name)}</span>
            <span className="cx-user-meta">
              <b>{user.name}</b>
              <small>Tarif {user.price_tier}</small>
            </span>
          </div>
          <Link href="/login" className="cx-icon-btn" title="Changer de rôle / Portail ERP" aria-label="Portail ERP">
            <LogIn size={17} />
          </Link>
          <button className="cx-icon-btn" onClick={handleLogout} title="Se déconnecter" aria-label="Se déconnecter">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {mobileNav && (
        <div className="cx-drawer-backdrop" onClick={() => setMobileNav(false)}>
          <aside className="cx-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cx-drawer-head">
              <span className="cx-avatar">{initials(user.name)}</span>
              <div>
                <b>{user.name}</b>
                <small>{user.company}</small>
              </div>
              <button className="cx-icon-btn" onClick={() => setMobileNav(false)} aria-label="Fermer"><X size={18} /></button>
            </div>
            <nav className="cx-drawer-nav">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileNav(false)} className="cx-drawer-link">
                    <Icon size={17} /> {item.label}
                  </Link>
                );
              })}
              <Link href="/customer/cart" onClick={() => setMobileNav(false)} className="cx-drawer-link">
                <ShoppingCart size={17} /> Panier {count > 0 && <span className="cx-pill">{count}</span>}
              </Link>
            </nav>
            <button className="cx-drawer-logout" onClick={handleLogout}><LogOut size={16} /> Se déconnecter</button>
          </aside>
        </div>
      )}

      <main className="cx-main">
        <Switch>
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
          <Route path="/customer/invoices" component={() => <Invoices />} />
          <Route path="/customer/profile">
            {() => <Profile user={user} onUpdated={onUpdated} />}
          </Route>
          <Route component={() => <NotFound onHome={() => setLocation('/customer/home')} />} />
        </Switch>
      </main>

      <footer className="cx-footer">
        <span>© 2026 Hercules Distribution · Espace client</span>
        <span className="cx-footer-links">
          <a onClick={() => setLocation('/customer/invoices')}>Factures</a>
          <ChevronRight size={12} />
          <a onClick={() => setLocation('/customer/profile')}>Profil</a>
        </span>
      </footer>
    </div>
  );
}

function NotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className="cx-empty">
      <Search size={28} />
      <h2>Page introuvable</h2>
      <p>Cette page n’existe pas dans votre espace client.</p>
      <button className="cx-btn cx-btn-primary" onClick={onHome}>Retour à l’accueil</button>
    </div>
  );
}

function initials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function PageHeader({ kicker, title, description, children }: {
  kicker?: string; title: string; description?: string; children?: ReactNode;
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
