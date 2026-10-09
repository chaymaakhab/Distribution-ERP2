import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Minus, Plus, Trash2, ShoppingBag, Loader2, CheckCircle2, AlertCircle,
  CreditCard, Banknote, Building2, Receipt, X, ShieldCheck, ArrowRight, Check,
  Truck, Calendar, MessageSquare, Clock, FileText,
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

  // Modal de paiement B2B Marocain
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'cheque' | 'virement'>('cash');
  const [chequeBank, setChequeBank] = useState('Attijariwafa Bank');
  const [chequeRef, setChequeRef] = useState(`CHQ-${Math.floor(100000 + Math.random() * 900000)}`);

  const FRANCO_THRESHOLD = 2500;
  const isFranco = subtotalHt >= FRANCO_THRESHOLD;
  const remainingFranco = Math.max(0, FRANCO_THRESHOLD - subtotalHt);

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
        ? 'Paiement Espèces (Règlement chauffeur à la livraison)'
        : selectedMethod === 'card'
        ? 'Paiement Carte Bancaire (CMI / TPE Chauffeur)'
        : selectedMethod === 'cheque'
        ? `Paiement Chèque bancaire (${chequeBank} - N° ${chequeRef})`
        : 'Paiement Virement bancaire / En compte 30j';

    const fullDeliveryNote = [
      note ? `Note: ${note}` : '',
      `[Mode de Règlement: ${paymentLabel}]`,
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
      setError(err instanceof ApiError ? err.message : 'Impossible de valider votre commande.');
      setShowPaymentModal(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <div className="cx-page">
        <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 540, margin: '40px auto', background: 'var(--cx-surface)', borderRadius: 20, border: '1px solid var(--cx-border)', boxShadow: 'var(--cx-shadow-lg)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center', margin: '0 auto 20px', boxShadow: '0 0 20px rgba(5, 150, 105, 0.2)' }}>
            <CheckCircle2 size={42} />
          </div>
          <span className="cx-eyebrow">COMMANDE ENREGISTRÉE</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '8px 0 10px', color: 'var(--cx-text)' }}>
            Commande {placed} confirmée !
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--cx-muted)', margin: '0 0 24px', lineHeight: 1.5 }}>
            Votre commande a été transmise à notre entrepôt pour préparation. Le chauffeur vous contactera avant la livraison.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--cx-brand)', fontWeight: 700 }}>
            <Loader2 className="cx-spin" size={18} /> Redirection vers votre suivi de commande…
          </div>
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="cx-page">
        <div className="cx-empty">
          <ShoppingBag size={48} style={{ color: 'var(--cx-brand)', margin: '0 auto 12px' }} />
          <h2>Votre panier est vide</h2>
          <p>Consultez notre catalogue B2B pour ajouter des articles et passer commande.</p>
          <button className="cx-btn cx-btn-primary lg" onClick={() => setLocation('/customer/catalog')}>
            Découvrir le catalogue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cx-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="cx-eyebrow">FINALISATION B2B</span>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 0' }}>Votre Panier de Commande</h1>
        </div>
        <button className="cx-btn cx-btn-ghost sm" onClick={clear}>
          <Trash2 size={14} /> Vider le panier
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px 18px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="cx-cart-layout">
        {/* Left Column: Cart Line Items */}
        <div className="cx-cart-items-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--cx-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--cx-bg)' }}>
            <b style={{ fontSize: 14 }}>Articles sélectionnés ({lines.length})</b>
            <span style={{ fontSize: 12, color: 'var(--cx-muted)' }}>Prix en DH Hors Taxes (HT)</span>
          </div>

          <div>
            {lines.map((line) => (
              <div key={line.product_id} className="cx-cart-item-row">
                <img
                  src={line.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100&q=80'}
                  alt={line.name}
                  className="cx-cart-item-img"
                />

                <div className="cx-cart-item-info">
                  <b>{line.name}</b>
                  <small>Réf: {line.code} · {line.unit}</small>
                  <div style={{ fontSize: 12, color: 'var(--cx-brand)', fontWeight: 600, marginTop: 4 }}>
                    {formatMoney(line.price_ht)} HT / unité
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="cx-qty-stepper">
                  <button type="button" onClick={() => setQty(line.product_id, Math.max(1, line.quantity - 1))}>
                    <Minus size={13} />
                  </button>
                  <span>{line.quantity}</span>
                  <button type="button" onClick={() => setQty(line.product_id, line.quantity + 1)}>
                    <Plus size={13} />
                  </button>
                </div>

                {/* Line Total */}
                <div className="cx-cart-item-price">
                  <b>{formatMoney(line.quantity * line.price_ht)}</b>
                  <small>HT</small>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => remove(line.product_id)}
                  className="cx-icon-btn"
                  title="Supprimer la ligne"
                  style={{ width: 34, height: 34, border: 0 }}
                >
                  <Trash2 size={15} style={{ color: '#ef4444' }} />
                </button>
              </div>
            ))}
          </div>

          {/* Delivery & Logistics Preferences in Card Footer */}
          <div style={{ padding: '20px', background: 'var(--cx-bg)', borderTop: '1px solid var(--cx-border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--cx-text)' }}>
                <Calendar size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> Date de livraison souhaitée
              </label>
              <input
                type="date"
                value={desiredDate}
                onChange={(e) => setDesiredDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ width: '100%', height: 40, borderRadius: 9, border: '1px solid var(--cx-border)', background: 'var(--cx-surface)', padding: '0 12px', fontSize: 13, outline: 'none', color: 'var(--cx-text)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, marginBottom: 6, color: 'var(--cx-text)' }}>
                <MessageSquare size={14} style={{ verticalAlign: -2, marginRight: 4 }} /> Instructions pour le chauffeur
              </label>
              <input
                type="text"
                placeholder="Ex: Quai n°2, appeler avant arrivée..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width: '100%', height: 40, borderRadius: 9, border: '1px solid var(--cx-border)', background: 'var(--cx-surface)', padding: '0 12px', fontSize: 13, outline: 'none', color: 'var(--cx-text)' }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="cx-checkout-summary-card">
          <h2 className="cx-checkout-summary-title">
            <Receipt size={20} style={{ color: 'var(--cx-brand)' }} /> Récapitulatif B2B
          </h2>

          {/* Franco Alert Bar */}
          <div style={{ background: isFranco ? '#ecfdf5' : 'var(--cx-brand-soft)', border: `1px solid ${isFranco ? '#a7f3d0' : 'var(--cx-brand-glow)'}`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12.5 }}>
            {isFranco ? (
              <span style={{ color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} /> Livraison gratuite offerte (Franco atteint)
              </span>
            ) : (
              <span style={{ color: 'var(--cx-brand)', fontWeight: 600 }}>
                Plus que <b>{formatMoney(remainingFranco)}</b> pour la livraison offerte (Franco dès 2 500 DH HT).
              </span>
            )}
          </div>

          <div className="cx-breakdown-row">
            <span>Sous-total articles (HT)</span>
            <b>{formatMoney(subtotalHt)}</b>
          </div>

          <div className="cx-breakdown-row">
            <span>TVA légale marocaine (20%)</span>
            <b>{formatMoney(vatTotal)}</b>
          </div>

          <div className="cx-breakdown-row">
            <span>Frais de livraison & manutention</span>
            <span style={{ fontWeight: 700, color: isFranco ? '#059669' : 'var(--cx-text)' }}>
              {isFranco ? 'Gratuit (Franco)' : '150,00 DH'}
            </span>
          </div>

          <div className="cx-breakdown-total">
            <span>Total TTC à payer</span>
            <b>{formatMoney(totalTtc + (isFranco ? 0 : 150))}</b>
          </div>

          <div style={{ margin: '18px 0', fontSize: 12, color: 'var(--cx-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={16} style={{ color: '#059669' }} /> Facture certifiée émise avec ICE : {user.ice || '002874195000038'}
          </div>

          <button
            type="button"
            className="cx-btn cx-btn-primary lg cx-btn-block"
            onClick={openCheckout}
          >
            Choisir le mode de paiement <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <div className="cx-drawer-backdrop" onClick={() => !submitting && setShowPaymentModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--cx-surface)',
              borderRadius: 20,
              maxWidth: 580,
              width: '90%',
              margin: 'auto',
              padding: 28,
              boxShadow: 'var(--cx-shadow-lg)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <span className="cx-eyebrow">RÈGLEMENT DE LA COMMANDE</span>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '2px 0 0' }}>Mode de Paiement Prévu</h3>
              </div>
              <button
                className="cx-icon-btn"
                onClick={() => setShowPaymentModal(false)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAndPay}>
              <div className="cx-payment-methods">
                <div
                  className={`cx-pay-card ${selectedMethod === 'cash' ? 'active' : ''}`}
                  onClick={() => setSelectedMethod('cash')}
                >
                  <Banknote size={22} style={{ color: '#059669' }} />
                  <b>Espèces (Cash)</b>
                  <small>Au chauffeur avec reçu officiel</small>
                </div>

                <div
                  className={`cx-pay-card ${selectedMethod === 'cheque' ? 'active' : ''}`}
                  onClick={() => setSelectedMethod('cheque')}
                >
                  <FileText size={22} style={{ color: '#2563eb' }} />
                  <b>Chèque bancaire</b>
                  <small>À la décharge du camion</small>
                </div>

                <div
                  className={`cx-pay-card ${selectedMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setSelectedMethod('card')}
                >
                  <CreditCard size={22} style={{ color: '#7c3aed' }} />
                  <b>Carte / TPE</b>
                  <small>Paiement CMI sécurisé</small>
                </div>

                <div
                  className={`cx-pay-card ${selectedMethod === 'virement' ? 'active' : ''}`}
                  onClick={() => setSelectedMethod('virement')}
                >
                  <Building2 size={22} style={{ color: '#d97706' }} />
                  <b>En compte / 30j</b>
                  <small>Selon accord commercial</small>
                </div>
              </div>

              {selectedMethod === 'cheque' && (
                <div style={{ background: 'var(--cx-bg)', padding: 14, borderRadius: 12, marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Banque émettrice du chèque</label>
                  <input
                    type="text"
                    value={chequeBank}
                    onChange={(e) => setChequeBank(e.target.value)}
                    style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid var(--cx-border)', padding: '0 10px', fontSize: 13, marginBottom: 10, background: 'var(--cx-surface)' }}
                  />
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>N° de chèque (ou référence)</label>
                  <input
                    type="text"
                    value={chequeRef}
                    onChange={(e) => setChequeRef(e.target.value)}
                    style={{ width: '100%', height: 38, borderRadius: 8, border: '1px solid var(--cx-border)', padding: '0 10px', fontSize: 13, background: 'var(--cx-surface)' }}
                  />
                </div>
              )}

              <div style={{ background: 'var(--cx-brand-soft)', padding: 14, borderRadius: 12, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Total à régler :</span>
                <b style={{ fontSize: 20, color: 'var(--cx-brand)' }}>{formatMoney(totalTtc + (isFranco ? 0 : 150))}</b>
              </div>

              <button
                type="submit"
                className="cx-btn cx-btn-primary lg cx-btn-block"
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 className="cx-spin" size={18} /> Confirmation en cours…</>
                ) : (
                  <><Check size={18} /> Confirmer la commande</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
