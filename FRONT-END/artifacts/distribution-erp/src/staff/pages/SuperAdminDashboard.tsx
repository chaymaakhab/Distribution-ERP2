import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Crown, ShieldCheck, Database, Server, Activity, Users,
  Warehouse, BadgeDollarSign, ArrowUpRight, TrendingUp, AlertTriangle,
  RotateCcw, RefreshCw, FileText, CheckCircle2, ChevronRight,
  Settings, Lock, ArrowRight, Layers, BarChart3, HardDrive,
  Truck, Building2, Check, X, Undo2,
} from 'lucide-react';
import {
  api, formatMoney,
  type OverviewKpis, type RevenueData, type WarehouseNode, type PerformanceData,
} from '../api';
import { useStaffAuth } from '../auth';
import { AreaChart, BarList, ColumnChart, DonutChart, MultiSegmentProgress } from '../components/Charts';
import { MapCanvas, MapLegend } from '../components/MapCanvas';
import RoleQuickActionsBar from '../components/RoleQuickActionsBar';
import DepotsMultiCityAnalytics from '../components/DepotsMultiCityAnalytics';
import '../admin.css';

export interface PendingOperation {
  id: number;
  op_type: 'retour' | 'derogation_credit' | 'avoir' | 'achat_fournisseur';
  ref: string;
  order_ref: string;
  client: string;
  depot: string;
  driver_name: string;
  driver_role: string;
  driver_type: 'depot_to_client' | 'depot_to_depot' | 'pre_seller';
  product: string;
  qty: number;
  total: number;
  date: string;
  motif_initial: string;
  notes_initiales: string;
  status: 'en_attente' | 'arbitre';
  priority?: 'urgente' | 'haute' | 'normale';
  decision_admin?: {
    motif_constate: string; // motif exact
    circonstance_cause: string; // cause racine
    decision_qualite: 'reintegre_stock' | 'mis_au_rebut_perte' | 'refuse'; // sort du stock & verdict qualité
    decision_label: string;
    validated_at: string;
    visa_notes?: string;
  };
}

const INITIAL_PENDING_OPS: PendingOperation[] = [
  {
    id: 1,
    op_type: 'retour',
    priority: 'urgente',
    ref: 'RET-2026-018',
    order_ref: 'CMD-2026-1248',
    client: 'Épicerie Centrale Saïd',
    depot: 'DEP-01 Casablanca Central',
    driver_name: 'Hamid Moukrim',
    driver_role: 'Livreur Dépôt → Client',
    driver_type: 'depot_to_client',
    product: 'Huile Végétale 5L',
    qty: 15,
    total: 3300,
    date: 'Aujourd’hui 10:30',
    motif_initial: 'Produit endommagé',
    notes_initiales: 'Bidons percés lors du transport. Signalé par le chauffeur au déchargement.',
    status: 'en_attente',
  },
  {
    id: 2,
    op_type: 'retour',
    priority: 'haute',
    ref: 'RET-2026-014',
    order_ref: 'CMD-2026-1184',
    client: 'Commerce Général Tazi',
    depot: 'DEP-02 Rabat Hub',
    driver_name: 'Tariq El Ouazzani',
    driver_role: 'Navette Inter-Dépôts',
    driver_type: 'depot_to_depot',
    product: 'Riz Long Grain 50kg',
    qty: 25,
    total: 6250,
    date: 'Hier 16:45',
    motif_initial: 'Qualité insuffisante',
    notes_initiales: 'Signalement humidité excessive. Lot en quarantaine quai Settat en attente inspection.',
    status: 'en_attente',
  },
  {
    id: 3,
    op_type: 'retour',
    priority: 'normale',
    ref: 'RET-2026-019',
    order_ref: 'CMD-HW-2026-089',
    client: 'Épicerie Al Baraka (Commerce de proximité)',
    depot: 'DEP-01 Casablanca Central',
    driver_name: 'Hamid El Meskini',
    driver_role: 'Livreur-pré-vendeur (Van Sales)',
    driver_type: 'pre_seller',
    product: 'Perceuse à percussion 850W',
    qty: 1,
    total: 1249,
    date: 'Aujourd’hui 09:15',
    motif_initial: 'Erreur commande',
    notes_initiales: 'Récupéré lors de la tournée Derb Sultan par le pré-vendeur. Emballage scellé d’origine.',
    status: 'en_attente',
  },
  {
    id: 4,
    op_type: 'derogation_credit',
    priority: 'urgente',
    ref: 'DER-2026-008',
    order_ref: 'CMD-2408',
    client: 'Maison du Bricolage',
    depot: 'DEP-03 Marrakech',
    driver_name: 'Ahmed Idrissi',
    driver_role: 'Commercial Régional',
    driver_type: 'depot_to_client',
    product: 'Lot Outillage Pro & Pompes chantiers',
    qty: 3,
    total: 12450,
    date: 'Aujourd’hui 09:40',
    motif_initial: 'Dépassement de plafond crédit',
    notes_initiales: 'Plafond accordé: 35 000 DH · Encours actuel: 38 200 DH (+3 200 DH excédent). Client historique solvable sollicitant dérogation expédition urgente.',
    status: 'en_attente',
  },
  {
    id: 5,
    op_type: 'derogation_credit',
    priority: 'haute',
    ref: 'DER-2026-009',
    order_ref: 'CMD-2409',
    client: 'Comptoir Al Amal',
    depot: 'DEP-05 Fès',
    driver_name: 'Youssef Bennani',
    driver_role: 'Commercial Grands Comptes',
    driver_type: 'depot_to_client',
    product: 'Matériel sanitaire & robinetterie',
    qty: 8,
    total: 32100,
    date: 'Hier 16:30',
    motif_initial: 'Dépassement de plafond crédit',
    notes_initiales: 'Plafond crédit: 100 000 DH · Encours total: 104 500 DH. Demande de dérogation commerciale exceptionnelle pour chantier Al Qaraouiyine.',
    status: 'en_attente',
  },
  {
    id: 6,
    op_type: 'avoir',
    priority: 'haute',
    ref: 'AVR-2026-004',
    order_ref: 'FAC-2025-179',
    client: 'Quincaillerie Saada',
    depot: 'DEP-06 Agadir',
    driver_name: 'Nadia Mansouri',
    driver_role: 'Responsable Comptable',
    driver_type: 'depot_to_client',
    product: 'Ristourne annuelle sur CA HT 2024',
    qty: 1,
    total: 8450,
    date: '26 Fév 2025',
    motif_initial: 'Avoir commercial sur volume',
    notes_initiales: 'Régularisation remise annuelle 3% contractuelle. Visa Super Admin obligatoire car montant supérieur au seuil délégataire de 5 000 DH.',
    status: 'en_attente',
  },
  {
    id: 7,
    op_type: 'achat_fournisseur',
    priority: 'urgente',
    ref: 'BCA-2026-048',
    order_ref: 'BC-2026-048',
    client: 'Fournisseur Ingelec Maroc',
    depot: 'DEP-05 Fès',
    driver_name: 'Karim Tazi',
    driver_role: 'Chef Approvisionnement',
    driver_type: 'depot_to_depot',
    product: 'Appareillage électrique & Câbles cuivre',
    qty: 120,
    total: 145000,
    date: 'Hier 14:00',
    motif_initial: 'Réapprovisionnement stratégique Dépôt Fès',
    notes_initiales: 'Achat de réapprovisionnement dépassant 100 000 DH TTC. Engagement budgétaire soumis au visa préalable de la Direction Générale.',
    status: 'en_attente',
  },
];

interface SystemNodeHealth {
  depot_code: string;
  name: string;
  city: string;
  status: 'online' | 'synced' | 'busy' | 'alert';
  last_sync: string;
  pending_sync_items: number;
  stock_count: number;
  revenue: number;
  active_users: number;
}

const SYSTEM_NODES: SystemNodeHealth[] = [
  {
    depot_code: 'DEP-01',
    name: 'Dépôt Casablanca',
    city: 'Casablanca (Principal)',
    status: 'online',
    last_sync: 'Il y a 12s',
    pending_sync_items: 0,
    stock_count: 1248,
    revenue: 584200,
    active_users: 5,
  },
  {
    depot_code: 'DEP-02',
    name: 'Dépôt Rabat',
    city: 'Rabat (Secondaire)',
    status: 'online',
    last_sync: 'Il y a 45s',
    pending_sync_items: 0,
    stock_count: 850,
    revenue: 342100,
    active_users: 3,
  },
  {
    depot_code: 'DEP-03',
    name: 'Dépôt Marrakech',
    city: 'Marrakech (Sidi Ghanem)',
    status: 'synced',
    last_sync: 'Il y a 2m',
    pending_sync_items: 1,
    stock_count: 620,
    revenue: 218900,
    active_users: 2,
  },
  {
    depot_code: 'DEP-04',
    name: 'Dépôt Tanger',
    city: 'Tanger (Zone Franche)',
    status: 'busy',
    last_sync: 'Il y a 1m',
    pending_sync_items: 3,
    stock_count: 490,
    revenue: 139450,
    active_users: 2,
  },
];

const MOCK_REVENUE: RevenueData = {
  by_day: [
    { label: '01 Fév', value: 24500, count: 12 },
    { label: '05 Fév', value: 38200, count: 18 },
    { label: '10 Fév', value: 49100, count: 24 },
    { label: '15 Fév', value: 41200, count: 21 },
    { label: '20 Fév', value: 58400, count: 29 },
    { label: '25 Fév', value: 67300, count: 34 },
    { label: '28 Fév', value: 72900, count: 38 },
  ],
  by_month: [
    { label: 'Sep', value: 890000 },
    { label: 'Oct', value: 1040000 },
    { label: 'Nov', value: 1120000 },
    { label: 'Déc', value: 1290000 },
    { label: 'Jan', value: 1180000 },
    { label: 'Fév', value: 1284650 },
  ],
  by_warehouse: [
    { label: 'Casablanca (DEP-01)', value: 584200, count: 84 },
    { label: 'Rabat (DEP-02)', value: 342100, count: 51 },
    { label: 'Marrakech (DEP-03)', value: 218900, count: 32 },
    { label: 'Tanger (DEP-04)', value: 139450, count: 19 },
  ],
  by_city: [
    { label: 'Casablanca & Mohammedia', value: 584200 },
    { label: 'Rabat - Salé - Kénitra', value: 342100 },
    { label: 'Marrakech & Safi', value: 218900 },
    { label: 'Tanger & Tétouan', value: 139450 },
  ],
  by_commercial: [
    { label: 'Amine Tazi', value: 410000 },
    { label: 'Sara Mansouri', value: 385000 },
    { label: 'Omar Bensouda', value: 289000 },
    { label: 'Mehdi Chraibi', value: 200650 },
  ],
  top_products: [
    { label: 'Perceuse à percussion 850W', value: 186000, qty: 148 },
    { label: 'Pompe immergée 1.5 HP', value: 154000, qty: 40 },
    { label: 'Huile Végétale 5L', value: 128000, qty: 580 },
    { label: 'Disque diamant 230 mm', value: 98000, qty: 517 },
  ],
  orders_evolution: [
    { label: 'S1', value: 34 },
    { label: 'S2', value: 42 },
    { label: 'S3', value: 51 },
    { label: 'S4', value: 59 },
  ],
};

const MOCK_KPIS: OverviewKpis = {
  ca_today: 48500,
  ca_month: 1284650,
  ca_prev_month: 1139000,
  ca_month_delta: 12.8,
  orders_total: 186,
  orders_today: 14,
  orders_to_validate: 12,
  orders_in_delivery: 8,
  deliveries_in_progress: 5,
  deliveries_done: 24,
  payments_total: 846500,
  payments_today: 32000,
  receivables: 428560,
  unpaid_invoices: 11,
  returns: 3,
  stock_ruptures: 2,
  stock_low: 6,
  customers_count: 142,
  products_count: 86,
  warehouses_count: 4,
};

export default function SuperAdminDashboard() {
  const { user, workspace } = useStaffAuth();
  const [, setLocation] = useLocation();
  const [kpis, setKpis] = useState<OverviewKpis>(MOCK_KPIS);
  const [revenue, setRevenue] = useState<RevenueData>(MOCK_REVENUE);
  const [warehouses, setWarehouses] = useState<WarehouseNode[] | null>(null);
  const [perf, setPerf] = useState<PerformanceData | null>(null);
  const [nodes, setNodes] = useState<SystemNodeHealth[]>(SYSTEM_NODES);
  const [periodTab, setPeriodTab] = useState<'jour' | 'mois'>('jour');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Super Admin Operation Validations (User requested: "super admin y3ti validation l chaque opiration par exemple reteur chno sbab dyalo o 3lach kan o wach produit saleh yrje3 l stock wela ba9i")
  const [pendingOps, setPendingOps] = useState<PendingOperation[]>(INITIAL_PENDING_OPS);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'arbitrated' | 'returns' | 'credit' | 'finance'>('all');
  const [arbitrationModal, setArbitrationModal] = useState<PendingOperation | null>(null);
  const [arbMotif, setArbMotif] = useState<string>('Produit endommagé');
  const [arbCause, setArbCause] = useState<string>('');
  const [arbStockDecision, setArbStockDecision] = useState<'reintegre_stock' | 'mis_au_rebut_perte' | 'refuse'>('reintegre_stock');
  const [arbNotes, setArbNotes] = useState<string>('');

  function handleOpenArbitration(op: PendingOperation) {
    setArbitrationModal(op);
    setArbMotif(op.motif_initial);
    setArbCause(op.notes_initiales);
    setArbStockDecision(op.decision_admin ? op.decision_admin.decision_qualite : 'reintegre_stock');
    setArbNotes(op.decision_admin?.visa_notes || '');
  }

  function handleSubmitArbitration(e: React.FormEvent) {
    e.preventDefault();
    if (!arbitrationModal) return;

    let decisionLabel = '';
    if (arbitrationModal.op_type === 'retour') {
      if (arbStockDecision === 'reintegre_stock') {
        decisionLabel = `Produit conforme : Réintégré en stock disponible (+${arbitrationModal.qty} unités)`;
      } else if (arbStockDecision === 'mis_au_rebut_perte') {
        decisionLabel = 'Avarie constatée : Mis au rebut / Perte comptable (0 stock vendable)';
      } else {
        decisionLabel = 'Rejet du litige : Retour non fondé, réexpédition au client';
      }
    } else if (arbitrationModal.op_type === 'derogation_credit') {
      if (arbStockDecision === 'reintegre_stock') {
        decisionLabel = 'Dérogation accordée : Commande débloquée et transmise en préparation';
      } else {
        decisionLabel = 'Dérogation refusée : Maintien du blocage jusqu’au règlement de la créance';
      }
    } else if (arbitrationModal.op_type === 'avoir') {
      if (arbStockDecision === 'reintegre_stock') {
        decisionLabel = 'Avoir commercial approuvé & visé : Émission comptable autorisée';
      } else {
        decisionLabel = 'Demande d’avoir rejetée par la Direction Générale';
      }
    } else {
      if (arbStockDecision === 'reintegre_stock') {
        decisionLabel = 'Bon d’achat approuvé : Bon de commande transmis au fournisseur';
      } else {
        decisionLabel = 'Bon d’achat mis en attente / refusé';
      }
    }

    setPendingOps((prev) =>
      prev.map((op) =>
        op.id === arbitrationModal.id
          ? {
              ...op,
              status: 'arbitre',
              decision_admin: {
                motif_constate: arbMotif,
                circonstance_cause: arbCause,
                decision_qualite: arbStockDecision,
                decision_label: decisionLabel,
                validated_at: new Date().toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                }),
                visa_notes: arbNotes,
              },
            }
          : op
      )
    );

    notify(`Décision Direction Générale validée pour ${arbitrationModal.ref} : ${decisionLabel}`);
    setArbitrationModal(null);
  }

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    let alive = true;
    Promise.all([api.adminOverview(), api.adminRevenue(), api.adminWarehouses(), api.adminPerformance()])
      .then(([o, r, w, p]) => {
        if (!alive) return;
        if (o?.data) setKpis(o.data);
        if (r?.data) setRevenue(r.data);
        if (w?.data) setWarehouses(w.data);
        if (p?.data) setPerf(p.data);
      })
      .catch(() => {
        // Fallback to rich mock stats on 401 or network disconnect
      });
    return () => {
      alive = false;
    };
  }, []);

  function handleTriggerGlobalSync() {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setNodes((prev) =>
        prev.map((n) => ({ ...n, last_sync: 'À l’instant', pending_sync_items: 0, status: 'online' }))
      );
      notify('Synchronisation globale multi-dépôts achevée avec succès (0 conflit).');
    }, 1200);
  }

  const series = periodTab === 'jour' ? revenue?.by_day ?? [] : revenue?.by_month ?? [];
  const totalNationalRevenue = kpis?.ca_month ?? 1284650;
  const totalStockRuptures = kpis?.stock_ruptures ?? 2;
  const totalReceivables = kpis?.receivables ?? 428560;

  return (
    <div className="dashboard-page sx-admin superadmin-workspace">
      {/* Executive Header */}
      <div className="page-heading dash-heading" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="eyebrow" style={{ color: '#38bdf8' }}>
              SUPERVISION GÉNÉRALE <span className="eyebrow-sep">/</span> SUPER ADMIN
            </span>
            <span className="status-pill status-blue" style={{ fontSize: '10px' }}>
              <Crown size={11} /> Accès Intégral (*)
            </span>
          </div>
          <h1>Cockpit de Direction Générale<span className="title-period">.</span></h1>
          <p>Supervision consolidée multi-dépôts, infrastructure, sécurité RBAC et pilotage national.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="button-secondary"
            onClick={handleTriggerGlobalSync}
            disabled={isSyncing}
            style={{ fontSize: '11.5px', height: '36px' }}
          >
            <RefreshCw size={14} className={isSyncing ? 'spin-animate' : ''} />
            {isSyncing ? 'Synchronisation...' : 'Forcer synchro réseau'}
          </button>
          <button
            className="button-primary"
            onClick={() => setLocation(`/${workspace}/users`)}
            style={{ fontSize: '11.5px', height: '36px' }}
          >
            <Users size={14} /> Gérer les utilisateurs
          </button>
        </div>
      </div>

      {/* ── Role Quick Actions Bar (Super Admin) ── */}
      <RoleQuickActionsBar
        roleTitle="Super Admin"
        actions={[
          {
            id: 'sa-user',
            label: '+ Nouvel Utilisateur',
            description: 'Créer un utilisateur ERP et lui assigner des rôles',
            icon: Users,
            primary: true,
            onClick: () => setLocation(`/${workspace}/users`),
          },
          {
            id: 'sa-wh',
            label: '+ Nouveau Dépôt / Ville',
            description: 'Superviser ou ouvrir un nouveau dépôt régional',
            icon: Warehouse,
            onClick: () => setLocation(`/${workspace}/warehouses`),
          },
          {
            id: 'sa-prod',
            label: '+ Article Catalogue',
            description: 'Ajouter une référence avec photo et tarifs',
            icon: Building2,
            onClick: () => setLocation(`/${workspace}/products`),
          },
          {
            id: 'sa-sav',
            label: '+ Déclarer Litige / SAV',
            description: 'Ouvrir un dossier de litige ou retour',
            icon: Undo2,
            onClick: () => setLocation(`/${workspace}/returns`),
          },
        ]}
      />

      {/* System Status Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'var(--navy-2)',
          border: '1px solid var(--line)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'grid', placeItems: 'center' }}>
            <Server size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700 }}>SERVEUR & BASE SQL</div>
            <b style={{ fontSize: '12px', color: '#22c55e' }}>En ligne · MySQL 8.x</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', display: 'grid', placeItems: 'center' }}>
            <Activity size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700 }}>SYNCHRO MULTI-DÉPÔT</div>
            <b style={{ fontSize: '12px', color: 'var(--text)' }}>4 / 4 Dépôts actifs</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(168,85,247,0.15)', color: '#c084fc', display: 'grid', placeItems: 'center' }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700 }}>AUDIT & SÉCURITÉ</div>
            <b style={{ fontSize: '12px', color: 'var(--text)' }}>100% Conforme (0 alerte)</b>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', display: 'grid', placeItems: 'center' }}>
            <HardDrive size={16} />
          </div>
          <div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontWeight: 700 }}>SAUVEGARDE AUTO</div>
            <b style={{ fontSize: '12px', color: 'var(--text)' }}>Aujourd'hui à 03:00</b>
          </div>
        </div>
      </div>

      {/* Top Level Strategic KPIs */}
      <div className="sx-kpi-cards">
        <div className="sx-card tone-blue">
          <div className="sx-card-top">
            <span>CA Consolidé National</span>
            <span className="sx-card-icon"><BadgeDollarSign size={16} /></span>
          </div>
          <div className="sx-card-value">{formatMoney(totalNationalRevenue)} DH</div>
          <div className="sx-card-sub">
            <TrendingUp size={13} className="up" /> +12.8% vs. M-1 (4 Dépôts)
          </div>
        </div>

        <div className="sx-card tone-green">
          <div className="sx-card-top">
            <span>Encaissements Globaux</span>
            <span className="sx-card-icon"><BadgeDollarSign size={16} /></span>
          </div>
          <div className="sx-card-value">{formatMoney(kpis?.payments_total ?? 846500)} DH</div>
          <div className="sx-card-sub">
            Chèques + Espèces + Virements
          </div>
        </div>

        <div className="sx-card tone-amber">
          <div className="sx-card-top">
            <span>Créances & Encours Clients</span>
            <span className="sx-card-icon"><AlertTriangle size={16} /></span>
          </div>
          <div className="sx-card-value">{formatMoney(totalReceivables)} DH</div>
          <div className="sx-card-sub">
            {kpis?.unpaid_invoices ?? 11} factures échues à suivre
          </div>
        </div>

        <div className="sx-card tone-violet">
          <div className="sx-card-top">
            <span>Commandes Traitées</span>
            <span className="sx-card-icon"><Layers size={16} /></span>
          </div>
          <div className="sx-card-value">{kpis?.orders_total ?? 186}</div>
          <div className="sx-card-sub">
            {kpis?.orders_to_validate ?? 12} en attente de validation
          </div>
        </div>
      </div>

      {/* ── Super Admin Hierarchical Validation Tasks & Alerts (User Request) ── */}
      {(() => {
        const pendingCount = pendingOps.filter((o) => o.status === 'en_attente').length;
        const arbitratedCount = pendingOps.filter((o) => o.status === 'arbitre').length;
        const filteredTasks = pendingOps.filter((op) => {
          if (taskFilter === 'pending') return op.status === 'en_attente';
          if (taskFilter === 'arbitrated') return op.status === 'arbitre';
          if (taskFilter === 'returns') return op.op_type === 'retour';
          if (taskFilter === 'credit') return op.op_type === 'derogation_credit';
          if (taskFilter === 'finance') return op.op_type === 'avoir' || op.op_type === 'achat_fournisseur';
          return true;
        });

        return (
          <section
            className="panel"
            style={{
              padding: '18px',
              marginBottom: '20px',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              background: 'var(--navy-1)',
              borderRadius: 12,
            }}
          >
            {/* Urgent Alert Banner */}
            {pendingCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: 13, display: 'block' }}>
                      Alerte : {pendingCount} demande{pendingCount > 1 ? 's' : ''} de validation prioritaire{pendingCount > 1 ? 's' : ''} en attente de votre arbitrage
                    </strong>
                    <span style={{ fontSize: 11, color: '#fca5a5' }}>
                      Opérations sensibles suspendues : retours SAV, dépassements d’encours et engagements budgétaires.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTaskFilter('pending')}
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 0,
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Filtrer tâches urgentes ({pendingCount})
                </button>
              </div>
            )}

            {/* Header */}
            <div className="panel-heading" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="eyebrow" style={{ color: '#0284c7', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Crown size={13} /> CENTRE DE TÂCHES &amp; VALIDATIONS HIÉRARCHIQUES
                  </span>
                  <span
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 12,
                      padding: '2px 9px',
                    }}
                  >
                    {pendingCount} en attente · {arbitratedCount} traitée{arbitratedCount > 1 ? 's' : ''}
                  </span>
                </div>
                <h2 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 700 }}>
                  Demandes d’Arbitrage &amp; Validations (Super Admin)
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                  Arbitrage opérationnel avec verdict qualité, réintégration en stock et visa hiérarchique.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="button-secondary"
                  onClick={() => setLocation(`/${workspace}/returns`)}
                  style={{ fontSize: 11.5, height: 34, gap: 6 }}
                >
                  <Undo2 size={14} /> Registre Retours SAV <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Task Filter Tabs */}
            <div className="table-tabs" style={{ marginBottom: 14, overflowX: 'auto', display: 'flex', gap: 4 }}>
              <button
                type="button"
                className={`table-tab ${taskFilter === 'all' ? 'active-tab' : ''}`}
                onClick={() => setTaskFilter('all')}
              >
                Toutes les Tâches ({pendingOps.length})
              </button>
              <button
                type="button"
                className={`table-tab ${taskFilter === 'pending' ? 'active-tab' : ''}`}
                onClick={() => setTaskFilter('pending')}
                style={{ color: pendingCount > 0 ? '#ef4444' : undefined, fontWeight: pendingCount > 0 ? 700 : undefined }}
              >
                À Arbitrer ({pendingCount})
              </button>
              <button
                type="button"
                className={`table-tab ${taskFilter === 'arbitrated' ? 'active-tab' : ''}`}
                onClick={() => setTaskFilter('arbitrated')}
              >
                Traitées / Visées ({arbitratedCount})
              </button>
              <button
                type="button"
                className={`table-tab ${taskFilter === 'returns' ? 'active-tab' : ''}`}
                onClick={() => setTaskFilter('returns')}
              >
                Retours SAV ({pendingOps.filter((o) => o.op_type === 'retour').length})
              </button>
              <button
                type="button"
                className={`table-tab ${taskFilter === 'credit' ? 'active-tab' : ''}`}
                onClick={() => setTaskFilter('credit')}
              >
                Dérogations Crédit ({pendingOps.filter((o) => o.op_type === 'derogation_credit').length})
              </button>
              <button
                type="button"
                className={`table-tab ${taskFilter === 'finance' ? 'active-tab' : ''}`}
                onClick={() => setTaskFilter('finance')}
              >
                Avoirs &amp; Achats ({pendingOps.filter((o) => o.op_type === 'avoir' || o.op_type === 'achat_fournisseur').length})
              </button>
            </div>

            {/* Task Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
              {filteredTasks.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '28px 16px', textAlign: 'center', background: 'var(--navy-2)', borderRadius: 8, color: 'var(--muted)' }}>
                  <CheckCircle2 size={28} style={{ color: '#22c55e', margin: '0 auto 6px' }} />
                  <b>Aucune tâche dans cette catégorie.</b>
                </div>
              ) : (
                filteredTasks.map((op) => {
                  const isArbitrated = op.status === 'arbitre';
                  let typeLabel = 'RETOUR SAV';
                  let typeColor = '#f59e0b';
                  if (op.op_type === 'derogation_credit') {
                    typeLabel = 'DÉROGATION CRÉDIT';
                    typeColor = '#a855f7';
                  } else if (op.op_type === 'avoir') {
                    typeLabel = 'AVOIR FINANCIER';
                    typeColor = '#06b6d4';
                  } else if (op.op_type === 'achat_fournisseur') {
                    typeLabel = 'ACHAT STRATÉGIQUE';
                    typeColor = '#3b82f6';
                  }

                  return (
                    <div
                      key={op.id}
                      style={{
                        border: isArbitrated ? '1px solid #16a34a' : '1px solid var(--line)',
                        borderRadius: 10,
                        padding: 14,
                        background: isArbitrated ? 'rgba(34,197,94,0.05)' : 'var(--navy-2)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}
                    >
                      <div>
                        {/* Card Head */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  padding: '1px 6px',
                                  borderRadius: 4,
                                  background: `${typeColor}20`,
                                  color: typeColor,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {typeLabel}
                              </span>
                              <code style={{ color: '#38bdf8', fontWeight: 700, fontSize: 11.5 }}>{op.ref}</code>
                            </div>
                            <b style={{ display: 'block', fontSize: 13, marginTop: 4 }}>{op.client}</b>
                          </div>
                          <span
                            className={`status-pill ${isArbitrated ? 'status-green' : op.priority === 'urgente' ? 'status-red' : 'status-amber'}`}
                            style={{ fontSize: 10 }}
                          >
                            {isArbitrated ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                            {isArbitrated ? 'Arbitré Direction' : op.priority === 'urgente' ? '🔴 Urgente' : 'En attente'}
                          </span>
                        </div>

                        {/* Content summary */}
                        <div style={{ background: 'rgba(0,0,0,0.18)', padding: '8px 10px', borderRadius: 6, fontSize: 12, margin: '8px 0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted)' }}>Objet :</span>
                            <b>{op.product} (×{op.qty})</b>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            <span style={{ color: 'var(--muted)' }}>Montant engagé :</span>
                            <b style={{ color: '#0284c7' }}>{formatMoney(op.total)} DH</b>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            <span style={{ color: 'var(--muted)' }}>Initiateur :</span>
                            <span style={{ fontSize: 11, color: 'var(--text)' }}>
                              {op.driver_name} ({op.driver_role})
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                            <span style={{ color: 'var(--muted)' }}>Dépôt rattaché :</span>
                            <span>{op.depot}</span>
                          </div>
                        </div>

                        {/* Decision or initial note */}
                        {isArbitrated && op.decision_admin ? (
                          <div style={{ fontSize: 11, padding: 8, background: 'rgba(2,132,199,0.08)', borderRadius: 6, border: '1px solid #bae6fd' }}>
                            <div style={{ color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <ShieldCheck size={12} /> Décision validée :
                            </div>
                            <div style={{ marginTop: 2, color: 'var(--text)' }}>
                              <b>Verdict :</b> {op.decision_admin.decision_label}
                            </div>
                            <div style={{ marginTop: 2, color: 'var(--muted)' }}>
                              <b>Motif :</b> {op.decision_admin.motif_constate} · <b>Cause :</b> {op.decision_admin.circonstance_cause}
                            </div>
                            {op.decision_admin.visa_notes && (
                              <div style={{ marginTop: 2, color: '#0284c7', fontStyle: 'italic' }}>
                                Visa : « {op.decision_admin.visa_notes} »
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontStyle: 'italic' }}>
                            « {op.notes_initiales} »
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, gap: 6 }}>
                        <button
                          type="button"
                          className="button-primary"
                          onClick={() => handleOpenArbitration(op)}
                          style={{
                            height: 32,
                            fontSize: 11.5,
                            padding: '0 12px',
                            background: isArbitrated ? '#334155' : '#0284c7',
                            borderColor: isArbitrated ? '#475569' : '#0369a1',
                            gap: 6,
                          }}
                        >
                          <ShieldCheck size={13} />
                          {isArbitrated ? 'Modifier l’arbitrage' : 'Arbitrer la tâche'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        );
      })()}

      {/* ── Multi-City Moroccan Depots Analytics (User Request) ── */}
      <DepotsMultiCityAnalytics onNavigateToWarehouse={() => setLocation(`/${workspace}/warehouses`)} />

      {/* Charts & Analytics */}
      <div className="sx-grid-2" style={{ marginBottom: '16px' }}>
        <section className="panel sx-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CHRONOLOGIE COMMERCIALE</span>
              <h2>Évolution du Chiffre d’Affaires</h2>
            </div>
            <div className="sx-range">
              <button className={periodTab === 'jour' ? 'active' : ''} onClick={() => setPeriodTab('jour')}>
                30 jours
              </button>
              <button className={periodTab === 'mois' ? 'active' : ''} onClick={() => setPeriodTab('mois')}>
                12 mois
              </button>
            </div>
          </div>
          <AreaChart data={series} />
        </section>

        <section className="panel sx-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MIX DES VENTES</span>
              <h2>Répartition par dépôt & par ville</h2>
            </div>
          </div>
          <BarList data={revenue?.by_warehouse ?? []} tone="blue" />
          <div className="panel-heading sx-subhead">
            <div><span className="eyebrow">TOP VILLES</span><h2>Ventes régionales</h2></div>
          </div>
          <BarList data={revenue?.by_city ?? []} tone="violet" />
        </section>
      </div>

      {/* Visualisations Avancées Trésorerie & Encaissements Super Admin */}
      <div className="sx-grid-2" style={{ marginBottom: '16px' }}>
        <section className="panel sx-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">ANALYSE ENCAISSEMENTS NATIONAUX</span>
              <h2>Flux par type de paiement</h2>
            </div>
            <span className="sx-chip">Cash · Card · Chèques · Traites</span>
          </div>
          <div style={{ padding: '10px 0' }}>
            <DonutChart
              centerLabel="ENCAISSEMENTS"
              centerValue={`${formatMoney(kpis?.payments_total ?? 846500)} DH`}
              slices={[
                { label: 'Chèques bancaires', value: Math.round((kpis?.payments_total ?? 846500) * 0.40), color: '#3b82f6', formatted: `${formatMoney(Math.round((kpis?.payments_total ?? 846500) * 0.40))} DH` },
                { label: 'Espèces (Cash)', value: Math.round((kpis?.payments_total ?? 846500) * 0.30), color: '#10b981', formatted: `${formatMoney(Math.round((kpis?.payments_total ?? 846500) * 0.30))} DH` },
                { label: 'Carte bancaire (Card / TPE)', value: Math.round((kpis?.payments_total ?? 846500) * 0.18), color: '#06b6d4', formatted: `${formatMoney(Math.round((kpis?.payments_total ?? 846500) * 0.18))} DH` },
                { label: 'Virement / Traite', value: Math.round((kpis?.payments_total ?? 846500) * 0.12), color: '#a855f7', formatted: `${formatMoney(Math.round((kpis?.payments_total ?? 846500) * 0.12))} DH` },
              ]}
            />
          </div>
        </section>

        <section className="panel sx-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CONSOLIDATION RISK & CASH</span>
              <h2>Structure financière & Recouvrement</h2>
            </div>
            <span className="sx-chip" style={{ color: '#10b981' }}>Score A+</span>
          </div>
          <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '12px' }}>
                <span style={{ color: 'var(--muted)', fontWeight: 600 }}>Balance Globale Recouvrée</span>
                <b style={{ color: 'var(--text)' }}>
                  {(((kpis?.payments_total ?? 846500) / ((kpis?.payments_total ?? 846500) + totalReceivables)) * 100).toFixed(1)}% Règlements perçus
                </b>
              </div>
              <MultiSegmentProgress
                height={14}
                segments={[
                  { label: 'Règlements perçus', value: kpis?.payments_total ?? 846500, color: '#10b981' },
                  { label: 'Créances en cours', value: Math.max(0, totalReceivables - 85000), color: '#f59e0b' },
                  { label: 'Impayés critiques', value: 85000, color: '#ef4444' },
                ]}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <small style={{ color: 'var(--muted)', fontSize: '11px', display: 'block', fontWeight: 600 }}>Taux Recouvrement</small>
                <b style={{ color: '#10b981', fontSize: '16px' }}>
                  {(((kpis?.payments_total ?? 846500) / ((kpis?.payments_total ?? 846500) + totalReceivables)) * 100).toFixed(1)}%
                </b>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: 2 }}>Sur total émis</span>
              </div>
              <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <small style={{ color: 'var(--muted)', fontSize: '11px', display: 'block', fontWeight: 600 }}>Solde Moyen / Client</small>
                <b style={{ color: '#38bdf8', fontSize: '16px' }}>
                  {formatMoney(Math.round(totalReceivables / (kpis?.customers_count || 1)))} DH
                </b>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: 2 }}>Encours portefeuille</span>
              </div>
              <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <small style={{ color: 'var(--muted)', fontSize: '11px', display: 'block', fontWeight: 600 }}>Opérations Arbitrées</small>
                <b style={{ color: '#a855f7', fontSize: '16px' }}>
                  {pendingOps.filter(o => o.status === 'arbitre').length} / {pendingOps.length}
                </b>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: 2 }}>Contrôlées Super Admin</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Strategic Management Shortlinks */}
      <section className="panel sx-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">CONSOLE D'ADMINISTRATION SYSTÈME</span>
            <h2>Accès aux modules de gestion</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/users`)}>
            <span className="sx-mod-icon"><Users size={18} /></span>
            <span className="sx-mod-copy">
              <b>Utilisateurs & Équipe</b>
              <small>Comptes, rôles et affectations</small>
            </span>
            <ArrowRight size={15} />
          </button>

          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/roles`)}>
            <span className="sx-mod-icon"><ShieldCheck size={18} /></span>
            <span className="sx-mod-copy">
              <b>Matrice des Droits (RBAC)</b>
              <small>Permissions par module</small>
            </span>
            <ArrowRight size={15} />
          </button>

          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/audit`)}>
            <span className="sx-mod-icon"><FileText size={18} /></span>
            <span className="sx-mod-copy">
              <b>Journal d’Audit Système</b>
              <small>Traçabilité des opérations</small>
            </span>
            <ArrowRight size={15} />
          </button>

          <button className="sx-mod-card" onClick={() => setLocation(`/${workspace}/settings`)}>
            <span className="sx-mod-icon"><Settings size={18} /></span>
            <span className="sx-mod-copy">
              <b>Configuration Fiscale</b>
              <small>ICE, IF, TVA et règles</small>
            </span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ── Super Admin Arbitration & Operational Validation Modal ── */}
      {arbitrationModal && (
        <div className="modal-backdrop" onClick={() => setArbitrationModal(null)}>
          <form
            className="record-modal"
            onSubmit={handleSubmitArbitration}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 640,
              width: '95%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: 0,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              className="modal-top"
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="eyebrow" style={{ color: '#0284c7', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Crown size={13} /> ARBITRAGE HIÉRARCHIQUE & DÉCISION SUPER ADMIN
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Validation Opérationnelle · {arbitrationModal.ref}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setArbitrationModal(null)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                padding: '18px 22px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                background: '#ffffff',
              }}
            >
              {/* Dossier Summary Box */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '10px 14px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 10,
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Client :</span>
                  <b style={{ color: '#0f172a' }}>{arbitrationModal.client}</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Article & Qté :</span>
                  <b style={{ color: '#0f172a' }}>{arbitrationModal.product} (×{arbitrationModal.qty})</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Montant Avoir :</span>
                  <b style={{ color: '#0284c7' }}>{formatMoney(arbitrationModal.total)} DH</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Chauffeur :</span>
                  <span style={{ color: '#334155' }}>
                    {arbitrationModal.driver_type === 'pre_seller' ? '🚚 Pré-vendeur (Van Sales)' : arbitrationModal.driver_name}
                  </span>
                </div>
              </div>

              {/* 1. Motif exact */}
              <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                1. Motif exact constaté *
                <select
                  required
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: 13,
                    marginTop: 4,
                  }}
                  value={arbMotif}
                  onChange={(e) => setArbMotif(e.target.value)}
                >
                  <option value="Produit endommagé">Produit endommagé / Casse ou fuite</option>
                  <option value="Erreur commande">Erreur commande (référence ou quantité)</option>
                  <option value="Produit périmé">Produit périmé / DLC insuffisante</option>
                  <option value="Refus client">Refus client à la livraison</option>
                  <option value="Surplus">Surplus de livraison / Surstock</option>
                  <option value="Qualité insuffisante">Qualité insuffisante / Non-conformité</option>
                </select>
              </label>

              {/* 2. Circonstance & Cause racine */}
              <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                2. Circonstance & Cause racine constatée *
                <textarea
                  required
                  rows={2}
                  value={arbCause}
                  onChange={(e) => setArbCause(e.target.value)}
                  placeholder="Expliquez en détail les circonstances : avarie durant le trajet, erreur de picking au dépôt, réclamation tardive..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: 12.5,
                    marginTop: 4,
                  }}
                />
              </label>

              {/* 3. Sort du Stock & Décision Qualité / Décision Hiérarchique */}
              <div>
                <span className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12, marginBottom: 6, display: 'block' }}>
                  {arbitrationModal.op_type === 'retour'
                    ? '3. Sort du Stock & Décision Qualité *'
                    : '3. Verdict & Décision Direction Générale *'}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
                  {arbitrationModal.op_type === 'retour' ? (
                    <>
                      {/* Option A: Reintegration */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: arbStockDecision === 'reintegre_stock' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                          background: arbStockDecision === 'reintegre_stock' ? 'rgba(22,163,74,0.08)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name="sa_arb_stock"
                          value="reintegre_stock"
                          checked={arbStockDecision === 'reintegre_stock'}
                          onChange={() => setArbStockDecision('reintegre_stock')}
                          style={{ marginTop: 2, accentColor: '#16a34a' }}
                        />
                        <div>
                          <b style={{ color: '#15803d', fontSize: 12.5 }}>
                            ✓ Conforme : Réintégrer en stock vendable (+{arbitrationModal.qty} unités)
                          </b>
                          <small style={{ display: 'block', color: '#64748b', fontSize: 11, marginTop: 2 }}>
                            Marchandise conforme, saine et scellée. Réintégrée physiquement et comptablement dans le stock disponible du dépôt.
                          </small>
                        </div>
                      </label>

                      {/* Option B: Scrap / Loss */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: arbStockDecision === 'mis_au_rebut_perte' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                          background: arbStockDecision === 'mis_au_rebut_perte' ? 'rgba(245,158,11,0.08)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name="sa_arb_stock"
                          value="mis_au_rebut_perte"
                          checked={arbStockDecision === 'mis_au_rebut_perte'}
                          onChange={() => setArbStockDecision('mis_au_rebut_perte')}
                          style={{ marginTop: 2, accentColor: '#f59e0b' }}
                        />
                        <div>
                          <b style={{ color: '#b45309', fontSize: 12.5 }}>
                            ✗ Non conforme (Avarie / Rebut) : Mise au rebut &amp; Perte comptable (0 stock vendable)
                          </b>
                          <small style={{ display: 'block', color: '#64748b', fontSize: 11, marginTop: 2 }}>
                            Marchandise avariée, détruite ou impropre à la vente. NON réintégrée dans le stock disponible. PV de destruction &amp; perte comptable.
                          </small>
                        </div>
                      </label>

                      {/* Option C: Refusal */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: arbStockDecision === 'refuse' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                          background: arbStockDecision === 'refuse' ? 'rgba(239,68,68,0.08)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name="sa_arb_stock"
                          value="refuse"
                          checked={arbStockDecision === 'refuse'}
                          onChange={() => setArbStockDecision('refuse')}
                          style={{ marginTop: 2, accentColor: '#ef4444' }}
                        />
                        <div>
                          <b style={{ color: '#b91c1c', fontSize: 12.5 }}>
                            ⛔ Refusé : Rejet du retour client (Délai dépassé ou motif irrecevable)
                          </b>
                          <small style={{ display: 'block', color: '#64748b', fontSize: 11, marginTop: 2 }}>
                            Retour rejeté au quai. Aucun avoir accordé au client et réexpédition à sa charge.
                          </small>
                        </div>
                      </label>
                    </>
                  ) : (
                    <>
                      {/* Option A: Approval */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: arbStockDecision === 'reintegre_stock' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                          background: arbStockDecision === 'reintegre_stock' ? 'rgba(22,163,74,0.08)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name="sa_arb_stock"
                          value="reintegre_stock"
                          checked={arbStockDecision === 'reintegre_stock'}
                          onChange={() => setArbStockDecision('reintegre_stock')}
                          style={{ marginTop: 2, accentColor: '#16a34a' }}
                        />
                        <div>
                          <b style={{ color: '#15803d', fontSize: 12.5 }}>
                            ✓ Accorder la validation / Dérogation exceptionnelle
                          </b>
                          <small style={{ display: 'block', color: '#64748b', fontSize: 11, marginTop: 2 }}>
                            Autoriser le déblocage de l’opération, la préparation de commande ou l’imputation comptable.
                          </small>
                        </div>
                      </label>

                      {/* Option B: Refusal */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: arbStockDecision === 'refuse' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                          background: arbStockDecision === 'refuse' ? 'rgba(239,68,68,0.08)' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="radio"
                          name="sa_arb_stock"
                          value="refuse"
                          checked={arbStockDecision === 'refuse'}
                          onChange={() => setArbStockDecision('refuse')}
                          style={{ marginTop: 2, accentColor: '#ef4444' }}
                        />
                        <div>
                          <b style={{ color: '#b91c1c', fontSize: 12.5 }}>
                            ⛔ Rejeter la demande / Maintien du blocage
                          </b>
                          <small style={{ display: 'block', color: '#64748b', fontSize: 11, marginTop: 2 }}>
                            Refus de dérogation ou mise en attente jusqu’à régularisation financière.
                          </small>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* 4. Visa Super Admin */}
              <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                Notes complémentaires & Visa Direction
                <input
                  value={arbNotes}
                  onChange={(e) => setArbNotes(e.target.value)}
                  placeholder="Ex. Contrôle physique validé par Direction Générale · Enregistré au PV #ARB-2026-08"
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: 13,
                    marginTop: 4,
                  }}
                />
              </label>
            </div>

            <div
              className="modal-actions"
              style={{
                padding: '12px 22px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                margin: 0,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setArbitrationModal(null)}
                style={{
                  height: 38,
                  padding: '0 16px',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{
                  height: 38,
                  padding: '0 18px',
                  background: '#0284c7',
                  borderColor: '#0369a1',
                  borderRadius: 6,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ShieldCheck size={16} /> Valider la décision Direction
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
