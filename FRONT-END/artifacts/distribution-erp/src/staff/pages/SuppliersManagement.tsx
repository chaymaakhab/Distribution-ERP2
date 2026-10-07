import { useState } from 'react';
import {
  Building2, Search, Plus, Phone, Mail, MapPin, X, Eye,
  Package, TrendingUp, CheckCircle2, RefreshCw, FileText, ShoppingCart,
} from 'lucide-react';
import { formatMoney } from '../api';
import NewPurchaseOrderModal from '../components/NewPurchaseOrderModal';
import PurchaseOrderDocumentModal, { type PurchaseOrderData } from '../components/PurchaseOrderDocumentModal';

interface Supplier {
  id: number;
  code: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  ice: string;
  rc: string;
  products_count: number;
  last_order: string;
  total_purchases: number;
  status: 'Actif' | 'Inactif' | 'Suspendu';
  categories: string[];
  payment_terms: string;
  lead_time_days: number;
}

const SUPPLIERS: Supplier[] = [
  {
    id: 1,
    code: 'FRN-001',
    name: 'Cosumar S.A.',
    contact: 'Mohammed Alami',
    phone: '+212 5 22 84 00 00',
    email: 'commercial@cosumar.co.ma',
    city: 'Casablanca',
    address: '8 Rue El Abbès, Mers Sultan',
    ice: '001045720000056',
    rc: '55431',
    products_count: 4,
    last_order: '02 Oct 2026',
    total_purchases: 1240500,
    status: 'Actif',
    categories: ['Sucre', 'Dérivés sucriers'],
    payment_terms: '60 jours fin de mois',
    lead_time_days: 5,
  },
  {
    id: 2,
    code: 'FRN-002',
    name: 'Lesieur Cristal',
    contact: 'Karim Benali',
    phone: '+212 5 22 36 36 36',
    email: 'ventes@lesieur.ma',
    city: 'Casablanca',
    address: 'Route de Rabat, Ain Sebaâ',
    ice: '003284100000012',
    rc: '68920',
    products_count: 6,
    last_order: '29 Sep 2026',
    total_purchases: 2180000,
    status: 'Actif',
    categories: ['Huiles végétales', 'Savons'],
    payment_terms: '45 jours date facture',
    lead_time_days: 3,
  },
  {
    id: 3,
    code: 'FRN-003',
    name: 'Minoterie Tazi & Fils',
    contact: 'Hassan Tazi',
    phone: '+212 5 23 40 12 34',
    email: 'htazi@minotazi.ma',
    city: 'Berrechid',
    address: 'Zone Industrielle Berrechid, Lot 12',
    ice: '008174220000041',
    rc: '34567',
    products_count: 3,
    last_order: '25 Sep 2026',
    total_purchases: 876300,
    status: 'Actif',
    categories: ['Farines', 'Semoules'],
    payment_terms: '30 jours date facture',
    lead_time_days: 7,
  },
  {
    id: 4,
    code: 'FRN-004',
    name: 'Salines du Gharb',
    contact: 'Fatima Bennani',
    phone: '+212 5 37 61 80 00',
    email: 'contact@salines-gharb.ma',
    city: 'Kenitra',
    address: 'Route de la Mer, Kenitra',
    ice: '006429800000078',
    rc: '22301',
    products_count: 2,
    last_order: '18 Sep 2026',
    total_purchases: 345800,
    status: 'Actif',
    categories: ['Sel industriel', 'Sel alimentaire'],
    payment_terms: '30 jours date facture',
    lead_time_days: 10,
  },
  {
    id: 5,
    code: 'FRN-005',
    name: 'Rizerie El Ouahda',
    contact: 'Omar Cherkaoui',
    phone: '+212 6 61 23 45 67',
    email: 'riz-elouahda@gmail.com',
    city: 'Mohammedia',
    address: 'Port de Mohammedia, Hangar 7',
    ice: '007834100000090',
    rc: '89012',
    products_count: 2,
    last_order: '10 Sep 2026',
    total_purchases: 490200,
    status: 'Inactif',
    categories: ['Riz', 'Légumineuses'],
    payment_terms: '60 jours fin de mois',
    lead_time_days: 14,
  },
  {
    id: 6,
    code: 'FRN-006',
    name: 'Import Légumes Sec SARL',
    contact: 'Youssef Mansouri',
    phone: '+212 5 22 72 00 01',
    email: 'y.mansouri@ils-sarl.ma',
    city: 'Casablanca',
    address: 'Derb Omar, Bloc C',
    ice: '002891000000033',
    rc: '44123',
    products_count: 5,
    last_order: '05 Aug 2026',
    total_purchases: 184600,
    status: 'Suspendu',
    categories: ['Lentilles', 'Pois chiches', 'Haricots'],
    payment_terms: 'Comptant livraison',
    lead_time_days: 21,
  },
];

export default function SuppliersManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showNewPo, setShowNewPo] = useState<boolean>(false);
  const [targetSupplierForPo, setTargetSupplierForPo] = useState<Supplier | null>(null);
  const [viewPoData, setViewPoData] = useState<PurchaseOrderData | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleCreatePo(po: PurchaseOrderData) {
    setShowNewPo(false);
    setTargetSupplierForPo(null);
    setViewPoData(po);
    notify(`Bon d'Achat ${po.ref} émis avec succès pour ${po.supplier} !`);
  }

  const filtered = SUPPLIERS.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'Tous' || s.status === statusFilter;
    return matchQ && matchStatus;
  });

  const totalPurchases = SUPPLIERS.reduce((a, b) => a + b.total_purchases, 0);
  const activeCount = SUPPLIERS.filter(s => s.status === 'Actif').length;

  return (
    <div className="module-page">
      {/* ── Header ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">RÉFÉRENTIEL <span className="heading-slash">/</span> ACHATS</div>
          <h1>Fournisseurs</h1>
          <p>Gestion du carnet des fournisseurs agréés — normes fiscales marocaines (ICE, RC).</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={() => setShowNewPo(true)}>
            <ShoppingCart size={14} /> Nouveau Bon d'Achat
          </button>
          <button className="button-primary" onClick={() => notify('Formulaire nouveau fournisseur — à implémenter')}>
            <Plus size={14} /> Nouveau fournisseur
          </button>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>Total fournisseurs</span>
          <strong>{SUPPLIERS.length}</strong>
        </div>
        <div className="summary-box">
          <span>Fournisseurs actifs</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="summary-box">
          <span>Total achats cumulés</span>
          <strong>{formatMoney(totalPurchases)} DH</strong>
        </div>
        <div className="summary-box">
          <span>Catégories couvertes</span>
          <strong>8</strong>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="panel list-panel" style={{ marginTop: 16 }}>
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">ANNUAIRE FOURNISSEURS</span>
            <h2>Liste ({filtered.length})</h2>
          </div>
          <div className="table-tools">
            <div className="table-tabs">
              {['Tous', 'Actif', 'Inactif', 'Suspendu'].map(s => (
                <button
                  key={s}
                  className={`table-tab ${statusFilter === s ? 'active-tab' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >{s}</button>
              ))}
            </div>
            <div className="search-field">
              <Search size={13} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Nom, ville, code…"
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Fournisseur</th>
                <th>Contact</th>
                <th>Ville</th>
                <th>Produits</th>
                <th className="table-amount">Achats cumulés</th>
                <th>Dernier achat</th>
                <th>Statut</th>
                <th className="row-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><code className="table-ref">{s.code}</code></td>
                  <td>
                    <div className="table-main">{s.name}</div>
                    <small className="table-secondary">{s.categories.join(' · ')}</small>
                  </td>
                  <td>
                    <div>{s.contact}</div>
                    <small className="table-secondary">{s.phone}</small>
                  </td>
                  <td>{s.city}</td>
                  <td>{s.products_count} réf.</td>
                  <td className="table-amount">{formatMoney(s.total_purchases)} DH</td>
                  <td className="table-secondary">{s.last_order}</td>
                  <td>
                    <span className={`status-pill ${s.status === 'Actif' ? 'status-green' : s.status === 'Suspendu' ? 'status-red' : 'status-muted'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <button className="row-action" title="Voir fiche fournisseur" onClick={() => setSelected(s)}>
                      <Eye size={14} />
                    </button>
                    <button
                      className="row-action"
                      title="Créer un Bon d'Achat"
                      style={{ color: '#0ea5e9' }}
                      onClick={() => {
                        setTargetSupplierForPo(s);
                        setShowNewPo(true);
                      }}
                    >
                      <ShoppingCart size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="record-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">FICHE FOURNISSEUR · {selected.code}</span>
                <h2>{selected.name}</h2>
              </div>
              <button className="icon-button" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
              <div className="frn-field">
                <span className="field-label">ICE</span>
                <code>{selected.ice}</code>
              </div>
              <div className="frn-field">
                <span className="field-label">RC</span>
                <code>{selected.rc}</code>
              </div>
              <div className="frn-field">
                <span className="field-label"><Phone size={11} /> Téléphone</span>
                <span>{selected.phone}</span>
              </div>
              <div className="frn-field">
                <span className="field-label"><Mail size={11} /> Email</span>
                <span style={{ fontSize: 12 }}>{selected.email}</span>
              </div>
              <div className="frn-field" style={{ gridColumn: '1/-1' }}>
                <span className="field-label"><MapPin size={11} /> Adresse</span>
                <span>{selected.address}, {selected.city}</span>
              </div>
              <div className="frn-field">
                <span className="field-label">Conditions paiement</span>
                <span>{selected.payment_terms}</span>
              </div>
              <div className="frn-field">
                <span className="field-label">Délai livraison</span>
                <span>{selected.lead_time_days} jours</span>
              </div>
              <div className="frn-field">
                <span className="field-label"><Package size={11} /> Produits référencés</span>
                <strong>{selected.products_count}</strong>
              </div>
              <div className="frn-field">
                <span className="field-label"><TrendingUp size={11} /> Achats cumulés</span>
                <strong>{formatMoney(selected.total_purchases)} DH</strong>
              </div>
              <div className="frn-field" style={{ gridColumn: '1/-1' }}>
                <span className="field-label">Catégories fournies</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {selected.categories.map(c => (
                    <span key={c} className="status-pill status-blue">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setSelected(null)}>Fermer</button>
              <button
                className="button-primary"
                onClick={() => {
                  const s = selected;
                  setSelected(null);
                  setTargetSupplierForPo(s);
                  setShowNewPo(true);
                }}
              >
                <ShoppingCart size={14} /> Créer Bon d'Achat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Purchase Order Modal ── */}
      {showNewPo && (
        <NewPurchaseOrderModal
          initialSupplierCode={targetSupplierForPo?.code}
          onClose={() => {
            setShowNewPo(false);
            setTargetSupplierForPo(null);
          }}
          onCreate={handleCreatePo}
        />
      )}

      {/* ── Purchase Order Official Document Viewer ── */}
      {viewPoData && (
        <PurchaseOrderDocumentModal
          order={viewPoData}
          onClose={() => setViewPoData(null)}
          onStatusChange={(status) => {
            setViewPoData(prev => prev ? { ...prev, status } : null);
            notify(`Statut du Bon d'Achat mis à jour: ${status}`);
          }}
        />
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
