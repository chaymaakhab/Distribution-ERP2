import React from 'react';
import {
  Printer, Download, X, CheckCircle2, MessageSquare,
  Building2, ShieldCheck, FileText, Undo2,
} from 'lucide-react';
import { formatMoney } from '../api';
import { numberToFrenchWords } from './amountToWords';
import './documents.css';

export interface CreditNoteData {
  ref: string; // AVR-2025-014
  invoice_ref: string; // FAC-2025-182
  return_slip_ref?: string; // BLR-2025-09
  client: string;
  client_ice?: string;
  client_city?: string;
  date_issued: string;
  reason: 'Retour de marchandise' | 'Remise commerciale accordée' | 'Erreur de facturation' | 'Avarie transport';
  total_ht: number;
  tva_rate: number;
  total_ttc: number;
  status: 'Émis' | 'Imputé sur compte' | 'Remboursé';
  notes?: string;
}

interface CreditNoteDocumentModalProps {
  creditNote: CreditNoteData;
  onClose: () => void;
}

export default function CreditNoteDocumentModal({
  creditNote,
  onClose,
}: CreditNoteDocumentModalProps) {
  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const text = `FACTURE D'AVOIR ${creditNote.ref}\nClient: ${creditNote.client}\nFacture d'origine: ${creditNote.invoice_ref}\nTotal TTC: ${formatMoney(creditNote.total_ttc)} DH\nDate: ${creditNote.date_issued}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Avoir-${creditNote.ref}.txt`;
    link.click();
  }

  const tvaAmount = creditNote.total_ht * (creditNote.tva_rate / 100);

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Toolbar */}
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <Undo2 size={17} style={{ color: '#f59e0b' }} />
            <span>Facture d'Avoir · {creditNote.ref}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                background:
                  creditNote.status === 'Imputé sur compte'
                    ? '#16a34a'
                    : creditNote.status === 'Remboursé'
                    ? '#0284c7'
                    : '#f59e0b',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {creditNote.status}
            </span>
          </div>

          <div className="doc-modal-toolbar-actions">
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
            {/* Header: Company & Title */}
            <div className="doc-header">
              <div className="doc-company-block">
                <div className="doc-brand">
                  <div className="doc-brand-logo" style={{ background: '#f59e0b' }}>H</div>
                  <div>
                    <h1 className="doc-company-name">HERCULES DISTRIBUTION SARL</h1>
                    <span className="doc-company-tagline">Négoce, Matériel BTP &amp; Distribution Industrielle</span>
                  </div>
                </div>
                <div className="doc-company-details">
                  <div>Siège Social : Boulevard Chefchaouni, Km 11.5, Ain Sebaâ</div>
                  <div>Casablanca 20250, MAROC · Tél : +212 (0) 522 35 14 00</div>
                  <div>Email : comptabilite@hercules-distribution.ma</div>
                </div>
              </div>

              <div className="doc-type-block">
                <div className="doc-title" style={{ color: '#d97706' }}>FACTURE D'AVOIR</div>
                <div className="doc-ref">N° {creditNote.ref}</div>
                <div className="doc-meta-grid">
                  <div><strong>Date d'émission :</strong> {creditNote.date_issued}</div>
                  <div><strong>Facture d'origine :</strong> {creditNote.invoice_ref}</div>
                  {creditNote.return_slip_ref && <div><strong>Bon de retour :</strong> {creditNote.return_slip_ref}</div>}
                  <div><strong>Motif :</strong> {creditNote.reason}</div>
                </div>
              </div>
            </div>

            {/* Client Card */}
            <div className="doc-party-wrap">
              <div className="doc-party-card" style={{ flex: 1 }}>
                <div className="doc-party-label">AVOIR ÉTABLI AU BÉNÉFICE DE</div>
                <div className="doc-party-name">{creditNote.client}</div>
                <div className="doc-party-info">
                  {creditNote.client_city && <div>Ville : <strong>{creditNote.client_city}</strong></div>}
                  <div style={{ marginTop: 4 }}>
                    <strong>Identifiant Commun de l'Entreprise (ICE) :</strong>{' '}
                    <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {creditNote.client_ice || '003147829000064'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="doc-party-card" style={{ flex: 1, background: '#f8fafc' }}>
                <div className="doc-party-label">IMPACT COMPTABLE &amp; FISCAL</div>
                <div style={{ fontSize: '11.5px', color: '#334155', lineHeight: 1.6, marginTop: 4 }}>
                  <div>• Imputation : <strong>Crédit déduit de l'encours client</strong></div>
                  <div>• Régularisation TVA : <strong>TVA 20% déductible régularisée</strong></div>
                  <div>• Validité : Conforme aux dispositions de l'article 145 du CGI Maroc</div>
                </div>
              </div>
            </div>

            {/* Avoir Table */}
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>N°</th>
                  <th>DÉSIGNATION / OBJET DE L'AVOIR</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>MONTANT HT</th>
                  <th style={{ width: '90px', textAlign: 'right' }}>TAUX TVA</th>
                  <th style={{ width: '130px', textAlign: 'right' }}>TVA DÉDUCTIBLE</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>TOTAL TTC (DH)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>1</td>
                  <td>
                    <strong>Avoir au titre de : {creditNote.reason}</strong>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                      En référence à la facture N° {creditNote.invoice_ref} · {creditNote.notes || 'Régularisation comptable approuvée'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatMoney(creditNote.total_ht)}</td>
                  <td style={{ textAlign: 'right' }}>{creditNote.tva_rate}%</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(tvaAmount)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#d97706' }}>
                    -{formatMoney(creditNote.total_ttc)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals & Notes */}
            <div className="doc-totals-wrap">
              <div className="doc-notes-block">
                <div className="doc-words-title">MONTANT DE L'AVOIR EN TOUTES LETTRES :</div>
                <div className="doc-words-value">
                  Arrêté le présent avoir à déduire à la somme de :<br />
                  <strong>« {numberToFrenchWords(creditNote.total_ttc)} »</strong>
                </div>

                <div className="doc-legal-box" style={{ marginTop: 12 }}>
                  <ShieldCheck size={14} style={{ flex: 'none', color: '#d97706' }} />
                  <div>
                    <strong>Régularisation fiscale :</strong> Cet avoir donne droit à la déduction de la taxe sur la valeur ajoutée initialement facturée, conformément aux textes réglementaires en vigueur au Royaume du Maroc.
                  </div>
                </div>
              </div>

              <div className="doc-totals-table">
                <div className="doc-totals-row">
                  <span>TOTAL AVOIR H.T.</span>
                  <strong>{formatMoney(creditNote.total_ht)} DH</strong>
                </div>
                <div className="doc-totals-row">
                  <span>TVA RÉGULARISÉE ({creditNote.tva_rate}%)</span>
                  <strong>{formatMoney(tvaAmount)} DH</strong>
                </div>
                <div className="doc-totals-row doc-totals-grand" style={{ borderTop: '2px solid #d97706' }}>
                  <span>NET CRÉDITÉ AU CLIENT</span>
                  <span style={{ color: '#d97706' }}>-{formatMoney(creditNote.total_ttc)} DH</span>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="doc-signatures-wrap" style={{ marginTop: 24 }}>
              <div className="doc-signature-box">
                <div className="doc-signature-title">Pour la Direction Comptable &amp; Financière</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Visa et Contrôle interne</div>
                <div className="doc-signature-line" style={{ marginTop: 40 }} />
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Signature autorisée &amp; Cachet</div>
              </div>

              <div className="doc-signature-box" style={{ background: '#f8fafc' }}>
                <div className="doc-signature-title">Accusé de Réception Client</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Pour déduction sur compte ou remboursement</div>
                <div className="doc-signature-line" style={{ marginTop: 40 }} />
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Date et signature du client</div>
              </div>
            </div>

            {/* Legal Footer Maroc */}
            <div className="doc-legal-footer">
              <div>
                <strong>HERCULES DISTRIBUTION SARL</strong> au Capital de 2 000 000,00 DH · Siège Social : Bd Chefchaouni Km 11.5, Ain Sebaâ, Casablanca
              </div>
              <div>
                <strong>ICE :</strong> 003147829000064 · <strong>IF :</strong> 45892147 · <strong>RC :</strong> 512348 Casablanca · <strong>Patente :</strong> 34125890
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
