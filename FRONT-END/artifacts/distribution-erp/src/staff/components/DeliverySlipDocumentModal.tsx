import React from 'react';
import {
  Printer, Download, X, Truck, CheckCircle2, ShieldCheck,
  FileCheck2, MapPin, User, Phone, MessageSquare,
} from 'lucide-react';
import { formatMoney } from '../api';
import './documents.css';

export interface BLLineItem {
  sku: string;
  name: string;
  qty_ordered: number;
  qty_delivered: number;
  unit: string;
  notes?: string;
}

export interface DeliverySlipData {
  bl_ref: string;
  order_ref: string;
  client: string;
  client_ice?: string;
  client_address: string;
  client_city: string;
  client_phone: string;
  whatsapp?: string;
  driver_name: string;
  vehicle?: string;
  tour_ref?: string;
  date_dispatched: string;
  date_delivered?: string;
  warehouse?: string;
  status: 'En attente' | 'En cours' | 'Livré' | 'Partiel' | 'Refusé' | 'Client absent';
  amount_to_collect?: number;
  paid_amount?: number;
  payment_method?: 'especes' | 'cheque' | 'carte_bancaire';
  cheque_number?: string;
  receiver_name?: string;
  signature?: string; // e.g. base64 or confirmation note
  lines: BLLineItem[];
}

interface DeliverySlipDocumentModalProps {
  slip: DeliverySlipData;
  onClose: () => void;
}

export default function DeliverySlipDocumentModal({
  slip,
  onClose,
}: DeliverySlipDocumentModalProps) {
  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const text = `BON DE LIVRAISON ${slip.bl_ref}\nCommande: ${slip.order_ref}\nClient: ${slip.client}\nChauffeur: ${slip.driver_name}\nDate: ${slip.date_dispatched}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Bon-Livraison-${slip.bl_ref}.txt`;
    link.click();
  }

  const isDelivered = slip.status === 'Livré';

  return (
    <div className="doc-modal-backdrop" onClick={onClose}>
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Toolbar */}
        <div className="doc-modal-toolbar">
          <div className="doc-modal-toolbar-title">
            <Truck size={17} style={{ color: '#38bdf8' }} />
            <span>Bon de Livraison Client · {slip.bl_ref}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px',
                background:
                  slip.status === 'Livré'
                    ? '#16a34a'
                    : slip.status === 'En cours'
                    ? '#0284c7'
                    : slip.status === 'Refusé'
                    ? '#ef4444'
                    : '#475569',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              {slip.status}
            </span>
          </div>

          <div className="doc-modal-toolbar-actions">
            {slip.whatsapp && (
              <a
                href={`https://wa.me/${slip.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${slip.client}, voici le Bon de Livraison N° ${slip.bl_ref} pour votre commande ${slip.order_ref}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="doc-btn doc-btn-secondary"
                style={{ color: '#22c55e', textDecoration: 'none' }}
                title="Partager le BL sur WhatsApp"
              >
                <MessageSquare size={13} /> WhatsApp
              </a>
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
            {isDelivered && (
              <div className="doc-stamp doc-stamp-delivered">LIVRÉ & RÉCEPTIONNÉ</div>
            )}
            {slip.status === 'Partiel' && (
              <div className="doc-stamp" style={{ color: '#d97706', borderColor: '#d97706' }}>
                LIVRAISON PARTIELLE
              </div>
            )}

            {/* Header */}
            <div className="doc-header">
              <div>
                <div className="doc-company-logo">
                  <div className="doc-brand-badge">G</div>
                  <div>
                    <div className="doc-company-name">GESTION ERP · DISTRIBUTION SARL</div>
                    <div className="doc-company-tagline">Département Logistique & Transport</div>
                  </div>
                </div>
                <div className="doc-company-details">
                  <b>Dépôt d'expédition :</b> {slip.warehouse || 'DEP-01 Casablanca Central (Zone Industrielle Ain Sebaâ)'}<br />
                  <b>Service Expéditions :</b> +212 522 35 11 20 · <b>Permanence Livraisons :</b> +212 661 00 22 44
                </div>
                <div className="doc-company-legal">
                  <b>ICE :</b> 003147829000064 · <b>IF :</b> 45892014 · <b>RC :</b> 182740 Casa · <b>Patente :</b> 36290184
                </div>
              </div>

              <div className="doc-title-block">
                <span className="doc-type-badge" style={{ background: '#0284c7' }}>
                  BON DE LIVRAISON CLIENT (BL)
                </span>
                <div className="doc-number">{slip.bl_ref}</div>
                <div className="doc-meta-row">
                  <div className="doc-meta-item">Commande liée : <b style={{ color: '#0284c7' }}>{slip.order_ref}</b></div>
                </div>
                <div className="doc-meta-row">
                  <div className="doc-meta-item">Date d'expédition : <b>{slip.date_dispatched}</b></div>
                </div>
                {slip.date_delivered && (
                  <div className="doc-meta-row">
                    <div className="doc-meta-item">Livré le : <b style={{ color: '#16a34a' }}>{slip.date_delivered}</b></div>
                  </div>
                )}
                {slip.tour_ref && (
                  <div className="doc-meta-row">
                    <div className="doc-meta-item">Tournée : <b>{slip.tour_ref}</b></div>
                  </div>
                )}
              </div>
            </div>

            {/* Transport & Client Info Grid */}
            <div className="doc-info-grid">
              <div className="doc-card-box">
                <div className="doc-card-box-title">CHAUFFEUR & VÉHICULE DE TRANSPORT</div>
                <div className="doc-card-entity">{slip.driver_name}</div>
                <div className="doc-card-line"><b>Véhicule :</b> {slip.vehicle || 'Renault Master 23-A-54321'}</div>
                <div className="doc-card-line"><b>Périmètre tournée :</b> Région {slip.client_city}</div>
                {slip.amount_to_collect && (
                  <div className="doc-card-line" style={{ marginTop: '4px' }}>
                    <b>Montant contre-remboursement (COD) :</b>{' '}
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>
                      {formatMoney(slip.amount_to_collect)} DH
                    </span>
                  </div>
                )}
              </div>

              <div className="doc-card-box">
                <div className="doc-card-box-title">DESTINATAIRE & LIEU DE LIVRAISON</div>
                <div className="doc-card-entity">{slip.client}</div>
                {slip.client_ice && (
                  <div className="doc-card-line"><b>ICE Client :</b> {slip.client_ice}</div>
                )}
                <div className="doc-card-line">
                  <b>Adresse de livraison :</b> {slip.client_address}, {slip.client_city}
                </div>
                <div className="doc-card-line">
                  <b>Téléphone :</b> {slip.client_phone}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }} className="center">N°</th>
                  <th style={{ width: '100px' }}>RÉF. / SKU</th>
                  <th>DÉSIGNATION DES ARTICLES LIVRÉS</th>
                  <th className="center" style={{ width: '80px' }}>UNITÉ</th>
                  <th className="center" style={{ width: '80px' }}>QTÉ CDÉE</th>
                  <th className="center" style={{ width: '80px' }}>QTÉ LIVRÉE</th>
                  <th className="center" style={{ width: '80px' }}>ÉCART</th>
                  <th style={{ width: '120px' }}>OBSERVATIONS</th>
                </tr>
              </thead>
              <tbody>
                {slip.lines.map((l, idx) => {
                  const ecart = l.qty_ordered - l.qty_delivered;
                  return (
                    <tr key={idx}>
                      <td className="center" style={{ color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{l.sku}</td>
                      <td>
                        <b>{l.name}</b>
                      </td>
                      <td className="center">{l.unit}</td>
                      <td className="center"><b>{l.qty_ordered}</b></td>
                      <td className="center">
                        <b style={{ color: l.qty_delivered === l.qty_ordered ? '#16a34a' : '#d97706' }}>
                          {l.qty_delivered}
                        </b>
                      </td>
                      <td className="center">
                        {ecart > 0 ? (
                          <span style={{ color: '#ef4444', fontWeight: 700 }}>-{ecart}</span>
                        ) : (
                          <span style={{ color: '#16a34a' }}>0 (Complet)</span>
                        )}
                      </td>
                      <td style={{ fontSize: '10.5px', color: '#64748b' }}>
                        {l.notes || (ecart === 0 ? 'Conforme colis d’origine' : 'Reliquat à réexpédier')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary notes */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', marginBottom: '20px', fontSize: '11px', color: '#475569' }}>
              <b>Nombre total de colis / unités livrées :</b> {slip.lines.reduce((s, l) => s + l.qty_delivered, 0)} articles · 
              <b> Mode de transport :</b> Livraison directe par camion ERP · 
              <b> État des emballages :</b> Intacts et scellés au départ de l'entrepôt.
            </div>

            {/* Double Signature Grid */}
            <div className="doc-signatures-grid">
              <div className="doc-signature-box">
                <div className="doc-signature-title">Visa Chauffeur / Expéditeur</div>
                <div style={{ margin: 'auto 0' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#0f172a' }}>
                    {slip.driver_name}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                    Marchandises chargées et contrôlées au départ
                  </div>
                </div>
                <div className="doc-signature-caption">Heure de départ dépôt : 08h30</div>
              </div>

              <div className="doc-signature-box">
                <div className="doc-signature-title">Accusé de Réception Client (Destinataire)</div>
                <div style={{ margin: 'auto 0' }}>
                  {isDelivered ? (
                    <div>
                      <div className="doc-signature-badge">
                        <CheckCircle2 size={13} /> POD Signé numériquement sur smartphone
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#0f172a', fontWeight: 700, marginTop: '4px' }}>
                        Réceptionné par : {slip.receiver_name || 'Client (Gérant)'}
                      </div>
                      {slip.payment_method && (
                        <div style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 600 }}>
                          Règlement encaissé : {formatMoney(slip.paid_amount || slip.amount_to_collect || 0)} DH ({slip.payment_method})
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>
                      Date, Nom lisible, Cachet commercial et Signature du client
                    </div>
                  )}
                </div>
                <div className="doc-signature-caption">
                  {isDelivered
                    ? `Certifié le ${slip.date_delivered || 'Aujourd’hui'} avec géolocalisation GPS`
                    : 'Mention manuscrite : « Reçu en bon état conforme »'}
                </div>
              </div>
            </div>

            {/* Legal Transport Footer */}
            <div className="doc-footer-legal">
              Les marchandises sont réputées agréées et conformes dès la signature du présent bon de livraison sans réserve motivée.<br />
              Pour toute réserve (avarie, colis manquant), le réceptionnaire doit impérativement la mentionner clairement sur ce bon et la notifier au transporteur par lettre recommandée sous 48h.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
