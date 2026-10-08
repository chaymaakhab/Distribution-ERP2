import { useState } from 'react';
import {
  Building2, Search, Plus, Phone, Mail, MapPin, X, Eye,
  Package, TrendingUp, CheckCircle2, RefreshCw, FileText, ShoppingCart,
  Edit2, Trash2, Check,
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
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showNewPo, setShowNewPo] = useState<boolean>(false);
  const [targetSupplierForPo, setTargetSupplierForPo] = useState<Supplier | null>(null);
  const [viewPoData, setViewPoData] = useState<PurchaseOrderData | null>(null);

  // Edit Supplier Modal State
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editSuppName, setEditSuppName] = useState('');
  const [editSuppContact, setEditSuppContact] = useState('');
  const [editSuppPhone, setEditSuppPhone] = useState('');
  const [editSuppEmail, setEditSuppEmail] = useState('');
  const [editSuppCity, setEditSuppCity] = useState('');
  const [editSuppAddress, setEditSuppAddress] = useState('');
  const [editSuppIce, setEditSuppIce] = useState('');
  const [editSuppRc, setEditSuppRc] = useState('');
  const [editSuppStatus, setEditSuppStatus] = useState<Supplier['status']>('Actif');
  const [editSuppCategories, setEditSuppCategories] = useState('');
  const [editSuppPaymentTerms, setEditSuppPaymentTerms] = useState('');

  // Delete Confirm State
  const [deleteConfirmSupplier, setDeleteConfirmSupplier] = useState<Supplier | null>(null);

  function openEditSupplier(s: Supplier) {
    setEditingSupplier(s);
    setEditSuppName(s.name);
    setEditSuppContact(s.contact);
    setEditSuppPhone(s.phone);
    setEditSuppEmail(s.email);
    setEditSuppCity(s.city);
    setEditSuppAddress(s.address);
    setEditSuppIce(s.ice);
    setEditSuppRc(s.rc);
    setEditSuppStatus(s.status);
    setEditSuppCategories(s.categories.join(', '));
    setEditSuppPaymentTerms(s.payment_terms);
  }

  function handleSaveEditSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSupplier) return;

    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === editingSupplier.id) {
          return {
            ...s,
            name: editSuppName.trim(),
            contact: editSuppContact.trim(),
            phone: editSuppPhone.trim(),
            email: editSuppEmail.trim(),
            city: editSuppCity.trim(),
            address: editSuppAddress.trim(),
            ice: editSuppIce.trim(),
            rc: editSuppRc.trim(),
            status: editSuppStatus,
            categories: editSuppCategories.split(',').map(c => c.trim()).filter(Boolean),
            payment_terms: editSuppPaymentTerms.trim() || s.payment_terms,
          };
        }
        return s;
      })
    );

    notify(`Fiche fournisseur « ${editSuppName} » mise à jour avec succès !`);
    setEditingSupplier(null);
  }

  function handleDeleteSupplier(id: number) {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    setDeleteConfirmSupplier(null);
    notify('Fournisseur supprimé du référentiel.');
  }

  // New Supplier Form Modal State
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('+212 5');
  const [formEmail, setFormEmail] = useState('');
  const [formCity, setFormCity] = useState('Casablanca');
  const [formAddress, setFormAddress] = useState('');
  const [formIce, setFormIce] = useState('');
  const [formRc, setFormRc] = useState('');
  const [formIf, setFormIf] = useState('');
  const [formCategories, setFormCategories] = useState('Agroalimentaire');
  const [formPaymentTerms, setFormPaymentTerms] = useState('30 jours date facture');
  const [formLeadTime, setFormLeadTime] = useState(5);
  const [formRib, setFormRib] = useState('');

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

  function handleCreateSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      notify('Veuillez renseigner la raison sociale du fournisseur.');
      return;
    }

    const nextCode = `FRN-${String(suppliers.length + 1).padStart(3, '0')}`;
    const newSupplier: Supplier = {
      id: Date.now(),
      code: nextCode,
      name: formName.trim(),
      contact: formContact.trim() || 'Interlocuteur Commercial',
      phone: formPhone.trim() || '+212 5 22 00 00 00',
      email: formEmail.trim() || `contact@${formName.toLowerCase().replace(/[^a-z0-9]/g, '')}.ma`,
      city: formCity.trim() || 'Casablanca',
      address: formAddress.trim() || 'Zone Industrielle',
      ice: formIce.trim() || '00' + Math.floor(1000000000000 + Math.random() * 9000000000000),
      rc: formRc.trim() || String(Math.floor(10000 + Math.random() * 90000)),
      products_count: 0,
      last_order: 'Nouveau',
      total_purchases: 0,
      status: 'Actif',
      categories: formCategories.split(',').map((c) => c.trim()).filter(Boolean),
      payment_terms: formPaymentTerms,
      lead_time_days: Number(formLeadTime) || 5,
    };

    setSuppliers([newSupplier, ...suppliers]);
    setShowAddSupplierModal(false);

    // Reset Form
    setFormName('');
    setFormContact('');
    setFormPhone('+212 5');
    setFormEmail('');
    setFormAddress('');
    setFormIce('');
    setFormRc('');
    setFormIf('');
    setFormCategories('Agroalimentaire');
    setFormRib('');

    notify(`Fournisseur « ${newSupplier.name} » (${newSupplier.code}) enregistré avec succès !`);
  }

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'Tous' || s.status === statusFilter;
    return matchQ && matchStatus;
  });

  const totalPurchases = suppliers.reduce((a, b) => a + b.total_purchases, 0);
  const activeCount = suppliers.filter(s => s.status === 'Actif').length;

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
          <button className="button-primary" onClick={() => setShowAddSupplierModal(true)}>
            <Plus size={14} /> Nouveau fournisseur
          </button>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>Total fournisseurs</span>
          <strong>{suppliers.length}</strong>
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
                    <button
                      className="row-action"
                      title="Modifier la fiche fournisseur"
                      style={{ color: '#0284c7' }}
                      onClick={() => openEditSupplier(s)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="row-action"
                      title="Supprimer ce fournisseur"
                      style={{ color: '#ef4444' }}
                      onClick={() => setDeleteConfirmSupplier(s)}
                    >
                      <Trash2 size={14} />
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
          <div
            className="record-modal"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 580,
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
                <span className="eyebrow" style={{ color: '#0284c7', fontWeight: 700, fontSize: 11 }}>
                  FICHE FOURNISSEUR · {selected.code}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  {selected.name}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelected(null)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                background: '#ffffff',
              }}
            >
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block' }}>ICE</span>
                <code style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{selected.ice}</code>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block' }}>RC</span>
                <code style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{selected.rc}</code>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Phone size={11} /> Téléphone direct
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{selected.phone}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={11} /> Email
                </span>
                <span style={{ fontSize: 12, color: '#0f172a' }}>{selected.email}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', gridColumn: '1/-1' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> Adresse & Ville
                </span>
                <span style={{ fontSize: 13, color: '#0f172a' }}>{selected.address}, {selected.city}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block' }}>Conditions paiement</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{selected.payment_terms}</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block' }}>Délai d'approvisionnement</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{selected.lead_time_days} jours</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Package size={11} /> Produits référencés
                </span>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>{selected.products_count} articles</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={11} /> Achats cumulés
                </span>
                <strong style={{ fontSize: 14, color: '#0284c7' }}>{formatMoney(selected.total_purchases)} DH</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', gridColumn: '1/-1' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block' }}>Catégories fournies</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {selected.categories.map(c => (
                    <span key={c} style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="modal-actions"
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                position: 'sticky',
                bottom: 0,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                margin: 0,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setSelected(null)}
                style={{
                  height: 38,
                  padding: '0 16px',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Fermer
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  const s = selected;
                  setSelected(null);
                  setTargetSupplierForPo(s);
                  setShowNewPo(true);
                }}
                style={{
                  height: 38,
                  padding: '0 18px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <ShoppingCart size={14} /> Créer Bon d'Achat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Supplier Modal (Fiche Ajout Fournisseur) ── */}
      {showAddSupplierModal && (
        <div className="modal-backdrop" onClick={() => setShowAddSupplierModal(false)}>
          <form
            className="record-modal"
            onSubmit={handleCreateSupplier}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 680,
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
            {/* Header */}
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
                <span className="eyebrow" style={{ color: '#0284c7', fontWeight: 700, fontSize: 11 }}>
                  RÉFÉRENTIEL ACHATS · FOURNISSEURS AGRÉÉS
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Enregistrer un nouveau fournisseur
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowAddSupplierModal(false)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div
              style={{
                padding: '18px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 13,
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>Normes fiscales marocaines : Assurez-vous de renseigner l'ICE valide à 15 chiffres pour les déclarations d'achats déductibles.</span>
              </div>

              {/* Identity & Company Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Raison Sociale / Société *
                  <input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex. Moulins Modernes du Maroc S.A."
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Contact / Interlocuteur principal
                  <input
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="Ex. Omar Berrada"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>
              </div>

              {/* Fiscal Data (ICE, IF, RC) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  ICE (15 chiffres) *
                  <input
                    required
                    value={formIce}
                    onChange={(e) => setFormIce(e.target.value)}
                    placeholder="Ex. 001594832000045"
                    maxLength={15}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Registre Commerce (RC)
                  <input
                    value={formRc}
                    onChange={(e) => setFormRc(e.target.value)}
                    placeholder="Ex. 48920 Casablanca"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Identifiant Fiscal (IF)
                  <input
                    value={formIf}
                    onChange={(e) => setFormIf(e.target.value)}
                    placeholder="Ex. 33412098"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>
              </div>

              {/* Contact (Phone, Email, City) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Téléphone direct *
                  <input
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+212 5 22 XX XX XX"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Email professionnel
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="commandes@fournisseur.ma"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Ville
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  >
                    <option value="Casablanca">Casablanca</option>
                    <option value="Mohammedia">Mohammedia</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Kénitra">Kénitra</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Fès">Fès</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Berrechid">Berrechid</option>
                    <option value="Meknès">Meknès</option>
                  </select>
                </label>
              </div>

              {/* Address */}
              <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                Adresse complète du siège ou de l'entrepôt
                <input
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Ex. Bd Chefchaouni, Zone Industrielle Ain Sebaâ, Lot 14"
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: 13,
                  }}
                />
              </label>

              {/* Commercial & Contract Terms */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 100px', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Catégories de produits fournies
                  <input
                    value={formCategories}
                    onChange={(e) => setFormCategories(e.target.value)}
                    placeholder="Ex. Sucre, Farines, Huiles végétales"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Modalités de paiement convenues
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  >
                    <option value="Comptant livraison">Comptant à la livraison (Chèque/Espèces)</option>
                    <option value="30 jours date facture">30 jours date facture</option>
                    <option value="45 jours date facture">45 jours date facture</option>
                    <option value="60 jours fin de mois">60 jours fin de mois (LCR / Virement)</option>
                    <option value="90 jours traite">90 jours par traite bancaire</option>
                  </select>
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Délai (j.)
                  <input
                    type="number"
                    min={1}
                    value={formLeadTime}
                    onChange={(e) => setFormLeadTime(Number(e.target.value))}
                    title="Délai moyen d'approvisionnement en jours"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 6px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                      textAlign: 'center',
                    }}
                  />
                </label>
              </div>

              {/* Bank RIB */}
              <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                Relevé d'Identité Bancaire (RIB - 24 chiffres) & Banque
                <input
                  value={formRib}
                  onChange={(e) => setFormRib(e.target.value)}
                  placeholder="Ex. 011 780 0000 123456789012 34 (Attijariwafa Bank)"
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: 13,
                  }}
                />
              </label>
            </div>

            {/* Sticky Actions Footer */}
            <div
              className="modal-actions"
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                margin: 0,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowAddSupplierModal(false)}
                style={{
                  height: 38,
                  padding: '0 16px',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{
                  height: 38,
                  padding: '0 20px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Plus size={16} /> Enregistrer le fournisseur
              </button>
            </div>
          </form>
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
          onStatusChange={(_order, status) => {
            setViewPoData(prev => prev ? { ...prev, status } : null);
            notify(`Statut du Bon d'Achat mis à jour: ${status}`);
          }}
        />
      )}

      {/* ── Modal Modifier Fournisseur ── */}
      {editingSupplier && (
        <div className="modal-backdrop" onClick={() => setEditingSupplier(null)}>
          <form
            className="record-modal"
            onSubmit={handleSaveEditSupplier}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 640,
              width: '95%',
              padding: 0,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
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
                <span className="eyebrow" style={{ color: '#0284c7', fontWeight: 700, fontSize: 11 }}>
                  MODIFICATION FOURNISSEUR · {editingSupplier.code}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Modifier {editingSupplier.name}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditingSupplier(null)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Raison sociale *
                  <input
                    required
                    value={editSuppName}
                    onChange={(e) => setEditSuppName(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Contact commercial *
                  <input
                    required
                    value={editSuppContact}
                    onChange={(e) => setEditSuppContact(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Ville *
                  <input
                    required
                    value={editSuppCity}
                    onChange={(e) => setEditSuppCity(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Téléphone direct *
                  <input
                    required
                    value={editSuppPhone}
                    onChange={(e) => setEditSuppPhone(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Email
                  <input
                    value={editSuppEmail}
                    onChange={(e) => setEditSuppEmail(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  N° ICE Maroc
                  <input
                    value={editSuppIce}
                    onChange={(e) => setEditSuppIce(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  N° RC (Registre de commerce)
                  <input
                    value={editSuppRc}
                    onChange={(e) => setEditSuppRc(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Statut
                  <select
                    value={editSuppStatus}
                    onChange={(e) => setEditSuppStatus(e.target.value as any)}
                    style={{ width: '100%', height: 38, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Catégories d'articles (séparées par des virgules)
                  <input
                    value={editSuppCategories}
                    onChange={(e) => setEditSuppCategories(e.target.value)}
                    placeholder="Sucre, Farine, Huile"
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Conditions de paiement
                  <input
                    value={editSuppPaymentTerms}
                    onChange={(e) => setEditSuppPaymentTerms(e.target.value)}
                    placeholder="30 jours date facture"
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
              </div>
            </div>

            <div
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setEditingSupplier(null)}
                style={{ height: 38, padding: '0 16px', background: '#ffffff', border: '1px solid #cbd5e1' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{ height: 38, padding: '0 20px', background: '#0284c7', borderColor: '#0369a1' }}
              >
                <Check size={14} /> Mettre à jour le fournisseur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal Confirmation Suppression Fournisseur ── */}
      {deleteConfirmSupplier && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmSupplier(null)}>
          <div
            className="record-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 440,
              width: '90%',
              padding: '24px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>
              Supprimer le fournisseur {deleteConfirmSupplier.code} ?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
              Êtes-vous certain de vouloir supprimer le fournisseur <b>« {deleteConfirmSupplier.name} »</b> ? Les bons d'achat historiques associés resteront archivés.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setDeleteConfirmSupplier(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => handleDeleteSupplier(deleteConfirmSupplier.id)}
                style={{ padding: '8px 16px', background: '#ef4444', borderColor: '#dc2626', color: '#ffffff' }}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
