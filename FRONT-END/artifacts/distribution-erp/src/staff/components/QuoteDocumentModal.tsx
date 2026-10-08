import React from 'react';
import {
  Printer, Download, X, CheckCircle2, MessageSquare, ArrowRight,
  Building2, ShieldCheck, FileCheck, FileText,
} from 'lucide-react';
import { formatMoney } from '../api';
import { numberToFrenchWords } from './amountToWords';
import './documents.css';

export interface QuoteLineItem {
  sku: string;
  name: string;
  qty: number;
  unit_price_ht: number;
  tva_rate: number;
  discount_pct?: number;
}

export interface QuoteData {
  ref: string;
  client: string;
  client_ice?: string;
  client_if?: string;
  client_address?: string;
  client_city?: string;
  client_phone?: string;
  date_issued: string;
  validity_date: string;
  payment_method?: string;
  status: 'En attente' | 'Accepté' | 'Converti en facture' | 'Refusé' | 'Expiré';
  lines: QuoteLineItem[];
  notes?: string;
  created_by?: string;
}

interface QuoteDocumentModalProps {
  quote: QuoteData;
  onClose: () => void;
  onConvertToInvoice?: (quote: QuoteData) => void;
  onAccept?: (quote: QuoteData) => void;
}

export default function QuoteDocumentModal({
  quote,
  onClose,
  onConvertToInvoice,
  onAccept,
}: QuoteDocumentModalProps) {
  const totalHt = quote.lines.reduce((sum, l) => {
    const discount = (l.discount_pct || 0) / 100;
    return sum + l.qty * l.unit_price_ht * (1 - discount);
  }, 0);

  const totalTva = quote.lines.reduce((sum, l) => {
    const discount = (l.discount_pct || 0) / 100;
    const baseHt = l.qty * l.unit_price_ht * (1 - discount);
    return sum + baseHt * (l.tva_rate / 100);
  }, 0);

  const totalTtc = totalHt + totalTva;

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const text = `DEVIS PROFORMA ${quote.ref}\nClient: ${quote.client}\nTotal TTC: ${formatMoney(totalTtc)} DH\nDate d'émission: ${quote.date_issued}\nValidité: ${quote.validity_date}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Devis-${quote.ref}.txt`;
    link.click();
  }

  const clientPhone = quote.client_phone || '212661234567';
  const whatsappUrl = `https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Bonjour ${quote.client}, voici votre Devis Proforma N° ${quote.ref} d'un montant de ${formatMoney(totalTtc)} DH TTC valable jusqu'au ${quote.validity_date}. Cordialement, Hercules Distribution.`
  )}`;

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Toolbar */}
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <FileText size={17} style={{ color: '#0ea5e9' }} />
            <span>Devis Proforma · {quote.ref}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                background:
                  quote.status === 'Accepté'
                    ? '#16a34a'
                    : quote.status === 'Converti en facture'
                    ? '#8b5cf6'
                    : quote.status === 'En attente'
                    ? '#f59e0b'
                    : '#ef4444',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {quote.status}
            </span>
          </div>

          <div className="doc-modal-toolbar-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="doc-btn doc-btn-secondary"
              style={{ color: '#22c55e', textDecoration: 'none' }}
              title="Transmettre le devis par WhatsApp"
            >
              <MessageSquare size={13} /> WhatsApp
            </a>

            {onAccept && quote.status === 'En attente' && (
              <button
                className="doc-btn doc-btn-secondary"
                style={{ color: '#16a34a', borderColor: '#16a34a' }}
                onClick={() => onAccept(quote)}
                title="Marquer comme accepté par le client"
              >
                <CheckCircle2 size={13} /> Valider accord client
              </button>
            )}

            {onConvertToInvoice && quote.status !== 'Converti en facture' && (
              <button
                className="doc-btn doc-btn-success"
                onClick={() => onConvertToInvoice(quote)}
                title="Convertir directement ce devis en facture de vente"
              >
                <ArrowRight size={13} /> Convertir en Facture
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
            {/* Stamp if converted or accepted */}
            {quote.status === 'Converti en facture' && (
              <div className="doc-stamp" style={{ color: '#8b5cf6', borderColor: '#8b5cf6' }}>
                CONVERTI EN FACTURE
              </div>
            )}
            {quote.status === 'Accepté' && (
              <div className="doc-stamp doc-stamp-paid" style={{ color: '#16a34a', borderColor: '#16a34a' }}>
                ACCORD CLIENT REÇU
              </div>
            )}

            {/* Header: Company & Title */}
            <div className="doc-header">
              <div className="doc-company-block">
                <div className="doc-brand">
                  <div className="doc-brand-logo">H</div>
                  <div>
                    <h1 className="doc-company-name">HERCULES DISTRIBUTION SARL</h1>
                    <span className="doc-company-tagline">Négoce, Matériel BTP &amp; Distribution Industrielle</span>
                  </div>
                </div>
                <div className="doc-company-details">
                  <div>Siège Social : Boulevard Chefchaouni, Km 11.5, Ain Sebaâ</div>
                  <div>Casablanca 20250, MAROC · Tél : +212 (0) 522 35 14 00</div>
                  <div>Email : facturation@hercules-distribution.ma · Web : www.hercules-erp.ma</div>
                </div>
              </div>

              <div className="doc-type-block">
                <div className="doc-title" style={{ color: '#0284c7' }}>DEVIS PROFORMA</div>
                <div className="doc-ref">N° {quote.ref}</div>
                <div className="doc-meta-grid">
                  <div><strong>Date d'émission :</strong> {quote.date_issued}</div>
                  <div><strong>Validité de l'offre :</strong> {quote.validity_date}</div>
                  <div><strong>Conditions :</strong> {quote.payment_method || '30 jours date facture'}</div>
                  {quote.created_by && <div><strong>Établi par :</strong> {quote.created_by}</div>}
                </div>
              </div>
            </div>

            {/* Client Card */}
            <div className="doc-party-wrap">
              <div className="doc-party-card" style={{ flex: 1.2 }}>
                <div className="doc-party-label">CLIENT DESTINATAIRE / FACTURÉ À</div>
                <div className="doc-party-name">{quote.client}</div>
                <div className="doc-party-info">
                  {quote.client_address && <div>{quote.client_address}</div>}
                  {quote.client_city && <div>Ville : <strong>{quote.client_city}</strong></div>}
                  {quote.client_phone && <div>Téléphone : {quote.client_phone}</div>}
                  <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dashed #cbd5e1' }}>
                    <strong>Identifiant Commun de l'Entreprise (ICE) :</strong>{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      {quote.client_ice || 'Non renseigné'}
                    </span>
                  </div>
                  {quote.client_if && <div><strong>I.F. :</strong> {quote.client_if}</div>}
                </div>
              </div>

              <div className="doc-party-card" style={{ flex: 0.8, background: '#f8fafc' }}>
                <div className="doc-party-label">MODALITÉS COMMERCIALES</div>
                <div style={{ fontSize: '11.5px', color: '#334155', lineHeight: 1.6, marginTop: 4 }}>
                  <div>• Validité des prix : <strong>Jusqu'au {quote.validity_date}</strong></div>
                  <div>• Délai de livraison estimé : <strong>24h à 48h</strong> après confirmation</div>
                  <div>• Franco de port : À partir de <strong>2 500 DH TTC</strong></div>
                  <div>• Modalités de règlement : <strong>{quote.payment_method || 'Virement bancaire / Chèque'}</strong></div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>N°</th>
                  <th style={{ width: '120px' }}>RÉFÉRENCE</th>
                  <th>DÉSIGNATION DES MARCHANDISES / PRESTATIONS</th>
                  <th style={{ width: '70px', textAlign: 'right' }}>QTÉ</th>
                  <th style={{ width: '110px', textAlign: 'right' }}>P.U. HT (DH)</th>
                  <th style={{ width: '70px', textAlign: 'right' }}>TVA</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>TOTAL HT (DH)</th>
                </tr>
              </thead>
              <tbody>
                {quote.lines.map((line, idx) => {
                  const discount = (line.discount_pct || 0) / 100;
                  const lineTotalHt = line.qty * line.unit_price_ht * (1 - discount);
                  return (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{line.sku}</td>
                      <td>
                        <strong>{line.name}</strong>
                        {line.discount_pct ? (
                          <span style={{ display: 'block', fontSize: '10.5px', color: '#16a34a' }}>
                            Remise commerciale : {line.discount_pct}%
                          </span>
                        ) : null}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{line.qty}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(line.unit_price_ht)}</td>
                      <td style={{ textAlign: 'right' }}>{line.tva_rate}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatMoney(lineTotalHt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals & Notes Section */}
            <div className="doc-totals-wrap">
              <div className="doc-notes-block">
                <div className="doc-words-title">MONTANT DU DEVIS EN TOUTES LETTRES :</div>
                <div className="doc-words-value">
                  Arrêté la présente proposition commerciale à la somme de :<br />
                  <strong>« {numberToFrenchWords(totalTtc)} »</strong>
                </div>

                <div className="doc-legal-box" style={{ marginTop: 12 }}>
                  <ShieldCheck size={14} style={{ flex: 'none', color: '#0ea5e9' }} />
                  <div>
                    <strong>Conditions Générales de Vente :</strong> Ce devis tient lieu de proforma. Pour valider votre commande, merci de retourner le présent document signé et revêtu du cachet de votre établissement avec la mention « Bon pour accord ».
                  </div>
                </div>
              </div>

              <div className="doc-totals-table">
                <div className="doc-totals-row">
                  <span>TOTAL BRUT H.T.</span>
                  <strong>{formatMoney(totalHt)} DH</strong>
                </div>
                <div className="doc-totals-row">
                  <span>TOTAL TVA (20%)</span>
                  <strong>{formatMoney(totalTva)} DH</strong>
                </div>
                <div className="doc-totals-row doc-totals-grand" style={{ borderTop: '2px solid #0284c7' }}>
                  <span>NET À PAYER T.T.C.</span>
                  <span style={{ color: '#0284c7' }}>{formatMoney(totalTtc)} DH</span>
                </div>
              </div>
            </div>

            {/* Signature & Bon pour accord */}
            <div className="doc-signatures-wrap" style={{ marginTop: 24 }}>
              <div className="doc-signature-box">
                <div className="doc-signature-title">Pour Hercules Distribution SARL</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Direction Commerciale &amp; Comptabilité</div>
                <div className="doc-signature-line" style={{ marginTop: 40 }} />
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Signature autorisée &amp; Cachet</div>
              </div>

              <div className="doc-signature-box" style={{ background: '#f8fafc' }}>
                <div className="doc-signature-title">Bon pour Accord &amp; Commande</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Date, Signature et Cachet du Client précédés de « Bon pour Accord » :</div>
                <div className="doc-signature-line" style={{ marginTop: 40 }} />
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Nom et qualité du signataire</div>
              </div>
            </div>

            {/* Legal Footer Maroc */}
            <div className="doc-legal-footer">
              <div>
                <strong>HERCULES DISTRIBUTION SARL</strong> au Capital de 2 000 000,00 DH · Siège Social : Bd Chefchaouni Km 11.5, Ain Sebaâ, Casablanca
              </div>
              <div>
                <strong>ICE :</strong> 003147829000064 · <strong>IF :</strong> 45892147 · <strong>RC :</strong> 512348 Casablanca · <strong>Patente :</strong> 34125890 · <strong>CNSS :</strong> 8492015
              </div>
              <div>
                RIB Bancaire (Attijariwafa Bank) : <strong>007 780 0001234567890123 45</strong> · Devise : Dirham Marocain (MAD)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
