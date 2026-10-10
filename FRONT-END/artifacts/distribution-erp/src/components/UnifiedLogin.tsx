import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Building2, Store, Lock, Mail, Eye, EyeOff, Loader2,
  AlertCircle, CheckCircle2, ChevronRight, Sun, Moon,
  Crown, Boxes, Briefcase, PackageCheck, Truck,
  BadgeDollarSign, ShoppingCart, ArrowRight, ShieldCheck, LogIn,
  UserPlus, UserCheck,
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
    name: 'Super Administrateur',
    shortName: 'Super Admin',
    category: 'staff',
    badge: 'Gestion des Abonnements',
    user_name: 'Super Administrateur',
    email: 'superadmin@hercules-erp.ma',
    password: 'password',
    home: '/superadmin',
    icon: Crown,
    color: '#f59e0b',
    scope: 'Espace central Super Administrateur : Attribution des formules, suivi des échéances (<30j, expirés), gestion des entreprises clientes et quotas.',
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
    badge: 'Van Sales / Proximité',
    user_name: 'Hamid El Meskini',
    email: 'prevendeur@hercules-erp.ma',
    password: 'password',
    home: '/delivery/dashboard',
    icon: Truck,
    color: ROLE_BLUE,
    scope: 'Tournées commerces de proximité & épiceries, prise de commandes directes, vente embarquée et encaissements.',
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
    shortName: 'Client Pro',
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

  const [portalMode, setPortalMode] = useState<'saas' | 'staff' | 'customer'>(
    defaultTab === 'customer' ? 'customer' : 'saas'
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    defaultTab === 'customer' ? 'client' : 'superadmin'
  );
  const [identifier, setIdentifier] = useState(
    defaultTab === 'customer' ? 'contact@atlas-equipements.ma' : 'superadmin@hercules-erp.ma'
  );
  const [password, setPassword] = useState(
    defaultTab === 'customer' ? 'client1234' : 'password'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+212 6');
  const [regCity, setRegCity] = useState('Casablanca');
  const [regAddress, setRegAddress] = useState('');
  const [regIce, setRegIce] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCommercialId, setRegCommercialId] = useState<string>('');
  const [regCommercialCode, setRegCommercialCode] = useState('');
  const [commercialsList, setCommercialsList] = useState<any[]>([]);

  useEffect(() => {
    customerApi.getCommercials().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setCommercialsList(res);
      }
    }).catch(() => {});
  }, []);

  const [storedUsers] = useState<StaffUserRecord[]>(() => {
    try {
      return getStoredStaffUsers();
    } catch {
      return [];
    }
  });

  const activeRole = ALL_ROLES.find((r) => r.id === selectedRoleId) || ALL_ROLES[0];
  const staffRoles = ALL_ROLES.filter((r) => r.category === 'staff' && r.id !== 'superadmin');

  function handleSelectRole(role: RoleDef, autoLogin = false) {
    setSelectedRoleId(role.id);
    if (role.id === 'superadmin') {
      setPortalMode('saas');
    } else {
      setPortalMode(role.category);
    }
    setIdentifier(role.email);
    setPassword(role.password);

    if (autoLogin) {
      executeLogin(role.email, role.password, role.id === 'superadmin' ? 'saas' : role.category);
    }
  }

  function handleSwitchPortal(mode: 'saas' | 'staff' | 'customer') {
    setPortalMode(mode);
    setError(null);
    if (mode === 'saas') {
      const saRole = ALL_ROLES.find((r) => r.id === 'superadmin')!;
      setSelectedRoleId('superadmin');
      setIdentifier(saRole.email);
      setPassword(saRole.password);
    } else if (mode === 'customer') {
      const clientRole = ALL_ROLES.find((r) => r.id === 'client')!;
      setSelectedRoleId(clientRole.id);
      setIdentifier(clientRole.email);
      setPassword(clientRole.password);
    } else {
      const defaultStaff = ALL_ROLES.find((r) => r.id === 'admin') || ALL_ROLES[1];
      setSelectedRoleId(defaultStaff.id);
      setIdentifier(defaultStaff.email);
      setPassword(defaultStaff.password);
    }
  }

  async function executeLogin(
    loginId: string,
    loginPass: string,
    mode: 'saas' | 'staff' | 'customer'
  ) {
    setError(null);
    setLoading(true);
    const cleanId = loginId.trim();

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
            user = await onStaffLogin(cleanId, loginPass, remember);
          } else {
            const res = await staffApi.login(cleanId, loginPass);
            setStaffSession(res.token, res.user, remember);
            user = res.user;
          }
        } catch {
          const stored = findStaffUserByEmail(cleanId);
          if (stored) {
            user = staffItemToSessionUser(stored);
          } else {
            const targetRole =
              ALL_ROLES.find((r) => r.email === cleanId || r.id === selectedRoleId) ||
              ALL_ROLES[0];
            user = createMockStaffUser(targetRole.role_code, cleanId);
          }
          setStaffSession('mock-token-' + (user.primary_role || 'staff'), user, remember);
        }
        if (onSuccess) onSuccess();
        if (mode === 'saas' || user.primary_role === 'superadmin' || cleanId === 'superadmin@hercules-erp.ma' || selectedRoleId === 'superadmin') {
          setLocation('/superadmin');
        } else {
          setLocation(user.home || '/admin/dashboard');
        }
        return;
      }
    } catch (err: any) {
      setError(err?.message || 'Identifiants invalides.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setError('Veuillez renseigner les champs obligatoires (Nom, Email, Téléphone).');
      return;
    }
    if (regPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        name: regName.trim(),
        company: regCompany.trim() || regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        city: regCity,
        address: regAddress.trim() || undefined,
        ice: regIce.trim() || undefined,
      };

      if (regCommercialId === 'code' && regCommercialCode.trim()) {
        payload.commercial_code = regCommercialCode.trim();
      } else if (regCommercialId && regCommercialId !== '' && regCommercialId !== 'code') {
        payload.commercial_id = Number(regCommercialId);
      }

      const res = await customerApi.register(payload);
      setCustomerSession(res.token, res.user);
      if (onSuccess) onSuccess();
      setLocation(res.home || '/customer/home');
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création du compte.');
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
            <small>DISTRIBUTION COMMERCIALE · MAROC</small>
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
          <div className="portal-tabs" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <button
              type="button"
              className={`portal-tab ${portalMode === 'saas' ? 'active saas-tab' : ''}`}
              onClick={() => handleSwitchPortal('saas')}
            >
              <Crown size={14} />
              <span>Super Administrateur</span>
            </button>
            <button
              type="button"
              className={`portal-tab ${portalMode === 'staff' ? 'active' : ''}`}
              onClick={() => handleSwitchPortal('staff')}
            >
              <Building2 size={14} />
              <span>Équipe ERP</span>
            </button>
            <button
              type="button"
              className={`portal-tab ${portalMode === 'customer' ? 'active' : ''}`}
              onClick={() => handleSwitchPortal('customer')}
            >
              <Store size={14} />
              <span>Client Pro</span>
            </button>
          </div>

          {/* Super Admin Dedicated Information */}
          {portalMode === 'saas' && (
            <div className="role-active-banner saas-active-banner">
              <div className="role-active-top">
                <span className="role-name" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Crown size={15} /> Super Administrateur · Plateforme
                </span>
                <span className="role-scope-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                  Espace Dédié Autonome
                </span>
              </div>
              <p className="role-scope-desc">
                Surveillance des abonnements à échéance (&lt;30j, expirés), gestion des entreprises clientes, activation de comptes et attribution des formules (Starter, Pro, Enterprise).
              </p>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <a
                  href="/superadmin"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#f59e0b',
                    textDecoration: 'none',
                    padding: '4px 8px',
                    borderRadius: 5,
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  Ouvrir directement le portail /superadmin ↗
                </a>
              </div>
            </div>
          )}

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

          {/* Customer mode info & sub-tabs */}
          {portalMode === 'customer' && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => { setCustomerMode('login'); setError(null); }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: customerMode === 'login' ? '1px solid #0284c7' : '1px solid rgba(255,255,255,0.1)',
                    background: customerMode === 'login' ? '#0284c7' : 'transparent',
                    color: customerMode === 'login' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <LogIn size={14} />
                  <span>Se connecter</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomerMode('register'); setError(null); }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: customerMode === 'register' ? '1px solid #0284c7' : '1px solid rgba(255,255,255,0.1)',
                    background: customerMode === 'register' ? '#0284c7' : 'transparent',
                    color: customerMode === 'register' ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <UserPlus size={14} />
                  <span>Créer un compte Client Pro</span>
                </button>
              </div>

              {customerMode === 'login' ? (
                <div className="customer-info-banner">
                  <div className="role-active-top">
                    <span className="role-name">Atlas Équipements SARL</span>
                    <span className="role-scope-badge">Client Revendeur</span>
                  </div>
                  <p className="role-scope-desc">
                    Accès au catalogue avec vos prix négociés, passation de commandes, suivi de factures et encours.
                  </p>
                </div>
              ) : (
                <div className="customer-info-banner" style={{ background: 'rgba(2, 132, 199, 0.08)', borderColor: '#0284c7' }}>
                  <div className="role-active-top">
                    <span className="role-name" style={{ color: '#0284c7' }}>Nouvelle Adhésion Client</span>
                    <span className="role-scope-badge">Ouverture de compte</span>
                  </div>
                  <p className="role-scope-desc">
                    Créez votre compte en quelques secondes, choisissez votre commercial référent et accédez aux tarifs distributeur.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Form: Customer Register Mode */}
          {portalMode === 'customer' && customerMode === 'register' ? (
            <form className="login-form" onSubmit={handleRegisterSubmit}>
              {error && (
                <div className="login-alert-error" role="alert">
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field-block">
                  <label className="field-label-text">Nom / Interlocuteur *</label>
                  <div className="field-input-wrap">
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ex. Karim Alami"
                      required
                    />
                  </div>
                </div>

                <div className="field-block">
                  <label className="field-label-text">Société / Raison Sociale *</label>
                  <div className="field-input-wrap">
                    <input
                      type="text"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      placeholder="Ex. Alami Quincaillerie SARL"
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field-block">
                  <label className="field-label-text">Email professionnel *</label>
                  <div className="field-input-wrap">
                    <Mail size={15} className="input-icon" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="contact@entreprise.ma"
                      required
                    />
                  </div>
                </div>

                <div className="field-block">
                  <label className="field-label-text">Téléphone direct *</label>
                  <div className="field-input-wrap">
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+212 6 XX XX XX XX"
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field-block">
                  <label className="field-label-text">Ville principale *</label>
                  <div className="field-input-wrap">
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: 13,
                        outline: 'none',
                        padding: '8px 0',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Casablanca" style={{ background: '#0f172a', color: '#fff' }}>Casablanca</option>
                      <option value="Rabat" style={{ background: '#0f172a', color: '#fff' }}>Rabat</option>
                      <option value="Tanger" style={{ background: '#0f172a', color: '#fff' }}>Tanger</option>
                      <option value="Marrakech" style={{ background: '#0f172a', color: '#fff' }}>Marrakech</option>
                      <option value="Fès" style={{ background: '#0f172a', color: '#fff' }}>Fès</option>
                      <option value="Agadir" style={{ background: '#0f172a', color: '#fff' }}>Agadir</option>
                      <option value="Meknès" style={{ background: '#0f172a', color: '#fff' }}>Meknès</option>
                      <option value="Kénitra" style={{ background: '#0f172a', color: '#fff' }}>Kénitra</option>
                    </select>
                  </div>
                </div>

                <div className="field-block">
                  <label className="field-label-text">ICE Société (15 chiffres)</label>
                  <div className="field-input-wrap">
                    <input
                      type="text"
                      maxLength={15}
                      value={regIce}
                      onChange={(e) => setRegIce(e.target.value)}
                      placeholder="002194850000038"
                    />
                  </div>
                </div>
              </div>

              {/* Commercial Referral Selection */}
              <div className="field-block">
                <label className="field-label-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Choisir votre commercial référent :</span>
                  <small style={{ color: '#0284c7', fontWeight: 600 }}>Attribution commerciale directe</small>
                </label>
                <div className="field-input-wrap">
                  <UserCheck size={15} className="input-icon" />
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
                    value={regCommercialId}
                    onChange={(e) => setRegCommercialId(e.target.value)}
                  >
                    <option value="" style={{ background: '#0f172a', color: '#fff' }}>
                      -- Sélectionner un commercial ou attribution automatique --
                    </option>
                    {commercialsList.map((c) => (
                      <option key={c.id} value={c.id} style={{ background: '#0f172a', color: '#fff' }}>
                        {c.name} · Réf: {c.commercial_code || `COM-${c.id}`} ({c.commission_rate ?? 5}% commission)
                      </option>
                    ))}
                    <option value="code" style={{ background: '#0f172a', color: '#fff' }}>
                      -- Saisir un code de référence commercial --
                    </option>
                  </select>
                </div>
              </div>

              {regCommercialId === 'code' && (
                <div className="field-block">
                  <label className="field-label-text">Code de référence commercial (ex: COM-001)</label>
                  <div className="field-input-wrap">
                    <input
                      type="text"
                      value={regCommercialCode}
                      onChange={(e) => setRegCommercialCode(e.target.value.toUpperCase())}
                      placeholder="COM-001"
                      required
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field-block">
                  <label className="field-label-text">Mot de passe *</label>
                  <div className="field-input-wrap">
                    <Lock size={15} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="field-block">
                  <label className="field-label-text">Confirmation *</label>
                  <div className="field-input-wrap">
                    <Lock size={15} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="action-buttons-group" style={{ marginTop: 14 }}>
                <button className="submit-btn" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={15} className="spin-animate" />
                      <span>Création de votre compte…</span>
                    </>
                  ) : (
                    <>
                      <span>Finaliser mon inscription</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Form: Login Mode */
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

                {portalMode === 'saas' && (
                  <button
                    type="button"
                    className="quick-test-btn"
                    onClick={() => executeLogin('superadmin@hercules-erp.ma', 'password', 'saas')}
                    disabled={loading}
                    style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' }}
                  >
                    <Crown size={13} />
                    <span>Connexion 1-Clic Super Administrateur 👑</span>
                  </button>
                )}

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
          )}

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
