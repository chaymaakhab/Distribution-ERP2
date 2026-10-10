import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Lock, Mail, Eye, EyeOff, Loader2,
  AlertCircle, Sun, Moon,
  ShieldCheck, ArrowRight,
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
  color: string;
  scope: string;
  role_code: string;
}

export const ALL_ROLES: RoleDef[] = [
  {
    id: 'superadmin',
    name: 'Super Administrateur',
    shortName: 'Super Admin',
    category: 'staff',
    badge: 'Gestion de la Plateforme',
    user_name: 'Super Administrateur',
    email: 'superadmin@hercules-erp.ma',
    password: 'password',
    home: '/superadmin',
    color: '#0284c7',
    scope: 'Supervision centrale : Attribution des formules, suivi des échéances, gestion des entreprises et quotas.',
    role_code: 'superadmin',
  },
  {
    id: 'admin',
    name: 'Administrateur',
    shortName: 'Admin',
    category: 'staff',
    badge: 'Direction Opérationnelle',
    user_name: 'Amine El Fassi',
    email: 'admin@hercules-erp.ma',
    password: 'password',
    home: '/administrator/dashboard',
    color: '#0284c7',
    scope: 'Gestion opérationnelle globale : catalogue, clients, stocks, achats et facturation.',
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
    color: '#0284c7',
    scope: 'Portefeuille clients, validation des commandes, devis et relances.',
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
    color: '#0284c7',
    scope: 'Stock physique, réservé et disponible, réceptions fournisseurs et transferts.',
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
    color: '#0284c7',
    scope: 'Bons de préparation groupés par tournée logistique et contrôle de colisage.',
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
    color: '#0284c7',
    scope: 'Feuille de tournée ordonnée, signature client (POD) et encaissement.',
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
    color: '#0284c7',
    scope: 'Tournées commerces de proximité, commandes directes et vente embarquée.',
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
    color: '#0284c7',
    scope: 'Facturation marocaine (ICE/IF), chèques/traites en portefeuille et remises banque.',
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
    color: '#0284c7',
    scope: 'Catalogue aux tarifs négociés, passation de commandes et suivi de solde.',
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
    defaultTab === 'customer' ? 'customer' : 'staff'
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    defaultTab === 'customer' ? 'client' : 'admin'
  );
  const [identifier, setIdentifier] = useState(
    defaultTab === 'customer' ? 'contact@atlas-equipements.ma' : 'admin@hercules-erp.ma'
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

  const activeRole = ALL_ROLES.find((r) => r.id === selectedRoleId) || ALL_ROLES[1];
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
      {/* ── LEFT SHOWCASE PANEL (Enterprise Brand Showcase) ── */}
      <div className="login-hero-side">
        <div className="hero-top">
          <div className="hero-brand">
            <span className="hero-logo-mark">G</span>
            <div>
              <b className="hero-brand-name">GESTION ERP</b>
              <span className="hero-brand-tagline">Distribution Commerciale · Maroc</span>
            </div>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">Suite Entreprise Certifiée</div>
          <h1 className="hero-title">
            La solution de référence pour la distribution commerciale et logistique.
          </h1>
          <p className="hero-description">
            Pilotez l'ensemble de votre chaîne de valeur : gestion multi-dépôts, tournées de livraison ordonnancées, suivi des forces de vente et facturation conforme DGI.
          </p>

          <div className="hero-features">
            <div className="hero-feature-item">
              <span className="hero-feature-dot" />
              <div>
                <strong>Multi-Dépôts &amp; Disponibilité Temps Réel</strong>
                <p>Gestion précise du stock physique, réservé et disponible sur Casablanca, Rabat, Marrakech et Tanger.</p>
              </div>
            </div>

            <div className="hero-feature-item">
              <span className="hero-feature-dot" />
              <div>
                <strong>Facturation &amp; Fiscalité Conforme DGI</strong>
                <p>Édition certifiée avec ICE, IF, gestion des bons de livraison, des traites bancaires et des effets.</p>
              </div>
            </div>

            <div className="hero-feature-item">
              <span className="hero-feature-dot" />
              <div>
                <strong>Force de Vente Embarquée &amp; Espace Client</strong>
                <p>Van sales, prise de commandes directes pour commerces de proximité et portail de réassort revendeurs.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-footer">
          <div className="hero-security-pill">
            <span className="security-live-dot" />
            <span>Infrastructure haute disponibilité · Chiffrement TLS 256-bit</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT AUTHENTICATION PANEL ── */}
      <div className="login-form-side">
        <div className="login-topbar-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isLight ? 'Activer le mode sombre' : 'Activer le mode clair'}
            aria-label="Basculer le thème"
          >
            {isLight ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>

        <div className="login-form-container">
          <div className="login-card">
            {/* Header */}
            <div className="login-header">
              <h2 className="login-title">Connexion à votre espace</h2>
              <p className="login-subtitle">
                {portalMode === 'customer'
                  ? 'Accédez à votre espace revendeur ou créez votre compte pro'
                  : portalMode === 'saas'
                  ? 'Espace central Super Administrateur de la plateforme'
                  : 'Saisissez vos identifiants d’équipe ou choisissez un profil'}
              </p>
            </div>

            {/* Segmented Switcher */}
            <div className="portal-tabs">
              <button
                type="button"
                className={`portal-tab ${portalMode === 'staff' ? 'active' : ''}`}
                onClick={() => handleSwitchPortal('staff')}
              >
                <span>Équipe ERP</span>
              </button>
              <button
                type="button"
                className={`portal-tab ${portalMode === 'customer' ? 'active' : ''}`}
                onClick={() => handleSwitchPortal('customer')}
              >
                <span>Client Pro</span>
              </button>
              <button
                type="button"
                className={`portal-tab ${portalMode === 'saas' ? 'active saas-tab' : ''}`}
                onClick={() => handleSwitchPortal('saas')}
              >
                <span>Super Admin</span>
              </button>
            </div>

            {/* Super Admin Notice */}
            {portalMode === 'saas' && (
              <div className="role-active-banner saas-active-banner">
                <div className="role-active-top">
                  <span className="role-name" style={{ color: '#0284c7' }}>
                    Supervision Plateforme
                  </span>
                  <span className="role-scope-badge">Multi-Sociétés</span>
                </div>
                <p className="role-scope-desc">
                  Surveillance des échéances d’abonnement, création d’entreprises et attribution des quotas dépôts/utilisateurs.
                </p>
              </div>
            )}

            {/* Role Preset Selector (Staff mode) */}
            {portalMode === 'staff' && (
              <div className="role-selector-section">
                <label className="field-label-text">
                  Profil de test (Démonstration rapide)
                </label>
                <div className="field-input-wrap">
                  <select
                    className="role-dropdown-select"
                    value={selectedRoleId}
                    onChange={(e) => {
                      const sel = staffRoles.find((r) => r.id === e.target.value);
                      if (sel) handleSelectRole(sel, false);
                    }}
                  >
                    {staffRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {r.user_name} ({r.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="role-active-banner">
                  <div className="role-active-top">
                    <span className="role-name">{activeRole.name}</span>
                    <span className="role-scope-badge">{activeRole.badge}</span>
                  </div>
                  <p className="role-scope-desc">{activeRole.scope}</p>
                </div>
              </div>
            )}

            {/* Customer Sub-Tabs */}
            {portalMode === 'customer' && (
              <div className="customer-subtabs">
                <div className="customer-subtabs-row">
                  <button
                    type="button"
                    className={`customer-subtab-btn ${customerMode === 'login' ? 'active' : ''}`}
                    onClick={() => { setCustomerMode('login'); setError(null); }}
                  >
                    Se connecter
                  </button>
                  <button
                    type="button"
                    className={`customer-subtab-btn ${customerMode === 'register' ? 'active' : ''}`}
                    onClick={() => { setCustomerMode('register'); setError(null); }}
                  >
                    Créer un compte Client Pro
                  </button>
                </div>

                <div className="customer-info-banner">
                  <div className="role-active-top">
                    <span className="role-name">
                      {customerMode === 'login' ? 'Atlas Équipements SARL' : 'Nouvelle Demande Client Pro'}
                    </span>
                    <span className="role-scope-badge">
                      {customerMode === 'login' ? 'Client Revendeur' : 'Ouverture de compte'}
                    </span>
                  </div>
                  <p className="role-scope-desc">
                    {customerMode === 'login'
                      ? 'Accès au catalogue avec vos grilles tarifaires négociées, vos devis et votre encours.'
                      : 'Renseignez vos coordonnées professionnelles et votre ICE pour activer votre accès distributeur.'}
                  </p>
                </div>
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

                <div className="form-grid-2">
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
                    <label className="field-label-text">Raison Sociale *</label>
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

                <div className="form-grid-2">
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

                <div className="form-grid-2">
                  <div className="field-block">
                    <label className="field-label-text">Ville principale *</label>
                    <div className="field-input-wrap">
                      <select
                        className="role-dropdown-select"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                      >
                        <option value="Casablanca">Casablanca</option>
                        <option value="Rabat">Rabat</option>
                        <option value="Tanger">Tanger</option>
                        <option value="Marrakech">Marrakech</option>
                        <option value="Fès">Fès</option>
                        <option value="Agadir">Agadir</option>
                        <option value="Meknès">Meknès</option>
                        <option value="Kénitra">Kénitra</option>
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
                  <label className="field-label-text">
                    Commercial référent (Attribution directe)
                  </label>
                  <div className="field-input-wrap">
                    <select
                      className="role-dropdown-select"
                      value={regCommercialId}
                      onChange={(e) => setRegCommercialId(e.target.value)}
                    >
                      <option value="">-- Attribution automatique selon secteur --</option>
                      {commercialsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.commercial_code || `COM-${c.id}`})
                        </option>
                      ))}
                      <option value="code">-- Saisir un code de référence --</option>
                    </select>
                  </div>
                </div>

                {regCommercialId === 'code' && (
                  <div className="field-block">
                    <label className="field-label-text">Code commercial (ex: COM-001)</label>
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

                <div className="form-grid-2">
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

                <div className="action-buttons-group">
                  <button className="submit-btn" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 size={15} className="spin-animate" />
                        <span>Création en cours…</span>
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
              /* Form: Standard Login Mode */
              <form className="login-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="login-alert-error" role="alert">
                    <AlertCircle size={15} />
                    <span>{error}</span>
                  </div>
                )}

                {portalMode === 'staff' && storedUsers.length > 0 && (
                  <div className="field-block">
                    <label className="field-label-text">
                      Collaborateur enregistré en session ({storedUsers.length})
                    </label>
                    <div className="field-input-wrap">
                      <select
                        className="role-dropdown-select"
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
                        <option value="">-- Sélectionner un compte collaborateur --</option>
                        {storedUsers.map((u) => (
                          <option key={u.id} value={u.email}>
                            {u.name} — {u.role_label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="field-block">
                  <label className="field-label-text">
                    {portalMode === 'customer' ? 'Email ou Téléphone' : 'Identifiant professionnel'}
                  </label>
                  <div className="field-input-wrap">
                    <Mail size={15} className="input-icon" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={portalMode === 'customer' ? 'contact@entreprise.ma' : 'nom@hercules-erp.ma'}
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
                      setError('Veuillez contacter l’administrateur pour réinitialiser vos identifiants.');
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
                        <span>Connexion en cours…</span>
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
                    >
                      <span>Connexion rapide Super Administrateur</span>
                    </button>
                  )}

                  {portalMode === 'staff' && (
                    <button
                      type="button"
                      className="quick-test-btn"
                      onClick={() => executeLogin(activeRole.email, activeRole.password, 'staff')}
                      disabled={loading}
                    >
                      <span>Entrer directement comme {activeRole.name}</span>
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Card Footer */}
            <div className="login-card-footer">
              <div className="credentials-hint">
                Identifiants démo : <code>password</code> (Équipe) · <code>client1234</code> (Client)
              </div>
            </div>
          </div>

          <div className="login-legal-footer">
            <span>© 2025–2026 Hercules Distribution ERP. Système d’information d’entreprise sécurisé.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
