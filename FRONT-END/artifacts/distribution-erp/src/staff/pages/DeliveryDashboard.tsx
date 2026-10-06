import { useRef, useState } from 'react';
import {
  Truck, MapPin, Phone, MessageSquare, CheckCircle2, AlertTriangle,
  Clock, DollarSign, Camera, FileCheck2, ShieldCheck, ChevronRight,
  User, RefreshCw, XCircle, PenTool, X,
} from 'lucide-react';
import { formatMoney } from '../api';

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

export default function DeliveryDashboard() {
  const [stops, setStops] = useState<DeliveryStop[]>(INITIAL_STOPS);
  const [activeStop, setActiveStop] = useState<DeliveryStop | null>(null);
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
        <button
          className="button-primary"
          style={{ background: '#0284c7', borderColor: '#0369a1' }}
          onClick={() => setClosingModal(true)}
        >
          <ShieldCheck size={16} /> Clôture de caisse livreur
        </button>
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

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
