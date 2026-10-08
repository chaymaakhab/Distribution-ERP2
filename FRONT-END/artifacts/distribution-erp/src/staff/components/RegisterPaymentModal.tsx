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
  const [method, setMethod] = useState<'Virement bancaire' | 'Chèque' | 'Espèces' | 'Traite' | 'Carte bancaire'>('Carte bancaire');
  const [refDoc, setRefDoc] = useState(`CB-${Math.floor(100000 + Math.random() * 900000)}`);
  const [bank, setBank] = useState('Attijariwafa Bank');
  const [date, setDate] = useState('08 Oct 2026');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onConfirm(invoice.ref, amount, method, refDoc);
    onClose();
  }

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <form
        className="doc-modal-container"
        style={{
          maxWidth: '520px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: 12,
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
        }}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
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
                width: 32,
                height: 32,
                borderRadius: 6,
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
              }}
            >
              <CreditCard size={18} />
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                TRÉSORERIE · ENCAISSEMENT RÈGLEMENT
              </span>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '1px 0 0' }}>
                Encaisser Facture {invoice.ref}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        <div
          style={{
            padding: '18px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 13,
            background: '#ffffff',
            color: '#0f172a',
          }}
        >
          <div
            style={{
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>CLIENT DÉBITEUR :</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{invoice.client}</div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '12.5px',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '8px',
              }}
            >
              <span style={{ color: '#64748b' }}>Total Facture : <b style={{ color: '#0f172a' }}>{formatMoney(totalTtc)} DH</b></span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>Solde restant : {formatMoney(remaining)} DH</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
              MONTANT DU RÈGLEMENT À ENCAISSER (DH) *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              max={remaining}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#16a34a',
                fontSize: '17px',
                fontWeight: 800,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                MODE DE RÈGLEMENT *
              </label>
              <select
                value={method}
                onChange={(e) => {
                  const m = e.target.value as any;
                  setMethod(m);
                  if (m === 'Carte bancaire') setRefDoc(`CB-${Math.floor(100000 + Math.random() * 900000)}`);
                  else if (m === 'Espèces') setRefDoc(`ESP-${Math.floor(100000 + Math.random() * 900000)}`);
                  else if (m === 'Chèque') setRefDoc(`CHQ-${Math.floor(100000 + Math.random() * 900000)}`);
                  else if (m === 'Virement bancaire') setRefDoc(`VIR-${Math.floor(100000 + Math.random() * 900000)}`);
                  else if (m === 'Traite') setRefDoc(`TRT-${Math.floor(100000 + Math.random() * 900000)}`);
                }}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                }}
              >
                <option value="Espèces">Espèces (Cash / Caisse)</option>
                <option value="Carte bancaire">Carte bancaire (TPE / CMI / Card)</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Chèque">Chèque bancaire</option>
                <option value="Traite">Traite / Effet</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                N° PIÈCE / TICKET TPE / RÉFÉRENCE *
              </label>
              <input
                required
                value={refDoc}
                onChange={(e) => setRefDoc(e.target.value)}
                placeholder="Ex. CB-890123 / TICKET-TPE / CHQ-104"
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                }}
              />
            </div>
          </div>

          {method !== 'Espèces' && (
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                {method === 'Carte bancaire' ? 'BANQUE ACQUÉREUR DU TPE / CMI' : 'BANQUE ÉMETTRICE'}
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                }}
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
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
              DATE D'ENCAISSEMENT COMPTABLE
            </label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '12.5px',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '12px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
          }}
        >
          <button
            type="button"
            className="button-secondary"
            onClick={onClose}
            style={{
              height: '38px',
              padding: '0 16px',
              background: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="button-primary"
            style={{
              height: '38px',
              padding: '0 20px',
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
            }}
          >
            <CheckCircle2 size={16} /> Enregistrer l'encaissement
          </button>
        </div>
      </form>
    </div>
  );
}
