import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, DollarSign } from 'lucide-react';
import { formatMoney } from '../api';
import type { InvoiceData } from './InvoiceDocumentModal';

interface RegisterPaymentModalProps {
  invoice: InvoiceData;
  onClose: () => void;
  onConfirm: (invoiceRef: string, amount: number, method: string, refDoc: string) => void;
}

export default function RegisterPaymentModal({
  invoice,
  onClose,
  onConfirm,
}: RegisterPaymentModalProps) {
  const totalHt = invoice.lines.reduce((sum, l) => sum + l.qty * l.unit_price_ht, 0);
  const totalTtc = totalHt * 1.2;
  const currentPaid = invoice.paid_amount || (invoice.status === 'Payée' ? totalTtc : 0);
  const remaining = Math.max(0, totalTtc - currentPaid);

  const [amount, setAmount] = useState<number>(remaining);
  const [method, setMethod] = useState<'Virement bancaire' | 'Chèque' | 'Espèces' | 'Traite'>('Virement bancaire');
  const [refDoc, setRefDoc] = useState(`VIR-${Math.floor(100000 + Math.random() * 900000)}`);
  const [bank, setBank] = useState('Attijariwafa Bank');
  const [date, setDate] = useState('07 Oct 2026');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(invoice.ref, amount, method, refDoc);
    onClose();
  }

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <form
        className="doc-modal-container"
        style={{ maxWidth: '480px' }}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <CreditCard size={17} style={{ color: '#22c55e' }} />
            <span>Encaisser Règlement · {invoice.ref}</span>
          </div>
          <button type="button" className="doc-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--navy-1, #131c28)', color: 'var(--text, #e2e8f0)' }}>
          <div style={{ background: '#0f172a', padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Client débiteur :</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{invoice.client}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', borderTop: '1px solid #1e293b', paddingTop: '6px' }}>
              <span>Total Facture : <b>{formatMoney(totalTtc)} DH</b></span>
              <span style={{ color: '#ef4444' }}>Solde restant : <b>{formatMoney(remaining)} DH</b></span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              MONTANT DU RÈGLEMENT (DH)
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={remaining}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#22c55e', fontSize: '16px', fontWeight: 700 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                MODE DE RÈGLEMENT
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              >
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Chèque">Chèque bancaire</option>
                <option value="Espèces">Espèces (Caisse)</option>
                <option value="Traite">Traite / Effet</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                N° PIÈCE / RÉFÉRENCE
              </label>
              <input
                required
                value={refDoc}
                onChange={(e) => setRefDoc(e.target.value)}
                placeholder="N° chèque ou virement"
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              />
            </div>
          </div>

          {method !== 'Espèces' && (
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                BANQUE TIREUR / COMPTE
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 8px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              >
                <option value="Attijariwafa Bank">Attijariwafa Bank</option>
                <option value="Banque Populaire">Banque Populaire</option>
                <option value="Bank of Africa (BMCE)">Bank of Africa (BMCE)</option>
                <option value="Société Générale Maroc">Société Générale Maroc</option>
                <option value="BMCI">BMCI</option>
                <option value="CIH Bank">CIH Bank</option>
                <option value="Crédit Agricole du Maroc">Crédit Agricole du Maroc</option>
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              DATE D'ENCAISSEMENT
            </label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
              style={{ height: '36px', padding: '0 14px' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="button-primary"
              style={{ height: '36px', padding: '0 16px', background: '#16a34a', borderColor: '#15803d' }}
            >
              <CheckCircle2 size={14} /> Valider l'encaissement
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
