import { useState, useEffect } from 'react';
import {
  Building2, Crown, Plus, Search, Filter, CheckCircle2,
  AlertTriangle, Clock, RefreshCw, User, Mail, Phone, MapPin,
  Calendar, Layers, ShieldCheck, ArrowRight, X, Edit, Zap,
  DollarSign, TrendingUp, Sparkles, Check,
} from 'lucide-react';
import { api, formatMoney, type SaasCompany, type SaasOverview } from '../api';

const MOCK_INITIAL_COMPANIES: SaasCompany[] = [
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
    max_users: 50,
    max_warehouses: 10,
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
    subscription_end_date: '2026-11-19',
    subscription_price: 18000,
    subscription_billing_cycle: 'annuel',
    max_users: 5,
    max_warehouses: 2,
    users_count: 4,
    warehouses_count: 1,
    days_remaining: 41,
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
    days_remaining: 16,
    status: 'active',
  },
];

interface SaasCompaniesManagementProps {
  onCompanyCreated?: (company: SaasCompany) => void;
  onSelectCompanyToView?: (company: SaasCompany) => void;
}

export default function SaasCompaniesManagement({
  onCompanyCreated,
  onSelectCompanyToView,
}: SaasCompaniesManagementProps) {
  const [companies, setCompanies] = useState<SaasCompany[]>(MOCK_INITIAL_COMPANIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'starter' | 'pro' | 'enterprise'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'expired'>('all');
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubscriptionCompany, setEditingSubscriptionCompany] = useState<SaasCompany | null>(null);

  // Create Company Form
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formIce, setFormIce] = useState('');
  const [formRc, setFormRc] = useState('');
  const [formCity, setFormCity] = useState('Casablanca');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('+212 ');
  const [formEmail, setFormEmail] = useState('');
  // Admin User
  const [formAdminName, setFormAdminName] = useState('');
  const [formAdminEmail, setFormAdminEmail] = useState('');
  const [formAdminPhone, setFormAdminPhone] = useState('+212 ');
  const [formAdminPassword, setFormAdminPassword] = useState('Admin@2026!');
  // Subscription
  const [formPlan, setFormPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [formPrice, setFormPrice] = useState('45000');
  const [formCycle, setFormCycle] = useState<'annuel' | 'mensuel'>('annuel');
  const [formEndDate, setFormEndDate] = useState('2027-10-09');
  const [formMaxUsers, setFormMaxUsers] = useState('20');
  const [formMaxDepots, setFormMaxDepots] = useState('4');

  // Edit Subscription Form
  const [editPlan, setEditPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [editStatus, setEditStatus] = useState<'active' | 'trial' | 'expired' | 'suspended'>('active');
  const [editEndDate, setEditEndDate] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editMaxUsers, setEditMaxUsers] = useState('20');
  const [editMaxDepots, setEditMaxDepots] = useState('4');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  // Load from backend if available
  useEffect(() => {
    api.getSaasCompanies()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setCompanies(res.data);
        }
      })
      .catch(() => {
        // Fallback to rich mock data
      });
  }, []);

  // Filtered companies
  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.ice && c.ice.toLowerCase().includes(q)) ||
      (c.admin_user && c.admin_user.name.toLowerCase().includes(q));

    const matchPlan = planFilter === 'all' || c.subscription_plan === planFilter;
    const matchStatus = statusFilter === 'all' || c.subscription_status === statusFilter;

    return matchSearch && matchPlan && matchStatus;
  });

  // Calculate SaaS Consolidated Metrics
  const totalCompanies = companies.length;
  const activeSubs = companies.filter((c) => c.subscription_status === 'active').length;
  const trialSubs = companies.filter((c) => c.subscription_status === 'trial').length;
  const totalUsersSaaS = companies.reduce((acc, c) => acc + (c.users_count || 0), 0);
  const totalDepotsSaaS = companies.reduce((acc, c) => acc + (c.warehouses_count || 0), 0);
  const mrrTotal = companies.reduce((acc, c) => {
    if (c.subscription_status === 'active') {
      return acc + (c.subscription_billing_cycle === 'annuel' ? c.subscription_price / 12 : c.subscription_price);
    }
    return acc;
  }, 0);
  const arrTotal = mrrTotal * 12;

  function handleCreateCompanySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formCity.trim()) {
      alert('Veuillez saisir au moins la raison sociale et la ville.');
      return;
    }

    const newCompany: SaasCompany = {
      id: Date.now(),
      code: formCode.trim() || `SOC-00${companies.length + 1}`,
      name: formName.trim(),
      brand_name: formBrand.trim() || formName.trim(),
      ice: formIce.trim() || '00' + Math.floor(1000000000000 + Math.random() * 9000000000000),
      rc: formRc.trim() || `RC-${Math.floor(100000 + Math.random() * 900000)} ${formCity.trim()}`,
      city: formCity.trim(),
      address: formAddress.trim() || `Zone d’activité, ${formCity.trim()}`,
      phone: formPhone.trim(),
      email: formEmail.trim() || `contact@${formName.toLowerCase().replace(/[^a-z]/g, '')}.ma`,
      admin_user: {
        id: Date.now() + 1,
        name: formAdminName.trim() || `Admin ${formName.trim()}`,
        email: formAdminEmail.trim() || `admin@${formName.toLowerCase().replace(/[^a-z]/g, '')}.ma`,
        phone: formAdminPhone.trim(),
      },
      subscription_plan: formPlan,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString().split('T')[0],
      subscription_end_date: formEndDate,
      subscription_price: parseFloat(formPrice) || 45000,
      subscription_billing_cycle: formCycle,
      max_users: parseInt(formMaxUsers, 10) || 20,
      max_warehouses: parseInt(formMaxDepots, 10) || 4,
      users_count: 1,
      warehouses_count: 1,
      days_remaining: 365,
      status: 'active',
    };

    // Try backend call
    api.createSaasCompany({
      name: newCompany.name,
      brand_name: newCompany.brand_name,
      code: newCompany.code,
      ice: newCompany.ice,
      city: newCompany.city,
      address: newCompany.address,
      phone: newCompany.phone,
      email: newCompany.email,
      admin_name: newCompany.admin_user?.name,
      admin_email: newCompany.admin_user?.email,
      admin_phone: newCompany.admin_user?.phone,
      admin_password: formAdminPassword,
      subscription_plan: newCompany.subscription_plan,
      subscription_price: newCompany.subscription_price,
      subscription_billing_cycle: newCompany.subscription_billing_cycle,
      subscription_end_date: newCompany.subscription_end_date,
      max_users: newCompany.max_users,
      max_warehouses: newCompany.max_warehouses,
    }).catch(() => {
      // Backend error fallback
    });

    setCompanies([newCompany, ...companies]);
    onCompanyCreated?.(newCompany);
    setIsCreateModalOpen(false);
    notify(`Entreprise "${newCompany.name}" et son compte Admin créés avec succès !`);

    // Reset Form
    setFormName('');
    setFormBrand('');
    setFormCode('');
    setFormIce('');
    setFormRc('');
    setFormAdminName('');
    setFormAdminEmail('');
  }

  function handleOpenEditSubscription(c: SaasCompany) {
    setEditingSubscriptionCompany(c);
    setEditPlan(c.subscription_plan === 'custom' ? 'pro' : c.subscription_plan);
    setEditStatus(c.subscription_status);
    setEditEndDate(c.subscription_end_date ?? '2027-10-09');
    setEditPrice(c.subscription_price.toString());
    setEditMaxUsers(c.max_users.toString());
    setEditMaxDepots(c.max_warehouses.toString());
  }

  function handleSaveSubscriptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSubscriptionCompany) return;

    const updatedPrice = parseFloat(editPrice) || editingSubscriptionCompany.subscription_price;
    const updatedUsers = parseInt(editMaxUsers, 10) || editingSubscriptionCompany.max_users;
    const updatedDepots = parseInt(editMaxDepots, 10) || editingSubscriptionCompany.max_warehouses;

    // Calculate updated days remaining
    const end = new Date(editEndDate);
    const now = new Date();
    const days = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24)));

    const updated = {
      ...editingSubscriptionCompany,
      subscription_plan: editPlan,
      subscription_status: editStatus,
      subscription_end_date: editEndDate,
      subscription_price: updatedPrice,
      max_users: updatedUsers,
      max_warehouses: updatedDepots,
      days_remaining: days,
    };

    api.updateSaasSubscription(editingSubscriptionCompany.id, {
      subscription_plan: editPlan,
      subscription_status: editStatus,
      subscription_end_date: editEndDate,
      subscription_price: updatedPrice,
      max_users: updatedUsers,
      max_warehouses: updatedDepots,
    }).catch(() => {});

    setCompanies((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setEditingSubscriptionCompany(null);
    notify(`Formule pour "${updated.name}" mise à jour avec succès !`);
  }

  return (
    <section className="panel" style={{ padding: 20, marginBottom: 24, borderRadius: 12, border: '1px solid rgba(2, 132, 199, 0.4)', background: 'var(--navy-1)' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #22c55e',
            borderRadius: 8,
            padding: '12px 18px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <div className="eyebrow" style={{ color: '#38bdf8', fontWeight: 800, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Crown size={14} /> GESTION DES SOCIÉTÉS &amp; FILIALES
          </div>
          <h2 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
            Portefeuille des Sociétés &amp; Filiales
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            Supervision centralisée des sociétés du réseau, attribution de leur administrateur et suivi de leurs activités.
          </p>
        </div>

        <button
          type="button"
          className="button-primary"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0284c7', borderColor: '#0369a1' }}
        >
          <Plus size={16} /> + Nouvelle Entreprise
        </button>
      </div>

      {/* ── Strategic KPI Strips ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--navy-2)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--line)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Revenu Mensuel Récurrent</span>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e', marginTop: 4 }}>
            {formatMoney(mrrTotal)} <small style={{ fontSize: 12 }}>DH/mois</small>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            Total Annuel Estimé : <b>{formatMoney(arrTotal)} DH/an</b>
          </div>
        </div>

        <div style={{ background: 'var(--navy-2)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--line)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Sociétés Affiliées</span>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
            {totalCompanies} <small style={{ fontSize: 12 }}>entreprises</small>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            <span style={{ color: '#22c55e' }}>{activeSubs} actives</span> · <span style={{ color: '#f59e0b' }}>{trialSubs} en essai</span>
          </div>
        </div>

        <div style={{ background: 'var(--navy-2)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--line)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Dépôts Opérationnels</span>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#a855f7', marginTop: 4 }}>
            {totalDepotsSaaS} <small style={{ fontSize: 12 }}>dépôts actifs</small>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            Sur l’ensemble du réseau Maroc
          </div>
        </div>

        <div style={{ background: 'var(--navy-2)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--line)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Utilisateurs Actifs</span>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f97316', marginTop: 4 }}>
            {totalUsersSaaS} <small style={{ fontSize: 12 }}>comptes actifs</small>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            Commerciaux, magasiniers, livreurs
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Rechercher par société, ICE, ville, admin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 6, background: 'var(--navy-2)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
          />
        </div>

        {/* Plan Filters */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--navy-2)', padding: 3, borderRadius: 6, border: '1px solid var(--line)' }}>
          {(['all', 'enterprise', 'pro', 'starter'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlanFilter(p)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: 0,
                background: planFilter === p ? '#0284c7' : 'transparent',
                color: planFilter === p ? '#ffffff' : 'var(--muted)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {p === 'all' ? 'Tous Plans' : p}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--navy-2)', padding: 3, borderRadius: 6, border: '1px solid var(--line)' }}>
          {(['all', 'active', 'trial', 'expired'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: 0,
                background: statusFilter === s ? '#0284c7' : 'transparent',
                color: statusFilter === s ? '#ffffff' : 'var(--muted)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {s === 'all' ? 'Tous Statuts' : s === 'active' ? 'Actifs' : s === 'trial' ? 'En Essai' : 'Expirés'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Companies List Cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredCompanies.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: 'var(--navy-2)', borderRadius: 8, color: 'var(--muted)' }}>
            Aucune entreprise ne correspond à votre filtre.
          </div>
        ) : (
          filteredCompanies.map((c) => {
            const isNearExpiry = c.days_remaining <= 30;
            const planColor =
              c.subscription_plan === 'enterprise' ? '#c084fc' : c.subscription_plan === 'pro' ? '#38bdf8' : '#22c55e';

            return (
              <div
                key={c.id}
                style={{
                  background: 'var(--navy-2)',
                  border: isNearExpiry ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--line)',
                  borderRadius: 10,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Row 1: Company Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                        color: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {c.code.replace('SOC-', '')}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                          {c.name}
                        </h3>
                        <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.08)', color: 'var(--muted)', fontWeight: 600 }}>
                          {c.code}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', gap: 10, marginTop: 3 }}>
                        <span>📍 {c.city}</span>
                        {c.ice && <span>ICE: <b>{c.ice}</b></span>}
                        {c.phone && <span>📞 {c.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Subscription Plan & Status Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: `${planColor}20`,
                        color: planColor,
                        border: `1px solid ${planColor}40`,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Crown size={12} /> PACK {c.subscription_plan}
                    </span>

                    <span
                      className={`status-pill ${
                        c.subscription_status === 'active'
                          ? 'status-green'
                          : c.subscription_status === 'trial'
                          ? 'status-amber'
                          : 'status-red'
                      }`}
                      style={{ fontSize: 11 }}
                    >
                      {c.subscription_status === 'active' ? '🟢 Actif' : c.subscription_status === 'trial' ? '⏳ Essai' : '🔴 Expiré'}
                    </span>
                  </div>
                </div>

                {/* Row 2: Admin & Subscription Metrics Bar */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 12,
                    background: 'rgba(0,0,0,0.18)',
                    padding: '12px 14px',
                    borderRadius: 8,
                  }}
                >
                  {/* Admin User */}
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      👤 Administrateur d’Entreprise
                    </span>
                    <strong style={{ display: 'block', fontSize: 13, color: '#ffffff', marginTop: 2 }}>
                      {c.admin_user?.name ?? 'Non assigné'}
                    </strong>
                    <div style={{ fontSize: 11, color: '#38bdf8' }}>
                      {c.admin_user?.email ?? c.email}
                    </div>
                  </div>

                  {/* Quotas Depots & Users */}
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      📦 Utilisation Quotas
                    </span>
                    <div style={{ fontSize: 12, marginTop: 2, display: 'flex', gap: 12 }}>
                      <span>Dépôts : <b>{c.warehouses_count ?? 1} / {c.max_warehouses}</b></span>
                      <span>Utilisateurs : <b>{c.users_count ?? 1} / {c.max_users}</b></span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, ((c.warehouses_count ?? 1) / c.max_warehouses) * 100)}%`, height: '100%', background: '#0284c7' }} />
                      </div>
                      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, ((c.users_count ?? 1) / c.max_users) * 100)}%`, height: '100%', background: '#a855f7' }} />
                      </div>
                    </div>
                  </div>

                  {/* Subscription Expiration & Pricing */}
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>
                      📅 Échéance &amp; Facturation
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                      <strong style={{ fontSize: 12.5, color: isNearExpiry ? '#f59e0b' : '#22c55e' }}>
                        {c.days_remaining} jours restants
                      </strong>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>
                        {formatMoney(c.subscription_price)} DH/{c.subscription_billing_cycle === 'annuel' ? 'an' : 'mois'}
                      </span>
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>
                      Expire le {c.subscription_end_date ?? 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Row 3: Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => handleOpenEditSubscription(c)}
                    style={{ height: 30, fontSize: 11.5, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Edit size={13} /> Modifier / Renouveler Formule
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => onSelectCompanyToView?.(c)}
                    style={{ height: 30, fontSize: 11.5, padding: '0 12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    Voir Société ↗
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL 1 : Création Nouvelle Entreprise SaaS ── */}
      {isCreateModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <form
            className="record-modal"
            onSubmit={handleCreateCompanySubmit}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 640,
              width: '95%',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={22} style={{ color: '#0284c7' }} />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                  Créer une Nouvelle Entreprise &amp; Attribuer son Admin
                </h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setIsCreateModalOpen(false)} style={{ color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* SECTION 1 : Infos de la Société */}
              <div>
                <span className="eyebrow" style={{ color: '#0284c7', fontWeight: 800, fontSize: 11 }}>
                  1. INFORMATIONS LÉGALES DE L'ENTREPRISE
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Raison Sociale *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex. Atlas Distribution Fès S.A.R.L."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Nom Commercial
                    </label>
                    <input
                      type="text"
                      placeholder="ex. Atlas Logix"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Code Société
                    </label>
                    <input
                      type="text"
                      placeholder={`SOC-00${companies.length + 1}`}
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      ICE (15 chiffres)
                    </label>
                    <input
                      type="text"
                      placeholder="001987654000012"
                      value={formIce}
                      onChange={(e) => setFormIce(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Ville Siège *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Casablanca, Fès, Tanger..."
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2 : Compte de l'Administrateur d'Entreprise */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <span className="eyebrow" style={{ color: '#0284c7', fontWeight: 800, fontSize: 11 }}>
                  2. ADMINISTRATEUR D'ENTREPRISE (LOGIN ADMIN)
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Nom Complet de l'Admin *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex. Yassine Belkadi"
                      value={formAdminName}
                      onChange={(e) => setFormAdminName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Email de Connexion *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@atlas-negoce.ma"
                      value={formAdminEmail}
                      onChange={(e) => setFormAdminEmail(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Téléphone Admin
                    </label>
                    <input
                      type="text"
                      value={formAdminPhone}
                      onChange={(e) => setFormAdminPhone(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Mot de Passe Initial
                    </label>
                    <input
                      type="text"
                      value={formAdminPassword}
                      onChange={(e) => setFormAdminPassword(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3 : Formule Contractuelle */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <span className="eyebrow" style={{ color: '#0284c7', fontWeight: 800, fontSize: 11 }}>
                  3. FORMULE CONTRACTUELLE &amp; CAPACITÉS
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 8 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Plan Souscrit
                    </label>
                    <select
                      value={formPlan}
                      onChange={(e) => {
                        const val = e.target.value as 'starter' | 'pro' | 'enterprise';
                        setFormPlan(val);
                        if (val === 'starter') {
                          setFormPrice('18000');
                          setFormMaxUsers('5');
                          setFormMaxDepots('1');
                        } else if (val === 'pro') {
                          setFormPrice('45000');
                          setFormMaxUsers('20');
                          setFormMaxDepots('4');
                        } else {
                          setFormPrice('95000');
                          setFormMaxUsers('60');
                          setFormMaxDepots('12');
                        }
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    >
                      <option value="starter">Starter (1 Dépôt · 5 Users)</option>
                      <option value="pro">Pro Business (4 Dépôts · 20 Users)</option>
                      <option value="enterprise">Enterprise (12 Dépôts · 60 Users)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Tarif Souscrit (DH)
                    </label>
                    <input
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Échéance (Date fin)
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Max Dépôts Autorisés
                    </label>
                    <input
                      type="number"
                      value={formMaxDepots}
                      onChange={(e) => setFormMaxDepots(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Max Utilisateurs Autorisés
                    </label>
                    <input
                      type="number"
                      value={formMaxUsers}
                      onChange={(e) => setFormMaxUsers(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              <button type="button" className="button-secondary" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </button>
              <button type="submit" className="button-primary" style={{ background: '#0284c7', borderColor: '#0369a1' }}>
                Créer l’Entreprise &amp; Son Administrateur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 2 : Renouvellement / Modification Formule Contractuelle ── */}
      {editingSubscriptionCompany && (
        <div className="modal-backdrop" onClick={() => setEditingSubscriptionCompany(null)}>
          <form
            className="record-modal"
            onSubmit={handleSaveSubscriptionSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 520, width: '92%', background: '#ffffff', color: '#0f172a', borderRadius: 12, padding: 22, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Crown size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                  Renouveler Formule · {editingSubscriptionCompany.name}
                </h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setEditingSubscriptionCompany(null)} style={{ color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Formule Contractuelle
                  </label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Statut de la Formule
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  >
                    <option value="active">Actif</option>
                    <option value="trial">En Essai (Trial)</option>
                    <option value="expired">Expiré</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Nouvelle Date d'Échéance *
                  </label>
                  <input
                    type="date"
                    required
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Montant de l'Abonnement (DH)
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Quota Max Dépôts
                  </label>
                  <input
                    type="number"
                    value={editMaxDepots}
                    onChange={(e) => setEditMaxDepots(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Quota Max Utilisateurs
                  </label>
                  <input
                    type="number"
                    value={editMaxUsers}
                    onChange={(e) => setEditMaxUsers(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
              <button type="button" className="button-secondary" onClick={() => setEditingSubscriptionCompany(null)}>
                Annuler
              </button>
              <button type="submit" className="button-primary" style={{ background: '#0284c7', borderColor: '#0369a1' }}>
                Enregistrer le Renouvellement
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
