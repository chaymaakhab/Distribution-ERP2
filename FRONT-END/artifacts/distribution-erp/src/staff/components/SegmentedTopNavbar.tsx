import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Menu, ChevronRight, Bell, LogOut, Search, Sun, Moon,
  ArrowLeft, ShieldCheck, Building2, Crown, Zap, Clock,
  CheckCircle2, AlertTriangle, X, LogIn, ChevronDown, Sparkles,
  Layers, User as UserIcon, Calendar, Check,
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useStaffAuth } from '../auth';
import { findModule } from '../nav';
import { formatMoney, type StaffUser, type StaffCompany } from '../api';
import { getErpSearchItems } from './GlobalSearchModal';

interface SegmentedTopNavbarProps {
  user: StaffUser;
  activeSegment: string;
  onNavigate: (segment: string) => void;
  onOpenMobileNav: () => void;
  onOpenSearchModal: () => void;
  topbarSearch: string;
  onTopbarSearchChange: (query: string) => void;
  onOpenNotifications: () => void;
  onOpenLogoutModal: () => void;
  unreadCount: number;
  staffLang: 'fr' | 'ar';
  onToggleLang: (lang: 'fr' | 'ar') => void;
  // SaaS Multi-Société props
  activeCompany?: StaffCompany | null;
  allCompanies?: StaffCompany[];
  onSelectCompany?: (company: StaffCompany | null) => void;
}

export default function SegmentedTopNavbar({
  user,
  activeSegment,
  onNavigate,
  onOpenMobileNav,
  onOpenSearchModal,
  topbarSearch,
  onTopbarSearchChange,
  onOpenNotifications,
  onOpenLogoutModal,
  unreadCount,
  staffLang,
  onToggleLang,
  activeCompany,
  allCompanies = [],
  onSelectCompany,
}: SegmentedTopNavbarProps) {
  const { switchRole } = useStaffAuth();
  const [, setLocation] = useLocation();
  const { isLight, toggleTheme } = useTheme();

  // Search state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Dropdowns state
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const companyMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  const primaryRole = user.roles.find((r) => r.is_primary) ?? user.roles[0];
  const isSuperAdmin = primaryRole?.code === 'superadmin';

  // Company details fallback
  const currentCompany: StaffCompany = activeCompany ?? user.company ?? {
    id: 1,
    code: 'SOC-001',
    name: 'Hercules Distribution Maroc S.A.R.L.',
    brand_name: isSuperAdmin ? 'Groupe Hercules Distribution' : 'Hercules Distribution',
    ice: '002345678000045',
    city: 'Casablanca',
    subscription_plan: 'enterprise',
    subscription_status: 'active',
    subscription_end_date: '2027-08-31',
    days_remaining: 326,
    max_users: 50,
    max_warehouses: 10,
    users_count: 14,
    warehouses_count: 7,
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (companyMenuRef.current && !companyMenuRef.current.contains(e.target as Node)) {
        setCompanyMenuOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const allSearchItems = getErpSearchItems(onNavigate);
  const qClean = topbarSearch.trim().toLowerCase();
  const inlineResults = qClean
    ? allSearchItems.filter(
        (i) =>
          i.title.toLowerCase().includes(qClean) ||
          i.subtitle.toLowerCase().includes(qClean) ||
          (i.badge && i.badge.toLowerCase().includes(qClean))
      ).slice(0, 5)
    : [];

  async function handleSwitchRole(code: string) {
    setRoleMenuOpen(false);
    if (code === primaryRole?.code) return;
    const updated = await switchRole(code);
    setLocation(updated.home);
  }

  // Plan badge styling
  const planBadge = (() => {
    const p = currentCompany.subscription_plan?.toLowerCase();
    if (p === 'enterprise') return { label: 'ENTERPRISE', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.4)', icon: Crown };
    if (p === 'pro') return { label: 'PRO BUSINESS', bg: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', border: 'rgba(2, 132, 199, 0.4)', icon: Zap };
    return { label: 'STARTER', bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.4)', icon: CheckCircle2 };
  })();

  return (
    <header className="topbar sx-segmented-navbar" style={{ padding: '0 14px', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'var(--navy-1)', borderBottom: '1px solid var(--line)' }}>
      {/* ── SEGMENT 1 : Société Active & Sélecteur SaaS Multi-Entreprise ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button className="mobile-trigger icon-button" onClick={onOpenMobileNav} aria-label="Ouvrir le menu">
          <Menu size={19} />
        </button>

        {/* Company Badge with Dropdown for Super Admin */}
        <div style={{ position: 'relative' }} ref={companyMenuRef}>
          <div
            onClick={() => isSuperAdmin && setCompanyMenuOpen(!companyMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 10px',
              borderRadius: 8,
              background: 'var(--navy-2)',
              border: isSuperAdmin ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid var(--line)',
              cursor: isSuperAdmin ? 'pointer' : 'default',
              userSelect: 'none',
              transition: 'all 0.15s ease',
            }}
            title={isSuperAdmin ? 'Cliquez pour basculer entre les sociétés du réseau' : `Société : ${currentCompany.name}`}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: isSuperAdmin ? 'linear-gradient(135deg, #0284c7, #9333ea)' : '#0284c7',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              {currentCompany.code.slice(0, 3)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <b style={{ fontSize: 12, color: 'var(--text)', maxWidth: 170, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentCompany.brand_name || currentCompany.name}
                </b>
                {isSuperAdmin && <ChevronDown size={12} style={{ color: 'var(--muted)' }} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                <span style={{ color: 'var(--muted)' }}>{currentCompany.city}</span>
                <span
                  style={{
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: planBadge.bg,
                    color: planBadge.color,
                    border: `1px solid ${planBadge.border}`,
                    fontWeight: 700,
                    fontSize: 9,
                  }}
                >
                  {planBadge.label}
                </span>
              </div>
            </div>
          </div>

          {/* Super Admin Company Switcher Dropdown */}
          {isSuperAdmin && companyMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                zIndex: 1000,
                width: 320,
                background: '#ffffff',
                color: '#0f172a',
                borderRadius: 10,
                boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
                border: '1px solid #cbd5e1',
                padding: '8px 0',
              }}
            >
              <div style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🏢 Sélecteur de Société &amp; Filiale
                </span>
                <span style={{ fontSize: 10, color: '#0284c7', fontWeight: 600 }}>Multi-Sociétés</span>
              </div>

              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCompany?.(null);
                    setCompanyMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: !activeCompany ? '#f0fdf4' : 'transparent',
                    border: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 12, color: '#0f172a', display: 'block' }}>Vue Globale du Réseau</strong>
                    <span style={{ fontSize: 10.5, color: '#64748b' }}>Supervision consolidée de toutes les sociétés</span>
                  </div>
                  {!activeCompany && <Check size={14} style={{ color: '#16a34a' }} />}
                </button>

                {allCompanies.map((c) => {
                  const isCurrent = activeCompany?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onSelectCompany?.(c);
                        setCompanyMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isCurrent ? '#f0fdf4' : 'transparent',
                        border: 0,
                        borderTop: '1px solid #f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 12, color: '#0f172a', display: 'block' }}>{c.name}</strong>
                        <div style={{ fontSize: 10.5, color: '#64748b', display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                          <span>{c.code}</span>
                          <span>·</span>
                          <span>{c.city}</span>
                          <span>·</span>
                          <span style={{ fontWeight: 700, color: '#0284c7' }}>{c.subscription_plan.toUpperCase()}</span>
                        </div>
                      </div>
                      {isCurrent && <Check size={14} style={{ color: '#16a34a' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SEGMENT 2 : Fil d'Ariane & Espace Actif Cloisonné ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: 'var(--navy-2)',
          borderRadius: 8,
          border: '1px solid var(--line)',
          fontSize: 12,
        }}
        className="hide-mobile"
      >
        {activeSegment !== 'dashboard' && (
          <button
            className="icon-button"
            onClick={() => {
              if (window.history.length > 1) window.history.back();
              else onNavigate('dashboard');
            }}
            title="Page précédente"
            style={{ width: 24, height: 24, borderRadius: 5, marginRight: 2 }}
          >
            <ArrowLeft size={13} />
          </button>
        )}
        <button
          onClick={() => onNavigate('dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            color: activeSegment === 'dashboard' ? '#38bdf8' : 'var(--muted)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {primaryRole?.name ?? 'Tableau de bord'}
        </button>
        {activeSegment !== 'dashboard' && (
          <>
            <ChevronRight size={12} style={{ color: 'var(--muted)' }} />
            <strong style={{ color: 'var(--text)' }}>
              {findModule(activeSegment)?.label ?? activeSegment}
            </strong>
          </>
        )}
      </div>

      {/* ── SEGMENT 3 : Recherche Globale Instantanée (Ctrl + K) ── */}
      <div style={{ flex: 1, maxWidth: 360 }} ref={searchBoxRef}>
        <div className="topbar-search-input-field" style={{ height: 34, padding: '0 10px' }}>
          <Search size={14} style={{ color: '#38bdf8', flex: 'none' }} />
          <input
            type="text"
            value={topbarSearch}
            onChange={(e) => {
              onTopbarSearchChange(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => {
              if (topbarSearch.trim()) setDropdownOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (inlineResults.length > 0) {
                  inlineResults[0].action();
                  setDropdownOpen(false);
                  onTopbarSearchChange('');
                } else {
                  onOpenSearchModal();
                }
              } else if (e.key === 'Escape') {
                setDropdownOpen(false);
              }
            }}
            placeholder="Rechercher (commandes, stocks, clients, livreurs)..."
            style={{ fontSize: 12 }}
          />
          {topbarSearch && (
            <button
              type="button"
              onClick={() => {
                onTopbarSearchChange('');
                setDropdownOpen(false);
              }}
              style={{ background: 'transparent', border: 0, color: 'var(--muted)', cursor: 'pointer', padding: 2 }}
              title="Effacer"
            >
              <X size={12} />
            </button>
          )}
          <kbd
            className="search-kbd"
            onClick={onOpenSearchModal}
            style={{ cursor: 'pointer', fontSize: 10, padding: '1px 5px' }}
            title="Ouvrir la palette de commande (Ctrl + K)"
          >
            Ctrl K
          </kbd>
        </div>

        {/* Dropdown Results */}
        {dropdownOpen && topbarSearch.trim().length > 0 && (
          <div className="topbar-search-dropdown" style={{ top: 40, width: 360 }}>
            <div style={{ padding: '6px 10px', fontSize: 10.5, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)' }}>
              <span>Résultats ({inlineResults.length})</span>
              <span onClick={() => { setDropdownOpen(false); onOpenSearchModal(); }} style={{ color: '#38bdf8', cursor: 'pointer' }}>
                Ouvrir en grand ↗
              </span>
            </div>
            {inlineResults.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>
                Aucun résultat pour « {topbarSearch} »
              </div>
            ) : (
              inlineResults.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="topbar-search-dropdown-item"
                    onClick={() => {
                      item.action();
                      setDropdownOpen(false);
                      onTopbarSearchChange('');
                    }}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: 5, background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'grid', placeItems: 'center' }}>
                      <Icon size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{item.title}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{item.subtitle}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── SEGMENT 4 : Statut Abonnement SaaS en temps réel ── */}
      <div
        onClick={() => setSubscriptionModalOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '4px 10px',
          borderRadius: 8,
          background: 'var(--navy-2)',
          border: '1px solid var(--line)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        className="hide-mobile"
        title="Détails de la formule de la société"
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: currentCompany.days_remaining > 30 ? '#22c55e' : '#f59e0b',
            boxShadow: `0 0 8px ${currentCompany.days_remaining > 30 ? '#22c55e' : '#f59e0b'}`,
          }}
        />
        <div style={{ fontSize: 11 }}>
          <b style={{ color: 'var(--text)', display: 'block', lineHeight: 1.2 }}>
            {isSuperAdmin && !activeCompany ? 'Direction Générale Réseau' : `Formule ${planBadge.label}`}
          </b>
          <span style={{ color: currentCompany.days_remaining > 30 ? '#22c55e' : '#f59e0b', fontSize: 10 }}>
            {currentCompany.days_remaining} jours restants
          </span>
        </div>
      </div>

      {/* ── SEGMENT 5 : Alertes, Notifications & Contrôles Système ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {/* Notifications Bell */}
        <button
          className="icon-button sx-bell"
          onClick={onOpenNotifications}
          aria-label="Notifications & alertes"
          title="Notifications & alertes hiérarchiques"
          style={{ position: 'relative' }}
        >
          <Bell size={16} />
          {unreadCount > 0 && <span className="sx-bell-badge">{unreadCount}</span>}
        </button>

        {/* Multi-role Switcher */}
        {user.roles.length > 1 && (
          <div className="sx-role" ref={roleMenuRef}>
            <button className="sx-role-btn" onClick={() => setRoleMenuOpen(!roleMenuOpen)} style={{ height: 32, fontSize: 11.5 }}>
              <ShieldCheck size={13} />
              <span>{primaryRole?.name}</span>
              <ChevronDown size={11} />
            </button>
            {roleMenuOpen && (
              <div className="sx-role-menu">
                <p className="sx-role-caption">Changer d’espace</p>
                {user.roles.map((r) => (
                  <button
                    key={r.code}
                    className={`sx-role-item ${r.code === primaryRole?.code ? 'active' : ''}`}
                    onClick={() => handleSwitchRole(r.code)}
                  >
                    <span>{r.name}</span>
                    {r.code === primaryRole?.code && <ShieldCheck size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Language Switcher FR / AR */}
        <div className="sx-lang-pill" title="Changer de langue / تغيير اللغة" style={{ height: 32 }}>
          <button
            type="button"
            className={`sx-lang-btn ${staffLang === 'fr' ? 'active' : ''}`}
            onClick={() => onToggleLang('fr')}
          >
            FR
          </button>
          <span className="sx-lang-divider">|</span>
          <button
            type="button"
            className={`sx-lang-btn ${staffLang === 'ar' ? 'active' : ''}`}
            onClick={() => onToggleLang('ar')}
          >
            العربية
          </button>
        </div>

        {/* Theme Toggle */}
        <button className="icon-button" onClick={toggleTheme} title="Basculer Mode Clair / Sombre" style={{ width: 32, height: 32 }}>
          {isLight ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        {/* User Identity & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 2 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 12,
            }}
            title={`${user.name} (${primaryRole?.name})`}
          >
            {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>

          <button
            className="icon-button"
            onClick={onOpenLogoutModal}
            title="Se déconnecter"
            style={{ color: '#ef4444', width: 32, height: 32 }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* ── Modal Détails Abonnement SaaS ── */}
      {subscriptionModalOpen && (
        <div className="modal-backdrop" onClick={() => setSubscriptionModalOpen(false)}>
          <div
            className="record-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 500, width: '92%', background: '#ffffff', color: '#0f172a', borderRadius: 12, padding: 22, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Crown size={20} style={{ color: '#9333ea' }} />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  Formule &amp; Quotas · {currentCompany.brand_name || currentCompany.name}
                </h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setSubscriptionModalOpen(false)} style={{ color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Formule active :</span>
                  <strong style={{ fontSize: 12, color: '#0284c7', textTransform: 'uppercase' }}>
                    Pack {currentCompany.subscription_plan}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Statut :</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: '#dcfce7', color: '#16a34a' }}>
                    {currentCompany.subscription_status === 'active' ? '🟢 Actif' : currentCompany.subscription_status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Validité jusqu’au :</span>
                  <strong style={{ fontSize: 12, color: '#0f172a' }}>
                    {currentCompany.subscription_end_date ?? 'Indéterminée'} ({currentCompany.days_remaining} jours)
                  </strong>
                </div>
              </div>

              {/* Quotas & Utilisation */}
              <div>
                <b style={{ fontSize: 12, color: '#334155', display: 'block', marginBottom: 8 }}>
                  Consommation des Quotas Inclus :
                </b>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
                    <span>Dépôts logistiques :</span>
                    <strong>{currentCompany.warehouses_count ?? 1} / {currentCompany.max_warehouses} autorisés</strong>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, ((currentCompany.warehouses_count ?? 1) / currentCompany.max_warehouses) * 100)}%`,
                        background: '#0284c7',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 3 }}>
                    <span>Comptes utilisateurs &amp; commerciaux :</span>
                    <strong>{currentCompany.users_count ?? 5} / {currentCompany.max_users} autorisés</strong>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, ((currentCompany.users_count ?? 5) / currentCompany.max_users) * 100)}%`,
                        background: '#9333ea',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', background: '#f1f5f9', padding: '8px 10px', borderRadius: 6 }}>
                💡 Pour étendre les quotas de dépôts ou d'utilisateurs de cette société, contactez la Direction Générale.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" className="button-secondary" onClick={() => setSubscriptionModalOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
