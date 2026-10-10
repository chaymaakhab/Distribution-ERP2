import React from 'react';
import {
  Printer, Download, X, Undo2, CheckCircle2, ShieldCheck,
  PackageCheck, AlertTriangle, User, Building2, MapPin,
} from 'lucide-react';
import { formatMoney } from '../api';
import './documents.css';

export interface ReturnSlipLineItem {
  product: string;
  qty: number;
  unit_price: number;
  reintegrate: boolean;
  reason_detail?: string;
}

export interface ReturnSlipData {
  ref: string;
  order_ref: string;
  client: string;
  client_ice?: string;
  client_city?: string;
  driver: string;
  driver_type?: 'depot_to_client' | 'depot_to_depot' | 'pre_seller';
  depot?: string;
  date: string;
  reason: string;
  status: 'En cours' | 'Reçu' | 'Validé' | 'Refusé' | 'Réintégré';
  total: number;
  lines: ReturnSlipLineItem[];
  notes?: string;
}

interface ReturnSlipDocumentModalProps {
  slip: ReturnSlipData;
  onClose: () => void;
}

export default function ReturnSlipDocumentModal({
  slip,
  onClose,
}: ReturnSlipDocumentModalProps) {
  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const driverTypeStr =
      slip.driver_type === 'pre_seller'
        ? 'Livreur-pré-vendeur (Van Sales)'
        : slip.driver_type === 'depot_to_depot'
        ? 'Navette Inter-Dépôts'
        : 'Livreur Dépôt → Client';
    const content = `BON DE RETOUR MARCHANDISE & CONSTAT DE LITIGE
Référence : ${slip.ref}
Commande / BL d'origine : ${slip.order_ref}
Client : ${slip.client} (ICE: ${slip.client_ice || 'N/A'})
Dépôt : ${slip.depot || 'DEP-01 Casablanca Central'}
Chauffeur : ${slip.driver} (${driverTypeStr})
Date : ${slip.date}
Motif principal : ${slip.reason}
Statut : ${slip.status}

Articles retournés :
${slip.lines.map((l) => `- ${l.product} : ${l.qty} unités à ${l.unit_price} DH (${l.reintegrate ? 'Réintégré en stock' : 'Mis en rebut / avarie'})`).join('\n')}

Valeur totale du retour : ${slip.total} DH
Observations : ${slip.notes || 'Aucune observation particulière'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bon-Retour-${slip.ref}.txt`;
    link.click();
  }

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Toolbar */}
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <Undo2 size={18} style={{ color: '#f59e0b' }} />
            <span>Bon de Retour & Constat de Litige · {slip.ref}</span>
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 4,
                background: slip.status === 'Réintégré' ? '#166534' : '#854d0e',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              {slip.status}
            </span>
          </div>

          <div className="doc-modal-toolbar-actions">
            <button className="doc-btn doc-btn-outline" onClick={handleDownload} title="Télécharger le fichier texte">
              <Download size={14} /> Exporter
            </button>
            <button className="doc-btn doc-btn-primary" onClick={handlePrint} title="Imprimer le document officiel (A4)">
              <Printer size={14} /> Imprimer Bon de Retour
            </button>
            <button className="doc-btn doc-btn-icon" onClick={onClose} aria-label="Fermer" title="Fermer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Document Body (A4 Style) */}
        <div className="doc-paper printable-content">
          {/* Header */}
          <div className="doc-header">
            <div>
              <div className="doc-brand">GESTION ERP DISTRIBUTION</div>
              <div className="doc-brand-sub">Distribution Alimentaire &amp; Matériaux de Construction</div>
              <div className="doc-meta-company">
                Zone Industrielle Ain Sebaâ, Allée des Usines, Casablanca<br />
                ICE : 001892345000042 · IF : 40291823 · RC : 349120 Casablanca<br />
                Tél : +212 522 35 40 00 · Contact : logistique@gestion-erp.ma
              </div>
            </div>

            <div className="doc-title-block" style={{ borderColor: '#f59e0b' }}>
              <div className="doc-doc-type" style={{ color: '#b45309' }}>BON DE RETOUR</div>
              <div className="doc-doc-sub">& CONSTAT D'AVARIE / LITIGE</div>
              <div className="doc-ref-number">{slip.ref}</div>
              <div className="doc-date-line">Date réception : <strong>{slip.date}</strong></div>
            </div>
          </div>

          {/* Logistics & Client Metadata */}
          <div className="doc-parties-grid">
            <div className="doc-party-card">
              <div className="doc-party-header">
                <Building2 size={13} />
                <span>INFORMATIONS TRANSPORT & DÉPÔT</span>
              </div>
              <div className="doc-party-body">
                <div><strong>Dépôt de réception :</strong> {slip.depot || 'DEP-01 Casablanca Central'}</div>
                <div>
                  <strong>Chauffeur / Livreur :</strong> {slip.driver}
                </div>
                <div>
                  <strong>Type d'acheminement :</strong>{' '}
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        slip.driver_type === 'pre_seller'
                          ? '#059669'
                          : slip.driver_type === 'depot_to_depot'
                          ? '#7e22ce'
                          : '#0369a1',
                    }}
                  >
                    {slip.driver_type === 'pre_seller'
                      ? 'Livreur-pré-vendeur (Van Sales)'
                      : slip.driver_type === 'depot_to_depot'
                      ? 'Navette Inter-Dépôts'
                      : 'Livreur Dépôt → Client'}
                  </span>
                </div>
                <div><strong>Commande d'origine :</strong> <code style={{ color: '#0f172a' }}>{slip.order_ref}</code></div>
                <div><strong>Motif principal :</strong> <span style={{ color: '#b45309', fontWeight: 600 }}>{slip.reason}</span></div>
              </div>
            </div>

            <div className="doc-party-card">
              <div className="doc-party-header">
                <User size={13} />
                <span>CLIENT DESTINATAIRE CONCERNÉ</span>
              </div>
              <div className="doc-party-body">
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{slip.client}</div>
                <div><strong>ICE Client :</strong> {slip.client_ice || '003147829000064'}</div>
                <div><strong>Ville :</strong> {slip.client_city || 'Casablanca'}</div>
                <div><strong>Origine :</strong> Refus ou retour lors de la livraison</div>
                <div><strong>Impact comptable :</strong> Émission d'un Avoir Client équivalent</div>
              </div>
            </div>
          </div>

          {/* Observations alert */}
          {slip.notes && (
            <div
              style={{
                margin: '12px 0',
                padding: '10px 14px',
                borderRadius: 6,
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              <strong>Observations & Constat au déchargement :</strong> {slip.notes}
            </div>
          )}

          {/* Table of Returned Lines */}
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Désignation Produit</th>
                <th style={{ textAlign: 'center', width: '12%' }}>Qté Retour</th>
                <th style={{ textAlign: 'right', width: '16%' }}>P.U. HT</th>
                <th style={{ textAlign: 'right', width: '16%' }}>Total HT</th>
                <th style={{ textAlign: 'center', width: '16%' }}>Décision Stock</th>
              </tr>
            </thead>
            <tbody>
              {slip.lines.map((line, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{line.product}</strong>
                    {line.reason_detail && (
                      <div style={{ fontSize: 11, color: '#64748b' }}>{line.reason_detail}</div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{line.qty}</td>
                  <td style={{ textAlign: 'right' }}>{formatMoney(line.unit_price)} DH</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    {formatMoney(line.qty * line.unit_price)} DH
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: line.reintegrate ? '#dcfce7' : '#fee2e2',
                        color: line.reintegrate ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {line.reintegrate ? 'Réintégré Stock' : 'Rebut / Avarie'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="doc-totals-row">
            <div className="doc-legal-note">
              Conformément à la réglementation commerciale marocaine, ce bon de retour atteste de la réintégration
              ou de la mise au rebut des marchandises spécifiées. Un avoir fiscal sera imputé sur le compte client.
            </div>

            <div className="doc-totals-table">
              <div className="doc-total-line doc-total-final" style={{ borderTop: '2px solid #f59e0b' }}>
                <span>VALEUR TOTALE AVOIR (DH) :</span>
                <span style={{ color: '#b45309' }}>{formatMoney(slip.total)} DH</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="doc-signatures-grid" style={{ marginTop: 28 }}>
            <div className="doc-sign-box">
              <div className="doc-sign-title">VISA & DÉCHARGE LIVREUR</div>
              <div className="doc-sign-subtitle">{slip.driver}</div>
              <div className="doc-sign-zone" style={{ height: 60 }}>
                <span style={{ color: '#94a3b8', fontSize: 11 }}>Signature & CIN chauffeur</span>
              </div>
            </div>

            <div className="doc-sign-box">
              <div className="doc-sign-title">RÉCEPTION & QUALITÉ ENTREPÔT</div>
              <div className="doc-sign-subtitle">{slip.depot || 'Responsable Dépôt'}</div>
              <div className="doc-sign-zone" style={{ height: 60 }}>
                <div style={{ color: '#16a34a', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} /> Marchandise réceptionnée au quai
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="doc-footer">
            GESTION ERP DISTRIBUTION SARL · Capital 2 000 000 DH · Patente 38472910 · CNSS 9182374<br />
            Document généré automatiquement le {new Date().toLocaleDateString('fr-FR')} · Système ERP Maroc
          </div>
        </div>
      </div>
    </div>
  );
}
