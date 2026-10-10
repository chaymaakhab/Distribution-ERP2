import React, { useState } from 'react';
import { X, Plus, Trash2, Undo2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatMoney } from '../api';
import type { CreditNoteData } from './CreditNoteDocumentModal';

const DEMO_INVOICES_FOR_CREDIT = [
  { ref: 'FAC-2025-184', client: 'Atlas Équipements SARL', ice: '003147829000064', city: 'Casablanca', amount: 24860.0 },
  { ref: 'FAC-2025-183', client: 'BatiPro Maroc', ice: '002984123000081', city: 'Rabat', amount: 18420.5 },
  { ref: 'FAC-2025-182', client: 'Comptoir Al Amal', ice: '004128901000092', city: 'Fès', amount: 32100.0 },
  { ref: 'FAC-2025-181', client: 'Nord Industrie', ice: '007812934000033', city: 'Tanger', amount: 6280.0 },
];

interface NewCreditNoteModalProps {
  onClose: () => void;
  onCreate: (creditNote: CreditNoteData) => void;
}

export default function NewCreditNoteModal({
  onClose,
  onCreate,
}: NewCreditNoteModalProps) {
  const [selectedInvoiceRef, setSelectedInvoiceRef] = useState(DEMO_INVOICES_FOR_CREDIT[0].ref);
  const [reason, setReason] = useState<'Retour de marchandise' | 'Remise commerciale accordée' | 'Erreur de facturation' | 'Avarie transport'>('Retour de marchandise');
  const [amountHt, setAmountHt] = useState(1500.0);
  const [tvaRate, setTvaRate] = useState(20);
  const [notes, setNotes] = useState('Retour partiel de 2 articles défectueux avec PV de contrôle');
  const [dateIssued, setDateIssued] = useState('28 Fév 2025');

  const invObj = DEMO_INVOICES_FOR_CREDIT.find((i) => i.ref === selectedInvoiceRef) || DEMO_INVOICES_FOR_CREDIT[0];
  const tvaAmount = amountHt * (tvaRate / 100);
  const totalTtc = amountHt + tvaAmount;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newCreditNote: CreditNoteData = {
      ref: `AVR-2025-${Math.floor(15 + Math.random() * 80)}`,
      invoice_ref: invObj.ref,
      client: invObj.client,
      client_ice: invObj.ice,
      client_city: invObj.city,
      date_issued: dateIssued,
      reason,
      total_ht: amountHt,
      tva_rate: tvaRate,
      total_ttc: totalTtc,
      status: 'Émis',
      notes,
    };
    onCreate(newCreditNote);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="record-modal"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '95vw' }}
      >
        <div className="modal-top">
          <div>
            <span className="eyebrow">RÉGULARISATION FISCALE &amp; COMPTABLE</span>
            <h2>Nouvelle Facture d'Avoir (Crédit Client)</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-note">
          Conforme à l'article 145 du Code Général des Impôts (CGI Maroc). L'avoir donne lieu à régularisation de la TVA et vient en déduction du solde client.
        </p>

        <label className="field-label" style={{ marginTop: '12px' }}>
          Facture de référence rattachée :
          <select
            value={selectedInvoiceRef}
            onChange={(e) => setSelectedInvoiceRef(e.target.value)}
            style={{ width: '100%', marginTop: '4px' }}
          >
            {DEMO_INVOICES_FOR_CREDIT.map((inv) => (
              <option key={inv.ref} value={inv.ref}>
                {inv.ref} · {inv.client} ({formatMoney(inv.amount)} DH TTC)
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <label className="field-label">
            Motif de l'avoir :
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as any)}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <option value="Retour de marchandise">Retour de marchandise</option>
              <option value="Remise commerciale accordée">Remise commerciale accordée</option>
              <option value="Erreur de facturation">Erreur de facturation</option>
              <option value="Avarie transport">Avarie transport / casse</option>
            </select>
          </label>

          <label className="field-label">
            Date d'émission :
            <input
              type="text"
              value={dateIssued}
              onChange={(e) => setDateIssued(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px', marginTop: '12px' }}>
          <label className="field-label">
            Montant Hors Taxes (DH HT) :
            <input
              type="number"
              step="0.01"
              value={amountHt}
              onChange={(e) => setAmountHt(parseFloat(e.target.value) || 0)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>

          <label className="field-label">
            Taux TVA :
            <select
              value={tvaRate}
              onChange={(e) => setTvaRate(parseInt(e.target.value, 10) || 20)}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <option value="20">20% (Standard)</option>
              <option value="14">14%</option>
              <option value="10">10%</option>
              <option value="7">7%</option>
              <option value="0">0%</option>
            </select>
          </label>
        </div>

        <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>Base HT :</span>
            <b>{formatMoney(amountHt)} DH</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
            <span>TVA ({tvaRate}%) à déduire :</span>
            <b>{formatMoney(tvaAmount)} DH</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginTop: '6px', borderTop: '1px solid var(--line)', paddingTop: '6px' }}>
            <span style={{ fontWeight: 700 }}>Total TTC de l'Avoir :</span>
            <b style={{ color: '#f59e0b', fontSize: '15px' }}>-{formatMoney(totalTtc)} DH</b>
          </div>
        </div>

        <label className="field-label" style={{ marginTop: '12px' }}>
          Observations &amp; Justificatif :
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            style={{ width: '100%', marginTop: '4px' }}
          />
        </label>

        <div className="modal-actions" style={{ marginTop: '18px' }}>
          <button type="button" className="button-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="button-primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
            <Undo2 size={15} /> Émettre la Facture d'Avoir
          </button>
        </div>
      </form>
    </div>
  );
}
