import React from 'react';
import {
  Printer, Download, X, CheckCircle2, MessageSquare, CreditCard,
  Building2, ShieldCheck, FileText,
} from 'lucide-react';
import { formatMoney } from '../api';
import { numberToFrenchWords } from './amountToWords';
import './documents.css';

export interface InvoiceLineItem {
  sku: string;
  name: string;
  qty: number;
  unit_price_ht: number;
  tva_rate: number;
}

export interface InvoiceData {
  ref: string;
  order_ref?: string;
  client: string;
  client_ice?: string;
  client_if?: string;
  client_address?: string;
  client_city?: string;
  client_phone?: string;
  date_issued: string;
  due_date: string;
  payment_method?: string;
  status: 'Payée' | 'Partielle' | 'Impayée' | 'En retard' | 'Brouillon' | 'Annulée';
  lines: InvoiceLineItem[];
  paid_amount?: number;
}

interface InvoiceDocumentModalProps {
  invoice: InvoiceData;
  onClose: () => void;
  onRecordPayment?: (invoice: InvoiceData) => void;
}

export default function InvoiceDocumentModal({
  invoice,
  onClose,
  onRecordPayment,
}: InvoiceDocumentModalProps) {
  const totalHt = invoice.lines.reduce((sum, l) => sum + l.qty * l.unit_price_ht, 0);
  const totalTva = invoice.lines.reduce((sum, l) => sum + (l.qty * l.unit_price_ht * (l.tva_rate / 100)), 0);
  const totalTtc = totalHt + totalTva;
  const paid = invoice.paid_amount ?? (invoice.status === 'Payée' ? totalTtc : 0);
  const remaining = Math.max(0, totalTtc - paid);

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const text = `FACTURE ${invoice.ref}\nClient: ${invoice.client}\nTotal TTC: ${formatMoney(totalTtc)} DH\nDate: ${invoice.date_issued}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Facture-${invoice.ref}.txt`;
    link.click();
  }

  const clientPhone = invoice.client_phone || '212661234567';
  const whatsappUrl = `https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Bonjour ${invoice.client}, voici votre facture N° ${invoice.ref} d'un montant de ${formatMoney(totalTtc)} DH TTC (Échéance: ${invoice.due_date}). Merci pour votre confiance.`
  )}`;

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Toolbar */}
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <FileText size={17} style={{ color: '#38bdf8' }} />
            <span>Facture Marocaine · {invoice.ref}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: invoice.status === 'Payée' ? '#16a34a' : invoice.status === 'Partielle' ? '#0284c7' : '#ef4444',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {invoice.status}
            </span>
          </div>

          <div className="doc-modal-toolbar-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="doc-btn doc-btn-secondary"
              style={{ color: '#22c55e', textDecoration: 'none' }}
              title="Envoyer la facture via WhatsApp"
            >
              <MessageSquare size={13} /> WhatsApp
            </a>

            {onRecordPayment && remaining > 0 && (
              <button
                className="doc-btn doc-btn-success"
                onClick={() => onRecordPayment(invoice)}
                title="Enregistrer un règlement sur cette facture"
              >
                <CreditCard size={13} /> Encaisser règlement
              </button>
            )}

            <button className="doc-btn doc-btn-secondary" onClick={handleDownload} title="Télécharger">
              <Download size={13} /> Télécharger
            </button>

            <button className="doc-btn doc-btn-primary" onClick={handlePrint} title="Imprimer au format A4">
              <Printer size={13} /> Imprimer (A4)
            </button>

            <button className="doc-btn-close" onClick={onClose} aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="doc-scroll-wrap">
          <div className="doc-paper">
            {/* Watermark / Stamp if paid */}
            {invoice.status === 'Payée' && (
              <div className="doc-stamp doc-stamp-paid">PAYÉE · ACQUITTÉE</div>
            )}
            {invoice.status === 'En retard' && (
              <div className="doc-stamp" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                ÉCHÉANCE DÉPASSÉE
              </div>
            )}

            {/* Header */}
            <div className="doc-header">
              <div>
                <div className="doc-company-logo">
                  <div className="doc-brand-badge">G</div>
                  <div>
                    <div className="doc-company-name">GESTION ERP · DISTRIBUTION SARL</div>
                    <div className="doc-company-tagline">Négoce, Gros & Distribution Nationale</div>
                  </div>
                </div>
                <div className="doc-company-details">
                  <b>Siège Social :</b> 120, Boulevard Abdelmoumen, 4ème étage, Casablanca<br />
                  <b>Tél :</b> +212 522 20 40 60 · <b>Email :</b> facturation@gestion-erp.ma
                </div>
                <div className="doc-company-legal">
                  <b>ICE :</b> 003147829000064 · <b>IF :</b> 45892014 · <b>RC :</b> 182740 Casa · <b>Patente :</b> 36290184 · <b>CNSS :</b> 8291044
                </div>
              </div>

              <div className="doc-title-block">
                <span className="doc-type-badge">FACTURE OFFICIELLE</span>
                <div className="doc-number">{invoice.ref}</div>
                <div className="doc-meta-row">
                  <div className="doc-meta-item">Date d'émission : <b>{invoice.date_issued}</b></div>
                </div>
                <div className="doc-meta-row">
                  <div className="doc-meta-item">Date d'échéance : <b style={{ color: invoice.status === 'En retard' ? '#ef4444' : 'inherit' }}>{invoice.due_date}</b></div>
                </div>
                {invoice.order_ref && (
                  <div className="doc-meta-row">
                    <div className="doc-meta-item">Commande liée : <b>{invoice.order_ref}</b></div>
                  </div>
                )}
                {invoice.payment_method && (
                  <div className="doc-meta-row">
                    <div className="doc-meta-item">Mode de règlement : <b>{invoice.payment_method}</b></div>
                  </div>
                )}
              </div>
            </div>

            {/* Address Grid */}
            <div className="doc-info-grid">
              <div className="doc-card-box">
                <div className="doc-card-box-title">ÉMETTEUR / FOURNISSEUR</div>
                <div className="doc-card-entity">GESTION ERP DISTRIBUTION SARL</div>
                <div className="doc-card-line">Société à Responsabilité Limitée au capital de 1.000.000 DH</div>
                <div className="doc-card-line">Compte RIB : 011 780 0000 123456789012 34 (BMCE Bank)</div>
                <div className="doc-card-line">Centre de distribution : Casablanca Dépôt Central DEP-01</div>
              </div>

              <div className="doc-card-box">
                <div className="doc-card-box-title">CLIENT DESTINATAIRE (FACTURÉ À)</div>
                <div className="doc-card-entity">{invoice.client}</div>
                <div className="doc-card-line">
                  <b>ICE Client :</b> {invoice.client_ice || '002984123000081'}
                </div>
                {invoice.client_if && (
                  <div className="doc-card-line"><b>IF Client :</b> {invoice.client_if}</div>
                )}
                <div className="doc-card-line">
                  <b>Adresse :</b> {invoice.client_address || 'Zone Industrielle Ain Sebaâ'}, {invoice.client_city || 'Casablanca'}
                </div>
                <div className="doc-card-line">
                  <b>Téléphone :</b> {invoice.client_phone || '+212 522 34 78 90'}
                </div>
              </div>
            </div>

            {/* Table of Articles */}
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>RÉFÉRENCE</th>
                  <th>DÉSIGNATION DES MARCHANDISES</th>
                  <th className="center" style={{ width: '60px' }}>QTÉ</th>
                  <th className="num" style={{ width: '100px' }}>PRIX U. HT</th>
                  <th className="center" style={{ width: '70px' }}>TVA %</th>
                  <th className="num" style={{ width: '110px' }}>TOTAL HT</th>
                  <th className="num" style={{ width: '110px' }}>TOTAL TTC</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line, idx) => {
                  const lineHt = line.qty * line.unit_price_ht;
                  const lineTtc = lineHt * (1 + line.tva_rate / 100);
                  return (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{line.sku}</td>
                      <td>
                        <b>{line.name}</b>
                      </td>
                      <td className="center"><b>{line.qty}</b></td>
                      <td className="num">{formatMoney(line.unit_price_ht)} DH</td>
                      <td className="center">{line.tva_rate}%</td>
                      <td className="num">{formatMoney(lineHt)} DH</td>
                      <td className="num"><b>{formatMoney(lineTtc)} DH</b></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals & Amount in words */}
            <div className="doc-totals-section">
              <div className="doc-in-words-box">
                <span>Arrêtée la présente facture à la somme TTC de :</span>
                <b>{numberToFrenchWords(totalTtc)}</b>
                <div style={{ marginTop: '10px', fontSize: '10px', color: '#64748b' }}>
                  Base imposable TVA à 20% : <b>{formatMoney(totalHt)} DH</b> · Montant TVA : <b>{formatMoney(totalTva)} DH</b>
                </div>
              </div>

              <table className="doc-totals-table">
                <tbody>
                  <tr>
                    <td>Total Brut Hors Taxes (HT) :</td>
                    <td className="num">{formatMoney(totalHt)} DH</td>
                  </tr>
                  <tr>
                    <td>TVA Légale (20.00%) :</td>
                    <td className="num">{formatMoney(totalTva)} DH</td>
                  </tr>
                  <tr className="total-ttc">
                    <td>TOTAL NET À PAYER TTC :</td>
                    <td className="num">{formatMoney(totalTtc)} DH</td>
                  </tr>
                  {paid > 0 && (
                    <tr>
                      <td style={{ color: '#16a34a', fontWeight: 600 }}>Montant déjà réglé :</td>
                      <td className="num" style={{ color: '#16a34a' }}>- {formatMoney(paid)} DH</td>
                    </tr>
                  )}
                  {remaining > 0 && (
                    <tr style={{ background: '#fef2f2' }}>
                      <td style={{ color: '#ef4444', fontWeight: 700 }}>RESTE DÛ / SOLDE :</td>
                      <td className="num" style={{ color: '#ef4444', fontWeight: 800 }}>{formatMoney(remaining)} DH</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signature blocks */}
            <div className="doc-signatures-grid">
              <div className="doc-signature-box">
                <div className="doc-signature-title">Bon pour accord & Cachet Client</div>
                <div style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic', margin: 'auto 0' }}>
                  Nom, Qualité et Signature du Client
                </div>
                <div className="doc-signature-caption">Mention manuscrite « Lu et approuvé »</div>
              </div>

              <div className="doc-signature-box">
                <div className="doc-signature-title">Pour la Direction Financière & Comptable</div>
                <div style={{ margin: 'auto 0' }}>
                  <div className="doc-signature-badge">
                    <ShieldCheck size={13} /> Certifié conforme système ERP
                  </div>
                  <div style={{ fontSize: '11px', color: '#334155', fontWeight: 700, marginTop: '4px' }}>
                    GESTION ERP DISTRIBUTION · DÉPÔT CENTRAL
                  </div>
                </div>
                <div className="doc-signature-caption">Signature électronique autorisée</div>
              </div>
            </div>

            {/* Legal Footer */}
            <div className="doc-footer-legal">
              En cas de retard de paiement, une pénalité égale à 3 fois le taux d'intérêt légal en vigueur sera exigible conformément à la loi marocaine n° 32-10 relative aux délais de paiement.<br />
              Aucun escompte pour paiement anticipé · Les marchandises demeurent la propriété de la société jusqu'au paiement intégral du prix (Clause de réserve de propriété).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
