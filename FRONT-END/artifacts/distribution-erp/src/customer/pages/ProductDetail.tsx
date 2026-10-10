import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronRight, Loader2, Minus, Plus, Check, Package as PackageIcon,
  ShieldCheck, Truck, RotateCcw, Home, FileText, PhoneCall,
  Sparkles, Layers,
} from 'lucide-react';
import { api, type Product } from '../api';
import { formatMoney, useCart } from '../cart';
import ProductArtwork from '../components/ProductArtwork';

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

  if (loading) {
    return (
      <div className="cx-empty" style={{ padding: '80px 20px' }}>
        <Loader2 className="cx-spin" size={32} style={{ color: 'var(--cx-brand)', margin: '0 auto 12px' }} />
        <h2 style={{ fontSize: 16 }}>Chargement de la fiche produit…</h2>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="cx-empty">
        <PackageIcon size={36} style={{ color: 'var(--cx-muted)' }} />
        <h2>Référence introuvable</h2>
        <p>Le produit demandé n'existe pas ou n'est plus commercialisé dans votre catalogue.</p>
        <button className="cx-btn cx-btn-primary" onClick={() => setLocation('/customer/catalog')}>
          Retour au catalogue général
        </button>
      </div>
    );
  }

  const out = !product.in_stock;
  const maxQty = Math.max(product.available_qty, product.min_order_qty);

  function handleAdd() {
    add(product!, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleMultiplier(step: number) {
    setQty((q) => Math.min(maxQty, q + step));
  }

  // Volume tier pricing calculations
  const tier1Price = product.price_ht;
  const tier2Price = product.price_ht * 0.95;
  const tier3Price = product.price_ht * 0.90;

  const currentTier = qty >= 25 ? 3 : qty >= 10 ? 2 : 1;
  const effectivePriceHt = currentTier === 3 ? tier3Price : currentTier === 2 ? tier2Price : tier1Price;
  const lineTotalHt = effectivePriceHt * qty;
  const lineTotalTtc = lineTotalHt * (1 + (product.vat_rate || 20) / 100);

  return (
    <div className="cx-page">
      {/* Breadcrumb Navigation */}
      <nav className="cx-breadcrumb">
        <Link href="/customer/home" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Home size={13} /> Accueil
        </Link>
        <ChevronRight size={13} />
        <Link href="/customer/catalog">Catalogue Grossiste</Link>
        <ChevronRight size={13} />
        <Link href={`/customer/catalog?cat=${encodeURIComponent(product.category || '')}`}>
          {product.category}
        </Link>
        <ChevronRight size={13} />
        <span>{product.name}</span>
      </nav>

      <div className="cx-product-detail">
        {/* Left Column: Visual Artwork & Specs */}
        <div className="cx-pd-media">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <ProductArtwork product={product} />
          )}

          <div style={{ marginTop: 24, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="cx-badge cx-badge-slate" style={{ fontSize: 11 }}>
              <Layers size={13} /> Conditionnement : {product.packaging}
            </span>
            <span className="cx-badge cx-badge-blue" style={{ fontSize: 11 }}>
              TVA {product.vat_rate}% Déductible
            </span>
          </div>
        </div>

        {/* Right Column: Pricing, Ordering & Assurance */}
        <div className="cx-pd-info">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="cx-card-cat">{product.category}</span>
              <span className="cx-badge-tier">TARIF DISTRIBUTEUR B2B</span>
            </div>
            <h1>{product.name}</h1>
            <div className="cx-pd-sku-bar" style={{ marginTop: 6 }}>
              <span>Référence interne : <b>{product.code}</b></span>
              <span>·</span>
              <span>SKU : <b>{product.sku}</b></span>
              <span>·</span>
              <span>Unité : <b>{product.unit}</b></span>
            </div>
          </div>

          {product.description && (
            <p className="cx-pd-desc">{product.description}</p>
          )}

          {/* Wholesale HT Pricing Showcase */}
          <div className="cx-pd-price-box">
            <div className="cx-pd-price-main">
              <b>{formatMoney(effectivePriceHt)}</b>
              <span>HT / {product.unit}</span>
              {currentTier > 1 && (
                <span className="cx-badge cx-badge-green" style={{ textTransform: 'none' }}>
                  Remise volume appliquée (-{currentTier === 3 ? '10%' : '5%'})
                </span>
              )}
            </div>
            <div className="cx-pd-price-sub">
              <span><b>{formatMoney(effectivePriceHt * (1 + (product.vat_rate || 20) / 100))} TTC</b></span>
              <span>·</span>
              <span>TVA {product.vat_rate}% : {formatMoney(effectivePriceHt * ((product.vat_rate || 20) / 100))}</span>
              <span>·</span>
              <span style={{ color: 'var(--cx-brand)', fontWeight: 600 }}>Facture avec mention ICE</span>
            </div>
          </div>

          {/* Stock & Hub Availability */}
          <div className="cx-pd-meta-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {out ? (
                <span className="cx-badge cx-badge-red">Rupture temporaire</span>
              ) : (
                <span className="cx-badge cx-badge-green">
                  ● En stock ({product.available_qty} {product.unit}s disponibles)
                </span>
              )}
              <span style={{ fontSize: 12, color: 'var(--cx-muted)' }}>Hub Casablanca / Tanger</span>
            </div>
            {product.min_order_qty > 1 && (
              <span style={{ fontSize: 12, color: 'var(--cx-brand)', fontWeight: 700 }}>
                Minimum commande : {product.min_order_qty} {product.unit}s
              </span>
            )}
          </div>

          {/* Volume Tiers Table */}
          <div className="cx-pd-tiers-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3>Grille de Remises Dégressives B2B</h3>
              <small style={{ color: 'var(--cx-muted)', fontSize: 11 }}>Calcul automatique au panier</small>
            </div>
            <div className="cx-tiers-list">
              <div className={`cx-tier-col ${currentTier === 1 ? 'highlight' : ''}`}>
                <div className="cx-tier-qty">1 à 9 {product.unit}s</div>
                <div className="cx-tier-discount">{formatMoney(tier1Price)} HT</div>
                <small style={{ fontSize: 10, color: 'var(--cx-muted)' }}>Tarif catalogue</small>
              </div>
              <div className={`cx-tier-col ${currentTier === 2 ? 'highlight' : ''}`}>
                <div className="cx-tier-qty">10 à 24 {product.unit}s</div>
                <div className="cx-tier-discount" style={{ color: '#059669' }}>-5% ({formatMoney(tier2Price)} HT)</div>
                <small style={{ fontSize: 10, color: 'var(--cx-muted)' }}>Remise artisan</small>
              </div>
              <div className={`cx-tier-col ${currentTier === 3 ? 'highlight' : ''}`}>
                <div className="cx-tier-qty">25+ {product.unit}s</div>
                <div className="cx-tier-discount" style={{ color: '#059669' }}>-10% ({formatMoney(tier3Price)} HT)</div>
                <small style={{ fontSize: 10, color: 'var(--cx-muted)' }}>Grand compte</small>
              </div>
            </div>
          </div>

          {/* Quantity Stepper & Express Pallet Multipliers */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--cx-text)' }}>
                Quantité commandée ({product.unit}s) :
              </label>
              <div className="cx-multipliers">
                <span style={{ fontSize: 11, color: 'var(--cx-muted)', fontWeight: 600 }}>Ajout rapide :</span>
                <button type="button" className="cx-multi-btn" onClick={() => handleMultiplier(5)}>+5</button>
                <button type="button" className="cx-multi-btn" onClick={() => handleMultiplier(10)}>+10</button>
                <button type="button" className="cx-multi-btn" onClick={() => handleMultiplier(25)}>+25</button>
                <button type="button" className="cx-multi-btn" onClick={() => handleMultiplier(50)}>+50</button>
              </div>
            </div>

            <div className="cx-pd-buy-box">
              <div className="cx-qty-stepper">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(product.min_order_qty, q - 1))}
                  aria-label="Diminuer"
                >
                  <Minus size={16} />
                </button>
                <input
                  value={qty}
                  onChange={(e) => setQty(Math.max(product.min_order_qty, Math.min(maxQty, Number(e.target.value) || product.min_order_qty)))}
                  inputMode="numeric"
                  aria-label="Quantité"
                />
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  aria-label="Augmenter"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                className="cx-btn cx-btn-primary"
                disabled={out}
                onClick={handleAdd}
                data-testid="button-pd-add"
              >
                {added ? (
                  <>
                    <Check size={18} />
                    {qty} {product.unit}s ajoutés au panier !
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Ajouter au bon de commande · {formatMoney(lineTotalHt)} HT
                  </>
                )}
              </button>
            </div>

            {/* Live total display */}
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', fontSize: 12, color: 'var(--cx-muted)', gap: 8 }}>
              <span>Total ligne TTC estimé : <b>{formatMoney(lineTotalTtc)}</b></span>
            </div>
          </div>

          {/* Moroccan B2B Pillars */}
          <ul className="cx-pd-assurance">
            <li>
              <Truck size={16} />
              <span>
                <strong>Livraison express 24/48H</strong> partout au Maroc avec flotte de camions dédiée.
              </span>
            </li>
            <li>
              <FileText size={16} />
              <span>
                <strong>Facture fiscale normalisée</strong> avec ICE, IF et TVA récupérable dès expédition.
              </span>
            </li>
            <li>
              <ShieldCheck size={16} />
              <span>
                <strong>Facilités de paiement</strong> · Chèque à livraison ou compte à 30 jours (selon encours).
              </span>
            </li>
            <li>
              <PhoneCall size={16} />
              <span>
                <strong>Assistance commerciale directe</strong> · Contactez votre commercial pour devis sur-mesure.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

