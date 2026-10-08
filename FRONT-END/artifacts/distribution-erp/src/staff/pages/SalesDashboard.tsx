import React, { useState } from 'react';
import {
  Users, ClipboardCheck, AlertTriangle, MessageSquare, Phone,
  CheckCircle2, XCircle, ShoppingBag, ArrowRight, DollarSign,
  Clock, Package, TrendingUp, Calendar, ChevronRight, X, ShieldCheck,
  FileText, Truck, MapPin, Tag, Plus, Filter, Search, Receipt,
  Check, CreditCard, ChevronDown, Percent,
} from 'lucide-react';
import { formatMoney } from '../api';
import { DonutChart, MultiSegmentProgress } from '../components/Charts';
import InvoiceDocumentModal, { type InvoiceData } from '../components/InvoiceDocumentModal';
import DeliverySlipDocumentModal, { type DeliverySlipData } from '../components/DeliverySlipDocumentModal';
import NewInvoiceModal from '../components/NewInvoiceModal';
import QuoteDocumentModal, { type QuoteData } from '../components/QuoteDocumentModal';
import NewQuoteModal from '../components/NewQuoteModal';

// ── Types ────────────────────────────────────────────────────────────────────

interface PendingOrder {
  id: number;
  ref: string;
  client: string;
  city: string;
  items_count: number;
  total_ttc: number;
  date: string;
  desired_date: string;
  note?: string;
  credit_status: 'ok' | 'depasse';
  source?: string;
  payment_term?: string;
}

interface CommercialClient {
  id: number;
  code: string;
  name: string;
  company: string;
  city: string;
  phone: string;
  whatsapp: string;
  ice: string;
  price_tier: 'revendeur' | 'grossiste' | 'chantier' | 'standard';
  credit_limit: number;
  current_balance: number;
  overdue_amount: number;
  orders_count: number;
  last_order_days_ago: number;
  status: 'Actif' | 'Bloqué' | 'À surveiller';
}

interface CommercialVisit {
  id: number;
  client: string;
  city: string;
  date: string;
  time: string;
  type: 'Prospection' | 'Prise de commande' | 'Recouvrement' | 'Visite de courtoisie';
  status: 'Planifiée' | 'Effectuée' | 'Annulée';
  objective: string;
  report?: string;
  outcome_amount?: number;
}

interface ProductPricing {
  sku: string;
  name: string;
  category: string;
  packaging: string;
  stock: number;
  price_public_ht: number;
  price_revendeur_ht: number;
  price_grossiste_ht: number;
  price_chantier_ht: number;
  vat_rate: number;
}

interface FieldPayment {
  id: number;
  receipt_ref: string;
  client: string;
  invoice_ref: string;
  amount: number;
  method: 'Espèces' | 'Carte bancaire' | 'Chèque';
  cheque_number?: string;
  date: string;
  status: 'En main commercial' | 'Reversé au comptable';
  notes?: string;
}

// ── Données initiales ────────────────────────────────────────────────────────

const INITIAL_PENDING_ORDERS: PendingOrder[] = [
  {
    id: 1,
    ref: 'CMD-2406',
    client: 'Atlas Équipements SARL',
    city: 'Casablanca',
    items_count: 5,
    total_ttc: 24860.0,
    date: 'Aujourd’hui 10:15',
    desired_date: 'Demain avant 11h',
    note: 'Livrer par le quai arrière si possible.',
    credit_status: 'ok',
    source: 'Portail mobile client',
    payment_term: '30j fin de mois',
  },
  {
    id: 2,
    ref: 'CMD-2408',
    client: 'Maison du Bricolage',
    city: 'Marrakech',
    items_count: 3,
    total_ttc: 12450.0,
    date: 'Aujourd’hui 09:40',
    desired_date: '02 Mars',
    note: 'Urgent pour chantier guéliz.',
    credit_status: 'depasse',
    source: 'Portail web client',
    payment_term: 'Traite 60j',
  },
  {
    id: 3,
    ref: 'CMD-2409',
    client: 'Comptoir Al Amal',
    city: 'Fès',
    items_count: 8,
    total_ttc: 32100.0,
    date: 'Hier 16:30',
    desired_date: '03 Mars',
    credit_status: 'depasse',
    source: 'Téléphone commercial',
    payment_term: 'Traite 60j',
  },
];

const INITIAL_RECENT_ORDERS: PendingOrder[] = [
  {
    id: 101,
    ref: 'CMD-2405',
    client: 'BatiPro Maroc',
    city: 'Rabat',
    items_count: 4,
    total_ttc: 18420.5,
    date: '28 Fév 2025',
    desired_date: '01 Mars',
    credit_status: 'ok',
    source: 'Commercial terrain',
  },
  {
    id: 102,
    ref: 'CMD-2403',
    client: 'Comptoir Al Amal',
    city: 'Fès',
    items_count: 8,
    total_ttc: 32100.0,
    date: '27 Fév 2025',
    desired_date: '28 Fév',
    credit_status: 'ok',
    source: 'Commercial terrain',
  },
  {
    id: 103,
    ref: 'CMD-2402',
    client: 'Nord Industrie',
    city: 'Tanger',
    items_count: 2,
    total_ttc: 6280.0,
    date: '26 Fév 2025',
    desired_date: '27 Fév',
    credit_status: 'ok',
    source: 'Commercial terrain',
  },
];

const COMMERCIAL_CLIENTS: CommercialClient[] = [
  {
    id: 1,
    code: 'CLI-0084',
    name: 'Amine Tazi',
    company: 'Atlas Équipements SARL',
    city: 'Casablanca',
    phone: '+212 522 34 78 90',
    whatsapp: '212661234567',
    ice: '003147829000064',
    price_tier: 'revendeur',
    credit_limit: 80000,
    current_balance: 42650,
    overdue_amount: 0,
    orders_count: 34,
    last_order_days_ago: 1,
    status: 'Actif',
  },
  {
    id: 2,
    code: 'CLI-0083',
    name: 'Karim Berrada',
    company: 'BatiPro Maroc',
    city: 'Rabat',
    phone: '+212 537 22 16 40',
    whatsapp: '212661987654',
    ice: '002984123000081',
    price_tier: 'chantier',
    credit_limit: 50000,
    current_balance: 18420,
    overdue_amount: 0,
    orders_count: 19,
    last_order_days_ago: 6,
    status: 'Actif',
  },
  {
    id: 3,
    code: 'CLI-0082',
    name: 'Hassan Mansouri',
    company: 'Maison du Bricolage',
    city: 'Marrakech',
    phone: '+212 524 38 05 17',
    whatsapp: '212662112233',
    ice: '001928374000055',
    price_tier: 'revendeur',
    credit_limit: 35000,
    current_balance: 38200,
    overdue_amount: 8400,
    orders_count: 22,
    last_order_days_ago: 18,
    status: 'À surveiller',
  },
  {
    id: 4,
    code: 'CLI-0081',
    name: 'Mohamed Fassi',
    company: 'Comptoir Al Amal',
    city: 'Fès',
    phone: '+212 535 61 20 08',
    whatsapp: '212663445566',
    ice: '004128901000092',
    price_tier: 'grossiste',
    credit_limit: 100000,
    current_balance: 32100,
    overdue_amount: 32100,
    orders_count: 48,
    last_order_days_ago: 22,
    status: 'À surveiller',
  },
  {
    id: 5,
    code: 'CLI-0080',
    name: 'Mehdi Lahlou',
    company: 'Nord Industrie',
    city: 'Tanger',
    phone: '+212 539 94 12 30',
    whatsapp: '212661778899',
    ice: '007812934000033',
    price_tier: 'grossiste',
    credit_limit: 60000,
    current_balance: 6280,
    overdue_amount: 0,
    orders_count: 15,
    last_order_days_ago: 3,
    status: 'Actif',
  },
  {
    id: 6,
    code: 'CLI-0079',
    name: 'Omar Slaoui',
    company: 'Quincaillerie Saada',
    city: 'Agadir',
    phone: '+212 528 84 55 60',
    whatsapp: '212664778899',
    ice: '006541289000021',
    price_tier: 'revendeur',
    credit_limit: 40000,
    current_balance: 14500,
    overdue_amount: 14500,
    orders_count: 11,
    last_order_days_ago: 32,
    status: 'À surveiller',
  },
];

const INITIAL_VISITS: CommercialVisit[] = [
  {
    id: 1,
    client: 'Atlas Équipements SARL',
    city: 'Casablanca',
    date: 'Aujourd’hui',
    time: '14:30',
    type: 'Prise de commande',
    status: 'Planifiée',
    objective: 'Présentation de la nouvelle gamme outillage 2026 et négociation commande réassort.',
  },
  {
    id: 2,
    client: 'Maison du Bricolage',
    city: 'Marrakech',
    date: 'Aujourd’hui',
    time: '16:00',
    type: 'Recouvrement',
    status: 'Planifiée',
    objective: 'Récupération chèque de règlement facture échue et déblocage plafond crédit.',
  },
  {
    id: 3,
    client: 'BatiPro Maroc',
    city: 'Rabat',
    date: '27 Fév 2025',
    time: '11:00',
    type: 'Prise de commande',
    status: 'Effectuée',
    objective: 'Validation des besoins chantier Takaddoum.',
    report: 'Visite positive. Client très satisfait des délais. Commande CMD-2405 signée pour 18 420,50 DH.',
    outcome_amount: 18420.5,
  },
  {
    id: 4,
    client: 'Quincaillerie Saada',
    city: 'Agadir',
    date: '24 Fév 2025',
    time: '10:15',
    type: 'Recouvrement',
    status: 'Effectuée',
    objective: 'Règlement acompte sur créance ancienne.',
    report: 'Chèque N° 001298 de 14 500 DH récupéré en main propre.',
    outcome_amount: 14500.0,
  },
];

const PRICING_CATALOG: ProductPricing[] = [
  {
    sku: 'HRC-0850',
    name: 'Perceuse à percussion 850W',
    category: 'Outillage',
    packaging: 'Carton (4 pcs)',
    stock: 120,
    price_public_ht: 1249.0,
    price_revendeur_ht: 1124.1, // -10%
    price_grossiste_ht: 1024.18, // -18%
    price_chantier_ht: 1099.0, // -12%
    vat_rate: 20,
  },
  {
    sku: 'CUT-230D',
    name: 'Disque diamant 230 mm',
    category: 'Outillage',
    packaging: 'Lot (10 pcs)',
    stock: 64,
    price_public_ht: 189.5,
    price_revendeur_ht: 170.55,
    price_grossiste_ht: 155.39,
    price_chantier_ht: 166.76,
    vat_rate: 20,
  },
  {
    sku: 'PMP-15HP',
    name: 'Pompe immergée 1.5 HP',
    category: 'Plomberie',
    packaging: 'Pièce',
    stock: 8,
    price_public_ht: 3840.0,
    price_revendeur_ht: 3456.0,
    price_grossiste_ht: 3148.8,
    price_chantier_ht: 3379.2,
    vat_rate: 14,
  },
  {
    sku: 'CAB-3G25',
    name: 'Câble électrique 3G2.5 (100m)',
    category: 'Électricité',
    packaging: 'Couronne 100m',
    stock: 480,
    price_public_ht: 1280.0,
    price_revendeur_ht: 1152.0,
    price_grossiste_ht: 1049.6,
    price_chantier_ht: 1126.4,
    vat_rate: 20,
  },
  {
    sku: 'GEN-5000',
    name: 'Groupe électrogène 5 kVA',
    category: 'Énergie',
    packaging: 'Pièce',
    stock: 3,
    price_public_ht: 8950.0,
    price_revendeur_ht: 8055.0,
    price_grossiste_ht: 7339.0,
    price_chantier_ht: 7876.0,
    vat_rate: 20,
  },
  {
    sku: 'CHA-100I',
    name: 'Charnière inox 100 mm',
    category: 'Quincaillerie',
    packaging: 'Lot (6 pcs)',
    stock: 240,
    price_public_ht: 93.0,
    price_revendeur_ht: 83.7,
    price_grossiste_ht: 76.26,
    price_chantier_ht: 81.84,
    vat_rate: 20,
  },
];

const INITIAL_FIELD_PAYMENTS: FieldPayment[] = [
  {
    id: 1,
    receipt_ref: 'REC-COM-2025-019',
    client: 'Atlas Équipements SARL',
    invoice_ref: 'FAC-2025-184',
    amount: 5000.0,
    method: 'Espèces',
    date: '28 Fév 2025',
    status: 'En main commercial',
    notes: 'Acompte espèces contre reçu officiel (Plafond légal 5 000 DH respecté).',
  },
  {
    id: 2,
    receipt_ref: 'REC-COM-2025-018',
    client: 'BatiPro Maroc',
    invoice_ref: 'FAC-2025-183',
    amount: 8000.0,
    method: 'Chèque',
    cheque_number: 'CHQ-084731 (Attijariwafa)',
    date: '27 Fév 2025',
    status: 'Reversé au comptable',
    notes: 'Remis à Mme Sofia Cherkaoui avec accusé de transmission.',
  },
];

export default function SalesDashboard({ onNavigate }: { onNavigate?: (module: string) => void }) {
  const [activeTab, setActiveTab] = useState<'orders' | 'clients' | 'visits' | 'pricing' | 'payments'>('orders');

  // Orders State
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(INITIAL_PENDING_ORDERS);
  const [recentOrders, setRecentOrders] = useState<PendingOrder[]>(INITIAL_RECENT_ORDERS);
  const [rejectModalOrder, setRejectModalOrder] = useState<PendingOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Quick Order Modal
  const [showQuickOrderModal, setShowQuickOrderModal] = useState(false);
  const [quickOrderClient, setQuickOrderClient] = useState(COMMERCIAL_CLIENTS[0].name);
  const [quickOrderSku, setQuickOrderSku] = useState(PRICING_CATALOG[0].sku);
  const [quickOrderQty, setQuickOrderQty] = useState(2);

  // Clients State
  const [clients, setClients] = useState<CommercialClient[]>(COMMERCIAL_CLIENTS);
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');

  // Visits State
  const [visits, setVisits] = useState<CommercialVisit[]>(INITIAL_VISITS);
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [visitClient, setVisitClient] = useState(COMMERCIAL_CLIENTS[0].company);
  const [visitType, setVisitType] = useState<CommercialVisit['type']>('Prise de commande');
  const [visitDate, setVisitDate] = useState('Aujourd’hui');
  const [visitTime, setVisitTime] = useState('15:00');
  const [visitObjective, setVisitObjective] = useState('');

  // Visit Report Modal
  const [reportVisit, setReportVisit] = useState<CommercialVisit | null>(null);
  const [reportText, setReportText] = useState('');
  const [reportOutcomeAmount, setReportOutcomeAmount] = useState<number>(0);

  // Pricing Simulator State
  const [simProductSku, setSimProductSku] = useState(PRICING_CATALOG[0].sku);
  const [simQty, setSimQty] = useState(5);
  const [simTier, setSimTier] = useState<'revendeur' | 'grossiste' | 'chantier' | 'public'>('revendeur');
  const [priceSearch, setPriceSearch] = useState('');

  // Field Payments State
  const [fieldPayments, setFieldPayments] = useState<FieldPayment[]>(INITIAL_FIELD_PAYMENTS);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payClient, setPayClient] = useState(COMMERCIAL_CLIENTS[0].company);
  const [payMethod, setPayMethod] = useState<'Espèces' | 'Carte bancaire' | 'Chèque'>('Espèces');
  const [payAmount, setPayAmount] = useState<number>(2500);
  const [payChequeNum, setPayChequeNum] = useState('');
  const [payInvoiceRef, setPayInvoiceRef] = useState('FAC-2025-184');

  // Shared Document Modals
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<PendingOrder | null>(null);
  const [activeBlOrder, setActiveBlOrder] = useState<PendingOrder | null>(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [viewQuote, setViewQuote] = useState<QuoteData | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // Order Validation
  function handleValidate(order: PendingOrder) {
    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
    setRecentOrders((prev) => [order, ...prev]);
    notify(`Commande ${order.ref} validée par le commercial ! Stock réservé et transmise à la préparation.`);
  }

  function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectModalOrder) return;
    setPendingOrders((prev) => prev.filter((o) => o.id !== rejectModalOrder.id));
    notify(`Commande ${rejectModalOrder.ref} refusée (Motif: ${rejectReason}). Client notifié.`);
    setRejectModalOrder(null);
    setRejectReason('');
  }

  function handleQuickOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cl = clients.find((c) => c.name === quickOrderClient || c.company === quickOrderClient) || clients[0];
    const prod = PRICING_CATALOG.find((p) => p.sku === quickOrderSku) || PRICING_CATALOG[0];
    const unitPrice =
      cl.price_tier === 'grossiste'
        ? prod.price_grossiste_ht
        : cl.price_tier === 'chantier'
        ? prod.price_chantier_ht
        : prod.price_revendeur_ht;
    const totalTtc = unitPrice * quickOrderQty * (1 + prod.vat_rate / 100);

    const newOrder: PendingOrder = {
      id: Date.now(),
      ref: `CMD-${Math.floor(2410 + Math.random() * 50)}`,
      client: cl.company,
      city: cl.city,
      items_count: quickOrderQty,
      total_ttc: Math.round(totalTtc * 100) / 100,
      date: 'Aujourd’hui',
      desired_date: 'Sous 24h',
      credit_status: cl.current_balance + totalTtc > cl.credit_limit ? 'depasse' : 'ok',
      source: 'Saisie terrain commercial',
    };

    setRecentOrders((prev) => [newOrder, ...prev]);
    setShowQuickOrderModal(false);
    notify(`Commande ${newOrder.ref} saisie avec succès pour ${cl.company} (${formatMoney(totalTtc)} DH TTC) !`);
  }

  // Visit Handlers
  function handleCreateVisit(e: React.FormEvent) {
    e.preventDefault();
    const cl = clients.find((c) => c.company === visitClient) || clients[0];
    const newVisit: CommercialVisit = {
      id: Date.now(),
      client: cl.company,
      city: cl.city,
      date: visitDate,
      time: visitTime,
      type: visitType,
      status: 'Planifiée',
      objective: visitObjective || 'Visite commerciale terrain de suivi et commande.',
    };
    setVisits((prev) => [newVisit, ...prev]);
    setShowNewVisitModal(false);
    setVisitObjective('');
    notify(`Visite terrain planifiée chez ${cl.company} le ${visitDate} à ${visitTime} !`);
  }

  function handleSaveVisitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportVisit) return;
    setVisits((prev) =>
      prev.map((v) =>
        v.id === reportVisit.id
          ? {
              ...v,
              status: 'Effectuée',
              report: reportText,
              outcome_amount: reportOutcomeAmount,
            }
          : v
      )
    );
    notify(`Compte-rendu de visite enregistré pour ${reportVisit.client} !`);
    setReportVisit(null);
    setReportText('');
    setReportOutcomeAmount(0);
  }

  // Payment Handlers
  function handleCreateFieldPayment(e: React.FormEvent) {
    e.preventDefault();
    if (payMethod === 'Espèces' && payAmount > 5000) {
      alert('Attention : Selon l’article 193 du CGI Maroc, le plafond légal de paiement en espèces est de 5 000 DH TTC.');
      return;
    }
    const newPayment: FieldPayment = {
      id: Date.now(),
      receipt_ref: `REC-COM-2025-${Math.floor(20 + Math.random() * 80)}`,
      client: payClient,
      invoice_ref: payInvoiceRef,
      amount: payAmount,
      method: payMethod,
      cheque_number: payMethod === 'Chèque' ? payChequeNum : undefined,
      date: '28 Fév 2025',
      status: 'En main commercial',
      notes: payMethod === 'Chèque' ? `Chèque N° ${payChequeNum}` : 'Espèces perçues contre reçu',
    };
    setFieldPayments((prev) => [newPayment, ...prev]);
    setShowPaymentModal(false);
    notify(`Encaissement de ${formatMoney(payAmount)} DH enregistré ! Reçu ${newPayment.receipt_ref} délivré.`);
  }

  function handleHandoverPayment(id: number) {
    setFieldPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Reversé au comptable' } : p))
    );
    notify('Paiement reversé au service comptabilité avec accusé de réception !');
  }

  // Simulator Calculation
  const simProd = PRICING_CATALOG.find((p) => p.sku === simProductSku) || PRICING_CATALOG[0];
  const simUnitHt =
    simTier === 'grossiste'
      ? simProd.price_grossiste_ht
      : simTier === 'chantier'
      ? simProd.price_chantier_ht
      : simTier === 'revendeur'
      ? simProd.price_revendeur_ht
      : simProd.price_public_ht;
  const simTotalHt = simUnitHt * simQty;
  const simTotalTtc = simTotalHt * (1 + simProd.vat_rate / 100);
  const discountFromPublic = Math.round(((simProd.price_public_ht - simUnitHt) / simProd.price_public_ht) * 100);

  return (
    <div className="dashboard-page sales-workspace">
      {/* ── Top Header ── */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">ESPACE COMMERCIAL <span className="eyebrow-sep">/</span> GESTION DES VENTES &amp; PORTEFEUILLE</span>
          <h1>Cockpit Commercial<span className="title-period">.</span></h1>
          <p>Validez les commandes de vos clients, planifiez vos visites terrain, consultez les grilles de prix et encaissez selon vos permissions.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="button-secondary" onClick={() => setShowNewQuote(true)}>
            <FileText size={15} /> Nouveau Devis
          </button>
          <button className="button-secondary" onClick={() => setShowNewVisitModal(true)}>
            <MapPin size={15} /> Planifier Visite
          </button>
          <button className="button-secondary" onClick={() => setShowPaymentModal(true)}>
            <CreditCard size={15} /> Encaisser sur Place
          </button>
          <button className="button-primary" onClick={() => setShowQuickOrderModal(true)}>
            <Plus size={15} /> Nouvelle Commande
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="table-tabs" style={{ marginBottom: 16, overflowX: 'auto', display: 'flex', gap: 4 }}>
        <button
          className={`table-tab ${activeTab === 'orders' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ClipboardCheck size={14} style={{ display: 'inline', marginRight: 5 }} />
          Validation &amp; Commandes ({pendingOrders.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'clients' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <Users size={14} style={{ display: 'inline', marginRight: 5 }} />
          Mes Clients &amp; Encours ({clients.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'visits' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('visits')}
        >
          <MapPin size={14} style={{ display: 'inline', marginRight: 5 }} />
          Visites Terrain ({visits.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'pricing' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          <Tag size={14} style={{ display: 'inline', marginRight: 5 }} />
          Catalogue &amp; Grille des Prix
        </button>
        <button
          className={`table-tab ${activeTab === 'payments' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <Receipt size={14} style={{ display: 'inline', marginRight: 5 }} />
          Paiements Terrain ({fieldPayments.length})
        </button>
      </div>

      {/* ════════════════════ TAB 1 : VALIDATION & COMMANDES ════════════════════ */}
      {activeTab === 'orders' && (
        <>
          {/* Top KPIs */}
          <div className="metric-grid">
            <div className="metric-card metric-amber">
              <div className="metric-top">
                <span>Commandes à Valider</span>
                <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <ClipboardCheck size={16} />
                </div>
              </div>
              <div className="metric-number">{pendingOrders.length}</div>
              <div className="metric-foot">
                <span>{formatMoney(pendingOrders.reduce((a, b) => a + b.total_ttc, 0))} DH en attente</span>
              </div>
            </div>

            <div className="metric-card metric-green">
              <div className="metric-top">
                <span>Mes Ventes Confirmées</span>
                <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="metric-number">348 200 <small>DH</small></div>
              <div className="metric-foot">
                <span className="metric-change change-up">+14.2%</span>
                <span>Objectif: 400 000 DH (87%)</span>
              </div>
            </div>

            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>Commandes Validées</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <ShoppingBag size={16} />
                </div>
              </div>
              <div className="metric-number">{recentOrders.length}</div>
              <div className="metric-foot">
                <span>En préparation / livraison</span>
              </div>
            </div>
          </div>

          {/* Pending Orders to Validate */}
          <section className="panel" style={{ padding: '16px', marginTop: '16px' }}>
            <div className="panel-heading">
              <div>
                <span className="eyebrow">WORKFLOW COMMERCIAL CDC SECTION 9</span>
                <h2>Validation des commandes de vos clients ({pendingOrders.length})</h2>
              </div>
              <span className="status-pill status-amber">
                <i /> {pendingOrders.length} en attente de votre accord
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="empty-state" style={{ padding: '36px 20px' }}>
                <CheckCircle2 size={32} style={{ color: '#22c55e', margin: '0 auto 8px' }} />
                <b>Toutes les commandes de vos clients sont validées !</b>
                <span>Aucune commande en attente de validation commerciale.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {pendingOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      padding: '14px',
                      background: 'var(--navy-2)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="table-ref">{ord.ref}</span>
                          <b style={{ fontSize: '13px' }}>{ord.client}</b>
                          <small style={{ color: 'var(--muted)' }}>· {ord.city}</small>
                          {ord.source && (
                            <span className="status-pill status-blue" style={{ fontSize: '10px' }}>
                              {ord.source}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                          Envoyée : {ord.date} · Livraison souhaitée : <b>{ord.desired_date}</b> · Conditions : {ord.payment_term || '30j'}
                        </div>
                        {ord.note && (
                          <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', fontStyle: 'italic' }}>
                            Note client : « {ord.note} »
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '15px', color: 'var(--text)' }}>
                          {formatMoney(ord.total_ttc)} DH
                        </strong>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{ord.items_count} articles</div>
                        {ord.credit_status === 'depasse' ? (
                          <span className="status-pill status-red" style={{ fontSize: '10px', marginTop: '4px' }}>
                            <AlertTriangle size={10} /> Plafond dépassé
                          </span>
                        ) : (
                          <span className="status-pill status-green" style={{ fontSize: '10px', marginTop: '4px' }}>
                            <Check size={10} /> Crédit OK
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                      <button
                        className="button-secondary"
                        style={{ fontSize: '11px', height: '30px', padding: '0 10px', color: '#10b981', gap: '4px' }}
                        onClick={() => setActiveInvoiceOrder(ord)}
                        title="Aperçu Facture officielle"
                      >
                        <FileText size={13} /> Facture
                      </button>
                      <button
                        className="button-secondary"
                        style={{ fontSize: '11px', height: '30px', padding: '0 10px', color: '#0ea5e9', gap: '4px' }}
                        onClick={() => setActiveBlOrder(ord)}
                        title="Aperçu Bon de Livraison (BL)"
                      >
                        <Truck size={13} /> BL
                      </button>
                      <button
                        className="button-secondary"
                        style={{ fontSize: '11px', height: '30px', padding: '0 10px', color: '#ef4444' }}
                        onClick={() => setRejectModalOrder(ord)}
                      >
                        <XCircle size={13} /> Refuser
                      </button>
                      <button
                        className="button-primary"
                        style={{ fontSize: '11px', height: '30px', padding: '0 12px', background: '#22c55e', borderColor: '#16a34a' }}
                        onClick={() => handleValidate(ord)}
                      >
                        <CheckCircle2 size={13} /> Valider la Commande
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recently Validated Orders Table */}
          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">HISTORIQUE DES COMMANDES VALIDÉES</span>
                <h2>Commandes transmises à la logistique ({recentOrders.length})</h2>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>N° COMMANDE</th>
                    <th>CLIENT &amp; VILLE</th>
                    <th>DATE VALIDATION</th>
                    <th>MONTANT TTC</th>
                    <th>CANAL DE COMMANDE</th>
                    <th>STATUT LOGISTIQUE</th>
                    <th>DOCUMENTS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td><span className="table-ref">{ord.ref}</span></td>
                      <td>
                        <b className="table-main">{ord.client}</b>
                        <small style={{ display: 'block', color: 'var(--muted)' }}>{ord.city}</small>
                      </td>
                      <td><span className="table-secondary">{ord.date}</span></td>
                      <td><strong>{formatMoney(ord.total_ttc)} DH</strong></td>
                      <td><span className="table-secondary">{ord.source || 'Commercial'}</span></td>
                      <td>
                        <span className="status-pill status-blue">
                          En préparation dépôt
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="row-action"
                            title="Aperçu Facture"
                            onClick={() => setActiveInvoiceOrder(ord)}
                            style={{ color: '#10b981' }}
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            className="row-action"
                            title="Aperçu BL"
                            onClick={() => setActiveBlOrder(ord)}
                            style={{ color: '#0ea5e9' }}
                          >
                            <Truck size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 2 : MES CLIENTS & ENCOURS ════════════════════ */}
      {activeTab === 'clients' && (
        <section className="panel list-panel">
          <div className="list-panel-heading">
            <div>
              <span className="eyebrow">PORTEFEUILLE COMMERCIAL ATTITRÉ</span>
              <h2>Mes Clients &amp; Suivi des Encours ({clients.length})</h2>
            </div>
            <button
              className="button-primary"
              onClick={() => onNavigate?.('customers')}
              style={{ fontSize: '11.5px', height: '32px' }}
            >
              <Plus size={13} /> Ouvrir CRM Complet
            </button>
          </div>

          <div className="table-tools">
            <div className="table-tabs">
              {['all', 'Actif', 'À surveiller'].map((st) => (
                <button
                  key={st}
                  className={`table-tab ${clientFilter === st ? 'active-tab' : ''}`}
                  onClick={() => setClientFilter(st)}
                >
                  {st === 'all' ? 'Tous les clients' : st}
                </button>
              ))}
            </div>
            <div className="tool-actions">
              <label className="search-field">
                <Search size={14} />
                <input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Rechercher client, ville, ICE..."
                />
              </label>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>CLIENT &amp; ICE</th>
                  <th>VILLE</th>
                  <th>TARIF ACCORDÉ</th>
                  <th>PLAFOND CRÉDIT</th>
                  <th>ENCOURS ACTUEL</th>
                  <th>MONTANT ÉCHU</th>
                  <th>STATUT</th>
                  <th>ACTIONS COMMERCIALES</th>
                </tr>
              </thead>
              <tbody>
                {clients
                  .filter((c) => {
                    const q = clientSearch.toLowerCase();
                    const matchQ = !q || c.company.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
                    const matchS = clientFilter === 'all' || c.status === clientFilter;
                    return matchQ && matchS;
                  })
                  .map((cl) => {
                    const isCreditAlert = cl.current_balance > cl.credit_limit;
                    return (
                      <tr key={cl.id}>
                        <td>
                          <b className="table-main">{cl.company}</b>
                          <small style={{ display: 'block', color: 'var(--muted)' }}>
                            Contact : {cl.name} · ICE: {cl.ice}
                          </small>
                        </td>
                        <td><span className="table-secondary">{cl.city}</span></td>
                        <td>
                          <span
                            className="status-pill status-blue"
                            style={{ textTransform: 'capitalize' }}
                          >
                            Tarif {cl.price_tier}
                          </span>
                        </td>
                        <td>{formatMoney(cl.credit_limit)} DH</td>
                        <td style={{ color: isCreditAlert ? '#ef4444' : 'inherit', fontWeight: isCreditAlert ? 700 : 400 }}>
                          {formatMoney(cl.current_balance)} DH
                        </td>
                        <td style={{ color: cl.overdue_amount > 0 ? '#ef4444' : 'var(--muted)', fontWeight: cl.overdue_amount > 0 ? 700 : 400 }}>
                          {cl.overdue_amount > 0 ? `${formatMoney(cl.overdue_amount)} DH` : '0 DH'}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              cl.status === 'Actif'
                                ? 'status-green'
                                : cl.status === 'À surveiller'
                                ? 'status-amber'
                                : 'status-red'
                            }`}
                          >
                            {cl.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <a
                              href={`https://wa.me/${cl.whatsapp}?text=Bonjour%20${encodeURIComponent(cl.name)},%20votre%20commercial%20Hercules%20Distribution.`}
                              target="_blank"
                              rel="noreferrer"
                              className="button-secondary"
                              style={{ height: '28px', padding: '0 8px', color: '#22c55e', fontSize: '11px', gap: 4 }}
                              title="WhatsApp"
                            >
                              <MessageSquare size={13} />
                            </a>
                            <a
                              href={`tel:${cl.phone}`}
                              className="button-secondary"
                              style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                              title="Appeler"
                            >
                              <Phone size={13} />
                            </a>
                            <button
                              className="button-secondary"
                              style={{ height: '28px', padding: '0 8px', fontSize: '11px', color: '#0ea5e9' }}
                              onClick={() => {
                                setVisitClient(cl.company);
                                setShowNewVisitModal(true);
                              }}
                              title="Planifier une visite"
                            >
                              <MapPin size={13} />
                            </button>
                            <button
                              className="button-primary"
                              style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                              onClick={() => {
                                setQuickOrderClient(cl.company);
                                setShowQuickOrderModal(true);
                              }}
                              title="Saisir commande"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ════════════════════ TAB 3 : VISITES COMMERCIALES TERRAIN ════════════════════ */}
      {activeTab === 'visits' && (
        <>
          <div className="metric-grid">
            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>Visites Planifiées</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <Calendar size={16} />
                </div>
              </div>
              <div className="metric-number">
                {visits.filter((v) => v.status === 'Planifiée').length} <small>visites</small>
              </div>
              <div className="metric-foot">
                <span>Tournée du jour</span>
              </div>
            </div>

            <div className="metric-card metric-green">
              <div className="metric-top">
                <span>Visites Réalisées</span>
                <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="metric-number">
                {visits.filter((v) => v.status === 'Effectuée').length}
              </div>
              <div className="metric-foot">
                <span>Avec compte-rendu terrain</span>
              </div>
            </div>

            <div className="metric-card metric-cyan">
              <div className="metric-top">
                <span>Chiffre d'Affaires Issu de Visites</span>
                <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(visits.reduce((sum, v) => sum + (v.outcome_amount || 0), 0))} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>Commandes &amp; encaissements</span>
              </div>
            </div>
          </div>

          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">PLANNING COMMERCIAL &amp; TOURNÉES</span>
                <h2>Journal des Visites Clients ({visits.length})</h2>
              </div>
              <button
                className="button-primary"
                onClick={() => setShowNewVisitModal(true)}
                style={{ fontSize: '11.5px', height: '32px' }}
              >
                <Plus size={13} /> Planifier une Visite
              </button>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>DATE &amp; HEURE</th>
                    <th>CLIENT &amp; VILLE</th>
                    <th>TYPE DE VISITE</th>
                    <th>OBJECTIF</th>
                    <th>STATUT</th>
                    <th>RÉSULTAT / COMPTE-RENDU</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <b>{v.date}</b>
                        <small style={{ display: 'block', color: 'var(--muted)' }}>{v.time}</small>
                      </td>
                      <td>
                        <b className="table-main">{v.client}</b>
                        <small style={{ display: 'block', color: 'var(--muted)' }}>{v.city}</small>
                      </td>
                      <td>
                        <span className="status-pill status-blue">{v.type}</span>
                      </td>
                      <td style={{ fontSize: '11.5px', maxWidth: '240px' }}>{v.objective}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            v.status === 'Effectuée'
                              ? 'status-green'
                              : v.status === 'Planifiée'
                              ? 'status-amber'
                              : 'status-red'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '11.5px' }}>
                        {v.report ? (
                          <div>
                            <span>{v.report}</span>
                            {v.outcome_amount ? (
                              <b style={{ display: 'block', color: '#22c55e', marginTop: 2 }}>
                                Concrétisation : {formatMoney(v.outcome_amount)} DH
                              </b>
                            ) : null}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--muted)' }}>En attente de réalisation</span>
                        )}
                      </td>
                      <td>
                        {v.status === 'Planifiée' ? (
                          <button
                            className="button-secondary"
                            style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}
                            onClick={() => {
                              setReportVisit(v);
                              setReportText('');
                            }}
                          >
                            Clôturer visite
                          </button>
                        ) : (
                          <span style={{ color: '#22c55e', fontSize: '12px' }}>✓ Clôturée</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 4 : CATALOGUE & GRILLE DES PRIX ════════════════════ */}
      {activeTab === 'pricing' && (
        <>
          {/* Quick Price Calculator / Simulator */}
          <div
            style={{
              background: 'var(--navy-2)',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Tag size={16} style={{ color: '#0ea5e9' }} />
              <b style={{ fontSize: '14px' }}>Simulateur de Prix &amp; Remise Commerciale Instantanée</b>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <label className="field-label">
                Produit :
                <select
                  value={simProductSku}
                  onChange={(e) => setSimProductSku(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {PRICING_CATALOG.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-label">
                Barème Client :
                <select
                  value={simTier}
                  onChange={(e) => setSimTier(e.target.value as any)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <option value="revendeur">Tarif Revendeur (-10%)</option>
                  <option value="grossiste">Tarif Grossiste (-18%)</option>
                  <option value="chantier">Tarif Chantier (-12%)</option>
                  <option value="public">Tarif Public Standard</option>
                </select>
              </label>

              <label className="field-label">
                Quantité :
                <input
                  type="number"
                  min="1"
                  value={simQty}
                  onChange={(e) => setSimQty(parseInt(e.target.value, 10) || 1)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </label>

              <div style={{ background: 'var(--navy-3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--line)' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Prix Unitaire HT ({simTier}) :</div>
                <b style={{ fontSize: '14px' }}>{formatMoney(simUnitHt)} DH</b>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 4 }}>Total TTC ({simQty} pcs) :</div>
                <strong style={{ fontSize: '16px', color: '#0ea5e9' }}>{formatMoney(simTotalTtc)} DH</strong>
              </div>
            </div>
          </div>

          <section className="panel list-panel">
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">RÉFÉRENTIEL COMMERCIAL</span>
                <h2>Grille Tarifaire Multi-Paliers par Article</h2>
              </div>
              <div className="tool-actions">
                <label className="search-field">
                  <Search size={14} />
                  <input
                    value={priceSearch}
                    onChange={(e) => setPriceSearch(e.target.value)}
                    placeholder="Rechercher produit, SKU..."
                  />
                </label>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>SKU &amp; ARTICLE</th>
                    <th>CATÉGORIE</th>
                    <th>STOCK CASABLANCA</th>
                    <th>PRIX PUBLIC HT</th>
                    <th>TARIF REVENDEUR HT</th>
                    <th>TARIF GROSSISTE HT</th>
                    <th>TARIF CHANTIER HT</th>
                    <th>TVA</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICING_CATALOG.filter(
                    (p) =>
                      !priceSearch ||
                      p.name.toLowerCase().includes(priceSearch.toLowerCase()) ||
                      p.sku.toLowerCase().includes(priceSearch.toLowerCase())
                  ).map((p) => (
                    <tr key={p.sku}>
                      <td>
                        <span className="table-ref">{p.sku}</span>
                        <b className="table-main">{p.name}</b>
                        <small style={{ display: 'block', color: 'var(--muted)' }}>{p.packaging}</small>
                      </td>
                      <td><span className="table-secondary">{p.category}</span></td>
                      <td>
                        <b style={{ color: p.stock > 10 ? '#22c55e' : '#f59e0b' }}>{p.stock} unités</b>
                      </td>
                      <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(p.price_public_ht)} DH</td>
                      <td style={{ fontFamily: 'var(--app-font-mono)', color: '#0ea5e9' }}>
                        <b>{formatMoney(p.price_revendeur_ht)} DH</b>
                      </td>
                      <td style={{ fontFamily: 'var(--app-font-mono)', color: '#22c55e' }}>
                        <b>{formatMoney(p.price_grossiste_ht)} DH</b>
                      </td>
                      <td style={{ fontFamily: 'var(--app-font-mono)', color: '#a855f7' }}>
                        <b>{formatMoney(p.price_chantier_ht)} DH</b>
                      </td>
                      <td>{p.vat_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 5 : PAIEMENTS & ENCAISSEMENTS TERRAIN ════════════════════ */}
      {activeTab === 'payments' && (
        <>
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <ShieldCheck size={20} style={{ color: '#0ea5e9', flex: 'none' }} />
            <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
              <b>Permissions Commerciales d'Encaissement :</b> Le commercial est habilité à collecter les règlements des clients sur le terrain. Conformément à la législation fiscale marocaine (Article 193 du CGI), les paiements en <strong>espèces sont plafonnés à 5 000 DH TTC</strong> par client et par facture. Les <strong>chèques et traites</strong> n'ont pas de plafond. Tout montant perçu doit être remis au service comptable sous 24h.
            </div>
          </div>

          <div className="metric-grid">
            <div className="metric-card metric-green">
              <div className="metric-top">
                <span>Collecté Cette Semaine</span>
                <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <Receipt size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(fieldPayments.reduce((sum, p) => sum + p.amount, 0))} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>{fieldPayments.length} quittances émises</span>
              </div>
            </div>

            <div className="metric-card metric-amber">
              <div className="metric-top">
                <span>En Main Propre (À Déposer)</span>
                <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <Clock size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(
                  fieldPayments.filter((p) => p.status === 'En main commercial').reduce((sum, p) => sum + p.amount, 0)
                )} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>À reverser au comptable</span>
              </div>
            </div>

            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>Reversé &amp; Déchargé</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(
                  fieldPayments.filter((p) => p.status === 'Reversé au comptable').reduce((sum, p) => sum + p.amount, 0)
                )} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>Validé par la comptabilité</span>
              </div>
            </div>

            <div className="metric-card" style={{ borderColor: 'rgba(6,182,212,0.4)', background: 'linear-gradient(180deg, rgba(6,182,212,0.06), transparent)' }}>
              <div className="metric-top">
                <span>Carte bancaire (Card / TPE)</span>
                <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(
                  fieldPayments.filter((p) => p.method === 'Carte bancaire').reduce((sum, p) => sum + p.amount, 0)
                )} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>Paiements TPE mobile</span>
              </div>
            </div>
          </div>

          {/* Visualisation graphique des encaissements terrain */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginTop: '16px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>VENTILATION PAR MODE</span>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 0', color: '#0f172a' }}>Modes de Règlement Terrain</h3>
                </div>
                <span className="sx-chip" style={{ fontSize: '11px' }}>Cash · Card · Chèque</span>
              </div>
              <DonutChart
                size={160}
                strokeWidth={20}
                centerLabel="COLLECTÉ"
                centerValue={`${formatMoney(fieldPayments.reduce((s, p) => s + p.amount, 0))} DH`}
                slices={[
                  { label: 'Chèques barrés', value: fieldPayments.filter(p => p.method === 'Chèque').reduce((s, p) => s + p.amount, 0), color: '#3b82f6' },
                  { label: 'Espèces (Cash)', value: fieldPayments.filter(p => p.method === 'Espèces').reduce((s, p) => s + p.amount, 0), color: '#10b981' },
                  { label: 'Carte bancaire (Card)', value: fieldPayments.filter(p => p.method === 'Carte bancaire').reduce((s, p) => s + p.amount, 0), color: '#06b6d4' },
                ]}
              />
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>STATUT DE DÉCHARGE</span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 10px', color: '#0f172a' }}>Reversement à la Caisse Centrale</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
                  Suivi des fonds encaissés lors des tournées commerciales avant décharge physique auprès du responsable de trésorerie.
                </p>
                <MultiSegmentProgress
                  height={12}
                  segments={[
                    { label: 'Reversé au comptable', value: fieldPayments.filter(p => p.status === 'Reversé au comptable').reduce((s, p) => s + p.amount, 0), color: '#10b981' },
                    { label: 'En main propre commercial', value: fieldPayments.filter(p => p.status === 'En main commercial').reduce((s, p) => s + p.amount, 0), color: '#f59e0b' },
                  ]}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ShieldCheck size={13} /> Traçabilité des reçus garantie
                </span>
              </div>
            </div>
          </div>

          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">SUIVI DES ENCAISSEMENTS TERRAIN</span>
                <h2>Quittances &amp; Règlements Perçus ({fieldPayments.length})</h2>
              </div>
              <button
                className="button-primary"
                onClick={() => setShowPaymentModal(true)}
                style={{ fontSize: '11.5px', height: '32px' }}
              >
                <Plus size={13} /> Enregistrer un Encaissement
              </button>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>N° QUITTANCE REÇU</th>
                    <th>DATE</th>
                    <th>CLIENT B2B</th>
                    <th>FACTURE APURÉE</th>
                    <th>MODE DE PAIEMENT</th>
                    <th>MONTANT ENCAISSÉ</th>
                    <th>STATUT DE REMISE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldPayments.map((p) => (
                    <tr key={p.id}>
                      <td><span className="table-ref">{p.receipt_ref}</span></td>
                      <td><span className="table-secondary">{p.date}</span></td>
                      <td><b className="table-main">{p.client}</b></td>
                      <td><span className="table-ref" style={{ color: '#0ea5e9' }}>{p.invoice_ref}</span></td>
                      <td>
                        <span className={`status-pill ${p.method === 'Espèces' ? 'status-green' : p.method === 'Carte bancaire' ? 'status-cyan' : 'status-blue'}`}>
                          {p.method}
                          {p.cheque_number && ` (${p.cheque_number})`}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#22c55e', fontSize: 13 }}>+{formatMoney(p.amount)} DH</strong>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            p.status === 'Reversé au comptable' ? 'status-green' : 'status-amber'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {p.status === 'En main commercial' ? (
                          <button
                            className="button-secondary"
                            style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}
                            onClick={() => handleHandoverPayment(p.id)}
                            title="Confirmer la remise à la comptabilité"
                          >
                            Reverser au comptable
                          </button>
                        ) : (
                          <span style={{ color: '#22c55e', fontSize: '11.5px' }}>✓ Reversé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ── Quick New Order Modal ── */}
      {showQuickOrderModal && (
        <div className="modal-backdrop" onClick={() => setShowQuickOrderModal(false)}>
          <form className="record-modal" onSubmit={handleQuickOrderSubmit} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">SAISIE COMMERCIALE TERRAIN</span>
                <h2>Nouvelle Commande Client</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowQuickOrderModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">Saisie rapide d'une commande client en visite ou par téléphone.</p>

            <label className="field-label" style={{ marginTop: '12px' }}>
              Client :
              <select
                value={quickOrderClient}
                onChange={(e) => setQuickOrderClient(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.company}>
                    {c.company} ({c.city} - Tarif {c.price_tier})
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '12px' }}>
              <label className="field-label">
                Article :
                <select
                  value={quickOrderSku}
                  onChange={(e) => setQuickOrderSku(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {PRICING_CATALOG.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field-label">
                Quantité :
                <input
                  type="number"
                  min="1"
                  value={quickOrderQty}
                  onChange={(e) => setQuickOrderQty(parseInt(e.target.value, 10) || 1)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </label>
            </div>

            <div className="modal-actions" style={{ marginTop: '18px' }}>
              <button type="button" className="button-secondary" onClick={() => setShowQuickOrderModal(false)}>
                Annuler
              </button>
              <button className="button-primary" type="submit">
                <ShoppingBag size={14} /> Enregistrer la Commande
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Schedule Visit Modal ── */}
      {showNewVisitModal && (
        <div className="modal-backdrop" onClick={() => setShowNewVisitModal(false)}>
          <form className="record-modal" onSubmit={handleCreateVisit} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">GESTION DU PLANNING COMMERCIAL</span>
                <h2>Planifier une Visite Terrain</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowNewVisitModal(false)}>
                <X size={16} />
              </button>
            </div>

            <label className="field-label" style={{ marginTop: '12px' }}>
              Client à visiter :
              <select
                value={visitClient}
                onChange={(e) => setVisitClient(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.company}>
                    {c.company} ({c.city})
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <label className="field-label">
                Date :
                <input
                  type="text"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                  placeholder="Ex. 03 Mars 2025"
                />
              </label>
              <label className="field-label">
                Heure :
                <input
                  type="text"
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  style={{ width: '100%', marginTop: '4px' }}
                  placeholder="Ex. 14:30"
                />
              </label>
            </div>

            <label className="field-label" style={{ marginTop: '12px' }}>
              Type de visite :
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value as any)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                <option value="Prise de commande">Prise de commande / Réassort</option>
                <option value="Prospection">Prospection nouveau client</option>
                <option value="Recouvrement">Recouvrement créance / Chèque</option>
                <option value="Visite de courtoisie">Visite de courtoisie / Suivi</option>
              </select>
            </label>

            <label className="field-label" style={{ marginTop: '12px' }}>
              Objectif de la visite :
              <textarea
                value={visitObjective}
                onChange={(e) => setVisitObjective(e.target.value)}
                rows={2}
                style={{ width: '100%', marginTop: '4px' }}
                placeholder="Ex. Présentation catalogue outillage et réactivation compte..."
              />
            </label>

            <div className="modal-actions" style={{ marginTop: '18px' }}>
              <button type="button" className="button-secondary" onClick={() => setShowNewVisitModal(false)}>
                Annuler
              </button>
              <button className="button-primary" type="submit">
                <MapPin size={14} /> Planifier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Visit Report Modal ── */}
      {reportVisit && (
        <div className="modal-backdrop" onClick={() => setReportVisit(null)}>
          <form className="record-modal" onSubmit={handleSaveVisitReport} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">COMPTE-RENDU TERRAIN</span>
                <h2>Clôture de Visite : {reportVisit.client}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setReportVisit(null)}>
                <X size={16} />
              </button>
            </div>

            <label className="field-label" style={{ marginTop: '12px' }}>
              Compte-rendu &amp; Décisions :
              <textarea
                required
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={3}
                style={{ width: '100%', marginTop: '4px' }}
                placeholder="Résultat de la visite, besoins exprimés par le client, points d'accord..."
              />
            </label>

            <label className="field-label" style={{ marginTop: '12px' }}>
              Montant de la commande / règlement généré (DH) :
              <input
                type="number"
                step="0.01"
                value={reportOutcomeAmount}
                onChange={(e) => setReportOutcomeAmount(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>

            <div className="modal-actions" style={{ marginTop: '18px' }}>
              <button type="button" className="button-secondary" onClick={() => setReportVisit(null)}>
                Annuler
              </button>
              <button className="button-primary" type="submit" style={{ background: '#22c55e', borderColor: '#16a34a' }}>
                <CheckCircle2 size={14} /> Enregistrer le Compte-rendu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Field Payment Modal ── */}
      {showPaymentModal && (
        <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <form className="record-modal" onSubmit={handleCreateFieldPayment} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">ENCAISSEMENT TERRAIN</span>
                <h2>Enregistrer un Règlement Client</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowPaymentModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">
              Conforme aux permissions commerciales : Espèces max 5 000 DH TTC (Art. 193 CGI) ou chèque barré.
            </p>

            <label className="field-label" style={{ marginTop: '12px' }}>
              Client débiteur :
              <select
                value={payClient}
                onChange={(e) => setPayClient(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.company}>
                    {c.company} (Encours : {formatMoney(c.current_balance)} DH)
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <label className="field-label">
                Mode de règlement :
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  <option value="Espèces">Espèces (Cash · Max 5 000 DH)</option>
                  <option value="Carte bancaire">Carte bancaire (Card / TPE mobile)</option>
                  <option value="Chèque">Chèque bancaire</option>
                </select>
              </label>

              <label className="field-label">
                Montant encaissé (DH) :
                <input
                  type="number"
                  step="0.01"
                  max={payMethod === 'Espèces' ? 5000 : undefined}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </label>
            </div>

            {payMethod === 'Chèque' && (
              <label className="field-label" style={{ marginTop: '12px' }}>
                N° de Chèque &amp; Banque émettrice :
                <input
                  required
                  type="text"
                  value={payChequeNum}
                  onChange={(e) => setPayChequeNum(e.target.value)}
                  placeholder="Ex. CHQ 098432 - Attijariwafa"
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </label>
            )}

            <label className="field-label" style={{ marginTop: '12px' }}>
              Rattaché à la Facture / Commande :
              <input
                type="text"
                value={payInvoiceRef}
                onChange={(e) => setPayInvoiceRef(e.target.value)}
                placeholder="Ex. FAC-2025-184"
                style={{ width: '100%', marginTop: '4px' }}
              />
            </label>

            <div className="modal-actions" style={{ marginTop: '18px' }}>
              <button type="button" className="button-secondary" onClick={() => setShowPaymentModal(false)}>
                Annuler
              </button>
              <button className="button-primary" type="submit" style={{ background: '#22c55e', borderColor: '#16a34a' }}>
                <Receipt size={14} /> Valider l'Encaissement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectModalOrder && (
        <div className="modal-backdrop" onClick={() => setRejectModalOrder(null)}>
          <form className="record-modal" onSubmit={handleRejectSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">REFUS DE COMMANDE · {rejectModalOrder.ref}</span>
                <h2>Motif obligatoire de refus</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setRejectModalOrder(null)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">
              Conformément au cahier des charges, tout refus de commande doit obligatoirement comporter un motif transmis au client.
            </p>
            <label className="field-label">
              Sélectionnez le motif :
              <select
                className="select-compact"
                style={{ width: '100%', height: '36px', marginTop: '6px' }}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              >
                <option value="">-- Choisir un motif --</option>
                <option value="Dépassement du plafond de crédit autorisé">Dépassement du plafond de crédit autorisé</option>
                <option value="Articles demandés temporairement en rupture de stock">Articles demandés temporairement en rupture de stock</option>
                <option value="Montant minimum de commande non atteint (min. 1 000 DH)">Montant minimum de commande non atteint (min. 1 000 DH)</option>
                <option value="Factures antérieures impayées en attente de règlement">Factures antérieures impayées en attente de règlement</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={() => setRejectModalOrder(null)}>
                Annuler
              </button>
              <button className="button-primary" type="submit" style={{ background: '#ef4444', borderColor: '#dc2626' }}>
                Confirmer le refus
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Official Invoice Document Modal ── */}
      {activeInvoiceOrder && (
        <InvoiceDocumentModal
          invoice={{
            ref: `FAC-2026-${activeInvoiceOrder.ref.replace('CMD-', '')}`,
            order_ref: activeInvoiceOrder.ref,
            client: activeInvoiceOrder.client,
            client_city: activeInvoiceOrder.city,
            client_phone: '+212 522 34 78 90',
            date_issued: activeInvoiceOrder.date,
            due_date: '30 jours fin de mois',
            status: 'Impayée',
            payment_method: 'Virement bancaire / Chèque',
            lines: [
              {
                sku: 'HRC-CMD',
                name: `Marchandises commandées · Lot ${activeInvoiceOrder.ref}`,
                qty: activeInvoiceOrder.items_count,
                unit_price_ht: Math.round((activeInvoiceOrder.total_ttc / 1.2 / activeInvoiceOrder.items_count) * 100) / 100,
                tva_rate: 20,
              },
            ],
          }}
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}

      {/* ── Official Delivery Slip (BL) Modal ── */}
      {activeBlOrder && (
        <DeliverySlipDocumentModal
          slip={{
            bl_ref: `BL-2026-${activeBlOrder.ref.replace('CMD-', '')}`,
            order_ref: activeBlOrder.ref,
            client: activeBlOrder.client,
            client_address: `Zone commerciale & logistique, ${activeBlOrder.city}`,
            client_city: activeBlOrder.city,
            client_phone: '+212 522 34 78 90',
            whatsapp: '212661234567',
            driver_name: 'Mehdi Lahlou',
            vehicle: 'Renault Master 23-A-54321',
            tour_ref: 'TRN-2026-08',
            date_dispatched: activeBlOrder.date,
            warehouse: 'Casablanca (DEP-01 Central)',
            status: 'En cours',
            amount_to_collect: activeBlOrder.total_ttc,
            receiver_name: activeBlOrder.client.split(' ')[0],
            lines: [
              {
                sku: 'SKU-' + activeBlOrder.ref.slice(-4),
                name: `Articles commandés (${activeBlOrder.items_count} réf.)`,
                qty_ordered: activeBlOrder.items_count,
                qty_delivered: activeBlOrder.items_count,
                unit: 'Colis',
              },
            ],
          }}
          onClose={() => setActiveBlOrder(null)}
        />
      )}

      {/* ── New Invoice Modal ── */}
      {showNewInvoice && (
        <NewInvoiceModal
          onClose={() => setShowNewInvoice(false)}
          onCreate={(inv) => {
            notify(`Facture ${inv.ref} créée avec succès pour ${inv.client} !`);
          }}
        />
      )}

      {/* ── New Quote Modal ── */}
      {showNewQuote && (
        <NewQuoteModal
          onClose={() => setShowNewQuote(false)}
          onCreate={(q) => {
            notify(`Devis ${q.ref} créé avec succès pour ${q.client} !`);
            setViewQuote(q);
          }}
          creatorName="Youssef Bennani (Commercial)"
        />
      )}

      {/* ── Quote Document Modal ── */}
      {viewQuote && (
        <QuoteDocumentModal
          quote={viewQuote}
          onClose={() => setViewQuote(null)}
          onConvertToInvoice={(q) => {
            notify(`Devis ${q.ref} transmis pour facturation !`);
            setViewQuote(null);
          }}
        />
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
