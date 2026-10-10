import { useState } from 'react';
import { Link } from 'wouter';
import { Check, Plus, Minus, Package, Sparkles } from 'lucide-react';
import type { Product } from '../api';
import { formatMoney } from '../cart';
import ProductArtwork from './ProductArtwork';

export default function ProductCard({
  product,
  onAdd,
  added,
}: {
  product: Product;
  onAdd: (p: Product, qty?: number) => void;
  added?: boolean;
}) {
  const [qty, setQty] = useState(product.min_order_qty || 1);
  const out = !product.in_stock;

  function handleAdd() {
    if (out) return;
    onAdd(product, qty);
  }

  function inc(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setQty((q) => q + 1);
  }

  function dec(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setQty((q) => Math.max(product.min_order_qty || 1, q - 1));
  }

  return (
    <div className={`cx-card-product ${out ? 'is-out' : ''}`} data-testid={`card-product-${product.code}`}>
      <Link href={`/customer/product/${product.code}`} className="cx-card-media">
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <ProductArtwork product={product} />
        )}

        {/* Category / Tier tag */}
        <span className="cx-badge-tier">
          <Package size={11} style={{ marginRight: 3, verticalAlign: -1 }} />
          {product.category || 'PRO'}
        </span>

        {/* Stock alerts */}
        {out && <span className="cx-flag-out">Rupture</span>}
        {!out && product.available_qty <= 10 && (
          <span className="cx-flag-low">Reste {product.available_qty}</span>
        )}
      </Link>

      <div className="cx-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="cx-card-cat">{product.category}</span>
          <span className="cx-card-sku">Réf: {product.sku || product.code}</span>
        </div>

        <Link href={`/customer/product/${product.code}`} className="cx-card-title" title={product.name}>
          {product.name}
        </Link>

        {/* Stock status indicator */}
        <div className="cx-card-stock-row">
          <span className={`cx-stock-tag ${out ? 'out' : 'in'}`}>
            <span className="dot" />
            {out ? 'En réapprovisionnement' : `En stock (${product.available_qty || 50} dispo)`}
          </span>
          <span style={{ color: 'var(--cx-muted)', fontSize: 11 }}>
            {product.packaging || product.unit}
          </span>
        </div>

        {/* B2B Pricing Structure */}
        <div className="cx-card-price-block">
          <div className="cx-price-ht">
            <b>{formatMoney(product.price_ht)}</b>
            <span>HT / {product.unit}</span>
          </div>
          <div className="cx-price-ttc">
            {formatMoney(product.price_ttc)} TTC (TVA {product.vat_rate || 20}%)
          </div>
        </div>

        {/* Quantity Stepper & Add Action */}
        <div className="cx-card-actions" style={{ marginTop: 12 }}>
          {!out && (
            <div className="cx-qty-stepper">
              <button type="button" onClick={dec} title="Diminuer">
                <Minus size={13} />
              </button>
              <span>{qty}</span>
              <button type="button" onClick={inc} title="Augmenter">
                <Plus size={13} />
              </button>
            </div>
          )}

          <button
            className={`cx-btn ${added ? 'cx-btn-emerald' : 'cx-btn-primary'} cx-card-add-btn`}
            disabled={out}
            onClick={handleAdd}
            data-testid={`button-add-${product.code}`}
          >
            {added ? (
              <>
                <Check size={15} /> Ajouté !
              </>
            ) : (
              <>
                <Plus size={15} /> {out ? 'Indisponible' : 'Ajouter'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
