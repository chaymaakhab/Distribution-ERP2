import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '../api';
import type { InvoiceData, InvoiceLineItem } from './InvoiceDocumentModal';

const DEMO_CLIENTS = [
  { name: 'Atlas Équipements SARL', ice: '003147829000064', city: 'Casablanca', address: '12, Boulevard Zerktouni', phone: '+212 522 34 78 90' },
  { name: 'BatiPro Maroc', ice: '002984123000081', city: 'Rabat', address: 'Lot 14, Zone Industrielle Takaddoum', phone: '+212 537 22 16 40' },
  { name: 'Maison du Bricolage', ice: '001928374000055', city: 'Marrakech', address: 'Boulevard Mohamed VI, Guéliz', phone: '+212 524 38 05 17' },
  { name: 'Comptoir Al Amal', ice: '004128901000092', city: 'Fès', address: '45, Rue des Selliers, Medina', phone: '+212 535 61 20 08' },
  { name: 'Nord Industrie', ice: '007812934000033', city: 'Tanger', address: 'Zone Franche de Tanger, Lot 8', phone: '+212 539 94 12 30' },
  { name: 'Quincaillerie Saada', ice: '006541289000021', city: 'Agadir', address: 'Avenue Hassan II, Dakhla', phone: '+212 528 84 55 60' },
];

const CATALOG_ITEMS = [
  { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', price: 1249.0 },
  { sku: 'CUT-230D', name: 'Disque diamant 230 mm', price: 189.5 },
  { sku: 'PMP-15HP', name: 'Pompe immergée 1.5 HP', price: 3840.0 },
  { sku: 'CAB-3G25', name: 'Câble électrique 3G2.5 (100m)', price: 1280.0 },
  { sku: 'GEN-5000', name: 'Groupe électrogène 5 kVA', price: 8950.0 },
  { sku: 'CHA-100I', name: 'Charnière inox 100 mm (Lot 6)', price: 93.0 },
  { sku: 'HUI-5L', name: 'Huile Végétale 5L (Carton 4)', price: 880.0 },
  { sku: 'SUC-50K', name: 'Sucre Raffiné 50kg (Sac)', price: 350.0 },
];

interface NewInvoiceModalProps {
  onClose: () => void;
  onCreate: (invoice: InvoiceData) => void;
  initialOrderRef?: string;
  initialClient?: string;
}

export default function NewInvoiceModal({
  onClose,
  onCreate,
  initialOrderRef,
  initialClient,
}: NewInvoiceModalProps) {
  const [selectedClientName, setSelectedClientName] = useState(
    initialClient || DEMO_CLIENTS[0].name
  );
  const [orderRef, setOrderRef] = useState(initialOrderRef || 'CMD-2406');
  const [dateIssued, setDateIssued] = useState('28 Fév 2025');
  const [dueDate, setDueDate] = useState('28 Mars 2025');
  const [paymentMethod, setPaymentMethod] = useState('Virement bancaire (Net 30j)');

  const [lines, setLines] = useState<InvoiceLineItem[]>([
    { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', qty: 4, unit_price_ht: 1249.0, tva_rate: 20 },
    { sku: 'CUT-230D', name: 'Disque diamant 230 mm', qty: 10, unit_price_ht: 189.5, tva_rate: 20 },
  ]);

  const clientObj = DEMO_CLIENTS.find((c) => c.name === selectedClientName) || DEMO_CLIENTS[0];

  function addLine() {
    const item = CATALOG_ITEMS[lines.length % CATALOG_ITEMS.length];
    setLines((prev) => [
      ...prev,
      { sku: item.sku, name: item.name, qty: 1, unit_price_ht: item.price, tva_rate: 20 },
    ]);
  }

  function removeLine(idx: number) {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, field: keyof InvoiceLineItem, val: any) {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        if (field === 'sku') {
          const cat = CATALOG_ITEMS.find((c) => c.sku === val);
          if (cat) {
            return { ...l, sku: cat.sku, name: cat.name, unit_price_ht: cat.price };
          }
        }
        return { ...l, [field]: val };
      })
    );
  }

  const totalHt = lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
  const totalTva = lines.reduce((s, l) => s + (l.qty * l.unit_price_ht * (l.tva_rate / 100)), 0);
  const totalTtc = totalHt + totalTva;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newInvoice: InvoiceData = {
      ref: `FAC-2025-${Math.floor(185 + Math.random() * 800)}`,
      order_ref: orderRef,
      client: clientObj.name,
      client_ice: clientObj.ice,
      client_address: clientObj.address,
      client_city: clientObj.city,
      client_phone: clientObj.phone,
      date_issued: dateIssued,
      due_date: dueDate,
      payment_method: paymentMethod,
      status: 'Impayée',
      lines,
      paid_amount: 0,
    };
    onCreate(newInvoice);
    onClose();
  }

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <form
        className="doc-modal-container"
        style={{ maxWidth: '680px' }}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <FileText size={17} style={{ color: '#38bdf8' }} />
            <span>Nouvelle Facture Client (Maroc)</span>
          </div>
          <button type="button" className="doc-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--navy-1, #131c28)', color: 'var(--text, #e2e8f0)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                CLIENT FACTURÉ
              </label>
              <select
                value={selectedClientName}
                onChange={(e) => setSelectedClientName(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              >
                {DEMO_CLIENTS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.city} · ICE: {c.ice})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                COMMANDE LIÉE (OPTIONNEL)
              </label>
              <input
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="Ex. CMD-2406"
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                DATE D'ÉMISSION
              </label>
              <input
                value={dateIssued}
                onChange={(e) => setDateIssued(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                DATE D'ÉCHÉANCE
              </label>
              <input
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                MODE DE RÈGLEMENT
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              >
                <option value="Virement bancaire (Net 30j)">Virement bancaire (30j)</option>
                <option value="Chèque à l'ordre (Comptant)">Chèque à l'ordre</option>
                <option value="Traite bancaire 60j">Traite bancaire 60j</option>
                <option value="Espèces à la livraison">Espèces à la livraison</option>
              </select>
            </div>
          </div>

          {/* Line items */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                ARTICLES FACTURÉS ({lines.length})
              </span>
              <button
                type="button"
                onClick={addLine}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#0284c7', color: '#fff', border: 0, padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                <Plus size={12} /> Ajouter une ligne
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lines.map((l, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 60px 90px 70px auto',
                    gap: '8px',
                    alignItems: 'center',
                    background: '#0f172a',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                  }}
                >
                  <select
                    value={l.sku}
                    onChange={(e) => updateLine(idx, 'sku', e.target.value)}
                    style={{ height: '32px', background: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '11.5px', borderRadius: '4px', padding: '0 6px' }}
                  >
                    {CATALOG_ITEMS.map((ci) => (
                      <option key={ci.sku} value={ci.sku}>
                        {ci.name} ({formatMoney(ci.price)} DH)
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={l.qty}
                    onChange={(e) => updateLine(idx, 'qty', Number(e.target.value))}
                    title="Quantité"
                    style={{ height: '32px', width: '100%', textAlign: 'center', background: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '11.5px', borderRadius: '4px' }}
                  />

                  <input
                    type="number"
                    step="0.5"
                    value={l.unit_price_ht}
                    onChange={(e) => updateLine(idx, 'unit_price_ht', Number(e.target.value))}
                    title="Prix unitaire HT"
                    style={{ height: '32px', width: '100%', textAlign: 'right', background: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '11.5px', borderRadius: '4px', paddingRight: '4px' }}
                  />

                  <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                    TVA 20%
                  </span>

                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    disabled={lines.length <= 1}
                    style={{ background: 'transparent', border: 0, color: lines.length <= 1 ? '#475569' : '#ef4444', cursor: lines.length <= 1 ? 'not-allowed' : 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', background: '#0f172a', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', marginTop: '6px' }}>
            <div style={{ width: '240px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Total HT :</span>
                <b>{formatMoney(totalHt)} DH</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>TVA 20% :</span>
                <b>{formatMoney(totalTva)} DH</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '4px', fontSize: '14px', color: '#38bdf8', fontWeight: 800 }}>
                <span>Total TTC :</span>
                <span>{formatMoney(totalTtc)} DH</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
              style={{ height: '36px', padding: '0 16px' }}
            >
              <CheckCircle2 size={14} /> Émettre la Facture
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
