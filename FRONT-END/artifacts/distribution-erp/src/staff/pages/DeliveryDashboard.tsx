import { useRef, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Truck, MapPin, Phone, MessageSquare, CheckCircle2, AlertTriangle,
  Clock, DollarSign, Camera, FileCheck2, ShieldCheck, ChevronRight,
  User, RefreshCw, XCircle, PenTool, X, FileText, Printer, Undo2,
} from 'lucide-react';
import { formatMoney } from '../api';
import DeliverySlipDocumentModal, { type BLLineItem } from '../components/DeliverySlipDocumentModal';

interface DeliveryStop {
  id: number;
  order_ref: string;
  client: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  amount_to_collect: number;
  client_note?: string;
  status: 'pending' | 'in_route' | 'arrived' | 'delivered' | 'partially_delivered' | 'absent' | 'refused';
  paid_amount?: number;
  payment_method?: 'especes' | 'cheque';
  cheque_number?: string;
  cheque_bank?: string;
  receiver_name?: string;
  signature?: string;
}

const INITIAL_STOPS: DeliveryStop[] = [
  {
    id: 1,
    order_ref: 'CMD-2403',
    client: 'Comptoir Al Amal',
    address: '45, Rue des Selliers, Medina',
    city: 'Fès',
    phone: '+212 535 61 20 08',
    whatsapp: '212663445566',
    amount_to_collect: 32100,
    client_note: 'Livrer avant 11h. Accès camionnette par porte Bab Boujloud.',
    status: 'delivered',
    paid_amount: 32100,
    payment_method: 'cheque',
    cheque_number: 'CHQ-849301',
    cheque_bank: 'Attijariwafa Bank',
    receiver_name: 'Mohamed Fassi',
  },
  {
    id: 2,
    order_ref: 'CMD-2405',
    client: 'BatiPro Maroc',
    address: 'Lot 14, Zone Industrielle Takaddoum',
    city: 'Rabat',
    phone: '+212 537 22 16 40',
    whatsapp: '212661987654',
    amount_to_collect: 18420.5,
    client_note: 'Demander le chef de chantier Si Karim.',
    status: 'in_route',
  },
  {
    id: 3,
    order_ref: 'CMD-2406',
    client: 'Atlas Équipements SARL',
    address: '12, Boulevard Zerktouni',
    city: 'Casablanca',
    phone: '+212 522 34 78 90',
    whatsapp: '212661234567',
    amount_to_collect: 24860,
    client_note: 'Quai arrière disponible dès 14h.',
    status: 'pending',
  },
];

const STOP_LINES: Record<string, BLLineItem[]> = {
  'CMD-2403': [
    { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', qty_ordered: 6, qty_delivered: 6, unit: 'Carton 4 pcs' },
    { sku: 'CUT-230D', name: 'Disque diamant 230 mm', qty_ordered: 20, qty_delivered: 20, unit: 'Boîte 10 pcs' },
    { sku: 'CAB-3G25', name: 'Câble électrique 3G2.5', qty_ordered: 4, qty_delivered: 4, unit: 'Couronne 100m' },
  ],
  'CMD-2405': [
    { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', qty_ordered: 4, qty_delivered: 4, unit: 'Carton 4 pcs' },
    { sku: 'CAB-3G25', name: 'Câble électrique 3G2.5', qty_ordered: 2, qty_delivered: 2, unit: 'Couronne 100m' },
    { sku: 'PMP-15HP', name: 'Pompe immergée 1.5 HP', qty_ordered: 2, qty_delivered: 2, unit: 'Pièce' },
  ],
  'CMD-2406': [
    { sku: 'PMP-15HP', name: 'Pompe immergée 1.5 HP', qty_ordered: 1, qty_delivered: 1, unit: 'Pièce' },
    { sku: 'CUT-230D', name: 'Disque diamant 230 mm', qty_ordered: 6, qty_delivered: 4, unit: 'Boîte 10 pcs', notes: '2 boîtes en rupture' },
    { sku: 'GEN-5000', name: 'Groupe électrogène 5 kVA', qty_ordered: 1, qty_delivered: 1, unit: 'Pièce' },
  ],
};

export default function DeliveryDashboard({ onNavigate }: { onNavigate?: (segment: string) => void } = {}) {
  const [, setLocation] = useLocation();
  const [stops, setStops] = useState<DeliveryStop[]>(INITIAL_STOPS);
  const [activeStop, setActiveStop] = useState<DeliveryStop | null>(null);
  const [activeBlStop, setActiveBlStop] = useState<DeliveryStop | null>(null);
  const [returnStop, setReturnStop] = useState<DeliveryStop | null>(null);
  const [returnReason, setReturnReason] = useState<string>('Produit endommagé');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>({});
  const [closingModal, setClosingModal] = useState(false);
  const [cashSubmitted, setCashSubmitted] = useState<number>(75000);
  const [toast, setToast] = useState<string | null>(null);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Form states for delivery validation modal
  const [receiverName, setReceiverName] = useState('');
  const [payMethod, setPayMethod] = useState<'especes' | 'cheque'>('especes');
  const [payAmount, setPayAmount] = useState<string>('');
  const [chequeNum, setChequeNum] = useState('');
  const [chequeBank, setChequeBank] = useState('Attijariwafa Bank');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function startDelivery(stop: DeliveryStop) {
    setStops((prev) =>
      prev.map((s) => (s.id === stop.id ? { ...s, status: 'in_route' } : s)),
    );
    notify(`Tournée démarrée vers ${stop.client}. Statut : En route.`);
  }

  function markArrived(stop: DeliveryStop) {
    setStops((prev) =>
      prev.map((s) => (s.id === stop.id ? { ...s, status: 'arrived' } : s)),
    );
    notify(`Arrivé chez ${stop.client}. Prêt pour déchargement et signature.`);
  }

  function openValidation(stop: DeliveryStop) {
    setActiveStop(stop);
    setPayAmount(String(stop.amount_to_collect));
    setReceiverName('');
    setHasSigned(false);
  }

  function handleSaveDelivery(e: React.FormEvent) {
    e.preventDefault();
    if (!activeStop) return;

    setStops((prev) =>
      prev.map((s) => {
        if (s.id === activeStop.id) {
          return {
            ...s,
            status: 'delivered',
            paid_amount: Number(payAmount) || s.amount_to_collect,
            payment_method: payMethod,
            cheque_number: payMethod === 'cheque' ? chequeNum : undefined,
            cheque_bank: payMethod === 'cheque' ? chequeBank : undefined,
            receiver_name: receiverName,
            signature: hasSigned ? 'Signature validée' : undefined,
          };
        }
        return s;
      }),
    );

    notify(`Livraison de ${activeStop.client} validée avec succès ! Preuve POD et paiement enregistrés.`);
    setActiveStop(null);
  }

  function markRefusedOrAbsent(stop: DeliveryStop, status: 'absent' | 'refused') {
    setStops((prev) =>
      prev.map((s) => (s.id === stop.id ? { ...s, status } : s)),
    );
    notify(`Commande ${stop.order_ref} marquée comme : ${status === 'absent' ? 'Client Absent' : 'Refusée'}. Retour stock programmé.`);
  }

  function openReturnModal(stop: DeliveryStop) {
    setReturnStop(stop);
    setReturnReason('Produit endommagé');
    setReturnNotes('');
    const items = STOP_LINES[stop.order_ref] || [];
    const initQtys: Record<string, number> = {};
    items.forEach((item) => {
      initQtys[item.sku] = item.qty_delivered || item.qty_ordered;
    });
    setReturnQtys(initQtys);
  }

  function handleSaveReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!returnStop) return;

    setStops((prev) =>
      prev.map((s) => {
        if (s.id === returnStop.id) {
          return {
            ...s,
            status: s.status === 'delivered' ? 'partially_delivered' : 'refused',
            client_note: `[Retour marchandise: ${returnReason}] ${returnNotes ? `« ${returnNotes} »` : ''}`,
          };
        }
        return s;
      }),
    );

    notify(`Retour RET-2026-${returnStop.order_ref.replace('CMD-', '')} enregistré pour ${returnStop.client}. Fiche retour transmise à l’entrepôt.`);
    setReturnStop(null);
  }

  // Signature canvas handlers
  function startDraw(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    setHasSigned(true);
  }

  function stopDraw() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }

  // Cash calculations
  const totalExpectedCash = stops
    .filter((s) => s.status === 'delivered')
    .reduce((acc, s) => acc + (s.paid_amount || 0), 0);
  const diffCash = cashSubmitted - totalExpectedCash;

  return (
    <div className="dashboard-page delivery-workspace">
      {/* Header */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">APPLICATION LIVREUR (MOBILE-FIRST) <span className="eyebrow-sep">/</span> TOURNÉE DU JOUR</span>
          <h1>Tournée N° TRN-2026-08<span className="title-period">.</span></h1>
          <p>Chauffeur: Mehdi Lahlou · Véhicule: Renault Master 23-A-54321 · Dépôt Casablanca.</p>
        </div>
        <div className="heading-actions">
          <button
            className="button-secondary"
            onClick={() => (onNavigate ? onNavigate('returns') : setLocation('/delivery/returns'))}
            title="Consulter le registre des retours marchandises"
          >
            <Undo2 size={15} /> Registre des Retours
          </button>
          <button
            className="button-primary"
            style={{ background: '#0284c7', borderColor: '#0369a1' }}
            onClick={() => setClosingModal(true)}
          >
            <ShieldCheck size={16} /> Clôture de caisse livreur
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metric-grid">
        <div className="metric-card metric-blue">
          <div className="metric-top">
            <span>Arrêts Livrés</span>
            <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <Truck size={16} />
            </div>
          </div>
          <div className="metric-number">
            {stops.filter((s) => s.status === 'delivered').length} / {stops.length} <small>arrêts</small>
          </div>
          <div className="metric-foot">
            <span>Reste à livrer : {stops.filter((s) => s.status !== 'delivered').length}</span>
          </div>
        </div>

        <div className="metric-card metric-green">
          <div className="metric-top">
            <span>Montant Encaissé</span>
            <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className="metric-number">{formatMoney(totalExpectedCash)} <small>DH</small></div>
          <div className="metric-foot">
            <span className="metric-change change-up">Attendu du jour</span>
          </div>
        </div>

        <div className="metric-card metric-amber">
          <div className="metric-top">
            <span>Étape Actuelle</span>
            <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <MapPin size={16} />
            </div>
          </div>
          <div className="metric-number" style={{ fontSize: '18px' }}>
            {stops.find((s) => s.status === 'in_route' || s.status === 'arrived')?.client || 'En attente'}
          </div>
          <div className="metric-foot">
            <span>Arrêt 2 sur 3</span>
          </div>
        </div>

        <div className="metric-card metric-cyan">
          <div className="metric-top">
            <span>Preuves POD Enregistrées</span>
            <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="metric-number">
            {stops.filter((s) => s.signature).length} <small>signatures</small>
          </div>
          <div className="metric-foot">
            <span>Horodatage et géolocalisation</span>
          </div>
        </div>
      </div>

      {/* Ordered Stops List */}
      <section className="panel list-panel" style={{ marginTop: '16px' }}>
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">FEUILLE DE ROUTE ORDONNÉE</span>
            <h2>Arrêts de la tournée ({stops.length} clients)</h2>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              style={{
                border: '1px solid var(--line)',
                borderRadius: '9px',
                padding: '16px',
                background: stop.status === 'delivered' ? 'rgba(34,197,94,0.04)' : 'var(--navy-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: '11px', fontWeight: 800, display: 'grid', placeItems: 'center' }}>
                      {idx + 1}
                    </span>
                    <b style={{ fontSize: '15px' }}>{stop.client}</b>
                    <span className="table-ref">{stop.order_ref}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-soft)', marginTop: '6px' }}>
                    <MapPin size={14} style={{ color: '#ef4444' }} /> {stop.address}, {stop.city}
                  </div>
                  {stop.client_note && (
                    <div style={{ fontSize: '11.5px', color: '#38bdf8', marginTop: '6px', fontStyle: 'italic' }}>
                      Instruction spéciale : « {stop.client_note} »
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Montant à encaisser :</div>
                  <strong style={{ fontSize: '18px', color: '#22c55e' }}>{formatMoney(stop.amount_to_collect)} DH</strong>
                  <div style={{ marginTop: '6px' }}>
                    <span
                      className={`status-pill ${
                        stop.status === 'delivered'
                          ? 'status-green'
                          : stop.status === 'in_route'
                          ? 'status-blue'
                          : stop.status === 'arrived'
                          ? 'status-amber'
                          : stop.status === 'absent' || stop.status === 'refused'
                          ? 'status-red'
                          : 'status-muted'
                      }`}
                    >
                      <i /> {stop.status === 'delivered' ? 'Livrée & Encaissée' : stop.status === 'in_route' ? 'En Route' : stop.status === 'arrived' ? 'Arrivé sur place' : stop.status === 'absent' ? 'Client Absent' : stop.status === 'refused' ? 'Refusée' : 'En attente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for driver */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--line-soft)', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`https://wa.me/${stop.whatsapp}?text=Bonjour%20${encodeURIComponent(stop.client)},%20votre%20livreur%20Hercules%20Distribution%20est%20en%20route%20avec%20votre%20commande.`}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary"
                    style={{ height: '32px', padding: '0 10px', color: '#22c55e', gap: '4px' }}
                  >
                    <MessageSquare size={13} /> WhatsApp
                  </a>
                  <a
                    href={`tel:${stop.phone}`}
                    className="button-secondary"
                    style={{ height: '32px', padding: '0 10px', gap: '4px' }}
                  >
                    <Phone size={13} /> Appeler
                  </a>
                  <button
                    className="button-secondary"
                    style={{ height: '32px', padding: '0 10px', gap: '4px', color: '#38bdf8' }}
                    onClick={() => setActiveBlStop(stop)}
                    title="Consulter et imprimer le Bon de Livraison officiel (BL)"
                  >
                    <FileText size={13} /> Bon de Livraison (BL)
                  </button>
                  <button
                    className="button-secondary"
                    style={{ height: '32px', padding: '0 10px', gap: '4px', color: '#f59e0b' }}
                    onClick={() => openReturnModal(stop)}
                    title="Déclarer un retour de marchandise (avarie, refus client, surplus)"
                  >
                    <Undo2 size={13} /> Retour marchandise
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {stop.status === 'pending' && (
                    <button className="button-primary" onClick={() => startDelivery(stop)}>
                      Démarrer cet arrêt
                    </button>
                  )}
                  {stop.status === 'in_route' && (
                    <button className="button-primary" style={{ background: '#f59e0b', borderColor: '#d97706' }} onClick={() => markArrived(stop)}>
                      Arrivé chez le client
                    </button>
                  )}
                  {stop.status === 'arrived' && (
                    <>
                      <button
                        className="button-secondary"
                        style={{ color: '#ef4444' }}
                        onClick={() => markRefusedOrAbsent(stop, 'absent')}
                      >
                        Client absent
                      </button>
                      <button
                        className="button-secondary"
                        style={{ color: '#ef4444' }}
                        onClick={() => markRefusedOrAbsent(stop, 'refused')}
                      >
                        Refusé
                      </button>
                      <button className="button-primary" style={{ background: '#22c55e', borderColor: '#16a34a' }} onClick={() => openValidation(stop)}>
                        Valider livraison (POD & Paiement)
                      </button>
                    </>
                  )}
                  {stop.status === 'delivered' && (
                    <div style={{ fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Reçu POD signé par {stop.receiver_name || 'Client'} ({stop.payment_method})
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bon de Livraison Document Modal */}
      {activeBlStop && (
        <DeliverySlipDocumentModal
          slip={{
            bl_ref: `BL-2026-${activeBlStop.order_ref.replace('CMD-', '')}`,
            order_ref: activeBlStop.order_ref,
            client: activeBlStop.client,
            client_address: activeBlStop.address,
            client_city: activeBlStop.city,
            client_phone: activeBlStop.phone,
            whatsapp: activeBlStop.whatsapp,
            driver_name: 'Mehdi Lahlou',
            vehicle: 'Renault Master 23-A-54321',
            tour_ref: 'TRN-2026-08',
            date_dispatched: '28 Fév 2025',
            date_delivered: activeBlStop.status === 'delivered' ? '28 Fév 2025 · 11:30' : undefined,
            warehouse: 'DEP-01 Casablanca Central',
            status: activeBlStop.status === 'delivered' ? 'Livré' : activeBlStop.status === 'in_route' ? 'En cours' : activeBlStop.status === 'refused' ? 'Refusé' : 'En attente',
            amount_to_collect: activeBlStop.amount_to_collect,
            paid_amount: activeBlStop.paid_amount,
            payment_method: activeBlStop.payment_method,
            cheque_number: activeBlStop.cheque_number,
            receiver_name: activeBlStop.receiver_name,
            signature: activeBlStop.signature,
            lines: STOP_LINES[activeBlStop.order_ref] || [
              { sku: 'PRD-DIV', name: 'Marchandises assorties commande', qty_ordered: 2, qty_delivered: 2, unit: 'Colis' },
            ],
          }}
          onClose={() => setActiveBlStop(null)}
        />
      )}

      {/* Proof of Delivery (POD) & Payment Modal */}
      {activeStop && (
        <div className="modal-backdrop" onClick={() => setActiveStop(null)}>
          <form className="record-modal" onSubmit={handleSaveDelivery} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">PREUVE DE LIVRAISON (POD) · {activeStop.order_ref}</span>
                <h2>Livraison & Encaissement : {activeStop.client}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setActiveStop(null)}>
                <X size={16} />
              </button>
            </div>

            <p className="modal-note">
              Conforme CDC Maroc : signature électronique, mode d'encaissement et mentions de réception.
            </p>

            <label className="field-label">
              Nom et prénom du réceptionnaire
              <input
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="Ex. Karim Berrada (Gérant)"
              />
            </label>

            {/* Signature Canvas */}
            <div style={{ margin: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)' }}>
                  Signature du client sur l'écran :
                </span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer' }}
                  onClick={clearCanvas}
                >
                  Effacer la signature
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={470}
                height={120}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                style={{
                  border: '1px dashed var(--line)',
                  borderRadius: '6px',
                  background: '#ffffff',
                  cursor: 'crosshair',
                  display: 'block',
                  width: '100%',
                }}
              />
              <small style={{ fontSize: '10px', color: 'var(--muted)', display: 'block', marginTop: '3px' }}>
                Signer avec le doigt ou la souris.
              </small>
            </div>

            {/* Payment Section */}
            <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px', margin: '10px 0' }}>
              <b style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>Règlement à la livraison :</b>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <label className="field-label">
                  Mode de règlement
                  <select
                    className="select-compact"
                    style={{ width: '100%', height: '36px' }}
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                  >
                    <option value="especes">Espèces</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </label>
                <label className="field-label">
                  Montant perçu (DH)
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                  />
                </label>
              </div>

              {payMethod === 'cheque' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <label className="field-label">
                    N° du chèque
                    <input
                      placeholder="Ex. 0849201"
                      value={chequeNum}
                      onChange={(e) => setChequeNum(e.target.value)}
                      required
                    />
                  </label>
                  <label className="field-label">
                    Banque
                    <select
                      className="select-compact"
                      style={{ width: '100%', height: '36px' }}
                      value={chequeBank}
                      onChange={(e) => setChequeBank(e.target.value)}
                    >
                      <option>Attijariwafa Bank</option>
                      <option>Banque Populaire</option>
                      <option>BMCE Bank of Africa</option>
                      <option>CIH Bank</option>
                      <option>Société Générale Maroc</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={() => setActiveStop(null)}>Annuler</button>
              <button className="button-primary" type="submit" style={{ background: '#22c55e', borderColor: '#16a34a' }}>
                Confirmer la livraison
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Driver Cash Closing Modal (CDC p.11) */}
      {closingModal && (
        <div className="modal-backdrop" onClick={() => setClosingModal(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">FIN DE TOURNÉE · CAISSE LIVREUR</span>
                <h2>Clôture de Caisse du Livreur</h2>
              </div>
              <button className="icon-button" onClick={() => setClosingModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">
              Calcul de l'écart automatique entre les encaissements saisis et les montants remis (CDC section 8.7).
            </p>

            <div style={{ background: 'var(--navy-2)', padding: '14px', borderRadius: '8px', margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Total attendu (Livraisons) :</span>
                <b>{formatMoney(totalExpectedCash)} DH</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                <span>Détail :</span>
                <span>1 chèque ({formatMoney(32100)} DH) + Espèces ({formatMoney(totalExpectedCash - 32100)} DH)</span>
              </div>
            </div>

            <label className="field-label">
              Montant réellement remis par le livreur (DH)
              <input
                type="number"
                value={cashSubmitted}
                onChange={(e) => setCashSubmitted(Number(e.target.value))}
              />
            </label>

            <div
              style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: diffCash === 0 ? 'rgba(34,197,94,0.1)' : diffCash < 0 ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                border: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <b>Écart calculé :</b>
              <strong style={{ fontSize: '16px', color: diffCash === 0 ? '#22c55e' : diffCash < 0 ? '#ef4444' : '#3b82f6' }}>
                {diffCash > 0 ? `+${formatMoney(diffCash)}` : `${formatMoney(diffCash)}`} DH
              </strong>
            </div>
            {diffCash < 0 && (
              <small style={{ color: '#ef4444', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                Exemple CDC : attendu {formatMoney(totalExpectedCash)} DH, remis {formatMoney(cashSubmitted)} DH → écart {diffCash} DH à justifier.
              </small>
            )}

            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setClosingModal(false)}>Fermer</button>
              <button
                className="button-primary"
                onClick={() => {
                  setClosingModal(false);
                  notify('Clôture validée par le responsable de dépôt et verrouillée dans l’audit.');
                }}
              >
                Valider & verrouiller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Merchandise Modal for Driver */}
      {returnStop && (
        <div className="modal-backdrop" onClick={() => setReturnStop(null)}>
          <form className="record-modal" onSubmit={handleSaveReturn} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">DÉCLARATION RETOUR · {returnStop.order_ref}</span>
                <h2>Retour marchandise : {returnStop.client}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setReturnStop(null)}>
                <X size={16} />
              </button>
            </div>

            <p className="modal-note">
              Enregistrement direct sur smartphone. Les articles retournés seront réceptionnés et réintégrés au stock au retour au dépôt.
            </p>

            <label className="field-label" style={{ marginTop: 12 }}>
              Motif du retour
              <select
                className="select-compact"
                style={{ width: '100%', height: '36px' }}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              >
                <option>Produit endommagé</option>
                <option>Erreur commande</option>
                <option>Produit périmé</option>
                <option>Refus client</option>
                <option>Surplus de livraison</option>
                <option>Qualité non-conforme</option>
              </select>
            </label>

            <div style={{ marginTop: 12 }}>
              <span className="field-label">Articles de la commande à retourner :</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                {(STOP_LINES[returnStop.order_ref] || []).map((line) => (
                  <div
                    key={line.sku}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: 'var(--navy-2)',
                      border: '1px solid var(--line)',
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <b>{line.name}</b>
                      <small style={{ display: 'block', color: 'var(--muted)' }}>SKU: {line.sku} · Livré: {line.qty_delivered} {line.unit}</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Qté retour :</span>
                      <input
                        type="number"
                        min={0}
                        max={line.qty_delivered || line.qty_ordered}
                        value={returnQtys[line.sku] ?? 1}
                        onChange={(e) => setReturnQtys({ ...returnQtys, [line.sku]: Number(e.target.value) })}
                        style={{ width: 55, padding: '3px 6px', borderRadius: 4, border: '1px solid var(--line)', background: 'var(--navy-1)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="field-label" style={{ marginTop: 12 }}>
              Observations & remarques du livreur
              <textarea
                rows={3}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Ex. 2 bidons percés au déchargement, refusé par le responsable réception."
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 6,
                  border: '1px solid var(--line)',
                  background: 'var(--navy-2)',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              />
            </label>

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button type="button" className="button-secondary" onClick={() => setReturnStop(null)}>
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{ background: '#f59e0b', borderColor: '#d97706' }}
              >
                <Undo2 size={14} /> Confirmer le retour marchandise
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
