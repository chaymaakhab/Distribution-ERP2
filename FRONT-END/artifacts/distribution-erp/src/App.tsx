import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { customFetch } from '@workspace/api-client-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import CustomerApp from '@/customer/CustomerApp';
import StaffApp from '@/staff/StaffApp';
import { Route, Switch, useLocation, Router as WouterRouter, Link } from 'wouter';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeDollarSign, BarChart3,
  Boxes, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  ClipboardList, Clock3, CreditCard, Download, FileCheck2, FileText, Filter, Gauge, LayoutDashboard,
  MapPin, Menu, Package, Plus, Search, Settings, ShieldCheck, ShoppingBag, ShoppingCart, Truck,
  Users, Warehouse, X, Sun, Moon, UserCheck,
} from 'lucide-react';
import './erp.css';

const queryClient = new QueryClient();

type Row = Record<string, string>;
const initialRows: Record<string, Row[]> = {
  orders: [
    { ref: 'CMD-2406', customer: 'Atlas Équipements', city: 'Casablanca', date: '28 fév. 2025', total: '24 860,00', status: 'À valider', source: 'Commercial' },
    { ref: 'CMD-2405', customer: 'BatiPro Maroc', city: 'Rabat', date: '28 fév. 2025', total: '18 420,50', status: 'En préparation', source: 'Téléphone' },
    { ref: 'CMD-2404', customer: 'Maison du Bricolage', city: 'Marrakech', date: '27 fév. 2025', total: '9 735,00', status: 'Confirmée', source: 'Portail client' },
    { ref: 'CMD-2403', customer: 'Comptoir Al Amal', city: 'Fès', date: '27 fév. 2025', total: '32 100,00', status: 'En livraison', source: 'Commercial' },
    { ref: 'CMD-2402', customer: 'Nord Industrie', city: 'Tanger', date: '26 fév. 2025', total: '6 280,00', status: 'Livrée', source: 'Commercial' },
    { ref: 'CMD-2401', customer: 'Quincaillerie Saada', city: 'Agadir', date: '26 fév. 2025', total: '14 950,00', status: 'Partielle', source: 'Téléphone' },
    { ref: 'CMD-2400', customer: 'Électricité Benali', city: 'Meknès', date: '26 fév. 2025', total: '4 120,00', status: 'Brouillon', source: 'Commercial' },
    { ref: 'CMD-2399', customer: 'Chantiers El Idrissi', city: 'Kénitra', date: '25 fév. 2025', total: '51 700,00', status: 'En traitement', source: 'Portail client' },
    { ref: 'CMD-2398', customer: 'Pro Matériel Souss', city: 'Agadir', date: '25 fév. 2025', total: '11 390,00', status: 'Préparée', source: 'Commercial' },
    { ref: 'CMD-2397', customer: 'Distrib Benslimane', city: 'Mohammédia', date: '24 fév. 2025', total: '7 680,00', status: 'Affectée', source: 'Téléphone' },
    { ref: 'CMD-2396', customer: 'Outillage Rif', city: 'Tétouan', date: '24 fév. 2025', total: '2 450,00', status: 'Échec', source: 'Portail client' },
    { ref: 'CMD-2395', customer: 'Matériaux Saïss', city: 'Fès', date: '23 fév. 2025', total: '19 870,00', status: 'Annulée', source: 'Commercial' },
    { ref: 'CMD-2394', customer: 'Atelier Atlas', city: 'Béni Mellal', date: '22 fév. 2025', total: '3 860,00', status: 'Retournée', source: 'Téléphone' },
  ],
  products: [
    { ref: 'PRD-0018', customer: 'Perceuse à percussion 850W', city: 'Électroportatif · 20% TVA', date: 'SKU HRC-0850', total: '1 249,00', status: 'Actif', source: 'Carton · 4 unités' },
    { ref: 'PRD-0017', customer: 'Disque diamant 230 mm', city: 'Outillage · 20% TVA', date: 'SKU CUT-230D', total: '189,50', status: 'Actif', source: 'Pièce' },
    { ref: 'PRD-0016', customer: 'Pompe immergée 1.5 HP', city: 'Pompage · 14% TVA', date: 'SKU PMP-15HP', total: '3 840,00', status: 'Stock faible', source: 'Pièce' },
    { ref: 'PRD-0015', customer: 'Câble électrique 3G2.5', city: 'Électricité · 20% TVA', date: 'SKU CAB-3G25', total: '12,80', status: 'Actif', source: 'Mètre' },
    { ref: 'PRD-0014', customer: 'Groupe électrogène 5 kVA', city: 'Énergie · 20% TVA', date: 'SKU GEN-5000', total: '8 950,00', status: 'Actif', source: 'Pièce' },
  ],
  inventory: [
    { ref: 'HRC-0850', customer: 'Perceuse à percussion 850W', city: 'Dépôt Casablanca', date: '120 / 18 / 102', total: '34 680,00', status: 'Disponible', source: '28 fév. · Réception +24' },
    { ref: 'PMP-15HP', customer: 'Pompe immergée 1.5 HP', city: 'Dépôt Casablanca', date: '8 / 3 / 5', total: '19 200,00', status: 'Stock faible', source: '27 fév. · Sortie −2' },
    { ref: 'CUT-230D', customer: 'Disque diamant 230 mm', city: 'Dépôt Rabat', date: '64 / 12 / 52', total: '12 128,00', status: 'Disponible', source: '27 fév. · Réception +16' },
    { ref: 'CAB-3G25', customer: 'Câble électrique 3G2.5', city: 'Dépôt Casablanca', date: '480 / 60 / 420', total: '6 144,00', status: 'Disponible', source: '26 fév. · Réservation −20' },
  ],
  customers: [
    { ref: 'CLI-0084', customer: 'Atlas Équipements', city: 'Casablanca · +212 522 34 78 90', date: 'Tarif revendeur', total: '42 650,00', status: 'Actif', source: 'Plafond 80 000 DH' },
    { ref: 'CLI-0083', customer: 'BatiPro Maroc', city: 'Rabat · +212 537 22 16 40', date: 'Tarif chantier', total: '18 420,50', status: 'Actif', source: 'Plafond 50 000 DH' },
    { ref: 'CLI-0082', customer: 'Maison du Bricolage', city: 'Marrakech · +212 524 38 05 17', date: 'Tarif revendeur', total: '9 735,00', status: 'À surveiller', source: 'Plafond 35 000 DH' },
    { ref: 'CLI-0081', customer: 'Comptoir Al Amal', city: 'Fès · +212 535 61 20 08', date: 'Tarif grossiste', total: '32 100,00', status: 'Actif', source: 'Plafond 100 000 DH' },
  ],
  purchasing: [
    { ref: 'ACH-0097', customer: 'Société Outillage du Nord', city: 'PO-2025-097 · 26 fév.', date: 'Dépôt Casablanca', total: '38 750,00', status: 'En attente', source: 'Livraison prévue 03 mars' },
    { ref: 'ACH-0096', customer: 'Electro Maroc Distribution', city: 'PO-2025-096 · 24 fév.', date: 'Dépôt Rabat', total: '24 900,00', status: 'Réception partielle', source: 'Solde 12 unités' },
    { ref: 'ACH-0095', customer: 'HydroTech Maghreb', city: 'PO-2025-095 · 21 fév.', date: 'Dépôt Casablanca', total: '17 600,00', status: 'Reçue', source: 'Réception complète' },
  ],
  deliveries: [
    { ref: 'LIV-0318', customer: 'Comptoir Al Amal', city: 'Fès · Tournée Nord', date: 'Chauffeur · Youssef A.', total: '8 450,00', status: 'En route', source: 'Espèces à remettre · 4 200 DH' },
    { ref: 'LIV-0317', customer: 'BatiPro Maroc', city: 'Rabat · Tournée Centre', date: 'Chauffeur · Karim B.', total: '18 420,50', status: 'À charger', source: 'Bon signé requis' },
    { ref: 'LIV-0316', customer: 'Nord Industrie', city: 'Tanger · Tournée Nord', date: 'Chauffeur · Mehdi L.', total: '6 280,00', status: 'Livrée', source: 'Preuve reçue · 27 fév.' },
    { ref: 'LIV-0315', customer: 'Quincaillerie Saada', city: 'Agadir · Tournée Sud', date: 'Chauffeur · Amine R.', total: '14 950,00', status: 'Partielle', source: 'Reste 2 colis' },
  ],
  finance: [
    { ref: 'FAC-2025-184', customer: 'Atlas Équipements', city: 'Émise · 24 fév. 2025', date: 'Échéance 26 mars', total: '24 860,00', status: 'Impayée', source: 'Affecté · 0,00 DH' },
    { ref: 'FAC-2025-183', customer: 'BatiPro Maroc', city: 'Émise · 22 fév. 2025', date: 'Échéance 24 mars', total: '18 420,50', status: 'Partielle', source: 'Affecté · 8 000,00 DH' },
    { ref: 'FAC-2025-182', customer: 'Comptoir Al Amal', city: 'Émise · 20 fév. 2025', date: 'Échéance dépassée · 5 j', total: '32 100,00', status: 'En retard', source: 'Affecté · 0,00 DH' },
    { ref: 'EFF-0048', customer: 'Chèque · Atlas Équipements', city: 'N° 084731 · Banque Populaire', date: 'Remise prévue 05 mars', total: '12 500,00', status: 'À encaisser', source: 'Référence conservée' },
    { ref: 'REG-0126', customer: 'Virement · BatiPro Maroc', city: 'Banque Attijariwafa · 27 fév.', date: 'Affecté à FAC-2025-183', total: '8 000,00', status: 'Affecté', source: 'Solde facture · 10 420,50 DH' },
    { ref: 'EFF-0047', customer: 'Traite · Maison du Bricolage', city: 'N° 006841 · BMCI', date: 'Échéance 18 mars', total: '9 735,00', status: 'En portefeuille', source: 'Affectée à FAC-2025-179' },
  ],
  reports: [
    { ref: 'RPT-01', customer: 'Ventes par période', city: 'CA HT · comparatif mensuel', date: 'Fév. 2025', total: '1 284 650,00', status: 'Disponible', source: '32 jours de données' },
    { ref: 'RPT-02', customer: 'Rotation des stocks', city: 'Valorisation · seuils min.', date: 'Au 28 fév. 2025', total: '3 840 200,00', status: 'Disponible', source: '4 articles à réapprovisionner' },
    { ref: 'RPT-03', customer: 'Performance livraison', city: 'Tournées · ponctualité', date: 'Fév. 2025', total: '94,2%', status: 'Disponible', source: '67 livraisons' },
    { ref: 'RPT-04', customer: 'Balance clients', city: 'Créances · échéances', date: 'Au 28 fév. 2025', total: '428 560,00', status: 'À suivre', source: '11 factures échues' },
  ],
  settings: [
    { ref: 'SOC-01', customer: 'Hercules Distribution SARL', city: 'Casablanca · Maroc', date: 'ICE 003147829000064', total: 'DH · MAD', status: 'Actif', source: 'Société de démonstration' },
    { ref: 'DEP-01', customer: 'Dépôt Casablanca', city: 'Zone industrielle · Aïn Sebaâ', date: 'Responsable · N. El Fassi', total: 'Principal', status: 'Actif', source: 'Stock multi-emplacements' },
    { ref: 'DEP-02', customer: 'Dépôt Rabat', city: 'Hay Nahda · Rabat', date: 'Responsable · S. Amrani', total: 'Secondaire', status: 'Actif', source: 'Dernière synchro démo : 16:42' },
    { ref: 'USR-01', customer: 'Équipe commerciale', city: '5 utilisateurs · 3 secteurs', date: 'Droits · commandes, clients', total: 'Commercial', status: 'Actif', source: 'Accès illustratif' },
    { ref: 'USR-02', customer: 'Équipe finance', city: '2 utilisateurs · visibilité comptable', date: 'Droits · factures, règlements', total: 'Finance', status: 'Actif', source: 'Accès illustratif' },
    { ref: 'CFG-01', customer: 'Règles fiscales', city: 'TVA autorisées · 0 / 7 / 10 / 14 / 20%', date: 'Devise · DH (MAD)', total: 'Français', status: 'Actif', source: 'Préférences de démonstration' },
  ],
};

const modules = [
  { id: '/', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: '/orders', label: 'Commandes', icon: ClipboardList, count: '12' },
  { id: '/products', label: 'Catalogue', icon: Package },
  { id: '/inventory', label: 'Stocks', icon: Warehouse, count: '4' },
  { id: '/customers', label: 'Clients', icon: Users },
  { id: '/purchasing', label: 'Achats', icon: ShoppingCart },
  { id: '/deliveries', label: 'Livraisons', icon: Truck },
  { id: '/finance', label: 'Finance', icon: BadgeDollarSign },
  { id: '/reports', label: 'Rapports', icon: BarChart3 },
  { id: '/settings', label: 'Paramètres', icon: Settings },
];
const titles: Record<string, { title: string; kicker: string; description: string; action: string }> = {
  '/orders': { title: 'Commandes', kicker: 'VENTES / OPÉRATIONS', description: 'Suivez chaque commande, de la validation à la livraison.', action: 'Nouvelle commande' },
  '/products': { title: 'Catalogue produits', kicker: 'RÉFÉRENTIEL', description: 'Articles, tarifs, conditionnements et visibilité client.', action: 'Ajouter un produit' },
  '/inventory': { title: 'Stocks & mouvements', kicker: 'ENTREPÔT', description: 'Quantités physiques, réservées et réellement disponibles.', action: 'Nouveau mouvement' },
  '/customers': { title: 'Clients', kicker: 'RELATION COMMERCIALE', description: 'Comptes clients, conditions tarifaires et encours.', action: 'Ajouter un client' },
  '/purchasing': { title: 'Approvisionnements', kicker: 'ACHATS', description: 'Fournisseurs, commandes d’achat et besoins de réassort.', action: 'Créer un achat' },
  '/deliveries': { title: 'Tournées & livraisons', kicker: 'DISTRIBUTION', description: 'Ordonnancement, preuves de dépôt et suivi des encaissements.', action: 'Planifier une tournée' },
  '/finance': { title: 'Finance', kicker: 'COMPTABILITÉ CLIENT', description: 'Factures, règlements affectés, effets et créances.', action: 'Enregistrer un règlement' },
  '/reports': { title: 'Rapports', kicker: 'PILOTAGE', description: 'Indicateurs de ventes, stock, livraison et trésorerie.', action: 'Exporter le rapport' },
  '/settings': { title: 'Configuration', kicker: 'ADMINISTRATION', description: 'Société, dépôts, équipes et règles de gestion.', action: 'Ajouter un dépôt' },
};

function money(value: string) { return `${value} DH`; }
function AppShell() {
  const [location, setLocation] = useLocation();
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Tous les statuts');
  const [activeTab, setActiveTab] = useState('Tout');
  const [isLightMode, setIsLightMode] = useState(
    () => window.localStorage.getItem('gestion-erp-theme') === 'light',
  );
  const [selectedRole, setSelectedRole] = useState('admin');

  useEffect(() => {
    customFetch<Row[]>('/records').then((data: Row[]) => {
      if (Array.isArray(data) && data.length > 0) {
        const grouped: Record<string, Row[]> = { ...initialRows };
        data.forEach((item) => {
          const mod = item.module || 'orders';
          if (!grouped[mod]) grouped[mod] = [];
          if (!grouped[mod].some((r) => r.ref === item.ref)) {
            grouped[mod].unshift(item);
          }
        });
        setRows(grouped);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    document.body.classList.toggle('light-theme', isLightMode);
    window.localStorage.setItem('gestion-erp-theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const toggleTheme = () => {
    setIsLightMode((light) => !light);
  };
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const page = titles[location];
  const pageKey = location.slice(1);
  const currentRows = rows[pageKey] ?? [];
  const statuses = Array.from(new Set(currentRows.map(row => row.status)));
  const filtered = useMemo(() => currentRows.filter(row => {
    const text = Object.values(row).join(' ').toLocaleLowerCase('fr');
    return text.includes(query.toLocaleLowerCase('fr')) && (filter === 'Tous les statuts' || row.status === filter) && (activeTab === 'Tout' || row.status === activeTab);
  }), [currentRows, query, filter, activeTab]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }
  function addRecord(form: FormData) {
    const label = String(form.get('label') || 'Nouvel élément');
    const row: Row = { ref: `${pageKey.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-4)}`, customer: label, city: String(form.get('detail') || 'Casablanca · Démo'), date: '28 fév. 2025', total: String(form.get('amount') || '0,00'), status: 'À traiter', source: 'Saisie locale · démonstration' };
    setRows(previous => ({ ...previous, [pageKey]: [row, ...(previous[pageKey] ?? [])] }));
    setModal(false);
    notify('Élément ajouté aux données de démonstration.');
  }
  function exportRows() {
    const csv = [Object.keys(currentRows[0] ?? {}).join(';'), ...currentRows.map(row => Object.values(row).join(';'))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `hercules-${pageKey || 'rapport'}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    notify('Export CSV préparé depuis les données de démonstration.');
  }
  const activeModule = modules.find(item => item.id === location);

  return <div className="erp-app">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <Link href="/" className="brand" onClick={() => setMobileMenu(false)}>
        <span className="brand-mark"><span>G</span></span><span className="brand-copy"><b>GESTION ERP</b><small>ERP · DISTRIBUTION</small></span>
      </Link>
      <p className="nav-caption">ESPACE DE TRAVAIL</p>
      <nav className="side-nav">{modules.map(item => {
        const Icon = item.icon;
        const selected = item.id === location;
        return <Link href={item.id} key={item.id} onClick={() => setMobileMenu(false)} className={`nav-link ${selected ? 'nav-selected' : ''}`} data-testid={`link-nav-${item.id === '/' ? 'dashboard' : item.id.slice(1)}`}>
          <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.count && <small>{item.count}</small>}
        </Link>;
      })}</nav>
      <div className="sidebar-lower">
        <div className="status-panel"><span className="status-beacon" /><div><b>Mode démonstration</b><small>Aucune connexion active</small></div></div>
        <button className="user-panel" onClick={() => setLocation('/settings')} data-testid="button-user-profile">
          <div className="user-avatar">AE</div><span className="user-copy"><b>Amine El Fassi</b><small>Administrateur</small></span><ChevronDown size={14} />
        </button>
      </div>
    </aside>
    <div className="app-main">
      <header className="topbar">
        <button className="mobile-trigger icon-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Ouvrir le menu"><Menu size={19} /></button>
        <div className="crumb"><span>Gestion ERP</span><ChevronRight size={14} /><strong>{activeModule?.label ?? 'Vue d’ensemble'}</strong></div>
        <div className="topbar-right">
          <label className="role-select">
            <UserCheck size={14} />
            <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); notify(`Rôle basculé en : ${e.target.options[e.target.selectedIndex].text}`); }} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', outline: 'none' }} data-testid="select-role-switcher">
              <option value="admin">Administrateur</option>
              <option value="commercial">Commercial</option>
              <option value="finance">Finance</option>
              <option value="warehouse">Responsable Dépôt</option>
              <option value="driver">Chauffeur/Livreur</option>
            </select>
          </label>
          <button className="theme-toggle-button icon-button" onClick={toggleTheme} title="Basculer le thème (Clair / Sombre)" style={{ padding: '6px', cursor: 'pointer' }} data-testid="button-theme-toggle">
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <div className="top-date"><CalendarDays size={14} /> 28 fév. 2025 <ChevronDown size={13} /></div>
          <button className="help-button" onClick={() => notify('Aide produit : connectée au serveur API backend.')} aria-label="Aide"><CircleHelp size={17} /></button>
        </div>
      </header>
      <main className="page-wrap">
        {location === '/' ? <Dashboard onNavigate={setLocation} onNotify={notify} /> : page ? <ModulePage
          page={page} rows={filtered} allRows={currentRows} query={query} setQuery={setQuery}
          filter={filter} setFilter={setFilter} statuses={statuses} activeTab={activeTab} setActiveTab={setActiveTab}
          onAdd={() => pageKey === 'reports' ? exportRows() : setModal(true)} onExport={exportRows} onNotify={notify}
          onStatus={ref => pageKey === 'finance'
            ? notify(`Le statut de ${ref} est conservé ; les opérations financières ne sont pas modifiables en démo.`)
            : setRows(old => ({ ...old, [pageKey]: old[pageKey].map(row => row.ref === ref ? { ...row, status: row.status === 'Actif' ? 'Inactif' : 'Actif' } : row) }))}
        /> : <NotFound />}
      </main>
      {page && modal && <div className="modal-backdrop" onClick={() => setModal(false)}>
        <form className="record-modal" onSubmit={event => { event.preventDefault(); addRecord(new FormData(event.currentTarget)); }} onClick={event => event.stopPropagation()}>
          <div className="modal-top"><div><span className="eyebrow">SAISIE LOCALE · DÉMO</span><h2>{page.action}</h2></div><button type="button" className="icon-button" onClick={() => setModal(false)} aria-label="Fermer"><X size={18} /></button></div>
          <p className="modal-note">Cette action modifie uniquement les exemples affichés dans cette session.</p>
          <label className="field-label">Nom / libellé<input name="label" placeholder="Ex. Comptoir Atlas" required autoFocus data-testid="input-new-record-name" /></label>
          <label className="field-label">Détail<input name="detail" placeholder="Ville · information complémentaire" data-testid="input-new-record-detail" /></label>
          <label className="field-label">Montant (DH)<input name="amount" placeholder="0,00" inputMode="decimal" data-testid="input-new-record-amount" /></label>
          <div className="modal-actions"><button type="button" className="button-secondary" onClick={() => setModal(false)}>Annuler</button><button className="button-primary" type="submit"><Plus size={15} /> Ajouter en démo</button></div>
        </form>
      </div>}
      {toast && <div className="toast-note"><Check size={16} />{toast}</div>}
    </div>
  </div>;
}

function Dashboard({ onNavigate, onNotify }: { onNavigate: (path: string) => void; onNotify: (msg: string) => void }) {
  const [period, setPeriod] = useState('Ce mois');
  const [feedTab, setFeedTab] = useState('Activité');
  return <div className="dashboard-page">
    <div className="page-heading dash-heading">
      <div><span className="eyebrow">VENDREDI 28 FÉVRIER 2025 <span className="eyebrow-sep">/</span> CASABLANCA</span><h1>Bonjour, Amine<span className="title-period">.</span></h1><p>Voici le rythme de vos opérations aujourd’hui.</p></div>
      <button className="button-primary" onClick={() => onNavigate('/orders')} data-testid="button-new-order"><Plus size={16} /> Nouvelle commande</button>
    </div>
    <div className="metric-grid">
      <Metric label="Chiffre d’affaires" value="1 284 650" unit="DH" change="+12,8%" up detail="vs. période précédente" icon={BadgeDollarSign} accent="blue" />
      <Metric label="Commandes reçues" value="186" unit="" change="+8,3%" up detail="27 à traiter aujourd’hui" icon={ShoppingBag} accent="cyan" />
      <Metric label="Marge brute" value="248 320" unit="DH" change="+4,6%" up detail="Marge moyenne · 19,3%" icon={Activity} accent="green" />
      <Metric label="Panier moyen" value="6 906" unit="DH" change="−1,2%" detail="vs. période précédente" icon={CreditCard} accent="amber" />
    </div>
    <div className="dashboard-grid">
      <section className="panel sales-panel">
        <div className="panel-heading"><div><span className="eyebrow">PERFORMANCE COMMERCIALE</span><h2>Ventes nettes</h2></div><select className="select-compact" value={period} onChange={event => setPeriod(event.target.value)} aria-label="Période ventes"><option>Ce mois</option><option>Cette semaine</option><option>Cette année</option></select></div>
        <div className="sales-total"><strong>1 284 650 <small>DH</small></strong><span className="positive-pill"><ArrowUpRight size={13} /> 12,8%</span></div>
        <div className="chart-area">
          <div className="chart-y"><span>1,5 M</span><span>1,0 M</span><span>500 k</span><span>0</span></div>
          <svg className="sales-chart" viewBox="0 0 680 190" preserveAspectRatio="none" role="img" aria-label="Courbe des ventes mensuelles"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3f8cff" stopOpacity=".25" /><stop offset="100%" stopColor="#3f8cff" stopOpacity="0" /></linearGradient></defs><path d="M0 150 C28 144 36 151 58 135 S88 130 110 139 S145 118 164 123 S194 112 216 116 S244 97 267 106 S298 84 323 94 S353 75 376 83 S408 64 431 71 S463 56 485 64 S516 39 540 49 S569 30 592 40 S630 18 680 16 V190 H0Z" fill="url(#chartFill)" /><path d="M0 150 C28 144 36 151 58 135 S88 130 110 139 S145 118 164 123 S194 112 216 116 S244 97 267 106 S298 84 323 94 S353 75 376 83 S408 64 431 71 S463 56 485 64 S516 39 540 49 S569 30 592 40 S630 18 680 16" fill="none" stroke="#5c9dff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /><circle cx="680" cy="16" r="5" fill="#71abff" stroke="#142138" strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg>
          <div className="chart-x"><span>01 fév.</span><span>07 fév.</span><span>14 fév.</span><span>21 fév.</span><span>28 fév.</span></div>
        </div>
        <div className="chart-foot"><span><i className="legend-dot" /> Ventes confirmées</span><span>Actualisé à 16:42 <span className="demo-inline">· Démo</span></span></div>
      </section>
      <section className="panel breakdown-panel">
        <div className="panel-heading"><div><span className="eyebrow">MIX DE VENTES</span><h2>Par canal</h2></div><button className="more-button" onClick={() => onNavigate('/reports')}>Détails <ArrowRight size={14} /></button></div>
        <div className="channel-summary"><div className="donut-chart"><div><b>186</b><small>commandes</small></div></div><div className="channel-legend"><div><i className="legend-dot blue-dot" /><span>Commercial</span><b>54%</b></div><div><i className="legend-dot cyan-dot" /><span>Portail client</span><b>28%</b></div><div><i className="legend-dot slate-dot" /><span>Téléphone</span><b>18%</b></div></div></div>
        <div className="channel-foot"><span>Valeur totale</span><strong>1,28 M DH</strong></div>
      </section>
      <section className="panel orders-panel">
        <div className="panel-heading"><div><span className="eyebrow">À SUIVRE</span><h2>Commandes récentes</h2></div><button className="more-button" onClick={() => onNavigate('/orders')}>Toutes les commandes <ArrowRight size={14} /></button></div>
        <div className="compact-table-wrap"><table className="data-table compact-table"><thead><tr><th>RÉFÉRENCE</th><th>CLIENT</th><th>MONTANT TTC</th><th>STATUT</th></tr></thead><tbody>
          {initialRows.orders.slice(0, 4).map(row => <tr key={row.ref} onClick={() => onNavigate('/orders')}><td className="ref-cell">{row.ref}</td><td><b>{row.customer}</b><small>{row.city}</small></td><td className="amount-cell">{money(row.total)}</td><td><Status status={row.status} /></td></tr>)}
        </tbody></table></div>
      </section>
      <section className="panel activity-panel">
        <div className="panel-heading"><div><span className="eyebrow">JOURNAL OPÉRATIONNEL</span><h2>Flux d’activité</h2></div><div className="feed-tabs">{['Activité', 'Alertes'].map(tab => <button key={tab} className={feedTab === tab ? 'feed-active' : ''} onClick={() => setFeedTab(tab)}>{tab}</button>)}</div></div>
        <div className="feed-list">
          {(feedTab === 'Activité' ? [
            { icon: Check, tone: 'feed-blue', title: 'Nouvelle commande CMD-2406', sub: 'Atlas Équipements · 24 860 DH', time: 'Il y a 8 min' },
            { icon: Package, tone: 'feed-amber', title: 'Seuil de stock atteint', sub: 'Pompe immergée 1.5 HP · Casablanca', time: 'Il y a 24 min' },
            { icon: FileCheck2, tone: 'feed-green', title: 'Règlement affecté', sub: 'FAC-2025-183 · 8 000 DH', time: 'Il y a 1 h' },
            { icon: Truck, tone: 'feed-violet', title: 'Tournée Nord en route', sub: 'Youssef A. · 6 livraisons planifiées', time: 'Il y a 2 h' },
          ] : [
            { icon: Package, tone: 'feed-amber', title: '4 références sous le minimum', sub: 'Voir les suggestions d’achat', time: 'Stock' },
            { icon: Clock3, tone: 'feed-red', title: '11 factures échues', sub: 'Encours total · 86 450 DH', time: 'Finance' },
            { icon: Truck, tone: 'feed-blue', title: '2 preuves de livraison attendues', sub: 'Tournées Centre et Sud', time: 'Livraison' },
          ]).map((item, index) => { const Icon = item.icon; return <div className="feed-item" key={index}><div className={`feed-icon ${item.tone}`}><Icon size={14} /></div><div className="feed-text"><b>{item.title}</b><small>{item.sub}</small></div><time>{item.time}</time></div>; })}
        </div>
        <button className="activity-link" onClick={() => onNotify('Flux affiché : données de démonstration uniquement.')}>Afficher le journal complet <ArrowRight size={14} /></button>
      </section>
    </div>
    <div className="dashboard-bottom">
      <button className="bottom-shortcut" onClick={() => onNavigate('/inventory')}><div className="shortcut-icon"><Boxes size={17} /></div><span><b>État des stocks</b><small>4 articles sous le seuil minimum</small></span><ArrowRight size={16} /></button>
      <button className="bottom-shortcut" onClick={() => onNavigate('/finance')}><div className="shortcut-icon amber-icon"><FileText size={17} /></div><span><b>Créances à suivre</b><small>428 560 DH · 11 factures échues</small></span><ArrowRight size={16} /></button>
      <button className="bottom-shortcut" onClick={() => onNavigate('/deliveries')}><div className="shortcut-icon green-icon"><MapPin size={17} /></div><span><b>Tournées du jour</b><small>4 tournées · 23 livraisons planifiées</small></span><ArrowRight size={16} /></button>
    </div>
  </div>;
}

function Metric({ label, value, unit, change, up, detail, icon: Icon, accent }: { label: string; value: string; unit: string; change: string; up?: boolean; detail: string; icon: typeof Gauge; accent: string }) {
  return <div className={`metric-card metric-${accent}`}><div className="metric-top"><span>{label}</span><div className="metric-icon"><Icon size={17} /></div></div><div className="metric-number">{value}<small>{unit}</small></div><div className="metric-foot"><span className={`metric-change ${up ? 'change-up' : 'change-down'}`}>{up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span><span>{detail}</span></div><div className="metric-spark"><svg viewBox="0 0 110 28" preserveAspectRatio="none"><path d="M0 23 C10 21 12 14 22 18 S35 11 44 15 S54 5 64 10 S77 15 84 7 S100 8 110 2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></div></div>;
}

function Status({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = /livr|confirm|actif|reçue|disponible|encaiss|préparée|affecté/.test(normalized) ? 'status-green' : /attente|valider|faible|retard|traiter|surveiller|brouillon/.test(normalized) ? 'status-amber' : /route|préparation|partielle|traitement/.test(normalized) ? 'status-blue' : /échu|annul|inactif|échec|retourn/.test(normalized) ? 'status-red' : 'status-muted';
  return <span className={`status-pill ${tone}`} data-testid={`status-${status.toLowerCase().replaceAll(' ', '-')}`}><i />{status}</span>;
}

function ModulePage({ page, rows, allRows, query, setQuery, filter, setFilter, statuses, activeTab, setActiveTab, onAdd, onExport, onNotify, onStatus }: {
  page: { title: string; kicker: string; description: string; action: string }; rows: Row[]; allRows: Row[]; query: string; setQuery: (v: string) => void; filter: string; setFilter: (v: string) => void; statuses: string[]; activeTab: string; setActiveTab: (v: string) => void; onAdd: () => void; onExport: () => void; onNotify: (v: string) => void; onStatus: (ref: string) => void;
}) {
  const isOrders = page.title === 'Commandes';
  const isInventory = page.title === 'Stocks & mouvements';
  const isFinance = page.title === 'Finance';
  const summaries = isOrders ? [['À valider', '12', 'needs-action'], ['En préparation', '08', 'neutral'], ['En livraison', '06', 'blue'], ['TTC ce mois', '1,28 M DH', 'neutral']]
    : isInventory ? [['Références', '1 248', 'neutral'], ['Sous le minimum', '04', 'needs-action'], ['Stock physique', '3,84 M DH', 'blue'], ['Dépôts actifs', '02', 'neutral']]
    : isFinance ? [['Créances clients', '428 560 DH', 'blue'], ['Factures échues', '11', 'needs-action'], ['À encaisser', '86 450 DH', 'neutral'], ['Effets en portefeuille', '08', 'neutral']]
    : page.title === 'Tournées & livraisons' ? [['À livrer aujourd’hui', '23', 'blue'], ['Tournées prévues', '04', 'neutral'], ['Preuves attendues', '02', 'needs-action'], ['Espèces chauffeurs', '18 650 DH', 'neutral']]
    : page.title === 'Approvisionnements' ? [['Commandes ouvertes', '08', 'blue'], ['À réceptionner', '03', 'needs-action'], ['Fournisseurs actifs', '24', 'neutral'], ['Suggestions d’achat', '04', 'neutral']]
    : page.title === 'Clients' ? [['Comptes actifs', '386', 'blue'], ['Encours global', '428 560 DH', 'neutral'], ['À surveiller', '12', 'needs-action'], ['Villes desservies', '18', 'neutral']]
    : page.title === 'Catalogue produits' ? [['Articles actifs', '1 248', 'blue'], ['Sous le minimum', '04', 'needs-action'], ['TVA disponibles', '0 · 7 · 10 · 14 · 20%', 'neutral'], ['Masqués du portail', '36', 'neutral']]
    : [['Enregistrés', String(allRows.length).padStart(2, '0'), 'blue'], ['À vérifier', '04', 'needs-action'], ['Cette période', 'Fév. 2025', 'neutral'], ['Statut démo', 'Local', 'neutral']];
  const tabOptions = isOrders ? ['Tout', 'À valider', 'En préparation', 'En livraison', 'Livrée'] : isFinance ? ['Tout', 'Impayée', 'Partielle', 'En retard', 'À encaisser'] : ['Tout'];
  return <div className="module-page">
    <div className="page-heading">
      <div><div className="eyebrow">{page.kicker} <span className="heading-slash">/</span> DONNÉES ILLUSTRATIVES</div><h1>{page.title}</h1><p>{page.description}</p></div>
      <div className="heading-actions"><button className="button-secondary" onClick={onExport} data-testid="button-export"><Download size={15} /> Exporter</button><button className="button-primary" onClick={onAdd} data-testid="button-primary-action"><Plus size={16} />{page.action}</button></div>
    </div>
    <div className="summary-strip">{summaries.map(([label, value, tone]) => <div className="summary-box" key={label}><span>{label}</span><strong className={tone}>{value}</strong></div>)}</div>
    {isInventory && <div className="inventory-note"><div className="note-symbol"><Boxes size={17} /></div><div><b>Disponibilité = physique − réservé</b><span>Les mouvements gardent leur sens : réception, sortie, transfert et réservation.</span></div><button onClick={() => onNotify('Mouvement enregistré uniquement dans les données de démonstration.')}>Voir les mouvements <ArrowRight size={14} /></button></div>}
    {page.title === 'Approvisionnements' && <div className="suggestion-banner"><div className="suggest-icon"><ShoppingCart size={17} /></div><div><b>Suggestions de réapprovisionnement</b><span>4 références sous le seuil · priorisées par les ventes récentes</span></div><button onClick={() => onNotify('Suggestions : Pompe immergée, câble 3G2.5, raccords PVC et disque diamant.')}>Examiner les suggestions <ArrowRight size={14} /></button></div>}
    <section className="panel list-panel">
      <div className="list-panel-heading"><div><span className="eyebrow">REGISTRE OPÉRATIONNEL</span><h2>{isOrders ? 'Toutes les commandes' : isInventory ? 'Quantités par dépôt' : page.title === 'Finance' ? 'Factures, règlements & effets' : page.title}</h2></div><div className="table-count"><span className="count-pulse" />{rows.length} enregistrements <span>· démo</span></div></div>
      <div className="table-tools">
        <div className="table-tabs">{tabOptions.map(tab => <button key={tab} className={activeTab === tab ? 'table-tab active-tab' : 'table-tab'} onClick={() => { setActiveTab(tab); setFilter('Tous les statuts'); }} data-testid={`tab-${tab.toLowerCase().replaceAll(' ', '-')}`}>{tab}{tab === 'À valider' && <span className="tab-count">12</span>}</button>)}</div>
        <div className="tool-actions"><label className="search-field"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher…" aria-label="Rechercher dans le registre" data-testid="input-search-records" />{query && <button onClick={() => setQuery('')} aria-label="Effacer"><X size={13} /></button>}</label>
          <label className="filter-select"><Filter size={14} /><select value={filter} onChange={event => { setFilter(event.target.value); setActiveTab('Tout'); }} aria-label="Filtrer par statut" data-testid="select-status-filter"><option>Tous les statuts</option>{statuses.map(status => <option key={status}>{status}</option>)}</select><ChevronDown size={13} /></label>
        </div>
      </div>
      <div className="table-container"><table className="data-table module-table"><thead><tr>{isInventory ? <><th>RÉF. / ARTICLE</th><th>DÉPÔT</th><th>PHYSIQUE / RÉSERVÉ / DISPONIBLE</th><th>VALORISATION</th><th>DERNIER MOUVEMENT</th><th>ÉTAT</th></> : <><th>{isFinance ? 'PIÈCE' : 'RÉFÉRENCE'}</th><th>{isFinance ? 'CLIENT / BANQUE' : 'CLIENT / DÉSIGNATION'}</th><th>{isFinance ? 'ÉMISE / ÉCHÉANCE' : 'VILLE / DÉTAIL'}</th><th>{isFinance ? 'MONTANT TTC' : 'MONTANT / TARIF'}</th><th>STATUT</th><th>{isFinance ? 'SUIVI' : 'SOURCE / INFORMATION'}</th></>}<th></th></tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row.ref}-${index}`} data-testid={`row-record-${row.ref}`}>
          <td><span className="table-ref">{row.ref}</span>{isInventory && <small className="under-ref">TVA 20% · Pièce</small>}</td>
          <td>{isInventory ? <><span className="table-secondary">{row.city}</span><small>{row.customer}</small></> : <><b className="table-main">{row.customer}</b><small>{row.city}</small></>}</td>
          <td>{isInventory ? <span className="quantity-values">{row.date.split(' / ').map((value, i) => <span key={i} className={i === 2 ? 'available-value' : ''}>{value}{i < 2 && <em>/</em>}</span>)}</span> : <><span className="table-secondary">{row.date}</span><small>{row.city}</small></>}</td>
          <td className="table-amount">{money(row.total)}</td><td><Status status={row.status} /></td><td className="source-cell">{row.source}</td>
          <td><div className="row-actions"><button className="row-action" aria-label={`Voir ${row.ref}`} title="Ouvrir le détail" onClick={() => onNotify(`Détail de ${row.ref} · enregistrement illustratif.`)}><ArrowRight size={15} /></button><button className="row-action row-more" aria-label={`Changer le statut ${row.ref}`} title="Basculer le statut démo" onClick={() => onStatus(row.ref)}><ChevronDown size={15} /></button></div></td>
        </tr>)}</tbody>
      </table>
      {rows.length === 0 && <div className="empty-state"><div><Search size={20} /></div><b>Aucun résultat dans ce registre</b><span>Essayez un autre terme ou réinitialisez les filtres.</span><button onClick={() => { setQuery(''); setFilter('Tous les statuts'); setActiveTab('Tout'); }}>Réinitialiser la recherche</button></div>}
      </div>
      <div className="table-footer"><span>Affichage de <b>{rows.length ? 1 : 0}–{rows.length}</b> sur <b>{allRows.length}</b> enregistrements illustratifs</span><div className="pagination"><button disabled aria-label="Page précédente"><ChevronLeft size={15} /></button><button className="current-page">1</button><button disabled aria-label="Page suivante"><ChevronRight size={15} /></button></div></div>
    </section>
    <div className="module-footnote"><ShieldCheck size={14} /><span>Environnement de démonstration — aucun mouvement, règlement ou effet réel n’est transmis ni comptabilisé.</span><button onClick={() => onNotify('Aucune donnée n’est connectée à un serveur.')}>En savoir plus</button></div>
  </div>;
}

function Router() {
  return <RoutedErrorBoundary><AppShellRouter /></RoutedErrorBoundary>;
}
function AppShellRouter() {
  return <Switch>
    <Route path="/customer/login" component={CustomerApp} />
    <Route path="/customer/home" component={CustomerApp} />
    <Route path="/customer/catalog" component={CustomerApp} />
    <Route path="/customer/product/:code" component={CustomerApp} />
    <Route path="/customer/cart" component={CustomerApp} />
    <Route path="/customer/orders" component={CustomerApp} />
    <Route path="/customer/order/:ref" component={CustomerApp} />
    <Route path="/customer/invoices" component={CustomerApp} />
    <Route path="/customer/profile" component={CustomerApp} />
    <Route path="/login" component={StaffApp} />
    <Route path="/:ws/dashboard" component={StaffApp} />
    <Route path="/:ws/:module" component={StaffApp} />
    <Route path="/" component={AppShell} />
    <Route path="/orders" component={AppShell} />
    <Route path="/products" component={AppShell} />
    <Route path="/inventory" component={AppShell} />
    <Route path="/customers" component={AppShell} />
    <Route path="/purchasing" component={AppShell} />
    <Route path="/deliveries" component={AppShell} />
    <Route path="/finance" component={AppShell} />
    <Route path="/reports" component={AppShell} />
    <Route path="/settings" component={AppShell} />
    <Route component={NotFound} />
  </Switch>;
}
function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}
export default App;