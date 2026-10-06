import { useState } from 'react';
import {
  Package, Search, Filter, Plus, Download, CheckCircle2,
  Boxes, Edit2, Tag,
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
  },
];

export default function ProductsManagement() {
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
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
          <button className="button-primary" onClick={() => notify('Formulaire d’ajout de produit prêt.')}>
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
                <th>CODE / SKU</th>
                <th>DÉSIGNATION & CATÉGORIE</th>
                <th>CONDITIONNEMENT</th>
                <th>PRIX BASE HT (TVA)</th>
                <th>TARIF REVENDEUR</th>
                <th>TARIF GROSSISTE</th>
                <th>STOCK TOTAL</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prd) => (
                <tr key={prd.id}>
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
                    <span className="status-pill status-green">
                      <i /> {prd.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
