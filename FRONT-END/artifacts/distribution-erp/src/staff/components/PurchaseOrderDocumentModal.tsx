import React from 'react';
import {
  Printer, Download, X, ShoppingCart, CheckCircle2,
  Building2, PackageCheck, Truck, ShieldCheck, Mail,
} from 'lucide-react';
import { formatMoney } from '../api';
import { numberToFrenchWords } from './amountToWords';
import './documents.css';

export interface POLineItem {
  product: string;
  sku?: string;
  qty_ordered: number;
  qty_received: number;
  unit_price: number;
  unit: string;
}

export interface PurchaseOrderData {
  id: number;
  ref: string;
  supplier: string;
  supplier_code: string;
  supplier_ice?: string;
  supplier_phone?: string;
  supplier_address?: string;
  warehouse: string;
  date: string;
  expected: string;
  status: 'Brouillon' | 'Envoyé' | 'Confirmé' | 'En transit' | 'Reçu' | 'Annulé';
  total_ht: number;
  tva: number;
  total_ttc: number;
  lines: POLineItem[];
  payment_terms?: string;
}

interface PurchaseOrderDocumentModalProps {
  order: PurchaseOrderData;
  onClose: () => void;
  onReceive?: (order: PurchaseOrderData) => void;
  onStatusChange?: (order: PurchaseOrderData, newStatus: PurchaseOrderData['status']) => void;
}

export default function PurchaseOrderDocumentModal({
  order,
  onClose,
  onReceive,
  onStatusChange,
}: PurchaseOrderDocumentModalProps) {
  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const text = `BON DE COMMANDE ACHAT ${order.ref}\nFournisseur: ${order.supplier}\nTotal TTC: ${formatMoney(order.total_ttc)} DH\nDate: ${order.date}\nEntrepôt de livraison: ${order.warehouse}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bon-Achat-${order.ref}.txt`;
    link.click();
  }

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Toolbar */}
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <ShoppingCart size={17} style={{ color: '#38bdf8' }} />
            <span>Bon d'Achat Fournisseur · {order.ref}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                background:
                  order.status === 'Reçu'
                    ? '#16a34a'
                    : order.status === 'En transit'
                    ? '#0284c7'
                    : order.status === 'Confirmé'
                    ? '#d97706'
                    : order.status === 'Annulé'
                    ? '#ef4444'
                    : '#475569',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {order.status}
            </span>
          </div>

          <div className="doc-modal-toolbar-actions">
            {onReceive && order.status !== 'Reçu' && order.status !== 'Annulé' && (
              <button
                className="doc-btn doc-btn-success"
                onClick={() => onReceive(order)}
                title="Pointer et réceptionner les articles dans le stock"
              >
                <PackageCheck size={13} /> Réceptionner en stock
              </button>
            )}

            {onStatusChange && order.status === 'Brouillon' && (
              <button
                className="doc-btn doc-btn-secondary"
                onClick={() => onStatusChange(order, 'Envoyé')}
              >
                <Truck size={13} /> Marquer Envoyé
              </button>
            )}

            {onStatusChange && order.status === 'Envoyé' && (
              <button
                className="doc-btn doc-btn-secondary"
                onClick={() => onStatusChange(order, 'Confirmé')}
              >
                <CheckCircle2 size={13} /> Marquer Confirmé
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
            {/* Watermark Stamps */}
            {order.status === 'Reçu' && (
              <div className="doc-stamp doc-stamp-paid">MARCHANDISE REÇUE EN STOCK</div>
            )}
            {order.status === 'Confirmé' && (
              <div className="doc-stamp doc-stamp-approved">CONFIRMÉ FOURNISSEUR</div>
            )}

            {/* Header */}
            <div className="doc-header">
              <div>
                <div className="doc-company-logo">
                  <div className="doc-brand-badge">G</div>
                  <div>
                    <div className="doc-company-name">GESTION ERP · DISTRIBUTION SARL</div>
                    <div className="doc-company-tagline">Direction des Achats & Approvisionnements</div>
                  </div>
                </div>
                <div className="doc-company-details">
                  <b>Siège Social :</b> 120, Boulevard Abdelmoumen, Casablanca<br />
                  <b>Service Achats :</b> +212 522 20 40 65 · <b>Email :</b> achats@gestion-erp.ma
                </div>
                <div className="doc-company-legal">
                  <b>ICE :</b> 003147829000064 · <b>IF :</b> 45892014 · <b>RC :</b> 182740 Casa · <b>Patente :</b> 36290184
                </div>
              </div>

              <div className="doc-title-block">
                <span className="doc-type-badge" style={{ background: '#0284c7' }}>
                  BON D'ACHAT / COMMANDE FOURNISSEUR
                </span>
                <div className="doc-number">{order.ref}</div>
                <div className="doc-meta-row">
                  <div className="doc-meta-item">Date d'émission : <b>{order.date}</b></div>
                </div>
                <div className="doc-meta-row">
                  <div className="doc-meta-item">Livraison exigée le : <b style={{ color: '#0284c7' }}>{order.expected}</b></div>
                </div>
                <div className="doc-meta-row">
                  <div className="doc-meta-item">Dépôt destinataire : <b>{order.warehouse}</b></div>
                </div>
              </div>
            </div>

            {/* Address Grid */}
            <div className="doc-info-grid">
              <div className="doc-card-box">
                <div className="doc-card-box-title">LIEU DE LIVRAISON CONVENU</div>
                <div className="doc-card-entity">{order.warehouse}</div>
                <div className="doc-card-line">Quai de déchargement Poids Lourds n° 2</div>
                <div className="doc-card-line">Horaires de réception : Du Lundi au Vendredi de 08h00 à 16h30</div>
                <div className="doc-card-line">Contact Réceptionnaire Dépôt : +212 522 35 11 22</div>
              </div>

              <div className="doc-card-box">
                <div className="doc-card-box-title">FOURNISSEUR COMMANDÉ</div>
                <div className="doc-card-entity">{order.supplier}</div>
                <div className="doc-card-line"><b>Code Tiers :</b> {order.supplier_code}</div>
                <div className="doc-card-line"><b>ICE Fournisseur :</b> {order.supplier_ice || '001045720000056'}</div>
                <div className="doc-card-line"><b>Adresse :</b> {order.supplier_address || 'Zone Industrielle Mers Sultan, Casablanca'}</div>
                <div className="doc-card-line"><b>Modalités de paiement :</b> {order.payment_terms || '60 jours fin de mois par virement'}</div>
              </div>
            </div>

            {/* Table of Items */}
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }} className="center">N°</th>
                  <th>DÉSIGNATION DE L'ARTICLE COMMANDÉ</th>
                  <th className="center" style={{ width: '80px' }}>UNITÉ</th>
                  <th className="center" style={{ width: '70px' }}>QTÉ CDÉE</th>
                  <th className="center" style={{ width: '70px' }}>QTÉ REÇUE</th>
                  <th className="num" style={{ width: '100px' }}>PRIX U. HT</th>
                  <th className="num" style={{ width: '110px' }}>TOTAL HT</th>
                  <th className="num" style={{ width: '110px' }}>TOTAL TTC</th>
                </tr>
              </thead>
              <tbody>
                {order.lines.map((l, idx) => {
                  const lineHt = l.qty_ordered * l.unit_price;
                  const lineTtc = lineHt * 1.2;
                  return (
                    <tr key={idx}>
                      <td className="center" style={{ color: '#64748b' }}>{idx + 1}</td>
                      <td>
                        <b>{l.product}</b>
                      </td>
                      <td className="center">{l.unit}</td>
                      <td className="center"><b>{l.qty_ordered}</b></td>
                      <td className="center">
                        <span
                          style={{
                            fontWeight: 700,
                            color: l.qty_received >= l.qty_ordered ? '#16a34a' : l.qty_received > 0 ? '#d97706' : '#64748b',
                          }}
                        >
                          {l.qty_received}
                        </span>
                      </td>
                      <td className="num">{formatMoney(l.unit_price)} DH</td>
                      <td className="num">{formatMoney(lineHt)} DH</td>
                      <td className="num"><b>{formatMoney(lineTtc)} DH</b></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="doc-totals-section">
              <div className="doc-in-words-box">
                <span>Montant total de la commande d'achat en toutes lettres :</span>
                <b>{numberToFrenchWords(order.total_ttc)}</b>
                <div style={{ marginTop: '10px', fontSize: '10.5px', color: '#64748b' }}>
                  Livraison accompagnée obligatoirement d'un Bon de Livraison fournisseur (BL) et certificat de conformité.
                </div>
              </div>

              <table className="doc-totals-table">
                <tbody>
                  <tr>
                    <td>Total Achat Hors Taxes (HT) :</td>
                    <td className="num">{formatMoney(order.total_ht)} DH</td>
                  </tr>
                  <tr>
                    <td>TVA Applicable (20.00%) :</td>
                    <td className="num">{formatMoney(order.tva)} DH</td>
                  </tr>
                  <tr className="total-ttc">
                    <td>TOTAL GÉNÉRAL TTC (DH) :</td>
                    <td className="num">{formatMoney(order.total_ttc)} DH</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signature Blocks */}
            <div className="doc-signatures-grid">
              <div className="doc-signature-box">
                <div className="doc-signature-title">Accusé de Réception Fournisseur</div>
                <div style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic', margin: 'auto 0' }}>
                  Date, Cachet et Signature du Fournisseur pour acceptation de commande
                </div>
                <div className="doc-signature-caption">À retourner signé par fax ou email sous 24h</div>
              </div>

              <div className="doc-signature-box">
                <div className="doc-signature-title">Pour la Direction des Achats & Approvisionnements</div>
                <div style={{ margin: 'auto 0' }}>
                  <div className="doc-signature-badge">
                    <ShieldCheck size={13} /> Bon pour commande validé
                  </div>
                  <div style={{ fontSize: '11px', color: '#334155', fontWeight: 700, marginTop: '4px' }}>
                    RESPONSABLE ACHATS · GESTION ERP
                  </div>
                </div>
                <div className="doc-signature-caption">Visa et engagement financier validés</div>
              </div>
            </div>

            {/* Legal Footer */}
            <div className="doc-footer-legal">
              Toute livraison non conforme au présent Bon d'Achat (quantité, prix unitaire, délais ou qualité) sera refusée au quai de déchargement.<br />
              Le numéro de ce bon d'achat doit être obligatoirement mentionné sur votre facture et votre bon de livraison.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
