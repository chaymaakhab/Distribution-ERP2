import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
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
        style={{
          maxWidth: '780px',
          background: '#ffffff',
          color: '#0f172a',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          className="doc-modal-toolbar"
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            padding: '14px 22px',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div className="doc-modal-toolbar-title" style={{ color: '#fff' }}>
            <FileText size={18} style={{ color: '#38bdf8' }} />
            <div>
              <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.01em' }}>
                Création d'une Facture Client (Norme Fiscale Marocaine)
              </span>
              <small style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', fontWeight: 500 }}>
                Conformité ICE, IF, RC & TVA 20%
              </small>
            </div>
          </div>
          <button type="button" className="doc-btn-close" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body with Clean Paper White Styling */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            background: '#ffffff',
            color: '#0f172a',
          }}
        >
          {/* Client & Order details block */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Building2 size={15} style={{ color: '#0284c7' }} />
              <b style={{ fontSize: '12px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Destinataire & Identifiants Fiscaux
              </b>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  CLIENT DESTINATAIRE (RAISON SOCIALE) *
                </label>
                <select
                  value={selectedClientName}
                  onChange={(e) => setSelectedClientName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                >
                  {DEMO_CLIENTS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.city} · ICE: {c.ice})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  <b>ICE Client :</b> {clientObj.ice} · <b>Ville :</b> {clientObj.city}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  COMMANDE LIÉE (FACULTATIF)
                </label>
                <input
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  placeholder="Ex. CMD-2406"
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

            {/* Dates & Payment */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  DATE D'ÉMISSION
                </label>
                <input
                  value={dateIssued}
                  onChange={(e) => setDateIssued(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '12px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  DATE D'ÉCHÉANCE
                </label>
                <input
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '12px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>
                  MODE DE PAIEMENT PRÉVU
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '12px',
                  }}
                >
                  <option value="Virement bancaire (Net 30j)">Virement bancaire (30j)</option>
                  <option value="Chèque à l'ordre (Comptant)">Chèque à l'ordre</option>
                  <option value="Traite bancaire 60j">Traite bancaire 60j</option>
                  <option value="Espèces à la livraison">Espèces à la livraison</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line items section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Lignes d'articles facturés ({lines.length})
              </span>
              <button
                type="button"
                onClick={addLine}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 0,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                <Plus size={13} /> Ajouter une ligne d'article
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lines.map((l, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 70px 100px 75px auto',
                    gap: '10px',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <select
                    value={l.sku}
                    onChange={(e) => updateLine(idx, 'sku', e.target.value)}
                    style={{
                      height: '34px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '12px',
                      borderRadius: '5px',
                      padding: '0 8px',
                    }}
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
                    style={{
                      height: '34px',
                      width: '100%',
                      textAlign: 'center',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '12px',
                      fontWeight: 700,
                      borderRadius: '5px',
                    }}
                  />

                  <input
                    type="number"
                    step="0.5"
                    value={l.unit_price_ht}
                    onChange={(e) => updateLine(idx, 'unit_price_ht', Number(e.target.value))}
                    title="Prix unitaire HT"
                    style={{
                      height: '34px',
                      width: '100%',
                      textAlign: 'right',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '12px',
                      borderRadius: '5px',
                      paddingRight: '6px',
                    }}
                  />

                  <span style={{ fontSize: '11.5px', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
                    TVA 20%
                  </span>

                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    disabled={lines.length <= 1}
                    style={{
                      background: 'transparent',
                      border: 0,
                      color: lines.length <= 1 ? '#cbd5e1' : '#ef4444',
                      cursor: lines.length <= 1 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                    }}
                    title="Supprimer la ligne"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations Summary Box */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              background: '#f8fafc',
              padding: '14px 18px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginTop: '4px',
            }}
          >
            <div style={{ width: '260px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Total Hors Taxe (HT) :</span>
                <b>{formatMoney(totalHt)} DH</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>TVA Légale (20%) :</span>
                <b>{formatMoney(totalTva)} DH</b>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid #cbd5e1',
                  paddingTop: '6px',
                  fontSize: '15px',
                  color: '#0284c7',
                  fontWeight: 900,
                }}
              >
                <span>Total Facturé TTC :</span>
                <span>{formatMoney(totalTtc)} DH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Modal Actions Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
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
              fontWeight: 600,
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
              background: '#0284c7',
              borderColor: '#0369a1',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            <CheckCircle2 size={16} /> Enregistrer & Émettre la Facture
          </button>
        </div>
      </form>
    </div>
  );
}
