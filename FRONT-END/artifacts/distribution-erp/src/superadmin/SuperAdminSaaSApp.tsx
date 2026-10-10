import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  Crown, Building2, AlertTriangle, Clock, CheckCircle2, ShieldCheck,
  Search, Plus, RefreshCw, Zap, TrendingUp, Users, Warehouse,
  ExternalLink, CreditCard, ChevronRight, X, Edit, Phone, Mail,
  MapPin, Check, Sun, Moon, LogOut, ArrowRight, ShieldAlert,
  Package, Calendar, HelpCircle, Store, Sparkles
} from 'lucide-react';
import { useTheme } from '../lib/theme';
import { api, formatMoney, type SaasCompany, type SaasOverview } from '../staff/api';
import { useStaffAuth } from '../staff/auth';
import './superadmin.css';

// Demo seed data if backend has no companies yet
const INITIAL_COMPANIES: SaasCompany[] = [
  {
    id: 1,
    code: 'SOC-001',
    name: 'Hercules Distribution Maroc S.A.R.L.',
    brand_name: 'Hercules Distribution',
    ice: '002345678000045',
    rc: '458920 Casablanca',
    if_tax: '33214589',
    patente: '24589120',
    cnss: '7845120',
    city: 'Casablanca',
    address: 'Zone Industrielle Aïn Sebaâ',
    phone: '+212 522 45 67 89',
    email: 'contact@hercules-erp.ma',
    admin_user: {
      id: 2,
      name: 'Amine El Fassi',
      email: 'admin@hercules-erp.ma',
      phone: '+212 661 11 22 33',
    },
    subscription_plan: 'enterprise',
    subscription_status: 'active',
    subscription_start_date: '2025-10-09',
    subscription_end_date: '2027-08-31',
    subscription_price: 95000,
    subscription_billing_cycle: 'annuel',
    max_users: 60,
    max_warehouses: 12,
    users_count: 14,
    warehouses_count: 7,
    days_remaining: 326,
    status: 'active',
  },
  {
    id: 2,
    code: 'SOC-002',
    name: 'Atlas Négoce & Logistique S.A.R.L.',
    brand_name: 'Atlas Logix Fès',
    ice: '001987654000012',
    rc: '128490 Fès',
    if_tax: '44125890',
    patente: '32104589',
    cnss: '6547891',
    city: 'Fès',
    address: 'Quartier Industriel Dokkarat',
    phone: '+212 535 62 14 78',
    email: 'direction@atlas-negoce.ma',
    admin_user: {
      id: 17,
      name: 'Yassine Belkadi',
      email: 'admin@atlas-negoce.ma',
      phone: '+212 661 44 55 66',
    },
    subscription_plan: 'pro',
    subscription_status: 'active',
    subscription_start_date: '2026-01-15',
    subscription_end_date: '2027-01-14',
    subscription_price: 45000,
    subscription_billing_cycle: 'annuel',
    max_users: 20,
    max_warehouses: 4,
    users_count: 9,
    warehouses_count: 3,
    days_remaining: 185,
    status: 'active',
  },
  {
    id: 3,
    code: 'SOC-003',
    name: 'Souss Agro-Distribution & Trade',
    brand_name: 'Souss Agro Agadir',
    ice: '003214589000078',
    rc: '89420 Agadir',
    if_tax: '55214789',
    patente: '14258963',
    cnss: '9874561',
    city: 'Agadir',
    address: 'Zone Logistique Anza, Agadir',
    phone: '+212 528 84 51 20',
    email: 'contact@souss-trade.ma',
    admin_user: {
      id: 18,
      name: 'Omar Toumi',
      email: 'admin@souss-trade.ma',
      phone: '+212 662 77 88 99',
    },
    subscription_plan: 'starter',
    subscription_status: 'active',
    subscription_start_date: '2025-11-20',
    subscription_end_date: '2026-11-05',
    subscription_price: 18000,
    subscription_billing_cycle: 'annuel',
    max_users: 5,
    max_warehouses: 1,
    users_count: 4,
    warehouses_count: 1,
    days_remaining: 26, // Expiring soon (<30 days)!
    status: 'active',
  },
  {
    id: 4,
    code: 'SOC-004',
    name: 'Tanger Med Trade & Supply',
    brand_name: 'Tanger Med Supply',
    ice: '004561230000099',
    rc: '994512 Tanger',
    if_tax: '66321478',
    patente: '45879612',
    cnss: '3214569',
    city: 'Tanger',
    address: 'Zone Franche Logistique, Tanger Med',
    phone: '+212 539 33 22 11',
    email: 'ops@tangermedsupply.ma',
    admin_user: {
      id: 19,
      name: 'Karim Bennis',
      email: 'admin@tangermedsupply.ma',
      phone: '+212 663 11 22 33',
    },
    subscription_plan: 'enterprise',
    subscription_status: 'trial',
    subscription_start_date: '2026-09-25',
    subscription_end_date: '2026-10-25',
    subscription_price: 85000,
    subscription_billing_cycle: 'annuel',
    max_users: 30,
    max_warehouses: 6,
    users_count: 12,
    warehouses_count: 4,
    days_remaining: 15, // Expiring trial soon (<15 days)!
    status: 'active',
  },
  {
    id: 5,
    code: 'SOC-005',
    name: 'Marrakech Bâti & Distribution S.A.R.L.',
    brand_name: 'Marrakech Bâti Pro',
    ice: '005678901000055',
    rc: '78410 Marrakech',
    if_tax: '77412589',
    patente: '54128963',
    cnss: '4125896',
    city: 'Marrakech',
    address: 'Zone Industrielle Sidi Ghanem',
    phone: '+212 524 33 88 99',
    email: 'contact@marrakech-bati.ma',
    admin_user: {
      id: 20,
      name: 'Rachid El Amrani',
      email: 'admin@marrakech-bati.ma',
      phone: '+212 664 55 66 77',
    },
    subscription_plan: 'pro',
    subscription_status: 'expired',
    subscription_start_date: '2025-09-01',
    subscription_end_date: '2026-09-30',
    subscription_price: 45000,
    subscription_billing_cycle: 'annuel',
    max_users: 20,
    max_warehouses: 4,
    users_count: 8,
    warehouses_count: 2,
    days_remaining: 0, // Expired!
    status: 'suspended',
  },
];

export const SAAS_PACKS = [
  {
    id: 'starter',
    name: 'Pack Starter',
    badge: 'PME & Dépôt Unique',
    price_annual: 18000,
    price_monthly: 1800,
    max_warehouses: 1,
    max_users: 5,
    features: [
      '1 Dépôt Logistique Central',
      'Jusqu’à 5 Comptes Utilisateurs',
      'Gestion Catalogue & Tarifs HT/TTC',
      'Facturation B2B & Règlements simples',
      'Portail Client B2B Inclus',
      'Support par Email (48h)',
    ],
    color: '#10b981',
  },
  {
    id: 'pro',
    name: 'Pack Pro Business',
    badge: 'Multi-Dépôts & Ventes Terrain',
    price_annual: 45000,
    price_monthly: 4200,
    popular: true,
    max_warehouses: 4,
    max_users: 20,
    features: [
      'Jusqu’à 4 Dépôts Régionaux',
      'Jusqu’à 20 Comptes Collaborateurs',
      'Gestion Flotte & Tournées de Livraison',
      'Portefeuille Commerciaux & Commissions',
      'Gestion des Avoirs & Retours SAV',
      'Bons de Livraison & Visites Terrain',
      'Support Prioritaire 6j/7',
    ],
    color: '#0284c7',
  },
  {
    id: 'enterprise',
    name: 'Pack Enterprise',
    badge: 'Réseau National Maroc',
    price_annual: 95000,
    price_monthly: 8900,
    max_warehouses: 12,
    max_users: 60,
    features: [
      'Jusqu’à 12 Dépôts / Couverture Nationale',
      'Jusqu’à 60+ Comptes Utilisateurs',
      'Contrôle Crédit Client & Arbitrages Direction',
      'Multi-Devises & Données Consolidées',
      'Sauvegardes Automatiques Quotidiennes',
      'Accompagnement & Déploiement Dédié',
      'Accès API & Intégrations sur mesure',
    ],
    color: '#a855f7',
  },
];

export default function SuperAdminSaaSApp() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme, isLight } = useTheme();
  const { user, logout } = useStaffAuth();

  const [activeTab, setActiveTab] = useState<'alerts' | 'companies' | 'packs' | 'revenue'>('alerts');
  const [companies, setCompanies] = useState<SaasCompany[]>(INITIAL_COMPANIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [renewModalCompany, setRenewModalCompany] = useState<SaasCompany | null>(null);
  const [viewCompanyModal, setViewCompanyModal] = useState<SaasCompany | null>(null);

  // Sell Subscription Form State
  const [sellPack, setSellPack] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [sellCompanyName, setSellCompanyName] = useState('');
  const [sellBrandName, setSellBrandName] = useState('');
  const [sellIce, setSellIce] = useState('');
  const [sellRc, setSellRc] = useState('');
  const [sellCity, setSellCity] = useState('Casablanca');
  const [sellAddress, setSellAddress] = useState('');
  const [sellPhone, setSellPhone] = useState('+212 5');
  const [sellEmail, setSellEmail] = useState('');
  const [sellAdminName, setSellAdminName] = useState('');
  const [sellAdminEmail, setSellAdminEmail] = useState('');
  const [sellAdminPassword, setSellAdminPassword] = useState('Admin@2026!');
  const [sellCycle, setSellCycle] = useState<'annuel' | 'mensuel'>('annuel');
  const [sellPrice, setSellPrice] = useState('45000');
  const [sellEndDate, setSellEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  // Renew Subscription Form State
  const [renewPlan, setRenewPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewPrice, setRenewPrice] = useState('');
  const [renewStatus, setRenewStatus] = useState<'active' | 'trial' | 'suspended' | 'expired'>('active');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  // Fetch from backend API if available
  useEffect(() => {
    api.getSaasCompanies()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setCompanies(res.data);
        }
      })
      .catch(() => {
        // Fallback to local demo list
      });
  }, []);

  // Filter companies whose subscription is expiring soon (<30 days or expired)
  const expiringCompanies = useMemo(() => {
    return companies.filter((c) => c.days_remaining <= 30 || c.subscription_status === 'expired');
  }, [companies]);

  // General Filter
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.ice && c.ice.includes(searchQuery)) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.admin_user?.email && c.admin_user.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPlan = planFilter === 'all' || c.subscription_plan === planFilter;
      const matchStatus = statusFilter === 'all' || c.subscription_status === statusFilter;

      return matchSearch && matchPlan && matchStatus;
    });
  }, [companies, searchQuery, planFilter, statusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = companies.length;
    const active = companies.filter((c) => c.subscription_status === 'active').length;
    const trial = companies.filter((c) => c.subscription_status === 'trial').length;
    const expired = companies.filter((c) => c.subscription_status === 'expired').length;
    const urgent = expiringCompanies.length;

    // Monthly Recurring Revenue in MAD
    const mrr = companies.reduce((acc, c) => {
      if (c.subscription_status !== 'active') return acc;
      if (c.subscription_billing_cycle === 'annuel') {
        return acc + c.subscription_price / 12;
      }
      return acc + c.subscription_price;
    }, 0);

    const arr = mrr * 12;

    const totalUsers = companies.reduce((acc, c) => acc + (c.users_count || 1), 0);
    const totalDepots = companies.reduce((acc, c) => acc + (c.warehouses_count || 1), 0);

    return { total, active, trial, expired, urgent, mrr, arr, totalUsers, totalDepots };
  }, [companies, expiringCompanies]);

  // Handle Pack Change in Sell Modal
  function handleSelectSellPack(packId: 'starter' | 'pro' | 'enterprise') {
    setSellPack(packId);
    const packObj = SAAS_PACKS.find((p) => p.id === packId);
    if (packObj) {
      setSellPrice(sellCycle === 'annuel' ? packObj.price_annual.toString() : packObj.price_monthly.toString());
    }
  }

  // Handle Sell Form Submit
  function handleSellSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sellCompanyName || !sellCity) {
      notify('Veuillez renseigner au moins la raison sociale et la ville.');
      return;
    }

    const packObj = SAAS_PACKS.find((p) => p.id === sellPack);
    const newCompany: SaasCompany = {
      id: Math.floor(Math.random() * 1000) + 100,
      code: `SOC-${String(companies.length + 1).padStart(3, '0')}`,
      name: sellCompanyName,
      brand_name: sellBrandName || sellCompanyName,
      ice: sellIce || '00' + Math.floor(1000000000000 + Math.random() * 9000000000000),
      rc: sellRc || 'RC-' + Math.floor(10000 + Math.random() * 90000),
      city: sellCity,
      address: sellAddress,
      phone: sellPhone,
      email: sellEmail,
      admin_user: {
        id: Math.floor(Math.random() * 1000) + 20,
        name: sellAdminName || `Admin ${sellCompanyName}`,
        email: sellAdminEmail || `admin@${sellCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.ma`,
        phone: sellPhone,
      },
      subscription_plan: sellPack,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString().split('T')[0],
      subscription_end_date: sellEndDate,
      subscription_price: parseFloat(sellPrice) || (packObj?.price_annual ?? 45000),
      subscription_billing_cycle: sellCycle,
      max_users: packObj?.max_users ?? 20,
      max_warehouses: packObj?.max_warehouses ?? 4,
      users_count: 1,
      warehouses_count: 1,
      days_remaining: 365,
      status: 'active',
    };

    // Call Backend
    api.createSaasCompany({
      name: newCompany.name,
      brand_name: newCompany.brand_name,
      code: newCompany.code,
      ice: newCompany.ice,
      city: newCompany.city,
      address: newCompany.address,
      phone: newCompany.phone,
      email: newCompany.email,
      subscription_plan: newCompany.subscription_plan,
      subscription_status: 'active',
      subscription_price: newCompany.subscription_price,
      subscription_billing_cycle: newCompany.subscription_billing_cycle,
      subscription_end_date: newCompany.subscription_end_date,
      admin_name: newCompany.admin_user?.name,
      admin_email: newCompany.admin_user?.email,
      admin_password: sellAdminPassword,
      max_users: newCompany.max_users,
      max_warehouses: newCompany.max_warehouses,
    }).catch(() => {});

    setCompanies([newCompany, ...companies]);
    setIsSellModalOpen(false);
    notify(`Accès activé avec succès pour l'entreprise "${newCompany.name}" (Pack ${packObj?.name}) !`);

    // Reset fields
    setSellCompanyName('');
    setSellBrandName('');
    setSellIce('');
    setSellRc('');
    setSellAdminName('');
    setSellAdminEmail('');
  }

  // Open Renew Modal
  function handleOpenRenew(c: SaasCompany) {
    setRenewModalCompany(c);
    setRenewPlan(c.subscription_plan === 'custom' ? 'pro' : c.subscription_plan);
    setRenewStatus(c.subscription_status === 'expired' ? 'active' : c.subscription_status);
    setRenewPrice(c.subscription_price.toString());

    // Propose 1 year extension from today or current end date
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setRenewEndDate(d.toISOString().split('T')[0]);
  }

  // Submit Renew Modal
  function handleRenewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!renewModalCompany) return;

    const packObj = SAAS_PACKS.find((p) => p.id === renewPlan);
    const updatedPrice = parseFloat(renewPrice) || renewModalCompany.subscription_price;
    const end = new Date(renewEndDate);
    const now = new Date();
    const days = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24)));

    const updated: SaasCompany = {
      ...renewModalCompany,
      subscription_plan: renewPlan,
      subscription_status: renewStatus,
      subscription_end_date: renewEndDate,
      subscription_price: updatedPrice,
      max_users: packObj?.max_users ?? renewModalCompany.max_users,
      max_warehouses: packObj?.max_warehouses ?? renewModalCompany.max_warehouses,
      days_remaining: days,
      status: renewStatus === 'expired' ? 'suspended' : 'active',
    };

    api.updateSaasSubscription(renewModalCompany.id, {
      subscription_plan: renewPlan,
      subscription_status: renewStatus,
      subscription_end_date: renewEndDate,
      subscription_price: updatedPrice,
      max_users: updated.max_users,
      max_warehouses: updated.max_warehouses,
    }).catch(() => {});

    setCompanies((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setRenewModalCompany(null);
    notify(`Abonnement renouvelé avec succès pour "${updated.name}" (${days} jours accordés) !`);
  }

  // Extend Trial or Grace Period by 30 days
  function handleQuickExtend30Days(c: SaasCompany) {
    const curEnd = c.subscription_end_date ? new Date(c.subscription_end_date) : new Date();
    curEnd.setDate(curEnd.getDate() + 30);
    const newDateStr = curEnd.toISOString().split('T')[0];
    const days = c.days_remaining + 30;

    const updated = {
      ...c,
      subscription_status: 'active' as const,
      subscription_end_date: newDateStr,
      days_remaining: days,
      status: 'active' as const,
    };

    api.updateSaasSubscription(c.id, {
      subscription_status: 'active',
      subscription_end_date: newDateStr,
    }).catch(() => {});

    setCompanies((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    notify(`Période de grâce de 30 jours accordée à "${c.name}" !`);
  }

  return (
    <div className="saas-master-app">
      {/* ── Toast Feedback ── */}
      {toast && (
        <div className="saas-toast">
          <CheckCircle2 size={18} style={{ color: '#10b981' }} />
          <span>{toast}</span>
        </div>
      )}

      {/* ── Topbar Super Admin SaaS Master ── */}
      <header className="saas-topbar">
        <div className="saas-brand-area">
          <div className="saas-brand-logo">
            <Crown size={22} />
          </div>
          <div className="saas-brand-title">
            <b>HERCULES SaaS MASTER</b>
            <span>PORTAIL SUPER ADMIN · VENTES &amp; ABONNEMENTS</span>
          </div>
        </div>

        {/* Central Nav Tabs */}
        <nav className="saas-nav-tabs">
          <button
            type="button"
            className={`saas-nav-tab ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <AlertTriangle size={15} />
            <span>Abonnements à Échéance</span>
            {metrics.urgent > 0 && <span className="badge-count">{metrics.urgent}</span>}
          </button>

          <button
            type="button"
            className={`saas-nav-tab ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            <Building2 size={15} />
            <span>Entreprises Clientes</span>
            <span style={{ fontSize: 11, opacity: 0.8 }}>({companies.length})</span>
          </button>

          <button
            type="button"
            className={`saas-nav-tab ${activeTab === 'packs' ? 'active' : ''}`}
            onClick={() => setActiveTab('packs')}
          >
            <Zap size={15} />
            <span>Catalogue des Packs</span>
          </button>

          <button
            type="button"
            className={`saas-nav-tab ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            <CreditCard size={15} />
            <span>Revenus &amp; Croissance</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="saas-topbar-controls">
          <button
            type="button"
            className="btn-saas-primary"
            onClick={() => setIsSellModalOpen(true)}
            style={{ padding: '8px 14px', fontSize: 12.5 }}
          >
            <Plus size={16} /> Vendre un Abonnement
          </button>

          <button
            type="button"
            className="saas-switch-btn"
            onClick={() => setLocation('/administrator/dashboard')}
            title="Ouvrir l'application ERP opérationnelle"
          >
            <ExternalLink size={14} /> Aller à l’ERP
          </button>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isLight ? 'Activer mode sombre' : 'Activer mode clair'}
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => {
              logout();
              setLocation('/login');
            }}
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <main className="saas-main-container">
        {/* Hero Section */}
        <div className="saas-hero-strip">
          <div>
            <h1>Supervision Stratégique &amp; Ventes SaaS</h1>
            <p>
              Gestion exclusive des souscriptions d’entreprises, attribution des accès ERP et anticipation des fins de validité.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn-saas-secondary"
              onClick={() => notify('Données des abonnements actualisées.')}
            >
              <RefreshCw size={14} /> Actualiser
            </button>
            <button
              type="button"
              className="btn-saas-primary"
              onClick={() => setIsSellModalOpen(true)}
            >
              <Plus size={16} /> + Nouvelle Entreprise &amp; Pack
            </button>
          </div>
        </div>

        {/* ── High-Impact SaaS KPIs ── */}
        <div className="saas-kpi-grid">
          <div className="saas-kpi-card">
            <div className="saas-kpi-top">
              <span>Revenu Mensuel (MRR)</span>
              <div className="saas-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="saas-kpi-value">
              {formatMoney(metrics.mrr)} <small>DH/mois</small>
            </div>
            <div className="saas-kpi-sub" style={{ color: '#10b981' }}>
              <span>ARR projeté : <b>{formatMoney(metrics.arr)} DH/an</b></span>
            </div>
          </div>

          <div className="saas-kpi-card">
            <div className="saas-kpi-top">
              <span>Entreprises Abonnées</span>
              <div className="saas-kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Building2 size={16} />
              </div>
            </div>
            <div className="saas-kpi-value">
              {metrics.total} <small>entreprises</small>
            </div>
            <div className="saas-kpi-sub">
              <span style={{ color: '#10b981' }}>{metrics.active} actives</span> ·{' '}
              <span style={{ color: '#f59e0b' }}>{metrics.trial} en essai</span> ·{' '}
              <span style={{ color: '#ef4444' }}>{metrics.expired} expirées</span>
            </div>
          </div>

          <div className="saas-kpi-card" style={{ borderColor: metrics.urgent > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
            <div className="saas-kpi-top">
              <span style={{ color: metrics.urgent > 0 ? '#ef4444' : undefined }}>Échéances &lt; 30 Jours</span>
              <div className="saas-kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="saas-kpi-value" style={{ color: metrics.urgent > 0 ? '#ef4444' : undefined }}>
              {metrics.urgent} <small>à renouveler</small>
            </div>
            <div className="saas-kpi-sub">
              <span>Attention requise pour éviter l’interruption de service</span>
            </div>
          </div>

          <div className="saas-kpi-card">
            <div className="saas-kpi-top">
              <span>Infrastructures Hébergées</span>
              <div className="saas-kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                <Warehouse size={16} />
              </div>
            </div>
            <div className="saas-kpi-value">
              {metrics.totalDepots} <small>dépôts</small>
            </div>
            <div className="saas-kpi-sub">
              <span>{metrics.totalUsers} utilisateurs connectés au total</span>
            </div>
          </div>
        </div>

        {/* ── CRITICAL ALERTS BANNER (If any company expiring soon) ── */}
        {metrics.urgent > 0 && activeTab !== 'alerts' && (
          <div className="saas-alerts-banner">
            <div className="saas-alert-content">
              <div className="saas-alert-icon-box">
                <AlertTriangle size={24} />
              </div>
              <div className="saas-alert-text">
                <b>{metrics.urgent} Entreprise(s) arrivent à échéance dans moins de 30 jours !</b>
                <span>
                  Risque d’interruption de service pour les magasins et livreurs de ces filiales. Renouvelez leur abonnement dès maintenant.
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-saas-primary"
              style={{ background: '#ef4444', borderColor: '#b91c1c' }}
              onClick={() => setActiveTab('alerts')}
            >
              Voir les Abonnements en Alerte ({metrics.urgent}) <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 1 : ABONNEMENTS À ÉCHÉANCE IMMINENTE (User Request Focus)
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'alerts' && (
          <section className="saas-section-panel">
            <div className="saas-panel-header">
              <div className="saas-panel-header-left">
                <h3>🚨 Suivi des Échéances &amp; Alertes de Renouvellement</h3>
                <p>
                  Liste prioritaire des entreprises dont l’abonnement arrive à terme ou nécessite une action commerciale.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--saas-text-muted)' }}>
                  {expiringCompanies.length} dossiers à traiter
                </span>
              </div>
            </div>

            <div className="saas-table-wrap">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Entreprise &amp; Ville</th>
                    <th>Pack Souscrit</th>
                    <th>Date d’Échéance</th>
                    <th>Jours Restants</th>
                    <th>Facturation</th>
                    <th>Administrateur Référent</th>
                    <th style={{ textAlign: 'right' }}>Actions Commerciales</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--saas-text-muted)' }}>
                        <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 8px', display: 'block' }} />
                        <b>Aucune échéance critique dans les 30 prochains jours.</b>
                        <p style={{ margin: '4px 0 0', fontSize: 12 }}>Toutes les souscriptions sont à jour et actives.</p>
                      </td>
                    </tr>
                  ) : (
                    expiringCompanies.map((c) => {
                      const isExpired = c.days_remaining <= 0 || c.subscription_status === 'expired';
                      const isCritical = c.days_remaining <= 15;

                      return (
                        <tr key={c.id} style={{ background: isExpired ? 'rgba(239, 68, 68, 0.05)' : undefined }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 8,
                                  background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                                  color: '#fff',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: 800,
                                  fontSize: 12,
                                }}
                              >
                                {c.code.replace('SOC-', '')}
                              </div>
                              <div>
                                <b style={{ fontSize: 13, color: 'var(--saas-text-primary)' }}>{c.name}</b>
                                <div style={{ fontSize: 11, color: 'var(--saas-text-muted)', display: 'flex', gap: 8 }}>
                                  <span>📍 {c.city}</span>
                                  {c.ice && <span>ICE: {c.ice}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className={`badge-plan badge-plan-${c.subscription_plan}`}>
                              Pack {c.subscription_plan}
                            </span>
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar size={14} style={{ color: 'var(--saas-text-muted)' }} />
                              <b style={{ color: isExpired ? '#ef4444' : 'var(--saas-text-primary)' }}>
                                {c.subscription_end_date ?? 'Non définie'}
                              </b>
                            </div>
                          </td>

                          <td>
                            {isExpired ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#ef4444',
                                  fontWeight: 800,
                                  fontSize: 11.5,
                                }}
                              >
                                <AlertTriangle size={13} /> Expiré (Bloqué)
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  background: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: isCritical ? '#ef4444' : '#f59e0b',
                                  fontWeight: 800,
                                  fontSize: 11.5,
                                }}
                              >
                                <Clock size={13} /> {c.days_remaining} jours restants
                              </span>
                            )}
                          </td>

                          <td>
                            <b>{formatMoney(c.subscription_price)} DH</b>
                            <small style={{ display: 'block', color: 'var(--saas-text-muted)' }}>
                              /{c.subscription_billing_cycle === 'annuel' ? 'an' : 'mois'}
                            </small>
                          </td>

                          <td>
                            <div style={{ fontSize: 12 }}>
                              <b>{c.admin_user?.name ?? 'Non assigné'}</b>
                              <div style={{ fontSize: 11, color: '#38bdf8' }}>{c.admin_user?.email ?? c.email}</div>
                              {c.admin_user?.phone && (
                                <div style={{ fontSize: 10.5, color: 'var(--saas-text-muted)' }}>{c.admin_user.phone}</div>
                              )}
                            </div>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                type="button"
                                className="btn-saas-primary"
                                style={{ padding: '6px 12px', fontSize: 11.5 }}
                                onClick={() => handleOpenRenew(c)}
                              >
                                <RefreshCw size={13} /> Renouveler
                              </button>
                              <button
                                type="button"
                                className="btn-saas-secondary"
                                style={{ padding: '6px 10px', fontSize: 11.5 }}
                                onClick={() => handleQuickExtend30Days(c)}
                                title="Accorder 30 jours de grâce immédiats"
                              >
                                +30j Grâce
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 2 : RÉPERTOIRE & FICHES ENTREPRISES (User Request Focus)
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'companies' && (
          <section className="saas-section-panel">
            <div className="saas-panel-header">
              <div className="saas-panel-header-left">
                <h3>🏢 Répertoire des Entreprises Clientes Souscrites</h3>
                <p>
                  Toutes les informations administratives, coordonnées, statut d’accès et quotas réels par entreprise.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--saas-text-muted)' }} />
                  <input
                    type="text"
                    className="saas-search-input"
                    placeholder="Recherche : nom, ICE, ville, admin…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="saas-form-select"
                  style={{ width: 'auto', padding: '7px 12px', fontSize: 12 }}
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                >
                  <option value="all">Tous les Packs</option>
                  <option value="starter">Pack Starter</option>
                  <option value="pro">Pack Pro Business</option>
                  <option value="enterprise">Pack Enterprise</option>
                </select>

                <select
                  className="saas-form-select"
                  style={{ width: 'auto', padding: '7px 12px', fontSize: 12 }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tous les Statuts</option>
                  <option value="active">Actifs</option>
                  <option value="trial">En Essai</option>
                  <option value="expired">Expirés</option>
                </select>
              </div>
            </div>

            <div className="saas-table-wrap">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Code &amp; Société</th>
                    <th>Informations Fiscales &amp; Siège</th>
                    <th>Pack &amp; Statut</th>
                    <th>Quotas Utilisateurs &amp; Dépôts</th>
                    <th>Validité &amp; Tarif</th>
                    <th>Admin Entreprise</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((c) => {
                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 8,
                                background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                                color: '#fff',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 800,
                                fontSize: 12,
                              }}
                            >
                              {c.code.replace('SOC-', '')}
                            </div>
                            <div>
                              <b style={{ fontSize: 13, color: 'var(--saas-text-primary)' }}>{c.name}</b>
                              <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>{c.code}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: 12 }}>
                            <div>📍 <b>{c.city}</b> · <span style={{ color: 'var(--saas-text-muted)' }}>{c.address || 'Siège principal'}</span></div>
                            <div style={{ fontSize: 11, color: 'var(--saas-text-muted)', marginTop: 2 }}>
                              ICE : <b>{c.ice || 'Non renseigné'}</b> {c.rc && `· RC ${c.rc}`}
                            </div>
                            {c.phone && <div style={{ fontSize: 11, color: 'var(--saas-text-muted)' }}>📞 {c.phone}</div>}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span className={`badge-plan badge-plan-${c.subscription_plan}`}>
                              Pack {c.subscription_plan}
                            </span>
                            <span className={`badge-status badge-status-${c.subscription_status}`}>
                              {c.subscription_status === 'active' && '🟢 Actif'}
                              {c.subscription_status === 'trial' && '⏳ Essai'}
                              {c.subscription_status === 'expired' && '🔴 Expiré'}
                              {c.subscription_status === 'suspended' && '⏸️ Suspendu'}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                <span>Dépôts :</span>
                                <b>{c.warehouses_count || 1} / {c.max_warehouses}</b>
                              </div>
                              <div className="quota-bar-track">
                                <div
                                  className="quota-bar-fill"
                                  style={{
                                    width: `${Math.min(100, ((c.warehouses_count || 1) / c.max_warehouses) * 100)}%`,
                                    background: '#0284c7',
                                  }}
                                />
                              </div>
                            </div>

                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                <span>Utilisateurs :</span>
                                <b>{c.users_count || 1} / {c.max_users}</b>
                              </div>
                              <div className="quota-bar-track">
                                <div
                                  className="quota-bar-fill"
                                  style={{
                                    width: `${Math.min(100, ((c.users_count || 1) / c.max_users) * 100)}%`,
                                    background: '#a855f7',
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: 12 }}>
                            <b>{formatMoney(c.subscription_price)} DH</b>
                            <small style={{ color: 'var(--saas-text-muted)' }}>
                              /{c.subscription_billing_cycle === 'annuel' ? 'an' : 'mois'}
                            </small>
                            <div style={{ fontSize: 11, marginTop: 3 }}>
                              {c.days_remaining > 0 ? (
                                <span style={{ color: c.days_remaining <= 30 ? '#f59e0b' : '#10b981' }}>
                                  Expire dans {c.days_remaining} jours
                                </span>
                              ) : (
                                <span style={{ color: '#ef4444', fontWeight: 700 }}>Abonnement expiré</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: 12 }}>
                            <b>{c.admin_user?.name ?? 'Non assigné'}</b>
                            <div style={{ fontSize: 11, color: '#38bdf8' }}>{c.admin_user?.email ?? c.email}</div>
                            {c.admin_user?.phone && (
                              <div style={{ fontSize: 10.5, color: 'var(--saas-text-muted)' }}>{c.admin_user.phone}</div>
                            )}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              type="button"
                              className="btn-saas-secondary"
                              style={{ padding: '6px 10px', fontSize: 11.5 }}
                              onClick={() => setViewCompanyModal(c)}
                              title="Voir la fiche complète"
                            >
                              Fiche
                            </button>
                            <button
                              type="button"
                              className="btn-saas-primary"
                              style={{ padding: '6px 10px', fontSize: 11.5 }}
                              onClick={() => handleOpenRenew(c)}
                              title="Modifier ou renouveler l'abonnement"
                            >
                              Abonnement
                            </button>
                            <button
                              type="button"
                              className="btn-saas-secondary"
                              style={{ padding: '6px 10px', fontSize: 11.5, color: '#38bdf8' }}
                              onClick={() => setLocation('/administrator/dashboard')}
                              title="Se connecter en tant qu'administrateur de cette filiale"
                            >
                              ERP ↗
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 3 : CATALOGUE DES PACKS & VENTES (User Request Focus)
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'packs' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                💎 OFFRES COMMERCIALES &amp; TARIFS SAAS
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 900, margin: '4px 0 6px', color: 'var(--saas-text-primary)' }}>
                Catalogue des Packs d’Abonnement Distribution ERP
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--saas-text-secondary)', maxWidth: 640, margin: '0 auto' }}>
                Chaque entreprise cliente souscrit à un pack déterminant ses quotas de dépôts régionaux, comptes collaborateurs et modules opérationnels.
              </p>
            </div>

            <div className="saas-packs-grid">
              {SAAS_PACKS.map((pack) => (
                <div key={pack.id} className={`saas-pack-card ${pack.popular ? 'popular' : ''}`}>
                  {pack.popular && <span className="saas-pack-badge">Le Plus Vendu ⭐</span>}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${pack.color}20`,
                        color: pack.color,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Zap size={18} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{pack.name}</h3>
                      <span style={{ fontSize: 11, color: 'var(--saas-text-muted)' }}>{pack.badge}</span>
                    </div>
                  </div>

                  <div className="saas-pack-price">
                    {formatMoney(pack.price_annual)} DH <small>/ an HT</small>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--saas-text-muted)' }}>
                    Soit {formatMoney(pack.price_monthly)} DH/mois facturé annuellement
                  </div>

                  <div style={{ borderTop: '1px solid var(--saas-border)', marginTop: 16, paddingTop: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--saas-text-primary)', marginBottom: 6 }}>
                      Capacités &amp; Quotas Inclus :
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                      <span>📦 <b>{pack.max_warehouses} Dépôt{pack.max_warehouses > 1 ? 's' : ''}</b></span>
                      <span>👥 <b>{pack.max_users} Utilisateurs</b></span>
                    </div>
                  </div>

                  <ul className="saas-pack-features">
                    {pack.features.map((feat, idx) => (
                      <li key={idx}>
                        <Check size={15} style={{ color: pack.color, flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className="btn-saas-primary"
                    style={{ marginTop: 'auto', justifyContent: 'center' }}
                    onClick={() => {
                      handleSelectSellPack(pack.id as any);
                      setIsSellModalOpen(true);
                    }}
                  >
                    Vendre le {pack.name} <ArrowRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            TAB 4 : REVENUS & CROISSANCE SAAS
            ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'revenue' && (
          <section className="saas-section-panel">
            <div className="saas-panel-header">
              <div className="saas-panel-header-left">
                <h3>📊 Performance Financière &amp; Répartition du Chiffre d’Affaires SaaS</h3>
                <p>Analyse de la valeur souscrite par pack, cycle de facturation et projections annuelles.</p>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div style={{ background: 'var(--saas-bg-surface)', padding: 20, borderRadius: 12, border: '1px solid var(--saas-border)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800 }}>Répartition par Formule de Pack</h4>
                  {SAAS_PACKS.map((pack) => {
                    const count = companies.filter((c) => c.subscription_plan === pack.id).length;
                    const revenue = count * pack.price_annual;
                    const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;

                    return (
                      <div key={pack.id} style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                          <b>{pack.name} ({count})</b>
                          <span>{formatMoney(revenue)} DH/an ({pct}%)</span>
                        </div>
                        <div className="quota-bar-track" style={{ maxWidth: '100%' }}>
                          <div className="quota-bar-fill" style={{ width: `${pct}%`, background: pack.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: 'var(--saas-bg-surface)', padding: 20, borderRadius: 12, border: '1px solid var(--saas-border)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800 }}>Santé du Portefeuille d’Abonnements</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#10b981' }}>🟢 Souscriptions Actives Régulières :</span>
                      <b>{metrics.active} sociétés</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#f59e0b' }}>⏳ Périodes d’Essai Provisoires :</span>
                      <b>{metrics.trial} sociétés</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#ef4444' }}>🔴 Comptes Expirés / En Attente Règlement :</span>
                      <b>{metrics.expired} sociétés</b>
                    </div>
                    <div style={{ borderTop: '1px solid var(--saas-border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <b>Chiffre d’Affaires Annuel Contractualisé (ARR) :</b>
                      <b style={{ color: '#0284c7' }}>{formatMoney(metrics.arr)} DH</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 1 : VENDRE UN ABONNEMENT / CRÉATION ENTREPRISE (User Request)
          ════════════════════════════════════════════════════════════════════════ */}
      {isSellModalOpen && (
        <div className="saas-modal-backdrop" onClick={() => setIsSellModalOpen(false)}>
          <div
            className="saas-modal-card"
            style={{ maxWidth: 740 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="saas-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Crown size={22} style={{ color: '#0284c7' }} />
                <div>
                  <h2>Vendre un Abonnement &amp; Activer une Entreprise</h2>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--saas-text-muted)' }}>
                    Génération immédiate de l’accès ERP, du compte administrateur et affectation des quotas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={() => setIsSellModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSellSubmit}>
              {/* STEP 1 : CHOIX DU PACK */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  1. Choix du Pack d’Abonnement
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {SAAS_PACKS.map((p) => {
                    const isSelected = sellPack === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectSellPack(p.id as any)}
                        style={{
                          border: isSelected ? `2px solid ${p.color}` : '1px solid var(--saas-border)',
                          background: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'var(--saas-bg-surface)',
                          borderRadius: 10,
                          padding: 12,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <b style={{ fontSize: 13, color: isSelected ? p.color : 'var(--saas-text-primary)', display: 'block' }}>
                          {p.name}
                        </b>
                        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>
                          {formatMoney(p.price_annual)} DH<small style={{ fontSize: 10, color: 'var(--saas-text-muted)' }}>/an</small>
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--saas-text-muted)', marginTop: 4 }}>
                          {p.max_warehouses} Dépôt{p.max_warehouses > 1 ? 's' : ''} · {p.max_users} Users
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2 : INFORMATIONS ENTREPRISE */}
              <div style={{ borderTop: '1px solid var(--saas-border)', paddingTop: 14, marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  2. Informations de l’Entreprise Cliente
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <div className="saas-form-group">
                    <label>Raison Sociale *</label>
                    <input
                      type="text"
                      className="saas-form-input"
                      placeholder="Ex : Maghreb Quincaillerie &amp; Négoce S.A.R.L."
                      value={sellCompanyName}
                      onChange={(e) => setSellCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="saas-form-group">
                    <label>Nom Commercial / Marque</label>
                    <input
                      type="text"
                      className="saas-form-input"
                      placeholder="Ex : Maghreb Quinc’"
                      value={sellBrandName}
                      onChange={(e) => setSellBrandName(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="saas-form-group">
                    <label>Identifiant Commun (ICE) *</label>
                    <input
                      type="text"
                      className="saas-form-input"
                      placeholder="15 chiffres"
                      value={sellIce}
                      onChange={(e) => setSellIce(e.target.value)}
                    />
                  </div>
                  <div className="saas-form-group">
                    <label>Registre du Commerce (RC)</label>
                    <input
                      type="text"
                      className="saas-form-input"
                      placeholder="Ex : 124890 Casa"
                      value={sellRc}
                      onChange={(e) => setSellRc(e.target.value)}
                    />
                  </div>
                  <div className="saas-form-group">
                    <label>Ville du Siège *</label>
                    <select
                      className="saas-form-select"
                      value={sellCity}
                      onChange={(e) => setSellCity(e.target.value)}
                    >
                      <option value="Casablanca">Casablanca</option>
                      <option value="Rabat">Rabat</option>
                      <option value="Marrakech">Marrakech</option>
                      <option value="Tanger">Tanger</option>
                      <option value="Fès">Fès</option>
                      <option value="Agadir">Agadir</option>
                      <option value="Oujda">Oujda</option>
                      <option value="Meknès">Meknès</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STEP 3 : COMPTE ADMINISTRATEUR */}
              <div style={{ borderTop: '1px solid var(--saas-border)', paddingTop: 14, marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  3. Compte Administrateur de l’Entreprise (Accès ERP)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="saas-form-group">
                    <label>Nom du Dirigeant / Admin *</label>
                    <input
                      type="text"
                      className="saas-form-input"
                      placeholder="Ex : Karim Bennani"
                      value={sellAdminName}
                      onChange={(e) => setSellAdminName(e.target.value)}
                    />
                  </div>
                  <div className="saas-form-group">
                    <label>Email de Connexion *</label>
                    <input
                      type="email"
                      className="saas-form-input"
                      placeholder="admin@entreprise.ma"
                      value={sellAdminEmail}
                      onChange={(e) => setSellAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="saas-form-group">
                    <label>Mot de Passe Initial</label>
                    <input
                      type="text"
                      className="saas-form-input"
                      value={sellAdminPassword}
                      onChange={(e) => setSellAdminPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* STEP 4 : FACTURATION & DATE */}
              <div style={{ borderTop: '1px solid var(--saas-border)', paddingTop: 14, marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  4. Paramètres de Souscription &amp; Facturation
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="saas-form-group">
                    <label>Cycle de Facturation</label>
                    <select
                      className="saas-form-select"
                      value={sellCycle}
                      onChange={(e) => {
                        const val = e.target.value as 'annuel' | 'mensuel';
                        setSellCycle(val);
                        const packObj = SAAS_PACKS.find((p) => p.id === sellPack);
                        if (packObj) {
                          setSellPrice(val === 'annuel' ? packObj.price_annual.toString() : packObj.price_monthly.toString());
                        }
                      }}
                    >
                      <option value="annuel">Annuel (Recommandé)</option>
                      <option value="mensuel">Mensuel</option>
                    </select>
                  </div>

                  <div className="saas-form-group">
                    <label>Tarif Négocié (DH HT)</label>
                    <input
                      type="number"
                      className="saas-form-input"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                    />
                  </div>

                  <div className="saas-form-group">
                    <label>Date de Fin de Validité</label>
                    <input
                      type="date"
                      className="saas-form-input"
                      value={sellEndDate}
                      onChange={(e) => setSellEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--saas-border)', paddingTop: 16 }}>
                <button
                  type="button"
                  className="btn-saas-secondary"
                  onClick={() => setIsSellModalOpen(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-saas-primary">
                  <Check size={16} /> Activer l’Accès ERP &amp; Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 2 : RENOUVELER ABONNEMENT
          ════════════════════════════════════════════════════════════════════════ */}
      {renewModalCompany && (
        <div className="saas-modal-backdrop" onClick={() => setRenewModalCompany(null)}>
          <div className="saas-modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="saas-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <RefreshCw size={20} style={{ color: '#0284c7' }} />
                <div>
                  <h2>Renouveler Abonnement · {renewModalCompany.name}</h2>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--saas-text-muted)' }}>
                    Prolongation de la date de validité et ajustement de formule.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={() => setRenewModalCompany(null)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="saas-form-group">
                  <label>Pack d’Abonnement</label>
                  <select
                    className="saas-form-select"
                    value={renewPlan}
                    onChange={(e) => setRenewPlan(e.target.value as any)}
                  >
                    <option value="starter">Pack Starter (1 Dépôt · 5 Users)</option>
                    <option value="pro">Pack Pro Business (4 Dépôts · 20 Users)</option>
                    <option value="enterprise">Pack Enterprise (12 Dépôts · 60 Users)</option>
                  </select>
                </div>

                <div className="saas-form-group">
                  <label>Statut</label>
                  <select
                    className="saas-form-select"
                    value={renewStatus}
                    onChange={(e) => setRenewStatus(e.target.value as any)}
                  >
                    <option value="active">Actif (Accès Débloqué)</option>
                    <option value="trial">Période d’Essai</option>
                    <option value="expired">Expiré (Accès Restreint)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="saas-form-group">
                  <label>Nouvelle Date d’Échéance</label>
                  <input
                    type="date"
                    className="saas-form-input"
                    value={renewEndDate}
                    onChange={(e) => setRenewEndDate(e.target.value)}
                    required
                  />
                </div>

                <div className="saas-form-group">
                  <label>Tarif de Renouvellement (DH)</label>
                  <input
                    type="number"
                    className="saas-form-input"
                    value={renewPrice}
                    onChange={(e) => setRenewPrice(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  className="btn-saas-secondary"
                  onClick={() => setRenewModalCompany(null)}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-saas-primary">
                  Confirmer le Renouvellement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 3 : FICHE DÉTAILLÉE ENTREPRISE
          ════════════════════════════════════════════════════════════════════════ */}
      {viewCompanyModal && (
        <div className="saas-modal-backdrop" onClick={() => setViewCompanyModal(null)}>
          <div className="saas-modal-card" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="saas-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={22} style={{ color: '#0284c7' }} />
                <div>
                  <h2>Fiche Entreprise · {viewCompanyModal.name}</h2>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--saas-text-muted)' }}>
                    Identifiant {viewCompanyModal.code} · Siège {viewCompanyModal.city}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={() => setViewCompanyModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Coordonnées & Fiscal */}
              <div style={{ background: 'var(--saas-bg-surface)', padding: 16, borderRadius: 10, border: '1px solid var(--saas-border)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>Identité Fiscale &amp; Siège</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  <div>Raison Sociale : <b>{viewCompanyModal.name}</b></div>
                  <div>Nom Commercial : <b>{viewCompanyModal.brand_name || 'Idem'}</b></div>
                  <div>ICE : <b>{viewCompanyModal.ice || 'Non renseigné'}</b></div>
                  <div>RC : <b>{viewCompanyModal.rc || 'Non renseigné'}</b></div>
                  <div>Ville : <b>{viewCompanyModal.city}</b></div>
                  <div>Téléphone : <b>{viewCompanyModal.phone || 'Non renseigné'}</b></div>
                </div>
              </div>

              {/* Compte Admin */}
              <div style={{ background: 'var(--saas-bg-surface)', padding: 16, borderRadius: 10, border: '1px solid var(--saas-border)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>Compte Administrateur Attribué</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  <div>Nom Admin : <b>{viewCompanyModal.admin_user?.name || 'Non assigné'}</b></div>
                  <div>Email de Connexion : <b>{viewCompanyModal.admin_user?.email || viewCompanyModal.email}</b></div>
                  <div>Téléphone : <b>{viewCompanyModal.admin_user?.phone || 'Non renseigné'}</b></div>
                  <div>Statut Accès : <b style={{ color: '#10b981' }}>Actif &amp; Opérationnel</b></div>
                </div>
              </div>

              {/* Quotas & Abonnement */}
              <div style={{ background: 'var(--saas-bg-surface)', padding: 16, borderRadius: 10, border: '1px solid var(--saas-border)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: '#38bdf8' }}>Détails Abonnement &amp; Quotas</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                  <div>Formule : <b style={{ textTransform: 'uppercase' }}>Pack {viewCompanyModal.subscription_plan}</b></div>
                  <div>Tarif : <b>{formatMoney(viewCompanyModal.subscription_price)} DH/{viewCompanyModal.subscription_billing_cycle}</b></div>
                  <div>Date de Fin : <b>{viewCompanyModal.subscription_end_date}</b></div>
                  <div>Jours Restants : <b style={{ color: viewCompanyModal.days_remaining <= 30 ? '#ef4444' : '#10b981' }}>{viewCompanyModal.days_remaining} jours</b></div>
                  <div>Dépôts Utilisés : <b>{viewCompanyModal.warehouses_count || 1} / {viewCompanyModal.max_warehouses}</b></div>
                  <div>Utilisateurs Créés : <b>{viewCompanyModal.users_count || 1} / {viewCompanyModal.max_users}</b></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn-saas-secondary"
                onClick={() => setViewCompanyModal(null)}
              >
                Fermer
              </button>
              <button
                type="button"
                className="btn-saas-primary"
                onClick={() => {
                  const target = viewCompanyModal;
                  setViewCompanyModal(null);
                  handleOpenRenew(target);
                }}
              >
                Renouveler l’Abonnement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
