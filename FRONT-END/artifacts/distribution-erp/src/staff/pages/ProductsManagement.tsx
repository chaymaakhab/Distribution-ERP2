import { useState } from 'react';
import {
  Package, Search, Filter, Plus, Download, CheckCircle2,
  Boxes, Edit2, Tag, X, Barcode, Trash2, Check, AlertCircle,
} from 'lucide-react';
import { formatMoney } from '../api';

interface ProductItem {
  id: number;
  code: string;
  sku: string;
  name: string;
  category: string;
  price_ht: number;
  vat_rate: number;
  price_revendeur: number;
  price_grossiste: number;
  packaging: string;
  status: 'Actif' | 'Inactif';
  total_stock: number;
  image?: string;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    code: 'PRD-0018',
    sku: 'HRC-0850',
    name: 'Perceuse à percussion 850W',
    category: 'Outillage',
    price_ht: 1040.83,
    vat_rate: 20,
    price_revendeur: 1124.1,
    price_grossiste: 1024.18,
    packaging: 'Carton · 4 unités',
    status: 'Actif',
    total_stock: 120,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 2,
    code: 'PRD-0017',
    sku: 'CUT-230D',
    name: 'Disque diamant 230 mm',
    category: 'Outillage',
    price_ht: 157.92,
    vat_rate: 20,
    price_revendeur: 170.55,
    price_grossiste: 155.39,
    packaging: 'Pièce',
    status: 'Actif',
    total_stock: 64,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 3,
    code: 'PRD-0016',
    sku: 'PMP-15HP',
    name: 'Pompe immergée 1.5 HP',
    category: 'Plomberie',
    price_ht: 3368.42,
    vat_rate: 14,
    price_revendeur: 3456.0,
    price_grossiste: 3148.8,
    packaging: 'Pièce',
    status: 'Actif',
    total_stock: 8,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 4,
    code: 'PRD-0015',
    sku: 'CAB-3G25',
    name: 'Câble électrique 3G2.5',
    category: 'Électricité',
    price_ht: 10.67,
    vat_rate: 20,
    price_revendeur: 11.52,
    price_grossiste: 10.5,
    packaging: 'Mètre',
    status: 'Actif',
    total_stock: 480,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 5,
    code: 'PRD-0014',
    sku: 'GEN-5000',
    name: 'Groupe électrogène 5 kVA',
    category: 'Énergie',
    price_ht: 7458.33,
    vat_rate: 20,
    price_revendeur: 8055.0,
    price_grossiste: 7339.0,
    packaging: 'Pièce',
    status: 'Actif',
    total_stock: 3,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 6,
    code: 'PRD-0011',
    sku: 'CHA-100I',
    name: 'Charnière inox 100 mm',
    category: 'Quincaillerie',
    price_ht: 12.92,
    vat_rate: 20,
    price_revendeur: 13.95,
    price_grossiste: 12.71,
    packaging: 'Sachet · 6 pièces',
    status: 'Actif',
    total_stock: 210,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=300&q=80',
  },
];

export default function ProductsManagement() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  // New Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Outillage');
  const [formPackaging, setFormPackaging] = useState('Pièce');
  const [formPriceHt, setFormPriceHt] = useState<number>(250);
  const [formVatRate, setFormVatRate] = useState<number>(20);
  const [formPriceRevendeur, setFormPriceRevendeur] = useState<number>(275);
  const [formPriceGrossiste, setFormPriceGrossiste] = useState<number>(260);
  const [formInitialStock, setFormInitialStock] = useState<number>(50);
  const [formMinAlert, setFormMinAlert] = useState<number>(10);
  const [formDepot, setFormDepot] = useState('DEP-01 Casablanca Central');
  const [formLocation, setFormLocation] = useState('Allée A - Rayon R-02');
  const [formBarcode, setFormBarcode] = useState('');
  const [formImage, setFormImage] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editSku, setEditSku] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Outillage');
  const [editPackaging, setEditPackaging] = useState('Pièce');
  const [editPriceHt, setEditPriceHt] = useState<number>(250);
  const [editVatRate, setEditVatRate] = useState<number>(20);
  const [editPriceRevendeur, setEditPriceRevendeur] = useState<number>(275);
  const [editPriceGrossiste, setEditPriceGrossiste] = useState<number>(260);
  const [editTotalStock, setEditTotalStock] = useState<number>(50);
  const [editStatus, setEditStatus] = useState<'Actif' | 'Inactif'>('Actif');
  const [editImage, setEditImage] = useState<string>('');

  // Delete Confirm State
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<ProductItem | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handlePriceHtChange(newHt: number) {
    setFormPriceHt(newHt);
    // Auto calculate suggested tier prices
    setFormPriceRevendeur(Math.round(newHt * 1.12 * 100) / 100);
    setFormPriceGrossiste(Math.round(newHt * 1.05 * 100) / 100);
  }

  function generateBarcode() {
    const random10 = Math.floor(1000000000 + Math.random() * 9000000000);
    setFormBarcode(`611${random10}`);
  }

  function openEditModal(prd: ProductItem) {
    setEditingProduct(prd);
    setEditSku(prd.sku);
    setEditName(prd.name);
    setEditCategory(prd.category);
    setEditPackaging(prd.packaging);
    setEditPriceHt(prd.price_ht);
    setEditVatRate(prd.vat_rate);
    setEditPriceRevendeur(prd.price_revendeur);
    setEditPriceGrossiste(prd.price_grossiste);
    setEditTotalStock(prd.total_stock);
    setEditStatus(prd.status);
    setEditImage(prd.image || '');
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            sku: editSku.trim().toUpperCase(),
            name: editName.trim(),
            category: editCategory,
            packaging: editPackaging.trim() || 'Pièce',
            price_ht: Number(editPriceHt) || 0,
            vat_rate: Number(editVatRate) || 20,
            price_revendeur: Number(editPriceRevendeur) || (Number(editPriceHt) * 1.12),
            price_grossiste: Number(editPriceGrossiste) || (Number(editPriceHt) * 1.05),
            total_stock: Number(editTotalStock) || 0,
            status: editStatus,
            image: editImage.trim() || undefined,
          };
        }
        return p;
      })
    );

    notify(`Article « ${editName} » mis à jour avec succès !`);
    setEditingProduct(null);
  }

  function handleDelete(id: number) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmProduct(null);
    notify('Référence produit supprimée avec succès.');
  }

  function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim()) {
      notify('Veuillez renseigner la désignation et le SKU du produit.');
      return;
    }

    const nextId = products.length + 1;
    const nextCode = `PRD-${String(nextId).padStart(4, '0')}`;
    const newProduct: ProductItem = {
      id: Date.now(),
      code: nextCode,
      sku: formSku.trim().toUpperCase(),
      name: formName.trim(),
      category: formCategory,
      price_ht: Number(formPriceHt) || 0,
      vat_rate: Number(formVatRate) || 20,
      price_revendeur: Number(formPriceRevendeur) || (Number(formPriceHt) * 1.12),
      price_grossiste: Number(formPriceGrossiste) || (Number(formPriceHt) * 1.05),
      packaging: formPackaging.trim() || 'Pièce',
      status: 'Actif',
      total_stock: Number(formInitialStock) || 0,
      image: formImage.trim() || undefined,
    };

    setProducts([newProduct, ...products]);
    setShowAddModal(false);

    // Reset Form
    setFormSku('');
    setFormName('');
    setFormPriceHt(250);
    setFormPriceRevendeur(275);
    setFormPriceGrossiste(260);
    setFormInitialStock(50);
    setFormBarcode('');
    setFormImage('');

    notify(`Produit « ${newProduct.name} » (${newProduct.sku}) enregistré avec succès !`);
  }

  const filtered = products.filter((p) => {
    const matchQ =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      p.code.toLowerCase().includes(query.toLowerCase());
    const matchCat = catFilter === 'all' || p.category === catFilter;
    return matchQ && matchCat;
  });

  return (
    <div className="module-page products-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">RÉFÉRENTIEL ARTICLES <span className="heading-slash">/</span> CATALOGUE & TARIFS</div>
          <h1>Catalogue Produits & Grilles Tarifaires</h1>
          <p>Gestion des références SKU, conditionnements, taux de TVA légaux et tarifs selon les segments clients.</p>
        </div>
        <div className="heading-actions">
          <button className="button-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Ajouter un produit
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>Références actives</span>
          <strong className="blue">{products.length} articles</strong>
        </div>
        <div className="summary-box">
          <span>TVA 20% standard</span>
          <strong className="neutral">{products.filter((p) => p.vat_rate === 20).length} articles</strong>
        </div>
        <div className="summary-box">
          <span>TVA 14% plomberie/pompage</span>
          <strong className="neutral">{products.filter((p) => p.vat_rate === 14).length} articles</strong>
        </div>
        <div className="summary-box">
          <span>En alerte stock</span>
          <strong className="needs-action">{products.filter((p) => p.total_stock < 10).length} articles</strong>
        </div>
      </div>

      {/* Main Table Panel */}
      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">RÉPERTOIRE DES ARTICLES</span>
            <h2>Catalogue ({filtered.length})</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} produits affichés
          </div>
        </div>

        <div className="table-tools">
          <div className="table-tabs">
            {['all', 'Outillage', 'Plomberie', 'Électricité', 'Énergie', 'Quincaillerie'].map((c) => (
              <button
                key={c}
                className={`table-tab ${catFilter === c ? 'active-tab' : ''}`}
                onClick={() => setCatFilter(c)}
              >
                {c === 'all' ? 'Toutes catégories' : c}
              </button>
            ))}
          </div>
          <div className="tool-actions">
            <label className="search-field">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher désignation, SKU, code..."
              />
            </label>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th style={{ width: 56 }}>PHOTO</th>
                <th>CODE / SKU</th>
                <th>DÉSIGNATION & CATÉGORIE</th>
                <th>CONDITIONNEMENT</th>
                <th>PRIX BASE HT (TVA)</th>
                <th>TARIF REVENDEUR</th>
                <th>TARIF GROSSISTE</th>
                <th>STOCK TOTAL</th>
                <th>STATUT</th>
                <th style={{ width: 100, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prd) => (
                <tr key={prd.id}>
                  <td>
                    {prd.image ? (
                      <img
                        src={prd.image}
                        alt={prd.name}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 6,
                          objectFit: 'cover',
                          border: '1px solid var(--line)',
                          background: '#f8fafc',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 6,
                          background: 'rgba(56,189,248,0.1)',
                          border: '1px solid var(--line)',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#0284c7',
                        }}
                      >
                        <Package size={20} />
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="table-ref">{prd.sku}</span>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px' }}>
                      {prd.code}
                    </small>
                  </td>
                  <td>
                    <b className="table-main">{prd.name}</b>
                    <small style={{ display: 'block', color: 'var(--muted)' }}>{prd.category}</small>
                  </td>
                  <td>
                    <span>{prd.packaging}</span>
                  </td>
                  <td>
                    <b>{formatMoney(prd.price_ht)} DH</b>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px' }}>
                      TVA {prd.vat_rate}%
                    </small>
                  </td>
                  <td>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{formatMoney(prd.price_revendeur)} DH</span>
                  </td>
                  <td>
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>{formatMoney(prd.price_grossiste)} DH</span>
                  </td>
                  <td>
                    <b style={{ color: prd.total_stock < 10 ? '#ef4444' : 'inherit' }}>{prd.total_stock} un.</b>
                  </td>
                  <td>
                    <span className={`status-pill ${prd.status === 'Actif' ? 'status-green' : 'status-muted'}`}>
                      <i /> {prd.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        className="row-action"
                        title="Modifier la fiche produit"
                        style={{ color: '#0284c7' }}
                        onClick={() => openEditModal(prd)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="row-action"
                        title="Supprimer la référence produit"
                        style={{ color: '#ef4444' }}
                        onClick={() => setDeleteConfirmProduct(prd)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Modal Nouveau Produit ── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <form
            className="record-modal"
            onSubmit={handleCreateProduct}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 720,
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
                  RÉFÉRENTIEL ARTICLES · CATALOGUE ERP
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Ajouter une nouvelle référence produit
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowAddModal(false)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body */}
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
              {/* Reference & Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Référence SKU *
                  <input
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="Ex. OUT-0920"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Désignation complète de l'article *
                  <input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex. Scie circulaire 1400W 185mm"
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

              {/* Category & Packaging */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Catégorie principale
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
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
                    <option value="Outillage">Outillage</option>
                    <option value="Plomberie">Plomberie</option>
                    <option value="Électricité">Électricité</option>
                    <option value="Énergie">Énergie</option>
                    <option value="Quincaillerie">Quincaillerie</option>
                    <option value="Agroalimentaire">Agroalimentaire</option>
                    <option value="Droguerie">Droguerie</option>
                    <option value="Autre">Autre</option>
                  </select>
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Conditionnement / Unité de vente
                  <input
                    value={formPackaging}
                    onChange={(e) => setFormPackaging(e.target.value)}
                    placeholder="Ex. Pièce, Carton · 4 unités, Sac 25kg..."
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

              {/* Pricing & VAT Box */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: 14,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', marginBottom: 10, textTransform: 'uppercase' }}>
                  Structure Tarifaire & Taux de TVA (DH) :
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 11.5 }}>
                    Prix d'Achat HT *
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      required
                      value={formPriceHt}
                      onChange={(e) => handlePriceHtChange(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '0 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: 12.5,
                        textAlign: 'right',
                      }}
                    />
                  </label>

                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 11.5 }}>
                    Taux TVA (%)
                    <select
                      value={formVatRate}
                      onChange={(e) => setFormVatRate(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '0 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: 12.5,
                      }}
                    >
                      <option value={20}>20% (Standard)</option>
                      <option value={14}>14% (Plomberie/BTP)</option>
                      <option value={10}>10% (Agro)</option>
                      <option value={7}>7% (Essentiels)</option>
                      <option value={0}>0% (Exonéré)</option>
                    </select>
                  </label>

                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 11.5 }}>
                    Tarif Grossiste HT
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={formPriceGrossiste}
                      onChange={(e) => setFormPriceGrossiste(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '0 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#16a34a',
                        fontWeight: 700,
                        fontSize: 12.5,
                        textAlign: 'right',
                      }}
                    />
                  </label>

                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 11.5 }}>
                    Tarif Revendeur HT
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={formPriceRevendeur}
                      onChange={(e) => setFormPriceRevendeur(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: 36,
                        padding: '0 8px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0284c7',
                        fontWeight: 700,
                        fontSize: 12.5,
                        textAlign: 'right',
                      }}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, fontSize: 12, color: '#64748b' }}>
                  <span>
                    Prix Vente Revendeur TTC estimé :{' '}
                    <b style={{ color: '#0f172a' }}>
                      {formatMoney(formPriceRevendeur * (1 + formVatRate / 100))} DH
                    </b>
                  </span>
                </div>
              </div>

              {/* Stock initial & Logistics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1.2fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Stock Initial
                  <input
                    type="number"
                    min={0}
                    value={formInitialStock}
                    onChange={(e) => setFormInitialStock(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 8px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                      textAlign: 'center',
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Seuil d'alerte min.
                  <input
                    type="number"
                    min={1}
                    value={formMinAlert}
                    onChange={(e) => setFormMinAlert(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 8px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                      textAlign: 'center',
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Dépôt d'affectation
                  <select
                    value={formDepot}
                    onChange={(e) => setFormDepot(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 8px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 12,
                    }}
                  >
                    <option value="DEP-01 Casablanca Central">DEP-01 Casablanca Central</option>
                    <option value="DEP-02 Rabat">DEP-02 Rabat</option>
                    <option value="DEP-03 Berrechid">DEP-03 Berrechid</option>
                  </select>
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Emplacement stock
                  <input
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Allée A - Rayon R-02"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 8px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 12,
                    }}
                  />
                </label>
              </div>

              {/* Barcode EAN-13 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'flex-end' }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Code-barres EAN-13
                  <input
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    placeholder="Ex. 6111234567890"
                    maxLength={13}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                      letterSpacing: '1px',
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={generateBarcode}
                  style={{
                    height: 38,
                    padding: '0 14px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Barcode size={15} /> Générer EAN-13
                </button>
              </div>

              {/* Photo / Image URL */}
              <div style={{ marginTop: 14 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  URL de la photo du produit (Optionnel)
                  <input
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... (ou lien photo de l'article)"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  />
                </label>
                {formImage && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={formImage}
                      alt="Aperçu"
                      style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover', border: '1px solid #cbd5e1' }}
                    />
                    <small style={{ color: '#16a34a', fontWeight: 600, fontSize: 11 }}>Aperçu image chargé</small>
                  </div>
                )}
              </div>
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
                onClick={() => setShowAddModal(false)}
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
                <Plus size={16} /> Enregistrer le produit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal Modifier Produit ── */}
      {editingProduct && (
        <div className="modal-backdrop" onClick={() => setEditingProduct(null)}>
          <form
            className="record-modal"
            onSubmit={handleSaveEdit}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 700,
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
                  MODIFICATION ARTICLE · {editingProduct.code}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Modifier {editingProduct.name}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditingProduct(null)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Référence SKU *
                  <input
                    required
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Désignation commerciale *
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Catégorie
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option>Outillage</option>
                    <option>Plomberie</option>
                    <option>Électricité</option>
                    <option>Énergie</option>
                    <option>Quincaillerie</option>
                  </select>
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Conditionnement
                  <input
                    value={editPackaging}
                    onChange={(e) => setEditPackaging(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Statut
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    style={{ width: '100%', height: 38, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </label>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Grille Tarifaire (MAD / DH) & TVA
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                  <label className="field-label" style={{ fontSize: 11.5 }}>
                    Prix de base HT (DH)
                    <input
                      type="number"
                      step="0.01"
                      value={editPriceHt}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEditPriceHt(val);
                        setEditPriceRevendeur(Math.round(val * 1.12 * 100) / 100);
                        setEditPriceGrossiste(Math.round(val * 1.05 * 100) / 100);
                      }}
                      style={{ width: '100%', height: 36, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                    />
                  </label>
                  <label className="field-label" style={{ fontSize: 11.5 }}>
                    Taux TVA (%)
                    <select
                      value={editVatRate}
                      onChange={(e) => setEditVatRate(Number(e.target.value))}
                      style={{ width: '100%', height: 36, padding: '0 6px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                    >
                      <option value={20}>20% (Standard)</option>
                      <option value={14}>14% (Plomberie)</option>
                      <option value={10}>10% (Énergie)</option>
                      <option value={7}>7% (Spécifique)</option>
                    </select>
                  </label>
                  <label className="field-label" style={{ fontSize: 11.5 }}>
                    Tarif Revendeur (DH)
                    <input
                      type="number"
                      step="0.01"
                      value={editPriceRevendeur}
                      onChange={(e) => setEditPriceRevendeur(Number(e.target.value))}
                      style={{ width: '100%', height: 36, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                    />
                  </label>
                  <label className="field-label" style={{ fontSize: 11.5 }}>
                    Tarif Grossiste (DH)
                    <input
                      type="number"
                      step="0.01"
                      value={editPriceGrossiste}
                      onChange={(e) => setEditPriceGrossiste(Number(e.target.value))}
                      style={{ width: '100%', height: 36, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Stock total disponible
                  <input
                    type="number"
                    value={editTotalStock}
                    onChange={(e) => setEditTotalStock(Number(e.target.value))}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  URL photo du produit
                  <input
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    placeholder="https://..."
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  />
                </label>
              </div>

              {editImage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', padding: 8, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <img
                    src={editImage}
                    alt="Aperçu"
                    style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                  />
                  <small style={{ color: '#64748b', fontSize: 11 }}>Aperçu de la photo de l'article</small>
                </div>
              )}
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
                onClick={() => setEditingProduct(null)}
                style={{ height: 38, padding: '0 16px', background: '#ffffff', border: '1px solid #cbd5e1' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{ height: 38, padding: '0 20px', background: '#0284c7', borderColor: '#0369a1' }}
              >
                <Check size={15} /> Mettre à jour l'article
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal Confirmation Suppression ── */}
      {deleteConfirmProduct && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmProduct(null)}>
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
              Supprimer la référence {deleteConfirmProduct.sku} ?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
              Êtes-vous certain de vouloir supprimer le produit <b>« {deleteConfirmProduct.name} »</b> ? Cette opération le retirera du catalogue et des ventes.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setDeleteConfirmProduct(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => handleDelete(deleteConfirmProduct.id)}
                style={{ padding: '8px 16px', background: '#ef4444', borderColor: '#dc2626', color: '#ffffff' }}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
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
