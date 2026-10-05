import { useEffect, useMemo, useState } from 'react';
import { Search, X, Loader2, SlidersHorizontal, Check } from 'lucide-react';
import { api, type Product } from '../api';
import { useCart } from '../cart';
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
  const [added, setAdded] = useState<number | null>(null);

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
    return onlyStock ? products.filter((p) => p.in_stock) : products;
  }, [products, onlyStock]);

  function quickAdd(p: Product) {
    add(p, p.min_order_qty || 1);
    setAdded(p.id);
    setTimeout(() => setAdded((a) => (a === p.id ? null : a)), 1200);
  }

  return (
    <div className="cx-page">
      <PageHeader
        kicker="CATALOGUE"
        title="Nos produits"
        description="Tarifs appliqués selon votre grille personnalisée. Prix affichés HT et TTC."
      />

      <div className="cx-toolbar">
        <label className="cx-search">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un produit, SKU, code…"
            data-testid="input-catalog-search"
          />
          {q && <button onClick={() => setQ('')} aria-label="Effacer"><X size={14} /></button>}
        </label>
        <button
          className={`cx-chip-toggle ${onlyStock ? 'active' : ''}`}
          onClick={() => setOnlyStock((s) => !s)}
        >
          <SlidersHorizontal size={14} /> En stock uniquement {onlyStock && <Check size={13} />}
        </button>
      </div>

      <div className="cx-cat-row">
        <button className={`cx-cat ${category === '' ? 'active' : ''}`} onClick={() => setCategory('')}>
          Toutes
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

      {visible === null ? (
        <div className="cx-loading"><Loader2 className="cx-spin" size={20} /> Chargement du catalogue…</div>
      ) : visible.length === 0 ? (
        <div className="cx-empty">
          <Search size={26} />
          <h2>Aucun produit trouvé</h2>
          <p>Essayez un autre terme ou réinitialisez les filtres.</p>
          <button className="cx-btn cx-btn-ghost" onClick={() => { setQ(''); setCategory(''); setOnlyStock(false); }}>
            Réinitialiser
          </button>
        </div>
      ) : (
        <>
          <p className="cx-result-count">{visible.length} produit(s)</p>
          <div className="cx-product-grid">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={quickAdd} added={added === p.id} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
