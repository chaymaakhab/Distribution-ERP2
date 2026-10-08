import { useRef, useState } from 'react';
import { useLocation } from 'wouter';
import {
  Truck, MapPin, Phone, MessageSquare, CheckCircle2, AlertTriangle,
  Clock, DollarSign, Camera, FileCheck2, ShieldCheck, ChevronRight,
  User, RefreshCw, XCircle, PenTool, X, FileText, Printer, Undo2,
  Plus, ShoppingBag, Store, Check, CreditCard,
} from 'lucide-react';
import { formatMoney } from '../api';
import { DonutChart, MultiSegmentProgress } from '../components/Charts';
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
  payment_method?: 'especes' | 'carte_bancaire' | 'cheque';
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

const VAN_INVENTORY = [
  {
    sku: 'HRC-0850',
    name: 'Perceuse à percussion 850W',
    unit: 'Carton 4 pcs',
    price_ht: 1040.83,
    vat_rate: 20,
    van_stock: 12,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80',
  },
  {
    sku: 'CUT-230D',
    name: 'Disque diamant 230 mm',
    unit: 'Boîte 10 pcs',
    price_ht: 157.92,
    vat_rate: 20,
    van_stock: 35,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
  },
  {
    sku: 'CAB-3G25',
    name: 'Câble électrique 3G2.5',
    unit: 'Couronne 100m',
    price_ht: 1067.0,
    vat_rate: 20,
    van_stock: 8,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
  },
  {
    sku: 'PMP-15HP',
    name: 'Pompe immergée 1.5 HP',
    unit: 'Pièce',
    price_ht: 3368.42,
    vat_rate: 14,
    van_stock: 4,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=300&q=80',
  },
  {
    sku: 'CHA-100I',
    name: 'Charnière inox 100 mm',
    unit: 'Lot 6 pcs',
    price_ht: 77.52,
    vat_rate: 20,
    van_stock: 20,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=300&q=80',
  },
  {
    sku: 'GEN-5000',
    name: 'Groupe électrogène 5 kVA',
    unit: 'Pièce',
    price_ht: 7458.33,
    vat_rate: 20,
    van_stock: 2,
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=80',
  },
];

const HANOUT_CLIENTS = [
  { name: 'Droguerie Al Amal', owner: 'Si Mohamed', phone: '+212 661 22 33 44', address: 'Derb Omar N° 14', city: 'Casablanca' },
  { name: 'Quincaillerie Nassim', owner: 'Si Rachid', phone: '+212 663 44 55 66', address: 'Bd Al Qods N° 82', city: 'Casablanca' },
  { name: 'Épicerie & Droguerie El Wafae', owner: 'Si Hassan', phone: '+212 662 11 99 88', address: 'Hay Mohammadi Rue 12', city: 'Casablanca' },
  { name: 'Magasin Bricolage Benali', owner: 'Si Aziz', phone: '+212 665 77 88 99', address: 'Sidi Bernoussi Lot 4', city: 'Casablanca' },
];

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
  const [stopFilter, setStopFilter] = useState<'all' | 'pending' | 'in_route' | 'delivered' | 'van_sales' | 'issues'>('all');

  // Pre-seller / Van Sales state
  const [showVanSaleModal, setShowVanSaleModal] = useState(false);
  const [vanClientMode, setVanClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedHanout, setSelectedHanout] = useState(HANOUT_CLIENTS[0].name);
  const [newHanoutName, setNewHanoutName] = useState('');
  const [newHanoutOwner, setNewHanoutOwner] = useState('');
  const [newHanoutPhone, setNewHanoutPhone] = useState('');
  const [newHanoutAddress, setNewHanoutAddress] = useState('');
  const [vanSaleType, setVanSaleType] = useState<'immediate' | 'preorder'>('immediate');
  const [vanPayMethod, setVanPayMethod] = useState<'especes' | 'cheque'>('especes');
  const [vanChequeNum, setVanChequeNum] = useState('');
  const [vanChequeBank, setVanChequeBank] = useState('Attijariwafa Bank');
  const [vanLines, setVanLines] = useState<Array<{ sku: string; qty: number }>>([
    { sku: 'HRC-0850', qty: 1 },
    { sku: 'CUT-230D', qty: 2 },
  ]);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Form states for delivery validation modal
  const [receiverName, setReceiverName] = useState('');
  const [payMethod, setPayMethod] = useState<'especes' | 'carte_bancaire' | 'cheque'>('especes');
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

  // Van sales helpers
  function handleAddVanLine(sku: string) {
    const existing = vanLines.find((l) => l.sku === sku);
    if (existing) {
      setVanLines((prev) => prev.map((l) => (l.sku === sku ? { ...l, qty: l.qty + 1 } : l)));
    } else {
      setVanLines((prev) => [...prev, { sku, qty: 1 }]);
    }
  }

  function handleRemoveVanLine(sku: string) {
    setVanLines((prev) => prev.filter((l) => l.sku !== sku));
  }

  function handleUpdateVanLineQty(sku: string, qty: number) {
    if (qty <= 0) {
      handleRemoveVanLine(sku);
      return;
    }
    setVanLines((prev) => prev.map((l) => (l.sku === sku ? { ...l, qty } : l)));
  }

  // Calculate totals for van sales
  const vanLinesDetailed = vanLines.map((vl) => {
    const item = VAN_INVENTORY.find((p) => p.sku === vl.sku) || VAN_INVENTORY[0];
    const totalHt = item.price_ht * vl.qty;
    const totalVat = totalHt * (item.vat_rate / 100);
    const totalTtc = totalHt + totalVat;
    return { ...vl, item, totalHt, totalVat, totalTtc };
  });

  const vanTotalHt = vanLinesDetailed.reduce((acc, l) => acc + l.totalHt, 0);
  const vanTotalVat = vanLinesDetailed.reduce((acc, l) => acc + l.totalVat, 0);
  const vanTotalTtc = vanLinesDetailed.reduce((acc, l) => acc + l.totalTtc, 0);

  function handleSaveVanSale(e: React.FormEvent) {
    e.preventDefault();
    if (vanLines.length === 0) {
      alert('Veuillez sélectionner au moins un article dans le camion.');
      return;
    }

    const clientName = vanClientMode === 'existing'
      ? selectedHanout
      : (newHanoutName.trim() || 'Droguerie Hanout Direct');
    const clientPhone = vanClientMode === 'existing'
      ? (HANOUT_CLIENTS.find((h) => h.name === selectedHanout)?.phone || '+212 661 00 00 00')
      : (newHanoutPhone.trim() || '+212 661 00 00 00');
    const clientAddress = vanClientMode === 'existing'
      ? (HANOUT_CLIENTS.find((h) => h.name === selectedHanout)?.address || 'Quartier commerçant')
      : (newHanoutAddress.trim() || 'Boutique de proximité');
    const receiver = vanClientMode === 'existing'
      ? (HANOUT_CLIENTS.find((h) => h.name === selectedHanout)?.owner || 'Gérant')
      : (newHanoutOwner.trim() || 'Gérant du Hanout');

    const newRef = `CMD-VAN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBLLines: BLLineItem[] = vanLinesDetailed.map((vl) => ({
      sku: vl.sku,
      name: vl.item.name,
      qty_ordered: vl.qty,
      qty_delivered: vl.qty,
      unit: vl.item.unit,
    }));

    STOP_LINES[newRef] = newBLLines;

    const newStop: DeliveryStop = {
      id: Date.now(),
      order_ref: newRef,
      client: clientName,
      address: clientAddress,
      city: 'Casablanca',
      phone: clientPhone,
      whatsapp: clientPhone.replace(/[^0-9]/g, ''),
      amount_to_collect: vanTotalTtc,
      client_note: vanSaleType === 'immediate'
        ? 'Vente directe au camion (Van Sales) — Encaissé au comptoir'
        : 'Prise de commande pré-vendeur — À préparer pour prochaine tournée',
      status: vanSaleType === 'immediate' ? 'delivered' : 'pending',
      paid_amount: vanSaleType === 'immediate' ? vanTotalTtc : undefined,
      payment_method: vanSaleType === 'immediate' ? vanPayMethod : undefined,
      cheque_number: vanPayMethod === 'cheque' ? vanChequeNum : undefined,
      cheque_bank: vanPayMethod === 'cheque' ? vanChequeBank : undefined,
      receiver_name: receiver,
      signature: vanSaleType === 'immediate' ? 'Signature électronique (Validé)' : undefined,
    };

    setStops((prev) => [newStop, ...prev]);
    setShowVanSaleModal(false);

    if (vanSaleType === 'immediate') {
      notify(`Vente directe au camion enregistrée pour ${clientName} (${formatMoney(vanTotalTtc)} DH) !`);
      setActiveBlStop(newStop);
    } else {
      notify(`Prise de commande ${newRef} enregistrée pour ${clientName} (${formatMoney(vanTotalTtc)} DH) !`);
    }

    setNewHanoutName('');
    setNewHanoutOwner('');
    setNewHanoutPhone('');
    setNewHanoutAddress('');
    setVanLines([
      { sku: 'HRC-0850', qty: 1 },
      { sku: 'CUT-230D', qty: 2 },
    ]);
  }

  // Cash calculations & Visualizations
  const deliveredCount = stops.filter((s) => s.status === 'delivered').length;
  const deliveryPct = stops.length > 0 ? Math.round((deliveredCount / stops.length) * 100) : 0;
  const totalTourAmount = stops.reduce((acc, s) => acc + s.amount_to_collect, 0);
  const totalExpectedCash = stops
    .filter((s) => s.status === 'delivered')
    .reduce((acc, s) => acc + (s.paid_amount || 0), 0);
  const diffCash = cashSubmitted - totalExpectedCash;
  const cashPct = totalTourAmount > 0 ? Math.min(100, Math.round((totalExpectedCash / totalTourAmount) * 100)) : 0;
  const totalVanStockUnits = VAN_INVENTORY.reduce((acc, p) => acc + p.van_stock, 0);

  // Filtered stops
  const filteredStops = stops.filter((s) => {
    if (stopFilter === 'all') return true;
    if (stopFilter === 'pending') return s.status === 'pending';
    if (stopFilter === 'in_route') return s.status === 'in_route' || s.status === 'arrived';
    if (stopFilter === 'delivered') return s.status === 'delivered';
    if (stopFilter === 'van_sales') return s.order_ref.startsWith('CMD-VAN');
    if (stopFilter === 'issues') return s.status === 'absent' || s.status === 'refused' || s.status === 'partially_delivered';
    return true;
  });

  return (
    <div className="dashboard-page delivery-workspace">
      {/* Header */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">APPLICATION LIVREUR & PRÉ-VENDEUR <span className="eyebrow-sep">/</span> TOURNÉE DE DISTRIBUTION DU JOUR</span>
          <h1>Tournée N° TRN-2026-08<span className="title-period">.</span></h1>
          <p>Chauffeur & Pré-vendeur: Mehdi Lahlou · Véhicule: Renault Master 23-A-54321 · Dépôt Casablanca.</p>
        </div>
        <div className="heading-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
          <button
            className="button-primary"
            style={{ background: '#0284c7', borderColor: '#0369a1', fontWeight: 700 }}
            onClick={() => setShowVanSaleModal(true)}
            title="Livreur pré-vendeur : Ajouter une commande ou vente directe au camion"
          >
            <Plus size={16} /> Nouvelle Vente / Commande Terrain (Van Sales)
          </button>
          <button
            className="button-secondary"
            onClick={() => (onNavigate ? onNavigate('returns') : setLocation('/delivery/returns'))}
            title="Consulter le registre des retours marchandises"
          >
            <Undo2 size={15} /> Registre Retours
          </button>
          <button
            className="button-secondary"
            style={{ borderColor: '#22c55e', color: '#22c55e' }}
            onClick={() => setClosingModal(true)}
          >
            <ShieldCheck size={16} /> Clôture caisse
          </button>
        </div>
      </div>

      {/* Visual Progression Bars & Van Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
        {/* Route Progression Card */}
        <div style={{ background: 'var(--navy-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              Progression de la tournée
            </span>
            <b style={{ fontSize: 13, color: '#38bdf8' }}>{deliveredCount} / {stops.length} arrêts ({deliveryPct}%)</b>
          </div>
          <div style={{ height: 8, background: 'rgba(56,189,248,0.15)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${deliveryPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
            <span>{stops.filter((s) => s.status !== 'delivered').length} arrêt(s) restant(s)</span>
            <span>Objectif 100% fin de journée</span>
          </div>
        </div>

        {/* Financial Collection Meter */}
        <div style={{ background: 'var(--navy-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              Encaissements perçus
            </span>
            <b style={{ fontSize: 13, color: '#22c55e' }}>{formatMoney(totalExpectedCash)} / {formatMoney(totalTourAmount)} DH ({cashPct}%)</b>
          </div>
          <div style={{ height: 8, background: 'rgba(34,197,94,0.15)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${cashPct}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
            <span>Reste à percevoir: {formatMoney(Math.max(0, totalTourAmount - totalExpectedCash))} DH</span>
            <span>Espèces & Chèques certifiés</span>
          </div>
        </div>

        {/* Van Stock Status */}
        <div style={{ background: 'var(--navy-2)', border: '1px solid var(--line)', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>
              Stock embarqué Camion (Van)
            </span>
            <b style={{ fontSize: 13, color: '#f59e0b' }}>{totalVanStockUnits} unités · 6 réf.</b>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {VAN_INVENTORY.slice(0, 4).map((p) => (
              <span
                key={p.sku}
                style={{
                  fontSize: 10.5,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--line)',
                  color: 'var(--text-soft)',
                }}
              >
                {p.sku}: {p.van_stock} un.
              </span>
            ))}
            <span style={{ fontSize: 10.5, padding: '2px 6px', color: '#38bdf8' }}>+2 autres</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
            Prêt pour vente directe au comptoir chez l'épicier / quincaillier.
          </div>
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
            {deliveredCount} / {stops.length} <small>arrêts</small>
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
            <span className="metric-change change-up">{cashPct}% du total tournée</span>
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
            {stops.find((s) => s.status === 'in_route' || s.status === 'arrived')?.client || 'Tous arrêts terminés'}
          </div>
          <div className="metric-foot">
            <span>Client en cours</span>
          </div>
        </div>

        <div className="metric-card metric-cyan">
          <div className="metric-top">
            <span>Preuves POD Signées</span>
            <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
              <FileCheck2 size={16} />
            </div>
          </div>
          <div className="metric-number">
            {stops.filter((s) => s.signature).length} <small>signatures</small>
          </div>
          <div className="metric-foot">
            <span>Horodatage et preuve de livraison</span>
          </div>
        </div>
      </div>

      {/* Visualisation avancée : Ventilation des Règlements perçus lors de la tournée */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginTop: '16px' }}>
        <div style={{ background: 'var(--navy-2)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>CAISSE DU VÉHICULE</span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 0', color: 'var(--text)' }}>Modes de règlement perçus</h3>
            </div>
            <span className="sx-chip" style={{ fontSize: '11px' }}>Cash · Card · Chèque</span>
          </div>
          <DonutChart
            size={160}
            strokeWidth={20}
            centerLabel="ENCAISSÉ"
            centerValue={`${formatMoney(totalExpectedCash)} DH`}
            slices={[
              {
                label: 'Chèques bancaires',
                value: stops.filter(s => s.payment_method === 'cheque').reduce((acc, s) => acc + (s.paid_amount || 0), 0) || 32100,
                color: '#3b82f6',
              },
              {
                label: 'Espèces (Cash)',
                value: stops.filter(s => s.payment_method === 'especes').reduce((acc, s) => acc + (s.paid_amount || 0), 0) || 18420,
                color: '#10b981',
              },
              {
                label: 'Carte bancaire (Card / TPE)',
                value: stops.filter(s => s.payment_method === 'carte_bancaire').reduce((acc, s) => acc + (s.paid_amount || 0), 0) || 5400,
                color: '#06b6d4',
              },
            ]}
          />
        </div>

        <div style={{ background: 'var(--navy-2)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>SÉCURISATION DES FONDS</span>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 10px', color: 'var(--text)' }}>Rapprochement Fin de Tournée</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 14px' }}>
              Le livreur et pré-vendeur encaisse les clients selon les modes autorisés. La clôture de caisse confronte les fonds physiques (Cash + Card + Chèques) avec les montants de la feuille de route.
            </p>
            <MultiSegmentProgress
              height={12}
              segments={[
                { label: 'Chèques sécurisés', value: 32100, color: '#3b82f6' },
                { label: 'Espèces dans coffre camion', value: 18420, color: '#10b981' },
                { label: 'Carte / TPE dématérialisé', value: 5400, color: '#06b6d4' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11.5px' }}>
            <span style={{ color: 'var(--muted)' }}>Coffre camion verrouillé</span>
            <span style={{ color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={13} /> Conforme aux règles d’audit
            </span>
          </div>
        </div>
      </div>

      {/* Ordered Stops List with Interactive Filter Tabs */}
      <section className="panel list-panel" style={{ marginTop: '16px' }}>
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">FEUILLE DE ROUTE & COMMANDES TERRAIN</span>
            <h2>Arrêts et Ventes au Camion ({filteredStops.length} sur {stops.length})</h2>
          </div>
          <button
            className="button-primary"
            style={{ fontSize: 12, height: 32, background: '#0284c7', borderColor: '#0369a1' }}
            onClick={() => setShowVanSaleModal(true)}
          >
            <Plus size={14} /> + Vente / Commande Terrain
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `Tous les arrêts (${stops.length})` },
            { key: 'in_route', label: `En cours / En route (${stops.filter((s) => s.status === 'in_route' || s.status === 'arrived').length})` },
            { key: 'delivered', label: `Livrés & Encaissés (${deliveredCount})` },
            { key: 'van_sales', label: `Ventes directes Camion (${stops.filter((s) => s.order_ref.startsWith('CMD-VAN')).length})` },
            { key: 'issues', label: `Retours & Absences (${stops.filter((s) => s.status === 'absent' || s.status === 'refused' || s.status === 'partially_delivered').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`table-tab ${stopFilter === tab.key ? 'active-tab' : ''}`}
              onClick={() => setStopFilter(tab.key as any)}
              style={{ fontSize: 12 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
          {filteredStops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--muted)' }}>
              Aucun arrêt dans cette catégorie.
            </div>
          ) : (
            filteredStops.map((stop, idx) => (
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
          ))
        )}
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
                    <option value="especes">Espèces (Cash)</option>
                    <option value="carte_bancaire">Carte bancaire (TPE mobile / Card)</option>
                    <option value="cheque">Chèque bancaire</option>
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

      {/* ── Modal Vente Directe / Commande Hanout (Livreur-Pré-vendeur) ── */}
      {showVanSaleModal && (
        <div className="modal-backdrop" onClick={() => setShowVanSaleModal(false)}>
          <form
            className="record-modal"
            onSubmit={handleSaveVanSale}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 680,
              width: '95%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: 0,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              className="modal-top"
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="eyebrow" style={{ color: '#0284c7', fontWeight: 700, fontSize: 11 }}>
                  LIVREUR-PRÉ-VENDEUR (VAN SALES) · VENTE DIRECTE AU CAMION
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Prise de Commande & Vente Directe au Camion
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowVanSaleModal(false)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Type of operation */}
              <div style={{ background: '#f0f9ff', padding: 12, borderRadius: 8, border: '1px solid #bae6fd' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Type d'opération terrain :
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: vanSaleType === 'immediate' ? '#0284c7' : '#ffffff',
                      color: vanSaleType === 'immediate' ? '#ffffff' : '#0f172a',
                      cursor: 'pointer',
                      border: '1px solid #cbd5e1',
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="vanSaleType"
                      checked={vanSaleType === 'immediate'}
                      onChange={() => setVanSaleType('immediate')}
                      style={{ accentColor: '#ffffff' }}
                    />
                    Vente directe immédiate (Emporté & Encaissé)
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: vanSaleType === 'preorder' ? '#0284c7' : '#ffffff',
                      color: vanSaleType === 'preorder' ? '#ffffff' : '#0f172a',
                      cursor: 'pointer',
                      border: '1px solid #cbd5e1',
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="radio"
                      name="vanSaleType"
                      checked={vanSaleType === 'preorder'}
                      onChange={() => setVanSaleType('preorder')}
                      style={{ accentColor: '#ffffff' }}
                    />
                    Prise de commande (À livrer prochainement)
                  </label>
                </div>
              </div>

              {/* Client selection: existing vs new */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Client / Commerce de proximité :</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setVanClientMode('existing')}
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        background: vanClientMode === 'existing' ? '#0f172a' : '#f8fafc',
                        color: vanClientMode === 'existing' ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      Client existant
                    </button>
                    <button
                      type="button"
                      onClick={() => setVanClientMode('new')}
                      style={{
                        padding: '3px 8px',
                        fontSize: 11,
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        background: vanClientMode === 'new' ? '#0f172a' : '#f8fafc',
                        color: vanClientMode === 'new' ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      + Nouveau Point de Vente
                    </button>
                  </div>
                </div>

                {vanClientMode === 'existing' ? (
                  <select
                    value={selectedHanout}
                    onChange={(e) => setSelectedHanout(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  >
                    {HANOUT_CLIENTS.map((h) => (
                      <option key={h.name} value={h.name}>
                        {h.name} · {h.owner} ({h.address}, {h.phone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Nom de l'établissement *</span>
                      <input
                        required
                        value={newHanoutName}
                        onChange={(e) => setNewHanoutName(e.target.value)}
                        placeholder="Ex. Quincaillerie Bab Marrakech"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Responsable / Gérant *</span>
                      <input
                        required
                        value={newHanoutOwner}
                        onChange={(e) => setNewHanoutOwner(e.target.value)}
                        placeholder="Ex. Si Bouchaib"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Téléphone *</span>
                      <input
                        required
                        value={newHanoutPhone}
                        onChange={(e) => setNewHanoutPhone(e.target.value)}
                        placeholder="Ex. +212 661 99 88 77"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Adresse / Quartier</span>
                      <input
                        value={newHanoutAddress}
                        onChange={(e) => setNewHanoutAddress(e.target.value)}
                        placeholder="Ex. Derb Sultan Rue 14"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Product catalog available in van */}
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 8 }}>
                  Articles disponibles dans la camionnette ({VAN_INVENTORY.length} références) :
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 8 }}>
                  {VAN_INVENTORY.map((item) => {
                    const line = vanLines.find((l) => l.sku === item.sku);
                    const qty = line?.qty || 0;
                    return (
                      <div
                        key={item.sku}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: 8,
                          borderRadius: 8,
                          border: qty > 0 ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                          background: qty > 0 ? '#f0f9ff' : '#ffffff',
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flex: 'none', border: '1px solid #e2e8f0' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <b style={{ fontSize: 12, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </b>
                          <small style={{ color: '#64748b', fontSize: 11 }}>
                            {item.sku} · {formatMoney(item.price_ht * (1 + item.vat_rate / 100))} DH TTC
                          </small>
                          <div style={{ fontSize: 10.5, color: item.van_stock < 5 ? '#e11d48' : '#16a34a', fontWeight: 600 }}>
                            Stock camion: {item.van_stock} un.
                          </div>
                        </div>

                        {/* Stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateVanLineQty(item.sku, qty - 1)}
                            disabled={qty === 0}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 4,
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              cursor: qty > 0 ? 'pointer' : 'default',
                              fontWeight: 700,
                              color: '#0f172a',
                            }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: 20, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddVanLine(item.sku)}
                            disabled={qty >= item.van_stock}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 4,
                              border: '1px solid #0284c7',
                              background: '#0284c7',
                              color: '#ffffff',
                              cursor: qty < item.van_stock ? 'pointer' : 'default',
                              fontWeight: 700,
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected items summary */}
              {vanLines.length > 0 && (
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Récapitulatif de la commande terrain :
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {vanLinesDetailed.map((vl) => (
                      <div key={vl.sku} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span>
                          {vl.item.name} × <b>{vl.qty}</b>
                        </span>
                        <span style={{ fontWeight: 600 }}>{formatMoney(vl.totalTtc)} DH TTC</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid #cbd5e1' }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Total HT: {formatMoney(vanTotalHt)} DH · TVA: {formatMoney(vanTotalVat)} DH</span>
                      <b style={{ fontSize: 15, display: 'block', color: '#0f172a' }}>
                        Net à payer : {formatMoney(vanTotalTtc)} DH TTC
                      </b>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Section (if immediate) */}
              {vanSaleType === 'immediate' && (
                <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 8, border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Règlement immédiat au camion :
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#047857' }}>Mode d'encaissement</span>
                      <select
                        value={vanPayMethod}
                        onChange={(e) => setVanPayMethod(e.target.value as any)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                      >
                        <option value="especes">Espèces au comptoir</option>
                        <option value="cheque">Chèque certifié</option>
                      </select>
                    </div>
                    {vanPayMethod === 'cheque' && (
                      <div>
                        <span style={{ fontSize: 11, color: '#047857' }}>N° Chèque & Banque</span>
                        <input
                          required
                          value={vanChequeNum}
                          onChange={(e) => setVanChequeNum(e.target.value)}
                          placeholder="Ex. CHQ-928401 (Attijari)"
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '12px 22px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowVanSaleModal(false)}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{ background: '#0284c7', borderColor: '#0369a1' }}
              >
                <Check size={14} /> Enregistrer & Générer le Bon (BL / BC)
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
