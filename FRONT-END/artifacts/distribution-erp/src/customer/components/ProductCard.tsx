import { Link } from 'wouter';
import { Check, Plus, Package as PackageIcon } from 'lucide-react';
import type { Product } from '../api';
import { formatMoney } from '../cart';

export default function ProductCard({
  product,
  onAdd,
  added,
}: {
  product: Product;
  onAdd: (p: Product) => void;
  added?: boolean;
}) {
  const out = !product.in_stock;
  return (
    <div className={`cx-card-product ${out ? 'is-out' : ''}`}>
      <Link href={`/customer/product/${product.code}`} className="cx-card-media">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span className="cx-media-ph"><PackageIcon size={26} /></span>
        )}
        {out && <span className="cx-flag-out">Rupture</span>}
        {!out && product.available_qty <= 10 && <span className="cx-flag-low">Stock faible</span>}
      </Link>
      <div className="cx-card-body">
        <span className="cx-card-cat">{product.category}</span>
        <Link href={`/customer/product/${product.code}`} className="cx-card-title">{product.name}</Link>
        <div className="cx-card-price">
          <strong>{formatMoney(product.price_ttc)}</strong>
          <small>TTC · {product.unit}</small>
        </div>
        <div className="cx-card-meta">
          <span>HT {formatMoney(product.price_ht)} · {product.packaging || product.unit}</span>
          <span className={out ? 'cx-stock-out' : 'cx-stock-in'}>
            {out ? 'Rupture' : '✓ En Stock'}
          </span>
        </div>
        <button
          className="cx-btn cx-btn-primary cx-btn-block"
          disabled={out}
          onClick={() => onAdd(product)}
          data-testid={`button-add-${product.code}`}
        >
          {added ? <><Check size={15} /> Ajouté</> : <><Plus size={15} /> Ajouter</>}
        </button>
      </div>
    </div>
  );
}
