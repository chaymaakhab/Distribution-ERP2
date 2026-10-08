import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Building2, Store, Lock, Mail, Eye, EyeOff, Loader2,
  AlertCircle, CheckCircle2, ChevronRight, Sun, Moon,
  Crown, Boxes, Briefcase, PackageCheck, Truck,
  BadgeDollarSign, ShoppingCart, ArrowRight, ShieldCheck, LogIn,
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { api as staffApi, setSession as setStaffSession, type StaffUser } from '../staff/api';
import {
  createMockStaffUser, findStaffUserByEmail, staffItemToSessionUser,
  getStoredStaffUsers, type StaffUserRecord,
} from '../staff/mockAuth';
import { api as customerApi, setSession as setCustomerSession, type CustomerUser } from '../customer/api';
import './unified-login.css';

export interface RoleDef {
  id: string;
  name: string;
  shortName: string;
  category: 'staff' | 'customer';
  badge: string;
  user_name: string;
  email: string;
  phone?: string;
  password: string;
  home: string;
  icon: typeof Crown;
  color: string;
  scope: string;
  role_code: string;
}

const ROLE_BLUE = '#0284c7';

export const ALL_ROLES: RoleDef[] = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    shortName: 'Super Admin',
    category: 'staff',
    badge: 'Accès Intégral',
    user_name: 'Super Admin',
    email: 'superadmin@hercules-erp.ma',
    password: 'password',
    home: '/admin/dashboard',
    icon: Crown,
    color: ROLE_BLUE,
    scope: 'Supervision multi-dépôts, audit global, gestion des rôles et configuration.',
    role_code: 'superadmin',
  },
  {
    id: 'admin',
    name: 'Administrateur',
    shortName: 'Admin',
    category: 'staff',
    badge: 'Gestion Globale',
    user_name: 'Amine El Fassi',
    email: 'admin@hercules-erp.ma',
    password: 'password',
    home: '/administrator/dashboard',
    icon: Building2,
    color: ROLE_BLUE,
    scope: 'Gestion opérationnelle : catalogue, clients, stocks, achats et factures.',
    role_code: 'admin',
  },
  {
    id: 'commercial',
    name: 'Commercial',
    shortName: 'Commercial',
    category: 'staff',
    badge: 'Ventes & CRM',
    user_name: 'Youssef Bennani',
    email: 'commercial@hercules-erp.ma',
    password: 'password',
    home: '/sales/dashboard',
    icon: Briefcase,
    color: ROLE_BLUE,
    scope: 'Portefeuille clients, validation des commandes et relance clients.',
    role_code: 'commercial',
  },
  {
    id: 'warehouse',
    name: 'Responsable Dépôt',
    shortName: 'Dépôt',
    category: 'staff',
    badge: 'Stocks & Entrepôt',
    user_name: 'Nadia El Amrani',
    email: 'depot@hercules-erp.ma',
    password: 'password',
    home: '/warehouse/dashboard',
    icon: Boxes,
    color: ROLE_BLUE,
    scope: 'Stock physique/réservé/disponible, transferts 2 étapes et réceptions.',
    role_code: 'warehouse',
  },
  {
    id: 'preparation',
    name: 'Préparateur',
    shortName: 'Préparation',
    category: 'staff',
    badge: 'Scan & Préparation',
    user_name: 'Karim Ouazzani',
    email: 'preparation@hercules-erp.ma',
    password: 'password',
    home: '/preparation/dashboard',
    icon: PackageCheck,
    color: ROLE_BLUE,
    scope: 'Bons de préparation groupés par tournée et scan code-barres.',
    role_code: 'preparation',
  },
  {
    id: 'delivery',
    name: 'Livreur',
    shortName: 'Livreur',
    category: 'staff',
    badge: 'Tournée & POD',
    user_name: 'Mehdi Lahlou',
    email: 'livreur@hercules-erp.ma',
    password: 'password',
    home: '/delivery/dashboard',
    icon: Truck,
    color: ROLE_BLUE,
    scope: 'Tournée ordonnée, signature client (POD) et encaissement.',
    role_code: 'delivery',
  },
  {
    id: 'pre_seller',
    name: 'Livreur-pré-vendeur',
    shortName: 'Pré-vendeur',
    category: 'staff',
    badge: 'Van Sales / Hwanet',
    user_name: 'Hamid El Meskini',
    email: 'prevendeur@hercules-erp.ma',
    password: 'password',
    home: '/delivery/dashboard',
    icon: Truck,
    color: ROLE_BLUE,
    scope: 'Tournées hwanet & épiceries, prise de commandes directes, vente embarquée et encaissements.',
    role_code: 'pre_seller',
  },
  {
    id: 'accounting',
    name: 'Comptable',
    shortName: 'Comptable',
    category: 'staff',
    badge: 'Finance & Effets',
    user_name: 'Sofia Cherkaoui',
    email: 'compta@hercules-erp.ma',
    password: 'password',
    home: '/accounting/dashboard',
    icon: BadgeDollarSign,
    color: ROLE_BLUE,
    scope: 'Facturation marocaine (ICE/IF), chèques/traites et bordereaux banque.',
    role_code: 'accounting',
  },
  {
    id: 'client',
    name: 'Portail Client',
    shortName: 'Client B2B',
    category: 'customer',
    badge: 'Portail Revendeur',
    user_name: 'Atlas Équipements',
    email: 'contact@atlas-equipements.ma',
    phone: '+212 522 34 78 90',
    password: 'client1234',
    home: '/customer/home',
    icon: ShoppingCart,
    color: ROLE_BLUE,
    scope: 'Catalogue aux tarifs négociés, panier, commandes et suivi solde.',
    role_code: 'client',
  },
];

export default function UnifiedLogin({
  defaultTab = 'staff',
  onSuccess,
  onStaffLogin,
}: {
  defaultTab?: 'staff' | 'customer';
  onSuccess?: () => void;
  onStaffLogin?: (identifier: string, password: string, remember: boolean) => Promise<StaffUser>;
}) {
  const [, setLocation] = useLocation();
  const { toggleTheme, isLight } = useTheme();

  const [portalMode, setPortalMode] = useState<'staff' | 'customer'>(defaultTab);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('superadmin');
  const [identifier, setIdentifier] = useState('superadmin@hercules-erp.ma');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storedUsers] = useState<StaffUserRecord[]>(() => {
    try {
      return getStoredStaffUsers();
    } catch {
      return [];
    }
  });

  const activeRole = ALL_ROLES.find((r) => r.id === selectedRoleId) || ALL_ROLES[0];
  const staffRoles = ALL_ROLES.filter((r) => r.category === 'staff');

  function handleSelectRole(role: RoleDef, autoLogin = false) {
    setSelectedRoleId(role.id);
    setPortalMode(role.category);
    setIdentifier(role.email);
    setPassword(role.password);

    if (autoLogin) {
      executeLogin(role.email, role.password, role.category);
    }
  }

  function handleSwitchPortal(mode: 'staff' | 'customer') {
    setPortalMode(mode);
    setError(null);
    if (mode === 'customer') {
      const clientRole = ALL_ROLES.find((r) => r.id === 'client')!;
      setSelectedRoleId(clientRole.id);
      setIdentifier(clientRole.email);
      setPassword(clientRole.password);
    } else {
      const defaultStaff = ALL_ROLES[0];
      setSelectedRoleId(defaultStaff.id);
      setIdentifier(defaultStaff.email);
      setPassword(defaultStaff.password);
    }
  }

  async function executeLogin(
    loginId: string,
    loginPass: string,
    mode: 'staff' | 'customer'
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
        } catch {
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
        let user: StaffUser;
        try {
          if (onStaffLogin) {
            user = await onStaffLogin(loginId.trim(), loginPass, remember);
          } else {
            const res = await staffApi.login(loginId.trim(), loginPass);
            setStaffSession(res.token, res.user, remember);
            user = res.user;
          }
        } catch {
          const clean = loginId.trim();
          const stored = findStaffUserByEmail(clean);
          if (stored) {
            user = staffItemToSessionUser(stored);
          } else {
            const targetRole =
              ALL_ROLES.find((r) => r.email === clean || r.id === selectedRoleId) ||
              ALL_ROLES[0];
            user = createMockStaffUser(targetRole.role_code, clean);
          }
          setStaffSession('mock-token-' + (user.primary_role || 'staff'), user, remember);
        }
        if (onSuccess) onSuccess();
        setLocation(user.home || '/admin/dashboard');
        return;
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
      {/* Top bar */}
      <header className="unified-login-topbar">
        <div className="unified-brand">
          <div className="unified-brand-badge">G</div>
          <div className="unified-brand-text">
            <b>GESTION ERP</b>
            <small>DISTRIBUTION B2B · MAROC</small>
          </div>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isLight ? 'Activer le mode sombre' : 'Activer le mode clair'}
          aria-label="Basculer le thème"
        >
          {isLight ? <Moon size={15} /> : <Sun size={15} />}
        </button>
      </header>

      {/* Centered Login Card */}
      <div className="unified-login-container">
        <div className="login-card">
          {/* Segmented Switcher */}
          <div className="portal-tabs">
            <button
              type="button"
              className={`portal-tab ${portalMode === 'staff' ? 'active' : ''}`}
              onClick={() => handleSwitchPortal('staff')}
            >
              <Building2 size={14} />
              <span>Équipe ERP (7 Rôles)</span>
            </button>
            <button
              type="button"
              className={`portal-tab ${portalMode === 'customer' ? 'active' : ''}`}
              onClick={() => handleSwitchPortal('customer')}
            >
              <Store size={14} />
              <span>Espace Client B2B</span>
            </button>
          </div>

          {/* Role quick switcher (Staff mode) */}
          {portalMode === 'staff' && (
            <div className="role-selector-section">
              <div className="role-chips-label">
                <span>Sélection rapide du profil métier :</span>
              </div>
              <div className="role-chips-grid">
                {staffRoles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedRoleId === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      className={`role-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectRole(r, false)}
                      title={`${r.name} · ${r.badge}`}
                    >
                      <Icon size={13} />
                      <span>{r.shortName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active role badge & scope info */}
              <div className="role-active-banner">
                <div className="role-active-top">
                  <span className="role-name">{activeRole.name}</span>
                  <span className="role-scope-badge">{activeRole.badge}</span>
                </div>
                <p className="role-scope-desc">{activeRole.scope}</p>
              </div>
            </div>
          )}

          {/* Customer mode info */}
          {portalMode === 'customer' && (
            <div className="customer-info-banner">
              <div className="role-active-top">
                <span className="role-name">Atlas Équipements SARL</span>
                <span className="role-scope-badge">Client Revendeur</span>
              </div>
              <p className="role-scope-desc">
                Accès au catalogue avec vos prix négociés, passation de commandes, suivi de factures et encours.
              </p>
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-alert-error" role="alert">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {portalMode === 'staff' && storedUsers.length > 0 && (
              <div className="field-block" style={{ marginBottom: 12 }}>
                <label className="field-label-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Collaborateurs enregistrés ({storedUsers.length}) :</span>
                  <small style={{ color: '#0284c7', fontWeight: 600 }}>Comptes & droits en mémoire</small>
                </label>
                <div className="field-input-wrap">
                  <ShieldCheck size={15} className="input-icon" />
                  <select
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text)',
                      fontSize: 12.5,
                      outline: 'none',
                      padding: '8px 0',
                      cursor: 'pointer',
                    }}
                    value={identifier}
                    onChange={(e) => {
                      const selEmail = e.target.value;
                      if (!selEmail) return;
                      setIdentifier(selEmail);
                      setPassword('password');
                      const userRec = storedUsers.find((u) => u.email === selEmail);
                      if (userRec) {
                        const matchRole = ALL_ROLES.find((r) => r.role_code === userRec.primary_role);
                        if (matchRole) setSelectedRoleId(matchRole.id);
                      }
                    }}
                  >
                    <option value="" style={{ background: '#0f172a', color: '#fff' }}>
                      -- Ou choisir un compte enregistré (test rapide) --
                    </option>
                    {storedUsers.map((u) => (
                      <option key={u.id} value={u.email} style={{ background: '#0f172a', color: '#fff' }}>
                        {u.name} · {u.role_label} ({u.custom_permissions?.includes('*') ? 'Accès total' : `${u.custom_permissions?.length || 0} permissions`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="field-block">
              <label className="field-label-text">
                {portalMode === 'customer' ? 'Email ou Téléphone Client' : 'Identifiant professionnel'}
              </label>
              <div className="field-input-wrap">
                <Mail size={15} className="input-icon" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="nom@hercules-erp.ma"
                  required
                />
              </div>
            </div>

            <div className="field-block">
              <label className="field-label-text">Mot de passe</label>
              <div className="field-input-wrap">
                <Lock size={15} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-meta-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Mémoriser la session</span>
              </label>
              <a
                href="#forgot"
                className="forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  setError('Veuillez contacter votre administrateur pour réinitialiser votre accès.');
                }}
              >
                Mot de passe oublié ?
              </a>
            </div>

            <div className="action-buttons-group">
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={15} className="spin-animate" />
                    <span>Connexion…</span>
                  </>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {portalMode === 'staff' && (
                <button
                  type="button"
                  className="quick-test-btn"
                  onClick={() => executeLogin(activeRole.email, activeRole.password, 'staff')}
                  disabled={loading}
                >
                  <LogIn size={13} />
                  <span>Entrer directement comme {activeRole.shortName}</span>
                </button>
              )}
            </div>
          </form>

          {/* Compact footer hints */}
          <div className="login-card-footer">
            <div className="credentials-hint">
              <span>Mot de passe démo : <code>password</code> (Staff) · <code>client1234</code> (Client)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
