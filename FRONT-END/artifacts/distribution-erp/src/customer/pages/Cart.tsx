import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Minus, Plus, Trash2, ShoppingBag, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, ApiError, type CustomerUser } from '../api';
import { formatMoney, useCart } from '../cart';

export default function Cart({ user }: { user: CustomerUser }) {
  const { lines, setQty, remove, clear, subtotalHt, vatTotal, totalTtc } = useCart();
  const [, setLocation] = useLocation();
  const [desiredDate, setDesiredDate] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string | null>(null);

  async function placeOrder() {
    if (!lines.length) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.createOrder({
        items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
        desired_date: desiredDate || null,
        delivery_note: note || null,
        client_generated_uuid: crypto.randomUUID(),
      });
      clear();
      setPlaced(res.data.ref);
      setTimeout(() => setLocation(`/customer/order/${res.data.ref}`), 1600);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de passer la commande.');
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="cx-page">
        <div className="cx-confirm">
          <CheckCircle2 size={40} />
          <h1>Commande {placed} transmise</h1>
          <p>Elle est en attente de validation par votre commercial. Redirection…</p>
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="cx-page">
        <div className="cx-empty">
          <ShoppingBag size={28} />
          <h2>Votre panier est vide</h2>
          <p>Ajoutez des produits depuis le catalogue pour passer commande.</p>
          <Link href="/customer/catalog" className="cx-btn cx-btn-primary">Parcourir le catalogue</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cx-page">
      <div className="cx-page-head">
        <div>
          <span className="cx-eyebrow">PANIER</span>
          <h1>Votre commande</h1>
          <p>{lines.length} produit(s) · tarifs {user.price_tier}</p>
        </div>
        <button className="cx-btn cx-btn-ghost" onClick={clear}><Trash2 size={15} /> Vider</button>
      </div>

      {error && <div className="cx-alert cx-alert-error"><AlertCircle size={16} /> {error}</div>}

      <div className="cx-cart-layout">
        <div className="cx-cart-lines">
          {lines.map((l) => (
            <div className="cx-cart-line" key={l.product_id}>
              <Link href={`/customer/product/${l.code}`} className="cx-cart-thumb">
                <ShoppingBag size={18} />
              </Link>
              <div className="cx-cart-info">
                <Link href={`/customer/product/${l.code}`} className="cx-cart-name">{l.name}</Link>
                <small>{formatMoney(l.price_ht)} HT · TVA {l.vat_rate}% · {l.unit}</small>
                {l.quantity > l.available_qty && (
                  <span className="cx-warn">Quantité supérieure au stock ({l.available_qty})</span>
                )}
              </div>
              <div className="cx-qty">
                <button onClick={() => setQty(l.product_id, l.quantity - 1)} aria-label="Moins"><Minus size={14} /></button>
                <input value={l.quantity} onChange={(e) => setQty(l.product_id, Number(e.target.value) || 1)} inputMode="numeric" aria-label="Quantité" />
                <button onClick={() => setQty(l.product_id, l.quantity + 1)} aria-label="Plus"><Plus size={14} /></button>
              </div>
              <div className="cx-cart-total">{formatMoney(l.price_ht * l.quantity * (1 + l.vat_rate / 100))}</div>
              <button className="cx-icon-btn" onClick={() => remove(l.product_id)} aria-label="Retirer"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>

        <aside className="cx-summary">
          <h2>Récapitulatif</h2>
          <div className="cx-sum-row"><span>Sous-total HT</span><strong>{formatMoney(subtotalHt)}</strong></div>
          <div className="cx-sum-row"><span>TVA</span><strong>{formatMoney(vatTotal)}</strong></div>
          <div className="cx-sum-row cx-sum-total"><span>Total TTC</span><strong>{formatMoney(totalTtc)}</strong></div>

          <label className="cx-field">
            <span>Date de livraison souhaitée</span>
            <input type="date" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} />
          </label>
          <label className="cx-field">
            <span>Note de livraison</span>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Instructions, horaires, lieu…" maxLength={1000} />
          </label>

          <button className="cx-btn cx-btn-primary cx-btn-block" onClick={placeOrder} disabled={submitting} data-testid="button-place-order">
            {submitting ? <><Loader2 className="cx-spin" size={16} /> Envoi…</> : <><CheckCircle2 size={16} /> Commander</>}
          </button>
          <p className="cx-sum-note">Votre commande sera validée par votre commercial avant préparation.</p>
        </aside>
      </div>
    </div>
  );
}
