import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '../api';
import type { PurchaseOrderData, POLineItem } from './PurchaseOrderDocumentModal';

const DEMO_SUPPLIERS = [
  { code: 'FRN-001', name: 'Cosumar S.A.', ice: '001045720000056', address: '8 Rue El Abbès, Mers Sultan, Casablanca', terms: '60 jours fin de mois' },
  { code: 'FRN-002', name: 'Lesieur Cristal', ice: '003284100000012', address: 'Route de Rabat, Ain Sebaâ, Casablanca', terms: '45 jours date facture' },
  { code: 'FRN-003', name: 'Minoterie Tazi & Fils', ice: '008174220000041', address: 'Zone Industrielle Berrechid, Lot 12', terms: '30 jours virement' },
  { code: 'FRN-004', name: 'Salines du Gharb', ice: '009182730000088', address: 'Route Nationale 1, Kenitra', terms: 'Comptant à la livraison' },
  { code: 'FRN-006', name: 'Import Légumes Sec SARL', ice: '002819030000077', address: 'Port de Casablanca, Quai Ouest', terms: '30 jours fin de mois' },
];

const PURCHASABLE_ITEMS = [
  { name: 'Sucre Raffiné 50kg', unit: 'sac', price: 350.0 },
  { name: 'Sucre Glace 25kg', unit: 'sac', price: 175.0 },
  { name: 'Huile Végétale 5L', unit: 'bidon', price: 220.0 },
  { name: 'Huile Olive 1L', unit: 'bouteille', price: 85.0 },
  { name: 'Farine T55 50kg', unit: 'sac', price: 280.0 },
  { name: 'Semoule Fine 25kg', unit: 'sac', price: 145.0 },
  { name: 'Sel Industriel 25kg', unit: 'sac', price: 120.0 },
  { name: 'Lentilles Vertes 25kg', unit: 'sac', price: 250.0 },
  { name: 'Perceuse à percussion 850W', unit: 'pièce', price: 920.0 },
  { name: 'Pompe immergée 1.5 HP', unit: 'pièce', price: 2950.0 },
];

interface NewPurchaseOrderModalProps {
  onClose: () => void;
  onCreate: (order: PurchaseOrderData) => void;
  initialSupplierCode?: string;
}

export default function NewPurchaseOrderModal({
  onClose,
  onCreate,
  initialSupplierCode,
}: NewPurchaseOrderModalProps) {
  const [supplierCode, setSupplierCode] = useState(
    initialSupplierCode || DEMO_SUPPLIERS[0].code
  );
  const [warehouse, setWarehouse] = useState('DEP-01 · Casablanca');
  const [dateOrder, setDateOrder] = useState('07 Oct 2026');
  const [expectedDate, setExpectedDate] = useState('14 Oct 2026');

  const [lines, setLines] = useState<POLineItem[]>([
    { product: 'Huile Végétale 5L', qty_ordered: 250, qty_received: 0, unit_price: 220, unit: 'bidon' },
    { product: 'Sucre Raffiné 50kg', qty_ordered: 100, qty_received: 0, unit_price: 350, unit: 'sac' },
  ]);

  const supplierObj = DEMO_SUPPLIERS.find((s) => s.code === supplierCode) || DEMO_SUPPLIERS[0];

  function addLine() {
    const item = PURCHASABLE_ITEMS[lines.length % PURCHASABLE_ITEMS.length];
    setLines((prev) => [
      ...prev,
      { product: item.name, qty_ordered: 50, qty_received: 0, unit_price: item.price, unit: item.unit },
    ]);
  }

  function removeLine(idx: number) {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLine(idx: number, field: keyof POLineItem, val: any) {
    setLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        if (field === 'product') {
          const item = PURCHASABLE_ITEMS.find((it) => it.name === val);
          if (item) {
            return { ...l, product: item.name, unit_price: item.price, unit: item.unit };
          }
        }
        return { ...l, [field]: val };
      })
    );
  }

  const totalHt = lines.reduce((s, l) => s + l.qty_ordered * l.unit_price, 0);
  const totalTva = totalHt * 0.2;
  const totalTtc = totalHt + totalTva;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newOrder: PurchaseOrderData = {
      id: Date.now(),
      ref: `BC-2026-0${Math.floor(45 + Math.random() * 50)}`,
      supplier: supplierObj.name,
      supplier_code: supplierObj.code,
      supplier_ice: supplierObj.ice,
      supplier_address: supplierObj.address,
      warehouse,
      date: dateOrder,
      expected: expectedDate,
      status: 'Brouillon',
      total_ht: totalHt,
      tva: totalTva,
      total_ttc: totalTtc,
      lines,
      payment_terms: supplierObj.terms,
    };
    onCreate(newOrder);
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
            <ShoppingCart size={17} style={{ color: '#38bdf8' }} />
            <span>Nouveau Bon de Commande Achat (Fournisseur)</span>
          </div>
          <button type="button" className="doc-btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--navy-1, #131c28)', color: 'var(--text, #e2e8f0)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                FOURNISSEUR DESTINATAIRE
              </label>
              <select
                value={supplierCode}
                onChange={(e) => setSupplierCode(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              >
                {DEMO_SUPPLIERS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code} · ICE: {s.ice})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                DÉPÔT DE RÉCEPTION CONVENU
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              >
                <option value="DEP-01 · Casablanca">DEP-01 · Casablanca (Principal)</option>
                <option value="DEP-02 · Rabat">DEP-02 · Rabat (Secondaire)</option>
                <option value="DEP-03 · Berrechid">DEP-03 · Berrechid (Plateforme Sud)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                DATE DU BON DE COMMANDE
              </label>
              <input
                value={dateOrder}
                onChange={(e) => setDateOrder(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                DATE DE LIVRAISON SOUHAITÉE
              </label>
              <input
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Line items */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                ARTICLES À COMMANDER ({lines.length})
              </span>
              <button
                type="button"
                onClick={addLine}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#0284c7', color: '#fff', border: 0, padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                <Plus size={12} /> Ajouter une référence
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lines.map((l, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 70px 70px 90px auto',
                    gap: '8px',
                    alignItems: 'center',
                    background: '#0f172a',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                  }}
                >
                  <select
                    value={l.product}
                    onChange={(e) => updateLine(idx, 'product', e.target.value)}
                    style={{ height: '32px', background: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '11.5px', borderRadius: '4px', padding: '0 6px' }}
                  >
                    {PURCHASABLE_ITEMS.map((pi) => (
                      <option key={pi.name} value={pi.name}>
                        {pi.name} ({formatMoney(pi.price)} DH/{pi.unit})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={l.qty_ordered}
                    onChange={(e) => updateLine(idx, 'qty_ordered', Number(e.target.value))}
                    title="Quantité commandée"
                    style={{ height: '32px', width: '100%', textAlign: 'center', background: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '11.5px', borderRadius: '4px' }}
                  />

                  <input
                    value={l.unit}
                    onChange={(e) => updateLine(idx, 'unit', e.target.value)}
                    title="Unité (ex: sac, bidon, pièce)"
                    style={{ height: '32px', width: '100%', textAlign: 'center', background: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '11.5px', borderRadius: '4px' }}
                  />

                  <input
                    type="number"
                    step="0.5"
                    value={l.unit_price}
                    onChange={(e) => updateLine(idx, 'unit_price', Number(e.target.value))}
                    title="Prix d'achat HT unitaire"
                    style={{ height: '32px', width: '100%', textAlign: 'right', background: '#1e293b', border: '1px solid #475569', color: '#fff', fontSize: '11.5px', borderRadius: '4px', paddingRight: '4px' }}
                  />

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
                <span>Total Achat HT :</span>
                <b>{formatMoney(totalHt)} DH</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>TVA Déductible (20%) :</span>
                <b>{formatMoney(totalTva)} DH</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '4px', fontSize: '14px', color: '#38bdf8', fontWeight: 800 }}>
                <span>Total TTC Engagé :</span>
                <span>{formatMoney(totalTtc)} DH</span>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              <CheckCircle2 size={14} /> Créer le Bon d'Achat (BC)
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
