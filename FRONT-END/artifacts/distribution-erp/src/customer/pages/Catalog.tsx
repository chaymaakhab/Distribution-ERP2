import { useEffect, useMemo, useState } from 'react';
import {
  Search, X, Loader2, SlidersHorizontal, Check, LayoutGrid, List,
  ArrowUpDown, Package, Plus, Minus,
} from 'lucide-react';
import { api, type Product } from '../api';
import { formatMoney, useCart } from '../cart';
import { PageHeader } from '../CustomerApp';
import ProductCard from '../components/ProductCard';

type Category = { id: number; code: string; name: string; products_count: number };

export default function Catalog() {
  const { add } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [onlyStock, setOnlyStock] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'name'>('default');
  const [added, setAdded] = useState<number | null>(null);

  // Read URL search params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQ = urlParams.get('q');
    const initialCat = urlParams.get('category');
    if (initialQ) setQ(initialQ);
    if (initialCat) setCategory(initialCat);
  }, []);

  useEffect(() => {
    api.categories().then((r) => setCategories(r.data)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setProducts(null);
    const t = setTimeout(() => {
      api.products({ q: q || undefined, category: category || undefined })
        .then((r) => setProducts(r.data))
        .catch(() => setProducts([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category]);

  const visible = useMemo(() => {
    if (!products) return null;
    let list = onlyStock ? products.filter((p) => p.in_stock) : [...products];

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price_ht - b.price_ht);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price_ht - a.price_ht);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, onlyStock, sortBy]);

  function handleAdd(p: Product, qty: number = 1) {
    add(p, qty);
    setAdded(p.id);
    setTimeout(() => setAdded((a) => (a === p.id ? null : a)), 1200);
  }

  return (
    <div className="cx-page">
      <PageHeader
        kicker="CATALOGUE B2B OFFICIEL"
        title="Catalogue des Articles & Matériel"
        description="Tarifs personnalisés selon votre grille grossiste. Prix affichés en DH Hors Taxes et Toutes Taxes Comprises."
      />

      {/* Modern Filter & Search Toolbar */}
      <div className="cx-toolbar">
        <label className="cx-search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par référence, désignation, code-barres..."
            data-testid="input-catalog-search"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Effacer">
              <X size={15} />
            </button>
          )}
        </label>

        <div className="cx-toolbar-options">
          {/* In Stock Only Toggle */}
          <button
            className={`cx-chip-toggle ${onlyStock ? 'active' : ''}`}
            onClick={() => setOnlyStock((s) => !s)}
          >
            <SlidersHorizontal size={14} /> En stock uniquement {onlyStock && <Check size={13} />}
          </button>

          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <ArrowUpDown size={14} style={{ color: 'var(--cx-muted)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                height: 38,
                padding: '0 10px',
                borderRadius: 9,
                border: '1px solid var(--cx-border)',
                background: 'var(--cx-surface)',
                color: 'var(--cx-text)',
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
              }}
            >
              <option value="default">Tri : Recommandé</option>
              <option value="price_asc">Prix HT croissant</option>
              <option value="price_desc">Prix HT décroissant</option>
              <option value="name">Désignation (A-Z)</option>
            </select>
          </div>

          {/* Grid vs. List / Table View Toggle */}
          <div className="cx-view-toggles">
            <button
              className={`cx-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Affichage Grille"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`cx-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Affichage Tableau B2B"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="cx-cat-row">
        <button
          className={`cx-cat ${category === '' ? 'active' : ''}`}
          onClick={() => setCategory('')}
        >
          Tous les rayons
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`cx-cat ${category === c.code ? 'active' : ''}`}
            onClick={() => setCategory(c.code)}
          >
            {c.name} <small>{c.products_count}</small>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {visible === null ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--cx-muted)' }}>
          <Loader2 className="cx-spin" size={26} style={{ color: 'var(--cx-brand)', margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600 }}>Chargement du catalogue en direct de l'entrepôt…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="cx-empty">
          <Search size={32} style={{ color: 'var(--cx-brand)' }} />
          <h2>Aucun article trouvé</h2>
          <p>Essayez de modifier votre recherche ou réinitialisez les critères de filtres.</p>
          <button
            className="cx-btn cx-btn-ghost"
            onClick={() => {
              setQ('');
              setCategory('');
              setOnlyStock(false);
              setSortBy('default');
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cx-muted)' }}>
              <b>{visible.length}</b> article(s) disponible(s) dans votre tarif
            </span>
          </div>

          {/* GRID VIEW */}
          {viewMode === 'grid' ? (
            <div className="cx-product-grid">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={handleAdd}
                  added={added === p.id}
                />
              ))}
            </div>
          ) : (
            /* B2B WHOLESALE TABLE VIEW */
            <div className="cx-b2b-table-wrap">
              <table className="cx-table">
                <thead>
                  <tr>
                    <th>Article & Référence</th>
                    <th>Rayon</th>
                    <th>Conditionnement</th>
                    <th>Stock Dépôt</th>
                    <th>Prix Gros HT</th>
                    <th>Prix TTC</th>
                    <th className="right">Commande rapide</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p) => {
                    const out = !p.in_stock;
                    return (
                      <tr key={p.id} style={{ opacity: out ? 0.65 : 1 }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=80&q=80'}
                              alt={p.name}
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: '#f1f5f9' }}
                            />
                            <div>
                              <b style={{ display: 'block', fontSize: 14 }}>{p.name}</b>
                              <small style={{ color: 'var(--cx-muted)', fontFamily: 'var(--cx-font-mono)' }}>
                                SKU: {p.sku || p.code}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontSize: 12.5, fontWeight: 600 }}>{p.category}</span></td>
                        <td><span style={{ fontSize: 12, color: 'var(--cx-muted)' }}>{p.packaging || p.unit}</span></td>
                        <td>
                          <span className={`cx-stock-tag ${out ? 'out' : 'in'}`}>
                            <span className="dot" />
                            {out ? 'Rupture' : `${p.available_qty} dispo`}
                          </span>
                        </td>
                        <td>
                          <b style={{ fontSize: 15, color: 'var(--cx-text)' }}>{formatMoney(p.price_ht)}</b>
                          <small style={{ display: 'block', fontSize: 10.5, color: 'var(--cx-brand)' }}>HT</small>
                        </td>
                        <td>
                          <span style={{ fontSize: 13, color: 'var(--cx-muted)' }}>{formatMoney(p.price_ttc)}</span>
                        </td>
                        <td className="right">
                          <button
                            className={`cx-btn sm ${added === p.id ? 'cx-btn-emerald' : 'cx-btn-primary'}`}
                            disabled={out}
                            onClick={() => handleAdd(p, p.min_order_qty || 1)}
                          >
                            {added === p.id ? <><Check size={14} /> Ajouté</> : <><Plus size={14} /> Ajouter</>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
