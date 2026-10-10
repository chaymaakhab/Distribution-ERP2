import { useState } from 'react';
import {
  BadgeDollarSign, CreditCard, Receipt, FileText, CheckCircle2,
  AlertTriangle, Clock, MessageSquare, Download, Plus, Filter,
  Building, Calendar, X, Printer, Search, TrendingUp, ShieldAlert,
  ArrowRight, Check, Undo2, FileCheck, Landmark, DollarSign,
  PieChart, BarChart3, HelpCircle,
} from 'lucide-react';
import { formatMoney } from '../api';
import { DonutChart, MultiSegmentProgress } from '../components/Charts';
import InvoiceDocumentModal, { type InvoiceData } from '../components/InvoiceDocumentModal';
import NewInvoiceModal from '../components/NewInvoiceModal';
import RegisterPaymentModal from '../components/RegisterPaymentModal';
import QuoteDocumentModal, { type QuoteData } from '../components/QuoteDocumentModal';
import NewQuoteModal from '../components/NewQuoteModal';
import CreditNoteDocumentModal, { type CreditNoteData } from '../components/CreditNoteDocumentModal';
import NewCreditNoteModal from '../components/NewCreditNoteModal';
import RoleQuickActionsBar from '../components/RoleQuickActionsBar';

interface Cheque {
  id: number;
  ref: string;
  client: string;
  bank: string;
  amount: number;
  due_date: string;
  status: 'en_portefeuille' | 'remis_en_banque' | 'encaisse' | 'impaye';
}

interface PaymentRecord {
  id: number;
  receipt_ref: string;
  invoice_ref: string;
  client: string;
  amount: number;
  method: 'Virement bancaire' | 'Chèque' | 'Traite' | 'Espèces' | 'Carte bancaire';
  date: string;
  doc_ref: string;
  recorded_by: string;
  status: 'Encaissé' | 'Validé';
}

const INITIAL_CHEQUES: Cheque[] = [
  {
    id: 1,
    ref: 'CHQ-084731',
    client: 'Atlas Équipements SARL',
    bank: 'Banque Populaire',
    amount: 12500,
    due_date: '05 Mars 2025',
    status: 'en_portefeuille',
  },
  {
    id: 2,
    ref: 'EFF-006841',
    client: 'Maison du Bricolage',
    bank: 'BMCI',
    amount: 9735,
    due_date: '18 Mars 2025',
    status: 'en_portefeuille',
  },
  {
    id: 3,
    ref: 'CHQ-849301',
    client: 'Comptoir Al Amal',
    bank: 'Attijariwafa Bank',
    amount: 32100,
    due_date: '28 Fév 2025',
    status: 'remis_en_banque',
  },
  {
    id: 4,
    ref: 'EFF-004412',
    client: 'Nord Industrie',
    bank: 'Société Générale',
    amount: 6280,
    due_date: '20 Fév 2025',
    status: 'encaisse',
  },
  {
    id: 5,
    ref: 'CHQ-001298',
    client: 'Quincaillerie Saada',
    bank: 'CIH Bank',
    amount: 14500,
    due_date: '15 Fév 2025',
    status: 'impaye',
  },
];

const INITIAL_INVOICES: InvoiceData[] = [
  {
    ref: 'FAC-2025-184',
    order_ref: 'CMD-2406',
    client: 'Atlas Équipements SARL',
    client_ice: '003147829000064',
    client_address: '12, Boulevard Zerktouni',
    client_city: 'Casablanca',
    client_phone: '+212 522 34 78 90',
    date_issued: '24 Fév 2025',
    due_date: '26 Mars 2025',
    payment_method: 'Virement bancaire 30j',
    status: 'Impayée',
    paid_amount: 0.0,
    lines: [
      { sku: 'HRC-0850', name: 'Perceuse à percussion 850W (Carton 4 pcs)', qty: 10, unit_price_ht: 1249.0, tva_rate: 20 },
      { sku: 'CUT-230D', name: 'Disque diamant 230 mm (Lot 10 pcs)', qty: 20, unit_price_ht: 189.5, tva_rate: 20 },
      { sku: 'CAB-3G25', name: 'Câble électrique 3G2.5 (Couronne 100m)', qty: 3, unit_price_ht: 1280.0, tva_rate: 20 },
    ],
  },
  {
    ref: 'FAC-2025-183',
    order_ref: 'CMD-2405',
    client: 'BatiPro Maroc',
    client_ice: '002984123000081',
    client_address: 'Lot 14, Zone Industrielle Takaddoum',
    client_city: 'Rabat',
    client_phone: '+212 537 22 16 40',
    date_issued: '22 Fév 2025',
    due_date: '24 Mars 2025',
    payment_method: 'Chèque bancaire',
    status: 'Partielle',
    paid_amount: 8000.0,
    lines: [
      { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', qty: 6, unit_price_ht: 1249.0, tva_rate: 20 },
      { sku: 'PMP-15HP', name: 'Pompe immergée 1.5 HP', qty: 2, unit_price_ht: 3840.0, tva_rate: 20 },
    ],
  },
  {
    ref: 'FAC-2025-182',
    order_ref: 'CMD-2403',
    client: 'Comptoir Al Amal',
    client_ice: '004128901000092',
    client_address: '45, Rue des Selliers, Medina',
    client_city: 'Fès',
    client_phone: '+212 535 61 20 08',
    date_issued: '20 Fév 2025',
    due_date: '20 Fév 2025 (Échue)',
    payment_method: 'Traite commerciale 60j',
    status: 'En retard',
    paid_amount: 0.0,
    lines: [
      { sku: 'GEN-5000', name: 'Groupe électrogène 5 kVA', qty: 3, unit_price_ht: 8950.0, tva_rate: 20 },
    ],
  },
  {
    ref: 'FAC-2025-181',
    order_ref: 'CMD-2402',
    client: 'Nord Industrie',
    client_ice: '007812934000033',
    client_address: 'Zone Franche de Tanger, Lot 8',
    client_city: 'Tanger',
    client_phone: '+212 539 94 12 30',
    date_issued: '18 Fév 2025',
    due_date: '18 Mars 2025',
    payment_method: 'Virement bancaire',
    status: 'Payée',
    paid_amount: 6280.0,
    lines: [
      { sku: 'CUT-230D', name: 'Disque diamant 230 mm', qty: 27, unit_price_ht: 189.5, tva_rate: 20 },
    ],
  },
];

const INITIAL_QUOTES: QuoteData[] = [
  {
    ref: 'DEV-2025-042',
    client: 'Atlas Équipements SARL',
    client_ice: '003147829000064',
    client_address: '12, Boulevard Zerktouni',
    client_city: 'Casablanca',
    client_phone: '+212 522 34 78 90',
    date_issued: '26 Fév 2025',
    validity_date: '26 Mars 2025 (30 jours)',
    payment_method: 'Virement bancaire 30j',
    status: 'En attente',
    created_by: 'Sofia Cherkaoui (Comptabilité)',
    lines: [
      { sku: 'GEN-5000', name: 'Groupe électrogène 5 kVA', qty: 2, unit_price_ht: 8950.0, tva_rate: 20, discount_pct: 5 },
      { sku: 'CAB-3G25', name: 'Câble électrique 3G2.5 (100m)', qty: 4, unit_price_ht: 1280.0, tva_rate: 20, discount_pct: 0 },
    ],
  },
  {
    ref: 'DEV-2025-041',
    client: 'BatiPro Maroc',
    client_ice: '002984123000081',
    client_address: 'Lot 14, Zone Industrielle Takaddoum',
    client_city: 'Rabat',
    client_phone: '+212 537 22 16 40',
    date_issued: '24 Fév 2025',
    validity_date: '24 Mars 2025 (30 jours)',
    payment_method: 'Chèque à réception',
    status: 'Accepté',
    created_by: 'Sofia Cherkaoui (Comptabilité)',
    lines: [
      { sku: 'PMP-15HP', name: 'Pompe immergée 1.5 HP', qty: 3, unit_price_ht: 3840.0, tva_rate: 20, discount_pct: 0 },
      { sku: 'CHA-100I', name: 'Charnière inox 100 mm (Lot 6)', qty: 20, unit_price_ht: 93.0, tva_rate: 20, discount_pct: 10 },
    ],
  },
  {
    ref: 'DEV-2025-040',
    client: 'Maison du Bricolage',
    client_ice: '001928374000055',
    client_address: 'Boulevard Mohamed VI, Guéliz',
    client_city: 'Marrakech',
    client_phone: '+212 524 38 05 17',
    date_issued: '20 Fév 2025',
    validity_date: '20 Mars 2025',
    payment_method: 'Traite commerciale 60j',
    status: 'Converti en facture',
    created_by: 'Sofia Cherkaoui (Comptabilité)',
    lines: [
      { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', qty: 8, unit_price_ht: 1249.0, tva_rate: 20, discount_pct: 0 },
    ],
  },
  {
    ref: 'DEV-2025-039',
    client: 'Comptoir Al Amal',
    client_ice: '004128901000092',
    client_address: '45, Rue des Selliers, Medina',
    client_city: 'Fès',
    client_phone: '+212 535 61 20 08',
    date_issued: '15 Fév 2025',
    validity_date: '15 Mars 2025',
    payment_method: 'Virement bancaire',
    status: 'En attente',
    created_by: 'Sofia Cherkaoui (Comptabilité)',
    lines: [
      { sku: 'CUT-230D', name: 'Disque diamant 230 mm', qty: 50, unit_price_ht: 189.5, tva_rate: 20, discount_pct: 8 },
    ],
  },
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 1,
    receipt_ref: 'REC-2025-089',
    invoice_ref: 'FAC-2025-183',
    client: 'BatiPro Maroc',
    amount: 8000.0,
    method: 'Chèque',
    date: '27 Fév 2025',
    doc_ref: 'CHQ N° 084731 (Attijariwafa)',
    recorded_by: 'Sofia Cherkaoui',
    status: 'Encaissé',
  },
  {
    id: 2,
    receipt_ref: 'REC-2025-088',
    invoice_ref: 'FAC-2025-181',
    client: 'Nord Industrie',
    amount: 6280.0,
    method: 'Virement bancaire',
    date: '25 Fév 2025',
    doc_ref: 'VIR-SGMB-99214',
    recorded_by: 'Sofia Cherkaoui',
    status: 'Validé',
  },
  {
    id: 3,
    receipt_ref: 'REC-2025-087',
    invoice_ref: 'FAC-2025-179',
    client: 'Maison du Bricolage',
    amount: 9735.0,
    method: 'Traite',
    date: '23 Fév 2025',
    doc_ref: 'TRT-BMCI-006841',
    recorded_by: 'Sofia Cherkaoui',
    status: 'Encaissé',
  },
  {
    id: 4,
    receipt_ref: 'REC-2025-086',
    invoice_ref: 'FAC-2025-178',
    client: 'Marché Al Matar',
    amount: 15400.0,
    method: 'Espèces',
    date: '20 Fév 2025',
    doc_ref: 'Bon de caisse N° 342',
    recorded_by: 'Youssef Bennani (Commercial)',
    status: 'Validé',
  },
  {
    id: 5,
    receipt_ref: 'REC-2025-085',
    invoice_ref: 'FAC-2025-184',
    client: 'Atlas Équipements SARL',
    amount: 12000.0,
    method: 'Carte bancaire',
    date: '19 Fév 2025',
    doc_ref: 'Ticket CMI N° 981240 (TPE)',
    recorded_by: 'Sofia Cherkaoui (Comptable)',
    status: 'Encaissé',
  },
];

const INITIAL_CREDIT_NOTES: CreditNoteData[] = [
  {
    ref: 'AVR-2025-014',
    invoice_ref: 'FAC-2025-184',
    return_slip_ref: 'BLR-2025-09',
    client: 'Atlas Équipements SARL',
    client_ice: '003147829000064',
    client_city: 'Casablanca',
    date_issued: '27 Fév 2025',
    reason: 'Retour de marchandise',
    total_ht: 2498.0,
    tva_rate: 20,
    total_ttc: 2997.6,
    status: 'Émis',
    notes: 'Retour 2 perceuses modèle 850W défectueuses sous garantie.',
  },
  {
    ref: 'AVR-2025-013',
    invoice_ref: 'FAC-2025-182',
    client: 'Comptoir Al Amal',
    client_ice: '004128901000092',
    client_city: 'Fès',
    date_issued: '22 Fév 2025',
    reason: 'Remise commerciale accordée',
    total_ht: 1500.0,
    tva_rate: 20,
    total_ttc: 1800.0,
    status: 'Imputé sur compte',
    notes: 'Geste commercial accordé suite à retard de livraison sur chantier.',
  },
];

const AGING_CLIENTS = [
  { client: 'Comptoir Al Amal', ice: '004128901000092', city: 'Fès', current: 0, d30: 0, d60: 32100, d90: 0, dOver: 0, total: 32100, risk: 'Modéré', phone: '+212 535 61 20 08', whatsapp: '212663445566' },
  { client: 'Quincaillerie Saada', ice: '001928374000045', city: 'Casablanca', current: 0, d30: 0, d60: 0, d90: 14500, dOver: 0, total: 14500, risk: 'Élevé (Chèque impayé)', phone: '+212 522 99 88 77', whatsapp: '212661001122' },
  { client: 'Atlas Équipements SARL', ice: '003147829000064', city: 'Casablanca', current: 24860, d30: 0, d60: 0, d90: 0, dOver: 0, total: 24860, risk: 'Faible', phone: '+212 522 34 78 90', whatsapp: '212661234567' },
  { client: 'BatiPro Maroc', ice: '002984123000081', city: 'Rabat', current: 10420.5, d30: 8000, d60: 0, d90: 0, dOver: 0, total: 18420.5, risk: 'Faible', phone: '+212 537 22 16 40', whatsapp: '212661987654' },
  { client: 'Marché Al Matar', ice: '005519820000019', city: 'Casablanca', current: 45200, d30: 12000, d60: 0, d90: 0, dOver: 0, total: 57200, risk: 'Faible (VIP)', phone: '+212 522 88 77 66', whatsapp: '212662334455' },
];

export default function AccountingDashboard() {
  const [activeTab, setActiveTab] = useState<
    'invoices' | 'quotes' | 'payments' | 'cheques' | 'aging' | 'credit_notes' | 'financial_reports' | 'banking'
  >('invoices');

  const [invoices, setInvoices] = useState<InvoiceData[]>(INITIAL_INVOICES);
  const [quotes, setQuotes] = useState<QuoteData[]>(INITIAL_QUOTES);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [cheques, setCheques] = useState<Cheque[]>(INITIAL_CHEQUES);
  const [creditNotes, setCreditNotes] = useState<CreditNoteData[]>(INITIAL_CREDIT_NOTES);

  // Filters & searches
  const [invoiceFilter, setInvoiceFilter] = useState<string>('all');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [quoteFilter, setQuoteFilter] = useState<string>('all');
  const [quoteSearch, setQuoteSearch] = useState('');
  const [chequeFilter, setChequeFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Modals state
  const [viewInvoice, setViewInvoice] = useState<InvoiceData | null>(null);
  const [showNewInvoice, setShowNewInvoice] = useState<boolean>(false);
  const [payInvoice, setPayInvoice] = useState<InvoiceData | null>(null);

  const [viewQuote, setViewQuote] = useState<QuoteData | null>(null);
  const [showNewQuote, setShowNewQuote] = useState<boolean>(false);

  const [viewCreditNote, setViewCreditNote] = useState<CreditNoteData | null>(null);
  const [showNewCreditNote, setShowNewCreditNote] = useState<boolean>(false);

  const [slipModal, setSlipModal] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // Invoices calculations
  const totalInvoiced = invoices.reduce((sum, inv) => {
    const ht = inv.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
    return sum + ht * 1.2;
  }, 0);

  const totalCollected = invoices.reduce((sum, inv) => {
    const ht = inv.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
    const ttc = ht * 1.2;
    return sum + (inv.paid_amount ?? (inv.status === 'Payée' ? ttc : 0));
  }, 0);

  const totalReceivables = Math.max(0, totalInvoiced - totalCollected);

  // Cheques calculations
  const totalPortfolio = cheques
    .filter((c) => c.status === 'en_portefeuille')
    .reduce((a, b) => a + b.amount, 0);
  const totalRemis = cheques
    .filter((c) => c.status === 'remis_en_banque')
    .reduce((a, b) => a + b.amount, 0);
  const totalImpayes = cheques
    .filter((c) => c.status === 'impaye')
    .reduce((a, b) => a + b.amount, 0);

  // Filtered lists
  const filteredInvoices = invoices.filter((inv) => {
    const q = invoiceSearch.toLowerCase().trim();
    const matchQ =
      !q ||
      inv.ref.toLowerCase().includes(q) ||
      inv.client.toLowerCase().includes(q) ||
      (inv.client_ice && inv.client_ice.toLowerCase().includes(q));
    const matchS = invoiceFilter === 'all' || inv.status === invoiceFilter;
    return matchQ && matchS;
  });

  const filteredQuotes = quotes.filter((quo) => {
    const q = quoteSearch.toLowerCase().trim();
    const matchQ =
      !q ||
      quo.ref.toLowerCase().includes(q) ||
      quo.client.toLowerCase().includes(q) ||
      (quo.client_ice && quo.client_ice.toLowerCase().includes(q));
    const matchS = quoteFilter === 'all' || quo.status === quoteFilter;
    return matchQ && matchS;
  });

  const filteredCheques = cheques.filter(
    (ch) => chequeFilter === 'all' || ch.status === chequeFilter,
  );

  const filteredPayments = payments.filter(
    (p) => paymentFilter === 'all' || p.method === paymentFilter,
  );

  // Invoice Handlers
  function handleCreateInvoice(newInv: InvoiceData) {
    setInvoices((prev) => [newInv, ...prev]);
    notify(`Facture ${newInv.ref} émise avec succès pour ${newInv.client} !`);
  }

  // Quote Handlers
  function handleCreateQuote(newQuote: QuoteData) {
    setQuotes((prev) => [newQuote, ...prev]);
    notify(`Devis ${newQuote.ref} émis avec succès pour ${newQuote.client} !`);
  }

  function handleAcceptQuote(quote: QuoteData) {
    setQuotes((prev) =>
      prev.map((q) => (q.ref === quote.ref ? { ...q, status: 'Accepté' } : q))
    );
    notify(`Accord client validé pour le devis ${quote.ref} !`);
  }

  function handleConvertQuoteToInvoice(quote: QuoteData) {
    const newInvRef = `FAC-2025-${Math.floor(185 + Math.random() * 800)}`;
    const newInvoice: InvoiceData = {
      ref: newInvRef,
      order_ref: `CMD-${quote.ref.replace('DEV-', '')}`,
      client: quote.client,
      client_ice: quote.client_ice,
      client_address: quote.client_address,
      client_city: quote.client_city,
      client_phone: quote.client_phone,
      date_issued: '28 Fév 2025',
      due_date: '30 jours fin de mois',
      payment_method: quote.payment_method || 'Virement bancaire 30j',
      status: 'Impayée',
      paid_amount: 0,
      lines: quote.lines.map((l) => ({
        sku: l.sku,
        name: l.name,
        qty: l.qty,
        unit_price_ht: l.unit_price_ht,
        tva_rate: l.tva_rate,
      })),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setQuotes((prev) =>
      prev.map((q) => (q.ref === quote.ref ? { ...q, status: 'Converti en facture' } : q))
    );
    setViewQuote(null);
    notify(`Devis ${quote.ref} converti en Facture officielle ${newInvRef} !`);
  }

  // Payment Handlers
  function handlePaymentConfirm(ref: string, amount: number, method: string, refDoc: string) {
    const inv = invoices.find((i) => i.ref === ref);
    const clientName = inv?.client || 'Client ERP';

    setInvoices((prev) =>
      prev.map((i) => {
        if (i.ref !== ref) return i;
        const ht = i.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
        const ttc = ht * 1.2;
        const prevPaid = i.paid_amount ?? (i.status === 'Payée' ? ttc : 0);
        const nextPaid = prevPaid + amount;
        const newStatus = nextPaid >= ttc ? 'Payée' : 'Partielle';
        return { ...i, paid_amount: nextPaid, status: newStatus };
      })
    );

    const newPaymentRecord: PaymentRecord = {
      id: Date.now(),
      receipt_ref: `REC-2025-${Math.floor(100 + Math.random() * 900)}`,
      invoice_ref: ref,
      client: clientName,
      amount,
      method: (method as any) || 'Virement bancaire',
      date: '28 Fév 2025',
      doc_ref: refDoc || `${method} - Enregistré comptabilité`,
      recorded_by: 'Sofia Cherkaoui (Comptable)',
      status: 'Encaissé',
    };
    setPayments((prev) => [newPaymentRecord, ...prev]);

    if (method === 'Chèque' || method === 'Traite') {
      setCheques((prev) => [
        {
          id: Date.now(),
          ref: refDoc,
          client: clientName,
          bank: 'Attijariwafa Bank',
          amount,
          due_date: '30 jours',
          status: 'en_portefeuille',
        },
        ...prev,
      ]);
      notify(`Règlement de ${formatMoney(amount)} DH enregistré et effet ${refDoc} ajouté en portefeuille !`);
    } else {
      notify(`Règlement de ${formatMoney(amount)} DH enregistré pour la facture ${ref} (${method}) !`);
    }
  }

  // Credit Note Handlers
  function handleCreateCreditNote(newCn: CreditNoteData) {
    setCreditNotes((prev) => [newCn, ...prev]);
    notify(`Facture d'Avoir ${newCn.ref} émise avec succès (-${formatMoney(newCn.total_ttc)} DH) !`);
  }

  function advanceChequeStatus(id: number) {
    setCheques((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (c.status === 'en_portefeuille') return { ...c, status: 'remis_en_banque' };
          if (c.status === 'remis_en_banque') return { ...c, status: 'encaisse' };
          if (c.status === 'impaye') return { ...c, status: 'remis_en_banque' };
        }
        return c;
      }),
    );
    notify('Statut de l\'effet mis à jour avec traçabilité comptable.');
  }

  function exportInvoicesCsv() {
    const csv = [
      'N° Facture;Client;ICE;Total HT;TVA;Total TTC;Réglé;Reste;Statut;Échéance',
      ...filteredInvoices.map((inv) => {
        const ht = inv.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
        const ttc = ht * 1.2;
        const paid = inv.paid_amount ?? (inv.status === 'Payée' ? ttc : 0);
        const rem = Math.max(0, ttc - paid);
        return `"${inv.ref}";"${inv.client}";"${inv.client_ice || ''}";"${ht.toFixed(2)}";"${(ht * 0.2).toFixed(2)}";"${ttc.toFixed(2)}";"${paid.toFixed(2)}";"${rem.toFixed(2)}";"${inv.status}";"${inv.due_date}"`;
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `factures-maroc-${Date.now()}.csv`;
    link.click();
    notify('Export CSV des Factures téléchargé.');
  }

  function exportFinancialReportCsv() {
    const csv = [
      'RAPPORT FINANCIER & FISCAL MAROC - HERCULES DISTRIBUTION SARL',
      `Date;${new Date().toLocaleDateString('fr-FR')}`,
      `Total Facturé TTC;${totalInvoiced.toFixed(2)} DH`,
      `Total Encaissé;${totalCollected.toFixed(2)} DH`,
      `Créances Ouvertes;${totalReceivables.toFixed(2)} DH`,
      `Chèques en Portefeuille;${totalPortfolio.toFixed(2)} DH`,
      `Chèques Impayés;${totalImpayes.toFixed(2)} DH`,
      '',
      'DÉCLARATION FISCALE TVA (BASE MAROC 20% & 14%)',
      'Rubrique;Base Imposable HT;Taux;TVA Due',
      `Ventes Marchandises (20%);${(totalInvoiced / 1.2).toFixed(2)};20%;${((totalInvoiced / 1.2) * 0.2).toFixed(2)}`,
      `TVA Déductible sur Achats/Charges;48250.00;20%;9650.00`,
      `Total Net TVA à Déclarer;${(((totalInvoiced / 1.2) * 0.2) - 9650).toFixed(2)};;`,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport-financier-comptable-${Date.now()}.csv`;
    link.click();
    notify('Rapport Financier & Fiscal téléchargé avec succès.');
  }

  return (
    <div className="dashboard-page accounting-workspace">
      {/* ── Header ── */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">COMPTABILITÉ &amp; TRÉSORERIE <span className="eyebrow-sep">/</span> GESTION COMPTABLE MAROC</span>
          <h1>Espace Comptable &amp; Financier<span className="title-period">.</span></h1>
          <p>Devis proformas, facturation légale, encaissements, effets &amp; chèques, balance âgée des créances, avoirs et rapports fiscaux.</p>
        </div>
        <div className="heading-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="button-secondary" onClick={() => setShowNewQuote(true)}>
            <FileText size={15} /> Nouveau Devis
          </button>
          <button className="button-secondary" onClick={() => setShowNewCreditNote(true)}>
            <Undo2 size={15} /> Nouvel Avoir
          </button>
          <button className="button-secondary" onClick={() => setReminderModal(true)}>
            <MessageSquare size={15} /> Relance WhatsApp
          </button>
          <button className="button-secondary" onClick={() => setSlipModal(true)}>
            <Download size={15} /> Bordereau Banque
          </button>
          <button className="button-primary" onClick={() => setShowNewInvoice(true)}>
            <Plus size={15} /> Nouvelle Facture
          </button>
        </div>
      </div>

      {/* ── Role Quick Actions Bar (Comptabilité) ── */}
      <RoleQuickActionsBar
        roleTitle="Comptabilité & Finance"
        actions={[
          {
            id: 'qa-pay',
            label: '+ Encaisser Paiement',
            description: 'Enregistrer un règlement (Espèces, Carte CMI, Chèque, Effet ou Virement)',
            icon: Receipt,
            primary: true,
            onClick: () => {
              const openInv = invoices.find((i) => i.status !== 'Payée') || invoices[0];
              setPayInvoice(openInv);
            },
          },
          {
            id: 'qa-fac',
            label: '+ Nouvelle Facture',
            description: 'Créer une facture avec TVA 20% légale marocaine',
            icon: FileText,
            onClick: () => setShowNewInvoice(true),
          },
          {
            id: 'qa-dev',
            label: '+ Nouveau Devis',
            description: 'Établir une offre proforma officielle chiffrée',
            icon: FileCheck,
            onClick: () => setShowNewQuote(true),
          },
          {
            id: 'qa-avr',
            label: '+ Émettre un Avoir',
            description: 'Émettre une facture d’avoir rectificative',
            icon: Undo2,
            onClick: () => setShowNewCreditNote(true),
          },
          {
            id: 'qa-slip',
            label: '+ Bordereau Banque',
            description: 'Générer le bordereau de remise chèques et effets',
            icon: Download,
            onClick: () => setSlipModal(true),
          },
        ]}
      />

      {/* ── Sub-navigation Tabs ── */}
      <div className="table-tabs" style={{ marginBottom: 16, overflowX: 'auto', display: 'flex', gap: 4 }}>
        <button
          className={`table-tab ${activeTab === 'invoices' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FileText size={14} style={{ display: 'inline', marginRight: 5 }} />
          Factures ({invoices.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'quotes' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('quotes')}
        >
          <FileCheck size={14} style={{ display: 'inline', marginRight: 5 }} />
          Devis &amp; Proformas ({quotes.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'payments' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <Receipt size={14} style={{ display: 'inline', marginRight: 5 }} />
          Paiements ({payments.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'cheques' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('cheques')}
        >
          <CreditCard size={14} style={{ display: 'inline', marginRight: 5 }} />
          Chèques &amp; Effets ({cheques.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'aging' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('aging')}
        >
          <Clock size={14} style={{ display: 'inline', marginRight: 5 }} />
          Créances &amp; Balance Âgée
        </button>
        <button
          className={`table-tab ${activeTab === 'credit_notes' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('credit_notes')}
        >
          <Undo2 size={14} style={{ display: 'inline', marginRight: 5 }} />
          Avoirs Clients ({creditNotes.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'financial_reports' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('financial_reports')}
        >
          <BarChart3 size={14} style={{ display: 'inline', marginRight: 5 }} />
          Rapports Financiers &amp; TVA
        </button>
        <button
          className={`table-tab ${activeTab === 'banking' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('banking')}
        >
          <Building size={14} style={{ display: 'inline', marginRight: 5 }} />
          Bordereaux Bancaires
        </button>
      </div>

      {/* ════════════════════ TAB 1 : FACTURES DE VENTE ════════════════════ */}
      {activeTab === 'invoices' && (
        <>
          {/* Facturation KPIs */}
          <div className="metric-grid">
            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>Total Facturé TTC</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <FileText size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalInvoiced)} <small>DH</small></div>
              <div className="metric-foot">
                <span>{invoices.length} factures émises</span>
              </div>
            </div>

            <div className="metric-card metric-green">
              <div className="metric-top">
                <span>Règlements Encaissés</span>
                <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalCollected)} <small>DH</small></div>
              <div className="metric-foot">
                <span className="metric-change change-up">
                  {Math.round((totalCollected / (totalInvoiced || 1)) * 100)}% encaissé
                </span>
              </div>
            </div>

            <div className="metric-card metric-amber">
              <div className="metric-top">
                <span>Créances Ouvertes</span>
                <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <Clock size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalReceivables)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Solde à recouvrer</span>
              </div>
            </div>

            <div className="metric-card metric-red">
              <div className="metric-top">
                <span>Factures en Retard</span>
                <div className="metric-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="metric-number">
                {invoices.filter((i) => i.status === 'En retard').length} <small>factures</small>
              </div>
              <div className="metric-foot">
                <span className="metric-change change-down">Échéance dépassée</span>
              </div>
            </div>
          </div>

          {/* Moroccan Legal Invoices Section */}
          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">FACTURATION CLIENTS MAROC</span>
                <h2>Registre des Factures de Vente ({filteredInvoices.length} factures)</h2>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="button-secondary" onClick={exportInvoicesCsv} style={{ fontSize: '11.5px', height: '32px' }}>
                  <Download size={13} /> Exporter CSV
                </button>
                <button className="button-primary" onClick={() => setShowNewInvoice(true)} style={{ fontSize: '11.5px', height: '32px' }}>
                  <Plus size={13} /> Nouvelle Facture
                </button>
              </div>
            </div>

            <div className="table-tools">
              <div className="table-tabs">
                {['all', 'Impayée', 'Partielle', 'Payée', 'En retard'].map((st) => (
                  <button
                    key={st}
                    className={`table-tab ${invoiceFilter === st ? 'active-tab' : ''}`}
                    onClick={() => setInvoiceFilter(st)}
                  >
                    {st === 'all' ? 'Toutes les factures' : st}
                  </button>
                ))}
              </div>
              <div className="tool-actions">
                <label className="search-field">
                  <Search size={14} />
                  <input
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    placeholder="Rechercher facture, client, ICE..."
                  />
                </label>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>N° FACTURE</th>
                    <th>CLIENT &amp; ICE</th>
                    <th>TOTAL HT</th>
                    <th>TVA (20%)</th>
                    <th>TOTAL TTC</th>
                    <th>DÉJÀ PAYÉ / RESTE</th>
                    <th>STATUT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((fac) => {
                    const ht = fac.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
                    const tva = ht * 0.2;
                    const ttc = ht + tva;
                    const paid = fac.paid_amount ?? (fac.status === 'Payée' ? ttc : 0);
                    const remaining = Math.max(0, ttc - paid);

                    return (
                      <tr key={fac.ref}>
                        <td>
                          <span className="table-ref">{fac.ref}</span>
                          <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px' }}>
                            Émise : {fac.date_issued}
                          </small>
                        </td>
                        <td>
                          <b className="table-main">{fac.client}</b>
                          <small style={{ display: 'block', color: 'var(--muted)' }}>
                            ICE: {fac.client_ice || '002984123000081'}
                          </small>
                        </td>
                        <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(ht)} DH</td>
                        <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(tva)} DH</td>
                        <td>
                          <b>{formatMoney(ttc)} DH</b>
                        </td>
                        <td>
                          <div style={{ fontSize: '11px' }}>
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>{formatMoney(paid)} DH</span> /{' '}
                            <b style={{ color: remaining > 0 ? '#ef4444' : 'inherit' }}>
                              {formatMoney(remaining)} DH
                            </b>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              fac.status === 'Payée'
                                ? 'status-green'
                                : fac.status === 'Partielle'
                                ? 'status-blue'
                                : fac.status === 'En retard'
                                ? 'status-red'
                                : 'status-amber'
                            }`}
                          >
                            <i /> {fac.status}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="row-action"
                              title="Aperçu & Impression Facture A4"
                              onClick={() => setViewInvoice(fac)}
                              style={{ color: '#38bdf8' }}
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              className="row-action"
                              title="Imprimer"
                              onClick={() => setViewInvoice(fac)}
                            >
                              <Printer size={14} />
                            </button>
                            {remaining > 0 && (
                              <button
                                className="button-primary"
                                style={{
                                  fontSize: '11px',
                                  height: '28px',
                                  padding: '0 8px',
                                  background: '#16a34a',
                                  borderColor: '#15803d',
                                }}
                                onClick={() => setPayInvoice(fac)}
                                title="Encaisser un règlement"
                              >
                                <CreditCard size={12} /> Encaisser
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 2 : DEVIS & PROFORMAS ════════════════════ */}
      {activeTab === 'quotes' && (
        <>
          <div className="metric-grid">
            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>Devis en Cours</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <FileCheck size={16} />
                </div>
              </div>
              <div className="metric-number">
                {quotes.filter((q) => q.status === 'En attente').length} <small>propositions</small>
              </div>
              <div className="metric-foot">
                <span>En négociation / attente accord</span>
              </div>
            </div>

            <div className="metric-card metric-green">
              <div className="metric-top">
                <span>Devis Acceptés</span>
                <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="metric-number">
                {quotes.filter((q) => q.status === 'Accepté' || q.status === 'Converti en facture').length}
              </div>
              <div className="metric-foot">
                <span className="metric-change change-up">Prêts à être facturés</span>
              </div>
            </div>

            <div className="metric-card metric-cyan">
              <div className="metric-top">
                <span>Valeur Proformas</span>
                <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(
                  quotes.reduce((sum, q) => {
                    const ht = q.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
                    return sum + ht * 1.2;
                  }, 0)
                )} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>Chiffre d'affaires potentiel</span>
              </div>
            </div>
          </div>

          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">PROPOSITIONS COMMERCIALES &amp; PROFORMAS</span>
                <h2>Registre des Devis ({filteredQuotes.length} devis)</h2>
              </div>
              <button
                className="button-primary"
                onClick={() => setShowNewQuote(true)}
                style={{ fontSize: '11.5px', height: '32px' }}
              >
                <Plus size={13} /> Nouveau Devis Proforma
              </button>
            </div>

            <div className="table-tools">
              <div className="table-tabs">
                {['all', 'En attente', 'Accepté', 'Converti en facture'].map((st) => (
                  <button
                    key={st}
                    className={`table-tab ${quoteFilter === st ? 'active-tab' : ''}`}
                    onClick={() => setQuoteFilter(st)}
                  >
                    {st === 'all' ? 'Tous les devis' : st}
                  </button>
                ))}
              </div>
              <div className="tool-actions">
                <label className="search-field">
                  <Search size={14} />
                  <input
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    placeholder="Rechercher devis, client, ICE..."
                  />
                </label>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>N° DEVIS</th>
                    <th>CLIENT &amp; DESTINATAIRE</th>
                    <th>ÉMIS LE / VALIDITÉ</th>
                    <th>MONTANT HT</th>
                    <th>TVA (20%)</th>
                    <th>TOTAL TTC</th>
                    <th>STATUT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((q) => {
                    const ht = q.lines.reduce((s, l) => s + l.qty * l.unit_price_ht, 0);
                    const tva = ht * 0.2;
                    const ttc = ht + tva;
                    return (
                      <tr key={q.ref}>
                        <td>
                          <span className="table-ref" style={{ color: '#0ea5e9' }}>{q.ref}</span>
                          <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px' }}>
                            {q.lines.length} articles chiffrés
                          </small>
                        </td>
                        <td>
                          <b className="table-main">{q.client}</b>
                          <small style={{ display: 'block', color: 'var(--muted)' }}>
                            ICE: {q.client_ice || '003147829000064'} · {q.client_city}
                          </small>
                        </td>
                        <td>
                          <span className="table-secondary">{q.date_issued}</span>
                          <small style={{ display: 'block', color: 'var(--muted)' }}>
                            Valable : {q.validity_date}
                          </small>
                        </td>
                        <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(ht)} DH</td>
                        <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(tva)} DH</td>
                        <td>
                          <strong style={{ color: '#0ea5e9' }}>{formatMoney(ttc)} DH</strong>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              q.status === 'Accepté'
                                ? 'status-green'
                                : q.status === 'Converti en facture'
                                ? 'status-violet'
                                : q.status === 'En attente'
                                ? 'status-amber'
                                : 'status-red'
                            }`}
                          >
                            <i /> {q.status}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="row-action"
                              title="Aperçu & Impression du Devis"
                              onClick={() => setViewQuote(q)}
                              style={{ color: '#0ea5e9' }}
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              className="row-action"
                              title="Imprimer"
                              onClick={() => setViewQuote(q)}
                            >
                              <Printer size={14} />
                            </button>
                            {q.status !== 'Converti en facture' && (
                              <button
                                className="button-primary"
                                style={{
                                  fontSize: '11px',
                                  height: '28px',
                                  padding: '0 8px',
                                  background: '#0284c7',
                                  borderColor: '#0284c7',
                                  gap: 4,
                                }}
                                onClick={() => handleConvertQuoteToInvoice(q)}
                                title="Convertir directement en Facture de vente"
                              >
                                <ArrowRight size={12} /> Facturer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 3 : PAIEMENTS & ENCAISSEMENTS ════════════════════ */}
      {activeTab === 'payments' && (
        <>
          <div className="metric-grid">
            <div className="metric-card metric-green">
              <div className="metric-top">
                <span>Total Règlements Reçus</span>
                <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <Receipt size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(payments.reduce((a, b) => a + b.amount, 0))} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>{payments.length} quittances comptabilisées</span>
              </div>
            </div>

            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>Par Virement &amp; Chèque</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <Building size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(
                  payments
                    .filter((p) => p.method === 'Virement bancaire' || p.method === 'Chèque')
                    .reduce((a, b) => a + b.amount, 0)
                )} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>Règlements bancarisés</span>
              </div>
            </div>

            <div className="metric-card metric-amber">
              <div className="metric-top">
                <span>Par Espèces (Cash)</span>
                <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <DollarSign size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(
                  payments.filter((p) => p.method === 'Espèces').reduce((a, b) => a + b.amount, 0)
                )} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>Caisse principale &amp; versements</span>
              </div>
            </div>

            <div className="metric-card" style={{ borderColor: 'rgba(6,182,212,0.4)', background: 'linear-gradient(180deg, rgba(6,182,212,0.06), transparent)' }}>
              <div className="metric-top">
                <span>Par Carte (Card / TPE)</span>
                <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="metric-number">
                {formatMoney(
                  payments.filter((p) => p.method === 'Carte bancaire').reduce((a, b) => a + b.amount, 0)
                )} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>Terminaux TPE &amp; CMI</span>
              </div>
            </div>
          </div>

          {/* Visualisation graphique Répartition des Règlements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginTop: '16px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>VENTILATION PAR CANAL</span>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 0', color: '#0f172a' }}>Répartition des Encaissements</h3>
                </div>
                <span className="sx-chip" style={{ fontSize: '11px' }}>Cash · Card · Effets · Banque</span>
              </div>
              <DonutChart
                size={170}
                strokeWidth={22}
                centerLabel="TOTAL REÇU"
                centerValue={`${formatMoney(payments.reduce((a, b) => a + b.amount, 0))} DH`}
                slices={[
                  { label: 'Chèques bancaires', value: payments.filter(p => p.method === 'Chèque').reduce((a, b) => a + b.amount, 0), color: '#3b82f6' },
                  { label: 'Espèces (Cash)', value: payments.filter(p => p.method === 'Espèces').reduce((a, b) => a + b.amount, 0), color: '#10b981' },
                  { label: 'Carte bancaire (Card)', value: payments.filter(p => p.method === 'Carte bancaire').reduce((a, b) => a + b.amount, 0) || 12000, color: '#06b6d4' },
                  { label: 'Virements & Traites', value: payments.filter(p => p.method === 'Virement bancaire' || p.method === 'Traite').reduce((a, b) => a + b.amount, 0), color: '#8b5cf6' },
                ]}
              />
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>SÉCURITÉ &amp; CONFORMITÉ</span>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 10px', color: '#0f172a' }}>Traçabilité des Flux</h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
                  Tous les paiements enregistrés par les commerciaux sur le terrain ou par la comptabilité génèrent automatiquement une quittance officielle horodatée avec référence bancaire / ticket TPE.
                </p>
                <MultiSegmentProgress
                  height={12}
                  segments={[
                    { label: 'Bancarisé (Chq / Vir / Traite)', value: payments.filter(p => p.method !== 'Espèces' && p.method !== 'Carte bancaire').reduce((a, b) => a + b.amount, 0), color: '#3b82f6' },
                    { label: 'Électronique (Carte / TPE)', value: payments.filter(p => p.method === 'Carte bancaire').reduce((a, b) => a + b.amount, 0) || 12000, color: '#06b6d4' },
                    { label: 'Espèces Caisse', value: payments.filter(p => p.method === 'Espèces').reduce((a, b) => a + b.amount, 0), color: '#10b981' },
                  ]}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} /> 100% des pièces justificatives archivées
                </span>
              </div>
            </div>
          </div>

          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">REGISTRE GÉNÉRAL DES ENCAISSEMENTS</span>
                <h2>Paiements &amp; Règlements Enregistrés ({filteredPayments.length})</h2>
              </div>
              <button
                className="button-primary"
                onClick={() => setPayInvoice(invoices[0])}
                style={{ fontSize: '11.5px', height: '32px' }}
              >
                <Plus size={13} /> Enregistrer un Règlement
              </button>
            </div>

            <div className="table-tools">
              <div className="table-tabs">
                {['all', 'Carte bancaire', 'Espèces', 'Virement bancaire', 'Chèque', 'Traite'].map((m) => (
                  <button
                    key={m}
                    className={`table-tab ${paymentFilter === m ? 'active-tab' : ''}`}
                    onClick={() => setPaymentFilter(m)}
                  >
                    {m === 'all' ? 'Tous les modes' : m}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>N° REÇU / QUITTANCE</th>
                    <th>DATE</th>
                    <th>CLIENT CONCERNÉ</th>
                    <th>FACTURE RATTACHÉE</th>
                    <th>MODE DE RÈGLEMENT</th>
                    <th>RÉF. PIÈCE BANCAIRE</th>
                    <th>MONTANT ENCAISSÉ</th>
                    <th>COMPTABILISÉ PAR</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id}>
                      <td><span className="table-ref">{p.receipt_ref}</span></td>
                      <td><span className="table-secondary">{p.date}</span></td>
                      <td><b className="table-main">{p.client}</b></td>
                      <td><span className="table-ref" style={{ color: '#38bdf8' }}>{p.invoice_ref}</span></td>
                      <td>
                        <span
                          className={`status-pill ${
                            p.method === 'Carte bancaire'
                              ? 'status-cyan'
                              : p.method === 'Espèces'
                              ? 'status-green'
                              : p.method === 'Virement bancaire'
                              ? 'status-blue'
                              : p.method === 'Chèque'
                              ? 'status-purple'
                              : 'status-amber'
                          }`}
                        >
                          {p.method}
                        </span>
                      </td>
                      <td><small style={{ fontFamily: 'monospace' }}>{p.doc_ref}</small></td>
                      <td><strong style={{ color: '#22c55e', fontSize: 13 }}>+{formatMoney(p.amount)} DH</strong></td>
                      <td><span className="table-secondary">{p.recorded_by}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 4 : EFFETS & CHÈQUES ════════════════════ */}
      {activeTab === 'cheques' && (
        <>
          <div className="metric-grid">
            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>En Portefeuille</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalPortfolio)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Chèques et traites en coffre</span>
              </div>
            </div>

            <div className="metric-card metric-cyan">
              <div className="metric-top">
                <span>Remis en Banque</span>
                <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  <Clock size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalRemis)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Encaissement en cours</span>
              </div>
            </div>

            <div className="metric-card metric-red">
              <div className="metric-top">
                <span>Chèques Impayés</span>
                <div className="metric-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="metric-number">{formatMoney(totalImpayes)} <small>DH</small></div>
              <div className="metric-foot">
                <span>Alerte rejet bancaire</span>
              </div>
            </div>
          </div>

          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">REGISTRE DES EFFETS DE COMMERCE</span>
                <h2>Chèques et Traites en circulation ({filteredCheques.length})</h2>
              </div>
              <button className="button-secondary" onClick={() => setSlipModal(true)} style={{ fontSize: '11.5px', height: '32px' }}>
                <Download size={13} /> Bordereau de remise PDF
              </button>
            </div>

            <div className="table-tools">
              <div className="table-tabs">
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'en_portefeuille', label: 'En portefeuille' },
                  { key: 'remis_en_banque', label: 'Remis en banque' },
                  { key: 'encaisse', label: 'Encaissés' },
                  { key: 'impaye', label: 'Impayés' },
                ].map((t) => (
                  <button
                    key={t.key}
                    className={`table-tab ${chequeFilter === t.key ? 'active-tab' : ''}`}
                    onClick={() => setChequeFilter(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>N° CHÈQUE / TRAITE</th>
                    <th>ÉMETTEUR / CLIENT</th>
                    <th>BANQUE DU CLIENT</th>
                    <th>MONTANT</th>
                    <th>DATE D'ÉCHÉANCE</th>
                    <th>STATUT BANCAIRE</th>
                    <th>ACTION COMPTABLE</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCheques.map((c) => (
                    <tr key={c.id}>
                      <td><span className="table-ref">{c.ref}</span></td>
                      <td><b className="table-main">{c.client}</b></td>
                      <td><span className="table-secondary">{c.bank}</span></td>
                      <td><strong style={{ fontSize: '13px' }}>{formatMoney(c.amount)} DH</strong></td>
                      <td><span className="table-secondary">{c.due_date}</span></td>
                      <td>
                        <span
                          className={`status-pill ${
                            c.status === 'encaisse'
                              ? 'status-green'
                              : c.status === 'remis_en_banque'
                              ? 'status-blue'
                              : c.status === 'impaye'
                              ? 'status-red'
                              : 'status-amber'
                          }`}
                        >
                          {c.status === 'en_portefeuille'
                            ? 'En portefeuille'
                            : c.status === 'remis_en_banque'
                            ? 'Remis en banque'
                            : c.status === 'encaisse'
                            ? 'Encaissé'
                            : 'Impayé (Rejet)'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="button-secondary"
                          style={{ height: '28px', fontSize: '11px', padding: '0 8px' }}
                          onClick={() => advanceChequeStatus(c.id)}
                        >
                          {c.status === 'en_portefeuille'
                            ? 'Remettre en banque'
                            : c.status === 'remis_en_banque'
                            ? 'Confirmer encaissement'
                            : c.status === 'impaye'
                            ? 'Représenter'
                            : 'Archivé'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 5 : CRÉANCES & BALANCE ÂGÉE ════════════════════ */}
      {activeTab === 'aging' && (
        <section className="panel list-panel">
          <div className="list-panel-heading">
            <div>
              <span className="eyebrow">RECOUVREMENT &amp; ANALYSE DU CRÉDIT</span>
              <h2>Balance Âgée des Créances Clients (Normes Maroc)</h2>
            </div>
            <button className="button-secondary" onClick={() => setReminderModal(true)}>
              <MessageSquare size={14} /> Relances groupées WhatsApp
            </button>
          </div>

          <div className="table-container">
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>CLIENT &amp; ICE</th>
                  <th>VILLE</th>
                  <th>NON ÉCHU (&lt;0j)</th>
                  <th>1 À 30 JOURS</th>
                  <th>31 À 60 JOURS</th>
                  <th>61 À 90 JOURS</th>
                  <th>TOTAL ENCOURS</th>
                  <th>NIVEAU DE RISQUE</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {AGING_CLIENTS.map((ac) => (
                  <tr key={ac.client}>
                    <td>
                      <b className="table-main">{ac.client}</b>
                      <small style={{ display: 'block', color: 'var(--muted)' }}>ICE: {ac.ice}</small>
                    </td>
                    <td><span className="table-secondary">{ac.city}</span></td>
                    <td style={{ color: ac.current > 0 ? '#22c55e' : 'var(--muted)' }}>
                      {ac.current > 0 ? `${formatMoney(ac.current)} DH` : '—'}
                    </td>
                    <td style={{ color: ac.d30 > 0 ? '#38bdf8' : 'var(--muted)' }}>
                      {ac.d30 > 0 ? `${formatMoney(ac.d30)} DH` : '—'}
                    </td>
                    <td style={{ color: ac.d60 > 0 ? '#f59e0b' : 'var(--muted)' }}>
                      {ac.d60 > 0 ? `${formatMoney(ac.d60)} DH` : '—'}
                    </td>
                    <td style={{ color: ac.d90 > 0 ? '#ef4444' : 'var(--muted)', fontWeight: ac.d90 > 0 ? 700 : 400 }}>
                      {ac.d90 > 0 ? `${formatMoney(ac.d90)} DH` : '—'}
                    </td>
                    <td>
                      <strong style={{ fontSize: 13 }}>{formatMoney(ac.total)} DH</strong>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          ac.risk.includes('Élevé')
                            ? 'status-red'
                            : ac.risk.includes('Modéré')
                            ? 'status-amber'
                            : 'status-green'
                        }`}
                      >
                        {ac.risk}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`https://wa.me/${ac.whatsapp}?text=Bonjour%20${encodeURIComponent(ac.client)},%20rappel%20de%20facture%20Hercules%20Distribution.`}
                        target="_blank"
                        rel="noreferrer"
                        className="button-secondary"
                        style={{ height: 26, fontSize: 11, padding: '0 8px', color: '#22c55e', gap: 4 }}
                      >
                        <MessageSquare size={12} /> Relancer
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ════════════════════ TAB 6 : FACTURES D'AVOIR & NOTES DE CRÉDIT ════════════════════ */}
      {activeTab === 'credit_notes' && (
        <>
          <div className="metric-grid">
            <div className="metric-card metric-amber">
              <div className="metric-top">
                <span>Total Avoirs Émis</span>
                <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  <Undo2 size={16} />
                </div>
              </div>
              <div className="metric-number">
                -{formatMoney(creditNotes.reduce((a, b) => a + b.total_ttc, 0))} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>{creditNotes.length} factures d'avoir</span>
              </div>
            </div>

            <div className="metric-card metric-blue">
              <div className="metric-top">
                <span>TVA Régularisée</span>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                  <ShieldAlert size={16} />
                </div>
              </div>
              <div className="metric-number">
                -{formatMoney(creditNotes.reduce((a, b) => a + (b.total_ht * 0.2), 0))} <small>DH</small>
              </div>
              <div className="metric-foot">
                <span>TVA déductible régularisée</span>
              </div>
            </div>
          </div>

          <section className="panel list-panel" style={{ marginTop: '16px' }}>
            <div className="list-panel-heading">
              <div>
                <span className="eyebrow">RÉGULARISATIONS &amp; RETOURS CLIENTS</span>
                <h2>Factures d'Avoir &amp; Notes de Crédit ({creditNotes.length})</h2>
              </div>
              <button
                className="button-primary"
                onClick={() => setShowNewCreditNote(true)}
                style={{ fontSize: '11.5px', height: '32px', background: '#d97706', borderColor: '#d97706' }}
              >
                <Plus size={13} /> Nouvel Avoir Client
              </button>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th>N° AVOIR</th>
                    <th>DATE</th>
                    <th>FACTURE RATTACHÉE</th>
                    <th>CLIENT &amp; ICE</th>
                    <th>MOTIF DE L'AVOIR</th>
                    <th>BASE HT</th>
                    <th>TVA (20%)</th>
                    <th>NET CRÉDITÉ TTC</th>
                    <th>STATUT</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {creditNotes.map((cn) => (
                    <tr key={cn.ref}>
                      <td><span className="table-ref" style={{ color: '#f59e0b' }}>{cn.ref}</span></td>
                      <td><span className="table-secondary">{cn.date_issued}</span></td>
                      <td><span className="table-ref" style={{ color: '#38bdf8' }}>{cn.invoice_ref}</span></td>
                      <td>
                        <b className="table-main">{cn.client}</b>
                        <small style={{ display: 'block', color: 'var(--muted)' }}>ICE: {cn.client_ice}</small>
                      </td>
                      <td><span className="table-secondary">{cn.reason}</span></td>
                      <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(cn.total_ht)} DH</td>
                      <td style={{ fontFamily: 'var(--app-font-mono)' }}>{formatMoney(cn.total_ht * 0.2)} DH</td>
                      <td><strong style={{ color: '#d97706' }}>-{formatMoney(cn.total_ttc)} DH</strong></td>
                      <td>
                        <span className="status-pill status-amber">
                          {cn.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="row-action"
                          title="Aperçu document d'avoir A4"
                          onClick={() => setViewCreditNote(cn)}
                          style={{ color: '#f59e0b' }}
                        >
                          <FileText size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ════════════════════ TAB 7 : RAPPORTS FINANCIERS & TVA ════════════════════ */}
      {activeTab === 'financial_reports' && (
        <section className="panel" style={{ padding: '20px' }}>
          <div className="panel-heading" style={{ marginBottom: '16px' }}>
            <div>
              <span className="eyebrow">ÉTATS FINANCIERS &amp; FISCAUX MAROC</span>
              <h2>Rapports de Synthèse Financière &amp; Déclarations TVA</h2>
            </div>
            <button className="button-primary" onClick={exportFinancialReportCsv}>
              <Download size={14} /> Exporter Rapport Fiscal (CSV)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--navy-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                CHIFFRE D'AFFAIRES RÉALISÉ
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', margin: '8px 0 4px' }}>
                {formatMoney(totalInvoiced)} DH TTC
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                Base HT : <b>{formatMoney(totalInvoiced / 1.2)} DH</b>
              </div>
            </div>

            <div style={{ background: 'var(--navy-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                TVA COLLECTÉE EXIGIBLE (20%)
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0ea5e9', margin: '8px 0 4px' }}>
                {formatMoney((totalInvoiced / 1.2) * 0.2)} DH
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                Déclaration mensuelle / trimestrielle à reverser
              </div>
            </div>

            <div style={{ background: 'var(--navy-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                DSO MOYEN (DÉLAI DE PAIEMENT)
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#22c55e', margin: '8px 0 4px' }}>
                38 Jours
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-soft)' }}>
                Objectif de l'entreprise : &lt; 45 jours
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--line)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'var(--navy-2)', borderBottom: '1px solid var(--line)', fontWeight: 700, fontSize: '13px' }}>
              Tableau Récapitulatif de TVA Exigible selon le CGI Maroc
            </div>
            <table className="data-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>RUBRIQUE FISCALE</th>
                  <th>BASE TAXABLE HT</th>
                  <th>TAUX APPLICABLE</th>
                  <th>TVA EXIGIBLE</th>
                  <th>OBSERVATION</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Opérations imposables au taux normal</b></td>
                  <td>{formatMoney(totalInvoiced / 1.2)} DH</td>
                  <td><span className="status-pill status-blue">20%</span></td>
                  <td><b>{formatMoney((totalInvoiced / 1.2) * 0.2)} DH</b></td>
                  <td>Factures de vente de marchandises</td>
                </tr>
                <tr>
                  <td><b>Déduction TVA sur avoirs émis</b></td>
                  <td>-{formatMoney(creditNotes.reduce((a, b) => a + b.total_ht, 0))} DH</td>
                  <td><span className="status-pill status-amber">20%</span></td>
                  <td style={{ color: '#d97706' }}>-{formatMoney(creditNotes.reduce((a, b) => a + (b.total_ht * 0.2), 0))} DH</td>
                  <td>Article 145 CGI - Retours et remises</td>
                </tr>
                <tr>
                  <td><b>TVA déductible sur achats de stocks</b></td>
                  <td>184 500,00 DH</td>
                  <td><span className="status-pill status-green">20%</span></td>
                  <td style={{ color: '#22c55e' }}>-36 900,00 DH</td>
                  <td>Factures fournisseurs validées</td>
                </tr>
                <tr style={{ background: 'rgba(56, 189, 248, 0.05)', fontWeight: 700 }}>
                  <td><strong>SOLDE NET DE TVA À VERSER AU TRÉSOR</strong></td>
                  <td>—</td>
                  <td>—</td>
                  <td style={{ color: '#0ea5e9', fontSize: '14px' }}>
                    {formatMoney(Math.max(0, ((totalInvoiced / 1.2) * 0.2) - 36900 - creditNotes.reduce((a, b) => a + (b.total_ht * 0.2), 0)))} DH
                  </td>
                  <td>Échéance au 20 du mois suivant</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ════════════════════ TAB 8 : BORDEREAUX BANCAIRES ════════════════════ */}
      {activeTab === 'banking' && (
        <section className="panel" style={{ padding: 20 }}>
          <div className="panel-heading" style={{ marginBottom: 14 }}>
            <div>
              <span className="eyebrow">SERVICES BANCAIRES &amp; REMISES</span>
              <h2>Bordereaux de Remise de Chèques &amp; Traites</h2>
            </div>
            <button className="button-primary" onClick={() => setSlipModal(true)}>
              <Download size={14} /> Télécharger Bordereau PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ background: 'var(--navy-2)', padding: 16, borderRadius: 8, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', marginBottom: 8 }}>
                <Building size={16} />
                <b>Attijariwafa Bank · Agence Mers Sultan</b>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                RIB : <b>007 780 0001234567890123 45</b><br />
                Titulaire : <b>HERCULES DISTRIBUTION SARL</b><br />
                Dernière remise : <b>28 Février 2025 (32 100 DH)</b>
              </p>
            </div>

            <div style={{ background: 'var(--navy-2)', padding: 16, borderRadius: 8, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', marginBottom: 8 }}>
                <Building size={16} />
                <b>Banque Populaire · Agence Ain Sebaâ</b>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                RIB : <b>127 780 0009876543210987 12</b><br />
                Titulaire : <b>HERCULES DISTRIBUTION SARL</b><br />
                Dernière remise : <b>24 Février 2025 (18 420 DH)</b>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Bank Remittance Slip Modal */}
      {slipModal && (
        <div className="modal-backdrop" onClick={() => setSlipModal(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">BORDEREAU OFFICIEL · BANQUE</span>
                <h2>Bordereau de Remise de Chèques &amp; Effets</h2>
              </div>
              <button className="icon-button" onClick={() => setSlipModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">
              Génération automatique pour remise à l'agence bancaire (Attijariwafa Bank / Banque Populaire).
            </p>
            <div style={{ background: 'var(--navy-2)', padding: '14px', borderRadius: '8px', margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Nombre d'effets à remettre :</span>
                <b>2 effets</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
                <span>Montant total de la remise :</span>
                <b style={{ color: '#22c55e' }}>{formatMoney(totalPortfolio)} DH</b>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', borderTop: '1px solid var(--line-soft)', paddingTop: '6px' }}>
                Compte Hercules Distribution SARL : RIB 007 780 0001234567890123 45
              </div>
            </div>
            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setSlipModal(false)}>Fermer</button>
              <button
                className="button-primary"
                onClick={() => {
                  setSlipModal(false);
                  notify('Bordereau PDF généré avec succès pour la banque !');
                }}
              >
                <Download size={14} /> Télécharger PDF Bordereau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Payment Reminder Modal */}
      {reminderModal && (
        <div className="modal-backdrop" onClick={() => setReminderModal(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">RELANCES AUTOMATIQUES MAROC</span>
                <h2>Modèle de Relance WhatsApp / SMS (J+7)</h2>
              </div>
              <button className="icon-button" onClick={() => setReminderModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">Modèle conforme au CDC section 9.7 (Français et Darija).</p>
            <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px', margin: '12px 0', fontSize: '12px', lineHeight: 1.6 }}>
              <b>Modèle Français :</b>
              <p style={{ margin: '4px 0 10px', color: 'var(--text-soft)' }}>
                « Bonjour [Client], sauf erreur de notre part, la facture [N°] de [Montant] DH échue le [Date] reste en attente de règlement. Merci de bien vouloir nous transmettre votre ordre de virement ou confirmer la date de remise de chèque. Hercules Distribution. »
              </p>
              <b>Modèle Darija / Arabe :</b>
              <p style={{ margin: '4px 0 0', color: 'var(--text-soft)', direction: 'rtl', textAlign: 'right' }}>
                « السلام عليكم [Client]، لتذكيركم بأن الفاتورة رقم [N°] بمبلغ [Montant] درهم قد حان أجل سدادها. المرجو تأكيد موعد الأداء مع الموزع. شكراً لكم، شركة Hercules Distribution. »
              </p>
            </div>
            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setReminderModal(false)}>Fermer</button>
              <button
                className="button-primary"
                style={{ background: '#22c55e', borderColor: '#16a34a' }}
                onClick={() => {
                  setReminderModal(false);
                  notify('Campagne de relance WhatsApp envoyée aux clients concernés.');
                }}
              >
                Envoyer les relances par WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Official Invoice Document Modal ── */}
      {viewInvoice && (
        <InvoiceDocumentModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onRecordPayment={(inv) => {
            setPayInvoice(inv);
            setViewInvoice(null);
          }}
        />
      )}

      {/* ── New Invoice Modal ── */}
      {showNewInvoice && (
        <NewInvoiceModal
          onClose={() => setShowNewInvoice(false)}
          onCreate={handleCreateInvoice}
        />
      )}

      {/* ── Register Payment Modal ── */}
      {payInvoice && (
        <RegisterPaymentModal
          invoice={payInvoice}
          onClose={() => setPayInvoice(null)}
          onConfirm={handlePaymentConfirm}
        />
      )}

      {/* ── Quote Document Modal ── */}
      {viewQuote && (
        <QuoteDocumentModal
          quote={viewQuote}
          onClose={() => setViewQuote(null)}
          onConvertToInvoice={handleConvertQuoteToInvoice}
          onAccept={handleAcceptQuote}
        />
      )}

      {/* ── New Quote Modal ── */}
      {showNewQuote && (
        <NewQuoteModal
          onClose={() => setShowNewQuote(false)}
          onCreate={handleCreateQuote}
          creatorName="Sofia Cherkaoui (Comptabilité)"
        />
      )}

      {/* ── Credit Note Document Modal ── */}
      {viewCreditNote && (
        <CreditNoteDocumentModal
          creditNote={viewCreditNote}
          onClose={() => setViewCreditNote(null)}
        />
      )}

      {/* ── New Credit Note Modal ── */}
      {showNewCreditNote && (
        <NewCreditNoteModal
          onClose={() => setShowNewCreditNote(false)}
          onCreate={handleCreateCreditNote}
        />
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
