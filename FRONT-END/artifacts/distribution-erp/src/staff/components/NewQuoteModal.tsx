import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { formatMoney } from '../api';
import type { QuoteData, QuoteLineItem } from './QuoteDocumentModal';

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

interface NewQuoteModalProps {
  onClose: () => void;
  onCreate: (quote: QuoteData) => void;
  initialClient?: string;
  creatorName?: string;
}

export default function NewQuoteModal({
  onClose,
  onCreate,
  initialClient,
  creatorName = 'Comptabilité / Sofia Cherkaoui',
}: NewQuoteModalProps) {
  const [selectedClientName, setSelectedClientName] = useState(
    initialClient || DEMO_CLIENTS[0].name
  );
  const [dateIssued, setDateIssued] = useState('28 Fév 2025');
  const [validityDays, setValidityDays] = useState('30');
  const [paymentMethod, setPaymentMethod] = useState('Virement bancaire 30j');
  const [notes, setNotes] = useState('Offre soumise aux conditions générales de vente. Franco de port 2 500 DH.');

  const [lines, setLines] = useState<QuoteLineItem[]>([
    { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', qty: 5, unit_price_ht: 1249.0, tva_rate: 20, discount_pct: 5 },
    { sku: 'CUT-230D', name: 'Disque diamant 230 mm', qty: 20, unit_price_ht: 189.5, tva_rate: 20, discount_pct: 0 },
  ]);

  const clientObj = DEMO_CLIENTS.find((c) => c.name === selectedClientName) || DEMO_CLIENTS[0];

  function addLine() {
    const item = CATALOG_ITEMS[lines.length % CATALOG_ITEMS.length];
    setLines((prev) => [
      ...prev,
      { sku: item.sku, name: item.name, qty: 1, unit_price_ht: item.price, tva_rate: 20, discount_pct: 0 },
    ]);
  }

  function removeLine(idx: number) {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, field: keyof QuoteLineItem, val: any) {
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

  const totalHt = lines.reduce((s, l) => {
    const discount = (l.discount_pct || 0) / 100;
    return s + l.qty * l.unit_price_ht * (1 - discount);
  }, 0);

  const totalTva = lines.reduce((s, l) => {
    const discount = (l.discount_pct || 0) / 100;
    const baseHt = l.qty * l.unit_price_ht * (1 - discount);
    return s + baseHt * (l.tva_rate / 100);
  }, 0);

  const totalTtc = totalHt + totalTva;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newQuote: QuoteData = {
      ref: `DEV-2025-${Math.floor(40 + Math.random() * 900)}`,
      client: clientObj.name,
      client_ice: clientObj.ice,
      client_address: clientObj.address,
      client_city: clientObj.city,
      client_phone: clientObj.phone,
      date_issued: dateIssued,
      validity_date: `${validityDays} jours (${validityDays === '15' ? '15 Mars 2025' : '28 Mars 2025'})`,
      payment_method: paymentMethod,
      status: 'En attente',
      lines,
      notes,
      created_by: creatorName,
    };
    onCreate(newQuote);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="record-modal"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-top">
          <div>
            <span className="eyebrow">ÉMISSION DE DEVIS COMMERCIAL &amp; COMPTABLE</span>
            <h2>Nouveau Devis Proforma Maroc</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-note">
          Proposition commerciale chiffrée avec calcul automatique de la TVA (20%), remises et validité juridique de l'offre.
        </p>

        {/* Client Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '12px' }}>
          <label className="field-label">
            Client Destinataire :
            <select
              value={selectedClientName}
              onChange={(e) => setSelectedClientName(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            >
              {DEMO_CLIENTS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.city} - ICE: {c.ice})
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Validité de l'offre :
            <select
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <option value="15">15 jours</option>
              <option value="30">30 jours (Standard)</option>
              <option value="60">60 jours</option>
              <option value="90">90 jours</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <label className="field-label">
            Date d'émission :
            <input
              type="text"
              value={dateIssued}
              onChange={(e) => setDateIssued(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>

          <label className="field-label">
            Mode de règlement proposé :
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            >
              <option value="Virement bancaire 30j">Virement bancaire (Net 30j)</option>
              <option value="Chèque bancaire à réception">Chèque à réception</option>
              <option value="Traite commerciale 60j">Traite commerciale (60j fin de mois)</option>
              <option value="Espèces à la livraison">Espèces à la livraison (Max 5 000 DH)</option>
            </select>
          </label>

          <label className="field-label">
            Établi par :
            <input
              type="text"
              value={creatorName}
              readOnly
              style={{ width: '100%', marginTop: '4px', background: 'rgba(255,255,255,0.05)' }}
            />
          </label>
        </div>

        {/* Lines items */}
        <div style={{ marginTop: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              LIGNES DU DEVIS ({lines.length})
            </span>
            <button
              type="button"
              className="button-secondary"
              onClick={addLine}
              style={{ height: '28px', fontSize: '11px', gap: '4px' }}
            >
              <Plus size={13} /> Ajouter un article
            </button>
          </div>

          <div style={{ border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
            <table className="data-table" style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Article / SKU</th>
                  <th style={{ width: '15%' }}>P.U. HT (DH)</th>
                  <th style={{ width: '12%' }}>Quantité</th>
                  <th style={{ width: '12%' }}>Remise (%)</th>
                  <th style={{ width: '10%' }}>TVA (%)</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Total HT</th>
                  <th style={{ width: '6%' }}></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => {
                  const discount = (line.discount_pct || 0) / 100;
                  const lineTotalHt = line.qty * line.unit_price_ht * (1 - discount);
                  return (
                    <tr key={idx}>
                      <td>
                        <select
                          value={line.sku}
                          onChange={(e) => updateLine(idx, 'sku', e.target.value)}
                          style={{ width: '100%', fontSize: '12px', padding: '4px' }}
                        >
                          {CATALOG_ITEMS.map((item) => (
                            <option key={item.sku} value={item.sku}>
                              {item.name} ({item.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={line.unit_price_ht}
                          onChange={(e) => updateLine(idx, 'unit_price_ht', parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', fontSize: '12px', padding: '4px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={line.qty}
                          onChange={(e) => updateLine(idx, 'qty', parseInt(e.target.value, 10) || 1)}
                          style={{ width: '100%', fontSize: '12px', padding: '4px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={line.discount_pct || 0}
                          onChange={(e) => updateLine(idx, 'discount_pct', parseFloat(e.target.value) || 0)}
                          style={{ width: '100%', fontSize: '12px', padding: '4px' }}
                        />
                      </td>
                      <td>
                        <select
                          value={line.tva_rate}
                          onChange={(e) => updateLine(idx, 'tva_rate', parseInt(e.target.value, 10) || 20)}
                          style={{ width: '100%', fontSize: '12px', padding: '4px' }}
                        >
                          <option value="20">20%</option>
                          <option value="14">14%</option>
                          <option value="10">10%</option>
                          <option value="7">7%</option>
                          <option value="0">0%</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '12px' }}>
                        {formatMoney(lineTotalHt)} DH
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          disabled={lines.length <= 1}
                          style={{ background: 'transparent', border: 0, color: '#ef4444', cursor: 'pointer' }}
                          title="Supprimer la ligne"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Summary */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, maxWidth: '420px' }}>
            <label className="field-label">
              Notes &amp; Conditions particulières :
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                style={{ width: '100%', marginTop: '4px', fontSize: '12px' }}
              />
            </label>
          </div>

          <div style={{ width: '280px', background: 'var(--navy-2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>Total Brut HT :</span>
              <b>{formatMoney(totalHt)} DH</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span>TVA (20%) :</span>
              <b>{formatMoney(totalTva)} DH</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '1px solid var(--line)', paddingTop: '6px' }}>
              <span style={{ fontWeight: 700 }}>Total TTC Devis :</span>
              <strong style={{ color: '#0ea5e9', fontSize: '15px' }}>{formatMoney(totalTtc)} DH</strong>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button type="button" className="button-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="button-primary" style={{ background: '#0284c7', borderColor: '#0284c7' }}>
            <FileText size={15} /> Émettre le Devis Proforma
          </button>
        </div>
      </form>
    </div>
  );
}
