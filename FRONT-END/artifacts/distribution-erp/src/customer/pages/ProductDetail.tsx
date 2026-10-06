import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronRight, Loader2, Minus, Plus, Check, Package as PackageIcon, ShieldCheck, Truck, RotateCcw,
} from 'lucide-react';
import { api, type Product } from '../api';
import { formatMoney, useCart } from '../cart';

export default function ProductDetail({ code }: { code: string }) {
  const [, setLocation] = useLocation();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.product(code)
      .then((r) => {
        setProduct(r.data);
        setQty(r.data.min_order_qty || 1);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="cx-loading"><Loader2 className="cx-spin" size={20} /> Chargement…</div>;

  if (notFound || !product) {
    return (
      <div className="cx-empty">
        <PackageIcon size={26} />
        <h2>Produit introuvable</h2>
        <button className="cx-btn cx-btn-primary" onClick={() => setLocation('/customer/catalog')}>Retour au catalogue</button>
      </div>
    );
  }

  const out = !product.in_stock;
  const maxQty = Math.max(product.available_qty, product.min_order_qty);

  function handleAdd() {
    add(product!, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="cx-page">
      <nav className="cx-breadcrumb">
        <Link href="/customer/home">Accueil</Link>
        <ChevronRight size={13} />
        <Link href="/customer/catalog">Catalogue</Link>
        <ChevronRight size={13} />
        <span>{product.name}</span>
      </nav>

      <div className="cx-product-detail">
        <div className="cx-pd-media">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <span className="cx-media-ph lg"><PackageIcon size={48} /></span>
          )}
        </div>

        <div className="cx-pd-info">
          <span className="cx-card-cat">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="cx-pd-sku">Réf. {product.code} · SKU {product.sku}</p>

          {product.description && <p className="cx-pd-desc">{product.description}</p>}

          <div className="cx-pd-price">
            <strong>{formatMoney(product.price_ttc)}</strong>
            <span>TTC · {product.unit}</span>
            <small>{formatMoney(product.price_ht)} HT · TVA {product.vat_rate}%</small>
          </div>

          <div className="cx-pd-stock">
            {out ? (
              <span className="cx-badge cx-badge-red">Rupture de stock</span>
            ) : (
              <span className="cx-badge cx-badge-green">{product.available_qty} disponibles</span>
            )}
            <span className="cx-pd-pack">Conditionnement : {product.packaging}</span>
          </div>

          <div className="cx-pd-buy">
            <div className="cx-qty">
              <button onClick={() => setQty((q) => Math.max(product.min_order_qty, q - 1))} aria-label="Moins"><Minus size={15} /></button>
              <input
                value={qty}
                onChange={(e) => setQty(Math.max(product.min_order_qty, Math.min(maxQty, Number(e.target.value) || product.min_order_qty)))}
                inputMode="numeric"
                aria-label="Quantité"
              />
              <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Plus"><Plus size={15} /></button>
            </div>
            <button className="cx-btn cx-btn-primary" disabled={out} onClick={handleAdd} data-testid="button-pd-add">
              {added ? <><Check size={16} /> Ajouté au panier</> : <><Plus size={16} /> Ajouter au panier</>}
            </button>
          </div>

          <ul className="cx-pd-assurance">
            <li><Truck size={15} /> Livraison suivie depuis nos dépôts</li>
            <li><ShieldCheck size={15} /> Paiement à la livraison · Tarif professionnel</li>
            <li><RotateCcw size={15} /> Retour possible selon conditions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
