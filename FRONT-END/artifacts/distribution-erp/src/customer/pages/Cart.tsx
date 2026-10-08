import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Minus, Plus, Trash2, ShoppingBag, Loader2, CheckCircle2, AlertCircle,
  CreditCard, Banknote, Building2, Receipt, X, ShieldCheck, ArrowRight, Check,
} from 'lucide-react';
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

  // Modal de paiement client (Cash, Card, Chèque, Virement)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'cheque' | 'virement'>('cash');
  const [cardHolder, setCardHolder] = useState(user.name);
  const [cardNumber, setCardNumber] = useState('4152 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');
  const [chequeBank, setChequeBank] = useState('Attijariwafa Bank');
  const [chequeRef, setChequeRef] = useState(`CHQ-${Math.floor(100000 + Math.random() * 900000)}`);

  function openCheckout() {
    if (!lines.length) return;
    setError(null);
    setShowPaymentModal(true);
  }

  async function handleConfirmAndPay(e: React.FormEvent) {
    e.preventDefault();
    if (!lines.length) return;
    setSubmitting(true);
    setError(null);

    const paymentLabel =
      selectedMethod === 'cash'
        ? 'Paiement Espèces (Cash à la livraison / comptoir)'
        : selectedMethod === 'card'
        ? `Paiement Carte Bancaire (CMI / Visa / Mastercard - ${cardNumber.slice(-4)})`
        : selectedMethod === 'cheque'
        ? `Paiement par Chèque bancaire (${chequeBank} - Réf: ${chequeRef})`
        : 'Paiement par Virement bancaire';

    const fullDeliveryNote = [
      note ? `Note: ${note}` : '',
      `[Mode de Règlement choisi: ${paymentLabel}]`,
    ].filter(Boolean).join(' | ');

    try {
      const res = await api.createOrder({
        items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
        desired_date: desiredDate || null,
        delivery_note: fullDeliveryNote || null,
        client_generated_uuid: crypto.randomUUID(),
      });
      clear();
      setShowPaymentModal(false);
      setPlaced(res.data.ref);
      setTimeout(() => setLocation(`/customer/order/${res.data.ref}`), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de passer la commande.');
      setShowPaymentModal(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="cx-page">
        <div className="cx-confirm" style={{ textAlign: 'center', padding: '40px 20px', maxWidth: 540, margin: '40px auto', background: 'var(--cx-surface)', borderRadius: 16, border: '1px solid var(--cx-border)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <CheckCircle2 size={36} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: 'var(--cx-text)' }}>
            Commande {placed} validée avec succès !
          </h1>
          <p style={{ fontSize: 14, color: 'var(--cx-muted)', margin: '0 0 20px' }}>
            Votre commande et le mode de règlement ont bien été enregistrés. Redirection vers votre suivi…
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#0284c7', fontWeight: 600 }}>
            <Loader2 className="cx-spin" size={16} /> Redirection en cours...
          </div>
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
          <span className="cx-eyebrow">PANIER & RÈGLEMENT</span>
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
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Instructions, horaires, quai de déchargement…" maxLength={1000} />
          </label>

          <button
            className="cx-btn cx-btn-primary cx-btn-block"
            onClick={openCheckout}
            disabled={submitting}
            data-testid="button-place-order"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, fontSize: 15, fontWeight: 700 }}
          >
            <CreditCard size={18} /> Passer au Paiement ({formatMoney(totalTtc)})
          </button>
          <p className="cx-sum-note">Choix immédiat du mode de règlement (Cash, Carte bancaire, Chèque ou Virement).</p>
        </aside>
      </div>

      {/* ── Modal de Paiement & Validation de Commande ── */}
      {showPaymentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowPaymentModal(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleConfirmAndPay}
            style={{
              maxWidth: 580,
              width: '100%',
              maxHeight: '92vh',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 14,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 22px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ESPACE CLIENT · PAIEMENT SÉCURISÉ
                  </span>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '1px 0 0' }}>
                    Règlement de la Commande
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  color: '#64748b',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Total Banner */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 10,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>MONTANT TOTAL À RÉGLER :</span>
                  <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>{lines.length} article(s) · Tarifs {user.price_tier}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#15803d' }}>
                  {formatMoney(totalTtc)}
                </div>
              </div>

              {/* Payment Methods Selector */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
                  SÉLECTIONNEZ VOTRE MODE DE RÈGLEMENT :
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {/* Option 1: Cash / Espèces */}
                  <div
                    onClick={() => setSelectedMethod('cash')}
                    style={{
                      border: `2px solid ${selectedMethod === 'cash' ? '#10b981' : '#e2e8f0'}`,
                      background: selectedMethod === 'cash' ? '#f0fdf4' : '#ffffff',
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 6, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Banknote size={18} />
                    </div>
                    <div>
                      <b style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>Espèces (Cash)</b>
                      <small style={{ fontSize: 11, color: '#64748b' }}>À la livraison / Caisse</small>
                    </div>
                  </div>

                  {/* Option 2: Carte Bancaire / Card */}
                  <div
                    onClick={() => setSelectedMethod('card')}
                    style={{
                      border: `2px solid ${selectedMethod === 'card' ? '#0284c7' : '#e2e8f0'}`,
                      background: selectedMethod === 'card' ? '#f0f9ff' : '#ffffff',
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 6, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <b style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>Carte Bancaire (Card)</b>
                      <small style={{ fontSize: 11, color: '#64748b' }}>CMI / Visa / Mastercard</small>
                    </div>
                  </div>

                  {/* Option 3: Chèque Bancaire */}
                  <div
                    onClick={() => setSelectedMethod('cheque')}
                    style={{
                      border: `2px solid ${selectedMethod === 'cheque' ? '#8b5cf6' : '#e2e8f0'}`,
                      background: selectedMethod === 'cheque' ? '#faf5ff' : '#ffffff',
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 6, background: '#f3e8ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Receipt size={18} />
                    </div>
                    <div>
                      <b style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>Chèque Bancaire</b>
                      <small style={{ fontSize: 11, color: '#64748b' }}>Remise chèque barré</small>
                    </div>
                  </div>

                  {/* Option 4: Virement Bancaire */}
                  <div
                    onClick={() => setSelectedMethod('virement')}
                    style={{
                      border: `2px solid ${selectedMethod === 'virement' ? '#f59e0b' : '#e2e8f0'}`,
                      background: selectedMethod === 'virement' ? '#fffbeb' : '#ffffff',
                      borderRadius: 10,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 6, background: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <b style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>Virement Bancaire</b>
                      <small style={{ fontSize: 11, color: '#64748b' }}>RIB / Ordre de virement</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Details based on Method */}
              {selectedMethod === 'card' && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <ShieldCheck size={16} color="#0284c7" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0284c7' }}>PAIEMENT EN LIGNE SÉCURISÉ CMI</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Nom sur la carte</label>
                      <input
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Numéro de carte bancaire</label>
                      <input
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'monospace' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Date d'expiration</label>
                        <input
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/AA"
                          style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Code CVC / CVV</label>
                        <input
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'cash' && (
                <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 10, border: '1px solid #bbf7d0', fontSize: 12.5, color: '#166534' }}>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>
                    ✓ <strong>Règlement en Espèces (Cash) :</strong> Vous réglerez directement à la livraison auprès du chauffeur-livreur ou lors du retrait au dépôt central. Une quittance officielle signée vous sera remise.
                  </p>
                </div>
              )}

              {selectedMethod === 'cheque' && (
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Banque émettrice</label>
                      <select
                        value={chequeBank}
                        onChange={(e) => setChequeBank(e.target.value)}
                        style={{ width: '100%', height: 36, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                      >
                        <option>Attijariwafa Bank</option>
                        <option>Banque Populaire (BCP)</option>
                        <option>Bank of Africa (BMCE)</option>
                        <option>CIH Bank</option>
                        <option>Société Générale Maroc</option>
                        <option>Crédit du Maroc</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>N° du chèque</label>
                      <input
                        value={chequeRef}
                        onChange={(e) => setChequeRef(e.target.value)}
                        placeholder="Ex. CHQ-890123"
                        style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === 'virement' && (
                <div style={{ background: '#fffbeb', padding: 14, borderRadius: 10, border: '1px solid #fde68a', fontSize: 12.5, color: '#92400e' }}>
                  <b>Coordonnées bancaires de paiement (RIB Hercules Distribution) :</b>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, margin: '6px 0', fontSize: 13, color: '#0f172a' }}>
                    007 780 0001234567890123 45
                  </div>
                  <span>Attijariwafa Bank · Agence Casablanca Entreprises</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '14px 22px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontWeight: 600,
                  fontSize: 13,
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                Retour au panier
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#16a34a',
                  border: '1px solid #15803d',
                  borderRadius: 6,
                  padding: '9px 20px',
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="cx-spin" size={16} /> Traitement du règlement…
                  </>
                ) : (
                  <>
                    <Check size={16} /> Valider la Commande &amp; Règlement ({formatMoney(totalTtc)})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

