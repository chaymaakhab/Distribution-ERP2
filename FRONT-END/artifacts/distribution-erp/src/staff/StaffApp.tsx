import { useEffect, useRef, useState } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  Menu, X, ChevronDown, ChevronRight, Bell, LogOut, Search, Sun, Moon, Lock,
  ArrowRight, ShieldCheck, Warehouse as WarehouseIcon, LayoutDashboard, LogIn,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { StaffAuthProvider, useStaffAuth } from './auth';
import { MODULES, NAV_GROUPS, findModule, type NavModule } from './nav';
import type { StaffUser } from './api';
import StaffLogin from './StaffLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdministratorDashboard from './pages/AdministratorDashboard';
import Warehouses from './pages/Warehouses';
import SalesDashboard from './pages/SalesDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import PreparationDashboard from './pages/PreparationDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import AccountingDashboard from './pages/AccountingDashboard';
import ClientsCrm from './pages/ClientsCrm';
import UsersManagement from './pages/UsersManagement';
import RolesPermissions from './pages/RolesPermissions';
import AuditLogs from './pages/AuditLogs';
import SystemSettings from './pages/SystemSettings';
import OrdersManagement from './pages/OrdersManagement';
import ProductsManagement from './pages/ProductsManagement';
import PurchasingManagement from './pages/PurchasingManagement';
import SuppliersManagement from './pages/SuppliersManagement';
import ReturnsManagement from './pages/ReturnsManagement';
import ReportsPage from './pages/ReportsPage';
import SystemMaintenance from './pages/SystemMaintenance';
import GlobalSearchModal from './components/GlobalSearchModal';
import NotificationsDrawer from './components/NotificationsDrawer';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import './components/global-search.css';
import './components/notifications.css';
import './staff.css';

export default function StaffApp() {
  return (
    <StaffAuthProvider>
      <StaffRoot />
    </StaffAuthProvider>
  );
}

function StaffRoot() {
  const { user, loading, home } = useStaffAuth();
  const [location, setLocation] = useLocation();

  // Signed in but sitting on /login → bounce to the role workspace.
  useEffect(() => {
    if (user && location === '/login') setLocation(home);
  }, [user, location, home, setLocation]);

  if (loading) {
    return (
      <div className="sx-splash">
        <div className="sx-spinner" />
        <p>Chargement de votre espace de travail…</p>
      </div>
    );
  }

  if (!user) return <StaffLogin />;
  if (location === '/login') return <StaffSplash />;

  return <StaffShell user={user} />;
}

function StaffSplash() {
  return (
    <div className="sx-splash">
      <div className="sx-spinner" />
      <p>Redirection…</p>
    </div>
  );
}

function StaffShell({ user }: { user: StaffUser }) {
  const { logout, switchRole, hasPermission, workspace, home } = useStaffAuth();
  const [location, setLocation] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [roleMenu, setRoleMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(4);
  const { theme, toggleTheme, isLight } = useTheme();
  const roleRef = useRef<HTMLDivElement>(null);

  const primary = user.roles.find((r) => r.is_primary) ?? user.roles[0];
  const visibleModules = MODULES.filter((m) => hasPermission(m.permission));

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleMenu(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function handleSwitch(code: string) {
    setRoleMenu(false);
    if (code === primary?.code) return;
    const updated = await switchRole(code);
    setLocation(updated.home);
  }

  async function handleLogout() {
    setLogoutModalOpen(false);
    await logout();
    setLocation('/login');
  }

  function go(segment: string) {
    setMobileNav(false);
    setLocation(`/${workspace}/${segment}`);
  }

  const activeSegment = location.split('/')[2] || 'dashboard';

  return (
    <div className="erp-app sx-app">
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <button className="icon-button sx-nav-close" onClick={() => setMobileNav(false)} aria-label="Fermer le menu">
          <X size={18} />
        </button>
        <Link href={home} className="brand" onClick={() => setMobileNav(false)}>
          <span className="brand-mark"><span>G</span></span>
          <span className="brand-copy"><b>GESTION ERP</b><small>ERP · DISTRIBUTION</small></span>
        </Link>

        <div className="workspace-chip">
          <span className="workspace-dot" />
          <span>{user.warehouse ? `${user.warehouse.name} · ${user.warehouse.city ?? ''}`.trim() : 'Tous dépôts'}</span>
          {user.warehouse && <WarehouseIcon size={13} />}
        </div>

        <nav className="side-nav sx-side-nav">
          {NAV_GROUPS.map((group) => {
            const items = visibleModules.filter((m) => m.group === group);
            if (items.length === 0) return null;
            return (
              <div className="sx-nav-group" key={group}>
                <p className="nav-caption">{group.toUpperCase()}</p>
                {items.map((m) => (
                  <NavButton
                    key={m.segment}
                    module={m}
                    active={activeSegment === m.segment}
                    onClick={() => go(m.segment)}
                  />
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-lower">
          <div className="status-panel">
            <span className="status-beacon" />
            <div>
              <b>{primary?.name ?? 'Utilisateur'}</b>
              <small>{user.permissions.includes('*') ? 'Accès complet' : `${user.permissions.length} permissions`}</small>
            </div>
          </div>
          <div
            className="user-panel"
            role="button"
            tabIndex={0}
            onClick={() => setLogoutModalOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && setLogoutModalOpen(true)}
            title="Se déconnecter"
          >
            <div className="user-avatar">{initials(user.name)}</div>
            <span className="user-copy"><b>{user.name}</b><small>{user.email ?? user.phone}</small></span>
            <LogOut size={15} />
          </div>
        </div>
      </aside>

      {mobileNav && <div className="sx-backdrop" onClick={() => setMobileNav(false)} />}

      <div className="app-main">
        <header className="topbar">
          <button className="mobile-trigger icon-button" onClick={() => setMobileNav(true)} aria-label="Ouvrir le menu">
            <Menu size={19} />
          </button>

          <div className="crumb">
            <span>Gestion ERP</span>
            <ChevronRight size={14} />
            <strong>{findModule(activeSegment)?.label ?? 'Tableau de bord'}</strong>
          </div>

          <div className="topbar-right">
            <button
              className="icon-button"
              onClick={() => setSearchOpen(true)}
              aria-label="Recherche globale (Ctrl + K)"
              title="Recherche globale (Ctrl + K)"
            >
              <Search size={16} />
            </button>
            <button
              className="icon-button sx-bell"
              onClick={() => setNotifOpen(true)}
              aria-label="Notifications & alertes"
              title="Notifications & alertes"
            >
              <Bell size={16} />
              {unreadNotifCount > 0 && <span className="sx-bell-badge">{unreadNotifCount}</span>}
            </button>

            {user.roles.length > 1 && (
              <div className="sx-role" ref={roleRef}>
                <button className="sx-role-btn" onClick={() => setRoleMenu((v) => !v)} data-testid="button-role-switcher">
                  <ShieldCheck size={14} />
                  <span>{primary?.name}</span>
                  <ChevronDown size={13} />
                </button>
                {roleMenu && (
                  <div className="sx-role-menu">
                    <p className="sx-role-caption">Changer d’espace</p>
                    {user.roles.map((r) => (
                      <button
                        key={r.code}
                        className={`sx-role-item ${r.code === primary?.code ? 'active' : ''}`}
                        onClick={() => handleSwitch(r.code)}
                      >
                        <span>{r.name}</span>
                        {r.code === primary?.code && <ShieldCheck size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Link href="/login" className="icon-button" title="Changer de rôle / Portail Connexion" aria-label="Portail Connexion">
              <LogIn size={16} />
            </Link>
            <button className="icon-button" onClick={toggleTheme} title="Basculer le thème" data-testid="button-theme-toggle">
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              className="icon-button"
              onClick={() => setLogoutModalOpen(true)}
              title="Se déconnecter"
              aria-label="Se déconnecter"
              style={{ color: '#ef4444' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="page-wrap">
          <Switch>
            <Route path="/:ws/dashboard" component={() => <RoleDashboard user={user} onNavigate={go} />} />
            <Route path="/:ws/:module">
              {(params: { ws: string; module: string }) => <GuardedModule segment={params.module} onNavigate={go} />}
            </Route>
            <Route component={() => <NotFound onHome={() => setLocation(home)} />} />
          </Switch>
        </main>
      </div>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={go}
      />

      <NotificationsDrawer
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onNavigate={go}
        onUnreadCountChange={setUnreadNotifCount}
      />

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        user={user}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

function NavButton({ module, active, onClick }: { module: NavModule; active: boolean; onClick: () => void }) {
  const Icon = module.icon;
  return (
    <button
      className={`nav-link sx-nav-link ${active ? 'nav-selected' : ''}`}
      onClick={onClick}
      data-testid={`link-nav-${module.segment}`}
    >
      <Icon size={17} strokeWidth={1.8} />
      <span>{module.label}</span>
    </button>
  );
}

function GuardedModule({ segment, onNavigate }: { segment: string; onNavigate?: (s: string) => void }) {
  const { hasPermission } = useStaffAuth();
  const module = findModule(segment);

  if (!module) return <NotFoundInline />;
  // Front-end guard: the URL alone never grants access.
  if (!hasPermission(module.permission)) return <Denied permission={module.permission} />;
  if (segment === 'warehouses') return <Warehouses />;
  if (segment === 'customers') return <ClientsCrm />;
  if (segment === 'inventory') return <WarehouseDashboard />;
  if (segment === 'preparation') return <PreparationDashboard />;
  if (segment === 'deliveries') return <DeliveryDashboard onNavigate={onNavigate} />;
  if (segment === 'finance' || segment === 'payments') return <AccountingDashboard />;
  if (segment === 'users') return <UsersManagement />;
  if (segment === 'roles') return <RolesPermissions />;
  if (segment === 'audit') return <AuditLogs />;
  if (segment === 'settings') return <SystemSettings />;
  if (segment === 'maintenance') return <SystemMaintenance />;
  if (segment === 'orders') return <OrdersManagement />;
  if (segment === 'products') return <ProductsManagement />;
  if (segment === 'purchasing') return <PurchasingManagement />;
  if (segment === 'suppliers') return <SuppliersManagement />;
  if (segment === 'returns') return <ReturnsManagement />;
  if (segment === 'reports') return <ReportsPage />;
  return <ModulePlaceholder module={module} />;
}

// Each role gets its dedicated workspace matching Cahier des Charges.
function RoleDashboard({ user, onNavigate }: { user: StaffUser; onNavigate: (segment: string) => void }) {
  const role = user.primary_role;
  if (role === 'superadmin') {
    return <SuperAdminDashboard />;
  }
  if (role === 'admin') {
    return <AdministratorDashboard />;
  }
  if (role === 'commercial') {
    return <SalesDashboard onNavigate={onNavigate} />;
  }
  if (role === 'warehouse') {
    return <WarehouseDashboard />;
  }
  if (role === 'preparation') {
    return <PreparationDashboard />;
  }
  if (role === 'delivery') {
    return <DeliveryDashboard onNavigate={onNavigate} />;
  }
  if (role === 'accounting') {
    return <AccountingDashboard />;
  }
  return <WorkspaceHome user={user} onNavigate={onNavigate} />;
}

function ModulePlaceholder({ module }: { module: NavModule }) {
  const Icon = module.icon;
  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">{module.group.toUpperCase()} <span className="heading-slash">/</span> MODULE</div>
          <h1>{module.label}</h1>
          <p>Accès autorisé · permission requise <code>{module.permission}</code>.</p>
        </div>
      </div>
      <div className="sx-empty">
        <div className="sx-empty-icon"><Icon size={22} /></div>
        <b>Module « {module.label} » en cours d’intégration</b>
        <span>
          Les données métier, tableaux et actions de ce module seront branchés sur l’API dans une
          prochaine itération. Votre permission <code>{module.permission}</code> est déjà active.
        </span>
      </div>
    </div>
  );
}

function WorkspaceHome({ user, onNavigate }: { user: StaffUser; onNavigate: (segment: string) => void }) {
  const { hasPermission } = useStaffAuth();
  const primary = user.roles.find((r) => r.is_primary) ?? user.roles[0];
  const shortcuts = MODULES.filter((m) => m.segment !== 'dashboard' && hasPermission(m.permission)).slice(0, 8);

  return (
    <div className="dashboard-page">
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">ESPACE {primary?.name.toUpperCase()} <span className="eyebrow-sep">/</span> GESTION ERP</span>
          <h1>Bonjour, {user.name.split(' ')[0]}<span className="title-period">.</span></h1>
          <p>Voici les modules accessibles selon vos permissions.</p>
        </div>
      </div>

      <div className="sx-kpi-grid">
        <div className="sx-kpi">
          <span className="sx-kpi-label">Rôle principal</span>
          <strong>{primary?.name ?? '—'}</strong>
          <small>{user.roles.length} rôle(s) attribué(s)</small>
        </div>
        <div className="sx-kpi">
          <span className="sx-kpi-label">Permissions</span>
          <strong>{user.permissions.includes('*') ? 'Toutes' : user.permissions.length}</strong>
          <small>Union de vos rôles</small>
        </div>
        <div className="sx-kpi">
          <span className="sx-kpi-label">Dépôt</span>
          <strong>{user.warehouse?.name ?? 'Multi-dépôts'}</strong>
          <small>{user.warehouse?.city ?? 'Périmètre complet'}</small>
        </div>
        <div className="sx-kpi">
          <span className="sx-kpi-label">Modules</span>
          <strong>{shortcuts.length}</strong>
          <small>Accessibles dans la barre latérale</small>
        </div>
      </div>

      <section className="panel sx-shortcuts">
        <div className="panel-heading">
          <div><span className="eyebrow">ACCÈS RAPIDES</span><h2>Votre espace de travail</h2></div>
        </div>
        <div className="sx-mod-grid">
          {shortcuts.map((m) => {
            const Icon = m.icon;
            return (
              <button key={m.segment} className="sx-mod-card" onClick={() => onNavigate(m.segment)}>
                <span className="sx-mod-icon"><Icon size={18} /></span>
                <span className="sx-mod-copy"><b>{m.label}</b><small>{m.group}</small></span>
                <ArrowRight size={15} />
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Denied({ permission }: { permission: string }) {
  const { home } = useStaffAuth();
  return (
    <div className="sx-denied">
      <div className="sx-denied-icon"><Lock size={24} /></div>
      <h2>Accès refusé</h2>
      <p>
        Votre rôle ne dispose pas de la permission <code>{permission}</code> nécessaire pour ouvrir
        cette page. Cette restriction est appliquée côté serveur comme côté interface.
      </p>
      <Link href={home} className="button-primary sx-denied-btn"><LayoutDashboard size={15} /> Retour au tableau de bord</Link>
    </div>
  );
}

function NotFoundInline() {
  return (
    <div className="sx-denied">
      <div className="sx-denied-icon"><Search size={24} /></div>
      <h2>Page introuvable</h2>
      <p>Ce module n’existe pas dans votre espace de travail.</p>
    </div>
  );
}

function NotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className="sx-denied">
      <div className="sx-denied-icon"><Search size={24} /></div>
      <h2>Page introuvable</h2>
      <p>L’adresse demandée ne correspond à aucun module autorisé.</p>
      <button className="button-primary sx-denied-btn" onClick={onHome}>Retour au tableau de bord</button>
    </div>
  );
}

function initials(name: string): string {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}
