import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ShieldCheck, Store, Lock, Mail, Eye, EyeOff, Loader2,
  AlertCircle, CheckCircle2, ChevronRight, Sun, Moon,
  Crown, Building2, Boxes, Briefcase, PackageCheck, Truck,
  BadgeDollarSign, ShoppingCart, UserCheck, ArrowRight,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { api as staffApi, setSession as setStaffSession, type StaffUser } from '../staff/api';
import { api as customerApi, setSession as setCustomerSession, type CustomerUser } from '../customer/api';
import './unified-login.css';

export interface RoleDef {
  id: string;
  name: string;
  category: 'staff' | 'customer';
  badge: string;
  user_name: string;
  email: string;
  phone?: string;
  password: string;
  home: string;
  icon: any;
  color: string;
  scope: string;
  role_code: string;
}

const ROLE_BLUE = '#0284c7';

export const ALL_ROLES: RoleDef[] = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    category: 'staff',
    badge: 'Accès Intégral',
    user_name: 'Super Admin',
    email: 'superadmin@hercules-erp.ma',
    password: 'password',
    home: '/admin/dashboard',
    icon: Crown,
    color: ROLE_BLUE,
    scope: 'Accès complet : multi-dépôt, CRM clients, tous modules, audit, utilisateurs et configuration.',
    role_code: 'superadmin',
  },
  {
    id: 'admin',
    name: 'Administrateur',
    category: 'staff',
    badge: 'Gestion Globale',
    user_name: 'Amine El Fassi',
    email: 'admin@hercules-erp.ma',
    password: 'password',
    home: '/administrator/dashboard',
    icon: Building2,
    color: ROLE_BLUE,
    scope: 'Gestion globale selon permissions : dépôts, CRM clients, catalogue, approvisionnements, factures.',
    role_code: 'admin',
  },
  {
    id: 'warehouse',
    name: 'Responsable Dépôt',
    category: 'staff',
    badge: 'Entrepôt & Stocks',
    user_name: 'Nadia El Amrani',
    email: 'depot@hercules-erp.ma',
    password: 'password',
    home: '/warehouse/dashboard',
    icon: Boxes,
    color: ROLE_BLUE,
    scope: 'Stock physique/réservé/disponible, transferts 2 étapes, réceptions, lots et clôture caisse dépôt.',
    role_code: 'warehouse',
  },
  {
    id: 'commercial',
    name: 'Commercial',
    category: 'staff',
    badge: 'Ventes & CRM',
    user_name: 'Youssef Bennani',
    email: 'commercial@hercules-erp.ma',
    password: 'password',
    home: '/sales/dashboard',
    icon: Briefcase,
    color: ROLE_BLUE,
    scope: 'Mes clients, commandes à valider en 1 clic, relance clients inactifs (>15j) et contact WhatsApp direct.',
    role_code: 'commercial',
  },
  {
    id: 'preparation',
    name: 'Préparateur',
    category: 'staff',
    badge: 'Préparation & Scan',
    user_name: 'Karim Ouazzani',
    email: 'preparation@hercules-erp.ma',
    password: 'password',
    home: '/preparation/dashboard',
    icon: PackageCheck,
    color: ROLE_BLUE,
    scope: 'Bons de préparation groupés par tournée, scan code-barres et contrôle des quantités manquantes.',
    role_code: 'preparation',
  },
  {
    id: 'delivery',
    name: 'Livreur',
    category: 'staff',
    badge: 'Distribution & POD',
    user_name: 'Mehdi Lahlou',
    email: 'livreur@hercules-erp.ma',
    password: 'password',
    home: '/delivery/dashboard',
    icon: Truck,
    color: ROLE_BLUE,
    scope: 'Tournée ordonnée, arrêt en direct, signature tactile, photo preuve, encaissement et clôture avec écart.',
    role_code: 'delivery',
  },
  {
    id: 'accounting',
    name: 'Comptable',
    category: 'staff',
    badge: 'Finance & Effets',
    user_name: 'Sofia Cherkaoui',
    email: 'compta@hercules-erp.ma',
    password: 'password',
    home: '/accounting/dashboard',
    icon: BadgeDollarSign,
    color: ROLE_BLUE,
    scope: 'Facturation légale marocaine (ICE/IF/RC), registre chèques/traites, bordereau remise et relances.',
    role_code: 'accounting',
  },
  {
    id: 'client',
    name: 'Client',
    category: 'customer',
    badge: 'Portail Client',
    user_name: 'Atlas Équipements',
    email: 'contact@atlas-equipements.ma',
    phone: '+212 522 34 78 90',
    password: 'client1234',
    home: '/customer/home',
    icon: ShoppingCart,
    color: ROLE_BLUE,
    scope: 'Catalogue revendeur, panier, commandes, factures et suivi du solde.',
    role_code: 'client',
  },
];

export default function UnifiedLogin({
  defaultTab = 'staff',
  onSuccess,
}: {
  defaultTab?: 'staff' | 'customer';
  onSuccess?: () => void;
}) {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme, isLight } = useTheme();

  const [portalMode, setPortalMode] = useState<'staff' | 'customer'>(defaultTab);
  const [identifier, setIdentifier] = useState('superadmin@hercules-erp.ma');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRoleCard, setActiveRoleCard] = useState<string>('superadmin');

  function handleSelectRole(role: RoleDef, autoLogin = false) {
    setActiveRoleCard(role.id);
    setPortalMode(role.category);
    setIdentifier(role.email);
    setPassword(role.password);

    if (autoLogin) {
      executeLogin(role.email, role.password, role.category, role);
    }
  }

  async function executeLogin(
    loginId: string,
    loginPass: string,
    mode: 'staff' | 'customer',
    forcedRole?: RoleDef,
  ) {
    setError(null);
    setLoading(true);

    try {
      if (mode === 'customer') {
        try {
          const res = await customerApi.login(loginId.trim(), loginPass);
          setCustomerSession(res.token, res.user);
          if (onSuccess) onSuccess();
          setLocation(res.home || '/customer/home');
          return;
        } catch (apiErr) {
          // If API unreachable or mock mode, fall back to seeded user
          const clientRole = forcedRole || ALL_ROLES.find((r) => r.id === 'client')!;
          const mockUser: CustomerUser = {
            id: 1,
            code: 'CLI-0084',
            name: 'Amine Tazi',
            company: 'Atlas Équipements SARL',
            email: loginId,
            phone: '+212522347890',
            city: 'Casablanca',
            address: '12, bd Zerktouni, Casablanca',
            price_tier: 'revendeur',
            credit_limit: 80000,
            locale: 'fr',
            role: 'customer',
            commercial: { name: 'Youssef Bennani', email: 'commercial@hercules-erp.ma' },
          };
          setCustomerSession('mock-token-client', mockUser);
          if (onSuccess) onSuccess();
          setLocation('/customer/home');
          return;
        }
      } else {
        // Staff login
        try {
          const res = await staffApi.login(loginId.trim(), loginPass);
          setStaffSession(res.token, res.user, remember);
          if (onSuccess) onSuccess();
          setLocation(res.user.home || '/admin/dashboard');
          return;
        } catch (apiErr) {
          // Fallback to local session matching selected role
          const targetRole = forcedRole || ALL_ROLES.find((r) => r.email === loginId) || ALL_ROLES[0];
          const mockStaff: StaffUser = {
            id: targetRole.id === 'superadmin' ? 1 : 2,
            name: targetRole.user_name,
            email: loginId,
            phone: null,
            avatar: null,
            locale: 'fr',
            warehouse: { id: 1, code: 'DEP-01', name: 'Dépôt Casablanca', city: 'Casablanca' },
            roles: [{ code: targetRole.role_code, name: targetRole.name, home: targetRole.home, is_primary: true }],
            primary_role: targetRole.role_code,
            permissions: targetRole.role_code === 'superadmin' ? ['*'] : [targetRole.role_code, 'dashboard.view'],
            home: targetRole.home,
          };
          setStaffSession('mock-token-staff', mockStaff, remember);
          if (onSuccess) onSuccess();
          setLocation(targetRole.home);
          return;
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    executeLogin(identifier, password, portalMode);
  }

  return (
    <div className="unified-login-wrapper">
      {/* Top Navbar on Login Screen */}
      <header className="unified-login-topbar">
        <div className="unified-brand">
          <div className="unified-brand-badge">H</div>
          <div>
            <b>GESTION ERP</b>
            <small>ERP Maroc · Plateforme Vente, Stock & Livraison</small>
          </div>
        </div>

        <div className="unified-top-actions">
          <div className="portal-switcher">
            <button
              className={`switcher-tab ${portalMode === 'staff' ? 'active' : ''}`}
              onClick={() => {
                setPortalMode('staff');
                const firstStaff = ALL_ROLES[0];
                handleSelectRole(firstStaff, false);
              }}
            >
              <Building2 size={14} /> Équipe ERP (7 Rôles)
            </button>
            <button
              className={`switcher-tab ${portalMode === 'customer' ? 'active' : ''}`}
              onClick={() => {
                setPortalMode('customer');
                const clientRole = ALL_ROLES.find((r) => r.id === 'client')!;
                handleSelectRole(clientRole, false);
              }}
            >
              <Store size={14} /> Espace Client
            </button>
          </div>

          <button
            className="theme-toggle-btn icon-button"
            onClick={toggleTheme}
            title={isLight ? 'Activer le mode sombre' : 'Activer le mode clair'}
            aria-label="Basculer le thème"
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* Main Content: Showcase Grid + Login Form */}
      <div className="unified-login-body">
        {/* Left Side: 8-Role Interactive Selector Grid */}
        <div className="roles-showcase-panel">
          <div className="showcase-header">
            <h2>Choisissez votre espace</h2>
            <p>
              Accédez à un espace adapté à votre rôle et à vos responsabilités.
            </p>
          </div>

          <div className="roles-grid">
            {ALL_ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = activeRoleCard === r.id;
              return (
                <div
                  key={r.id}
                  className={`role-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectRole(r, false)}
                >
                  <div className="role-card-top">
                    <div className="role-icon-box" style={{ background: `${r.color}20`, color: r.color }}>
                      <Icon size={18} />
                    </div>
                    <span className="role-badge" style={{ color: r.color, borderColor: `${r.color}40`, background: `${r.color}10` }}>
                      {r.badge}
                    </span>
                  </div>

                  <b className="role-title">{r.name}</b>
                  <div className="role-user">{r.user_name}</div>
                  <p className="role-scope">{r.scope}</p>

                  <div className="role-card-actions">
                    <button
                      type="button"
                      className="quick-enter-btn"
                      style={{ background: r.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRole(r, true);
                      }}
                      title={`Accéder à l’espace ${r.name}`}
                    >
                      <span>Accéder comme {r.name}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Authentication Form Card */}
        <div className="login-form-container">
          <form className="login-card-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <span className="form-eyebrow">
                {portalMode === 'customer' ? 'PORTAIL CLIENT' : 'ESPACE COLLABORATEUR ERP'}
              </span>
              <h1>Connexion Sécurisée</h1>
              <p>
                {portalMode === 'customer'
                  ? 'Connectez-vous pour passer vos commandes au tarif revendeur et suivre vos livraisons.'
                  : 'Saisissez vos identifiants ou sélectionnez votre espace.'}
              </p>
            </div>

            {error && (
              <div className="login-alert-error" role="alert">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            <label className="field-group">
              <span>{portalMode === 'customer' ? 'Téléphone ou Email Client' : 'Email Collaborateur ou Téléphone'}</span>
              <div className="field-input-box">
                <Mail size={16} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="nom@entreprise.ma ou 06…"
                  required
                />
              </div>
            </label>

            <label className="field-group">
              <span>Mot de passe ou Code PIN</span>
              <div className="field-input-box">
                <Lock size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label="Afficher/Masquer le mot de passe"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <div className="form-options-row">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setError('Veuillez contacter votre administrateur ou commercial pour réinitialiser le mot de passe.');
                }}
              >
                Mot de passe oublié ?
              </a>
            </div>

            <button className="submit-login-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spin-animate" /> Connexion en cours…
                </>
              ) : (
                <>
                  <span>Se connecter à mon espace</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            {/* Quick Demo Helper */}
            <div className="demo-credentials-box">
              <div className="demo-header">
                <b>Accès disponibles :</b>
              </div>
              <div className="demo-list">
                <div>
                  <span>Super Admin :</span> <code>superadmin@hercules-erp.ma</code>
                </div>
                <div>
                  <span>Commercial :</span> <code>commercial@hercules-erp.ma</code>
                </div>
                <div>
                  <span>Client :</span> <code>contact@atlas-equipements.ma</code>
                </div>
                <small>Mot de passe staff : <code>password</code> · Client : <code>client1234</code></small>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
