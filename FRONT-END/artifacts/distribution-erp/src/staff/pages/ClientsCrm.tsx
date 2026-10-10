import { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Phone, MessageSquare, ShieldAlert,
  ArrowUpRight, Building2, CheckCircle2, ChevronRight, Download, Plus,
  CreditCard, ExternalLink, X, Edit2, Trash2, Check,
  Printer, Receipt, Banknote, Calendar, Landmark, DollarSign, Eye,
  Lock, Sparkles, UserCheck, Percent, Award,
} from 'lucide-react';
import { api, formatMoney } from '../api';
import { useStaffAuth } from '../auth';
import CommercialsPortfolioManagement from '../components/CommercialsPortfolioManagement';

export interface CrmClient {
  id: number;
  code: string;
  name: string;
  company: string;
  email?: string;
  city: string;
  phone: string;
  whatsapp: string;
  ice: string;
  commercial_name: string;
  commercial_reference?: string;
  commission_percentage?: number;
  creator_name?: string;
  price_tier: 'revendeur' | 'grossiste' | 'chantier' | 'standard';
  credit_limit: number;
  current_balance: number;
  overdue_amount: number;
  orders_count: number;
  last_order_days_ago: number;
  status: 'Actif' | 'Bloqué' | 'À surveiller';
}

export interface ClientPaymentRecord {
  id: number;
  receiptNumber: string;
  clientId: number;
  clientName: string;
  clientCompany: string;
  clientIce: string;
  date: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  paymentMethod: 'Espèces' | 'Carte bancaire' | 'Chèque bancaire' | 'Virement bancaire' | 'Traite / Effet';
  bankName?: string;
  chequeOrDocNumber?: string;
  dueDate?: string;
  collectedBy: string;
  notes?: string;
}

const DEMO_PAYMENTS: ClientPaymentRecord[] = [
  {
    id: 1,
    receiptNumber: 'REC-2026-0891',
    clientId: 1,
    clientName: 'Amine Tazi',
    clientCompany: 'Atlas Équipements SARL',
    clientIce: '003147829000064',
    date: '08 Oct 2026',
    amount: 15000,
    previousBalance: 57650,
    newBalance: 42650,
    paymentMethod: 'Chèque bancaire',
    bankName: 'Attijariwafa Bank',
    chequeOrDocNumber: 'CHQ-889021',
    dueDate: '20 Oct 2026',
    collectedBy: 'Youssef Bennani',
    notes: 'Acompte sur commandes en cours',
  },
  {
    id: 2,
    receiptNumber: 'REC-2026-0890',
    clientId: 2,
    clientName: 'Karim Berrada',
    clientCompany: 'BatiPro Maroc',
    clientIce: '002984123000081',
    date: '07 Oct 2026',
    amount: 8000,
    previousBalance: 26420,
    newBalance: 18420,
    paymentMethod: 'Virement bancaire',
    bankName: 'Banque Populaire',
    chequeOrDocNumber: 'VIR-BP-49021',
    dueDate: '07 Oct 2026',
    collectedBy: 'Youssef Bennani',
    notes: 'Règlement livraison chantier Rabat',
  },
  {
    id: 3,
    receiptNumber: 'REC-2026-0889',
    clientId: 5,
    clientName: 'Rachid Belkacem',
    clientCompany: 'Nord Industrie',
    clientIce: '002761820000019',
    date: '06 Oct 2026',
    amount: 10000,
    previousBalance: 16280,
    newBalance: 6280,
    paymentMethod: 'Espèces',
    chequeOrDocNumber: 'QC-CAS-1049',
    collectedBy: 'Ahmed Idrissi',
    notes: 'Versement direct comptoir Tanger',
  },
];

const DEMO_CLIENTS: CrmClient[] = [
  {
    id: 1,
    code: 'CLI-0084',
    name: 'Amine Tazi',
    company: 'Atlas Équipements SARL',
    city: 'Casablanca',
    phone: '+212 522 34 78 90',
    whatsapp: '212661234567',
    ice: '003147829000064',
    commercial_name: 'Youssef Bennani',
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
    commercial_name: 'Youssef Bennani',
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
    ice: '001854902000055',
    commercial_name: 'Ahmed Idrissi',
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
    commercial_name: 'Youssef Bennani',
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
    name: 'Rachid Belkacem',
    company: 'Nord Industrie',
    city: 'Tanger',
    phone: '+212 539 94 11 22',
    whatsapp: '212661889900',
    ice: '002761820000019',
    commercial_name: 'Ahmed Idrissi',
    price_tier: 'revendeur',
    credit_limit: 60000,
    current_balance: 6280,
    overdue_amount: 0,
    orders_count: 15,
    last_order_days_ago: 4,
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
    ice: '003982145000073',
    commercial_name: 'Ahmed Idrissi',
    price_tier: 'revendeur',
    credit_limit: 40000,
    current_balance: 42100,
    overdue_amount: 14500,
    orders_count: 27,
    last_order_days_ago: 32,
    status: 'Bloqué',
  },
];

export default function ClientsCrm() {
  const { user: currentStaffUser } = useStaffAuth();
  const isUserCommercial = currentStaffUser?.primary_role === 'commercial' || currentStaffUser?.roles?.some((r: any) => (r.code || r) === 'commercial');

  const [clients, setClients] = useState<CrmClient[]>(DEMO_CLIENTS);
  const [commercialUsers, setCommercialUsers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<CrmClient | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [payments, setPayments] = useState<ClientPaymentRecord[]>(DEMO_PAYMENTS);

  useEffect(() => {
    api.getCustomers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CrmClient[] = data.map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name || c.company,
            company: c.company || c.name,
            email: c.email,
            city: c.city || 'Casablanca',
            phone: c.phone || '+212 522 00 00 00',
            whatsapp: c.whatsapp || (c.phone ? c.phone.replace(/[^0-9]/g, '') : '212600000000'),
            ice: c.ice || '003147829000064',
            commercial_name: c.commercial?.name || (c.commercial_reference ? `Commercial (${c.commercial_reference})` : 'Non attribué'),
            commercial_reference: c.commercial_reference || c.commercial?.commercial_code,
            commission_percentage: Number(c.commission_percentage) || Number(c.commercial?.commission_rate) || 5.0,
            creator_name: c.creator?.name,
            price_tier: c.price_tier || 'revendeur',
            credit_limit: Number(c.credit_limit) || 50000,
            current_balance: Number(c.current_balance) || 0,
            overdue_amount: Number(c.overdue_amount) || 0,
            orders_count: c.orders_count || 0,
            last_order_days_ago: 2,
            status: c.status || 'Actif',
          }));
          setClients(mapped);
        }
      })
      .catch((err) => {
        console.warn('Backend customers indisponibles, utilisation liste locale:', err);
      });

    api.getUsers({ role: 'commercial' }).then((users: any[]) => {
      if (Array.isArray(users) && users.length > 0) {
        setCommercialUsers(users);
      }
    }).catch(() => {});

    api.getPayments()
      .then((res: any) => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(list) && list.length > 0) {
          const mappedPayments: ClientPaymentRecord[] = list.map((p: any) => ({
            id: p.id,
            receiptNumber: p.receipt_number || p.ref,
            clientId: p.customer_id,
            clientName: p.customer?.name || 'Client',
            clientCompany: p.customer?.company || p.customer?.name || 'Entreprise',
            clientIce: p.customer?.ice || '',
            date: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '08 Oct 2026',
            amount: Number(p.amount) || 0,
            previousBalance: Number(p.previous_balance) || 0,
            newBalance: Number(p.new_balance) || 0,
            paymentMethod: p.method as any,
            bankName: p.bank,
            chequeOrDocNumber: p.doc_number,
            dueDate: p.due_date,
            collectedBy: p.user?.name || 'Youssef Bennani',
            notes: p.notes,
          }));
          setPayments(mappedPayments);
        }
      })
      .catch((err) => {
        console.warn('Backend payments indisponibles, utilisation liste locale:', err);
      });
  }, []);

  // Edit Client Modal State
  const [editingClient, setEditingClient] = useState<CrmClient | null>(null);
  const [editCompany, setEditCompany] = useState('');
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editIce, setEditIce] = useState('');
  const [editCommercial, setEditCommercial] = useState('Youssef Bennani');
  const [editPriceTier, setEditPriceTier] = useState<CrmClient['price_tier']>('revendeur');
  const [editCreditLimit, setEditCreditLimit] = useState<number>(50000);
  const [editStatus, setEditStatus] = useState<CrmClient['status']>('Actif');

  // Delete Confirm State
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<CrmClient | null>(null);

  function openEditClient(client: CrmClient) {
    setEditingClient(client);
    setEditCompany(client.company);
    setEditName(client.name);
    setEditCity(client.city);
    setEditPhone(client.phone);
    setEditWhatsapp(client.whatsapp);
    setEditIce(client.ice);
    setEditCommercial(client.commercial_name);
    setEditPriceTier(client.price_tier);
    setEditCreditLimit(client.credit_limit);
    setEditStatus(client.status);
  }

  function handleSaveEditClient(e: React.FormEvent) {
    e.preventDefault();
    if (!editingClient) return;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === editingClient.id) {
          return {
            ...c,
            company: editCompany.trim(),
            name: editName.trim(),
            city: editCity.trim(),
            phone: editPhone.trim(),
            whatsapp: editWhatsapp.trim() || editPhone.replace(/[^0-9]/g, ''),
            ice: editIce.trim(),
            commercial_name: editCommercial,
            price_tier: editPriceTier,
            credit_limit: Number(editCreditLimit) || c.credit_limit,
            status: editStatus,
          };
        }
        return c;
      })
    );

    api.updateCustomer(editingClient.id, {
      company: editCompany.trim(),
      name: editName.trim(),
      city: editCity.trim(),
      phone: editPhone.trim(),
      whatsapp: editWhatsapp.trim(),
      ice: editIce.trim(),
      price_tier: editPriceTier,
      credit_limit: Number(editCreditLimit),
      status: editStatus,
    }).catch(err => console.warn('Failed to update client on backend:', err));

    notify(`Fiche client « ${editCompany} » mise à jour avec succès !`);
    setEditingClient(null);
  }

  function handleDeleteClient(id: number) {
    api.deleteCustomer(id).catch(err => console.warn('Failed to delete client on backend:', err));
    setClients((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirmClient(null);
    notify('Compte client supprimé avec succès.');
  }

  // New Client Form State
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formPhone, setFormPhone] = useState('+212 5');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('client1234');
  const [formCity, setFormCity] = useState('Casablanca');
  const [formIce, setFormIce] = useState('');
  const [formPriceTier, setFormPriceTier] = useState<'revendeur' | 'grossiste' | 'chantier' | 'standard'>('revendeur');
  const [formCreditLimit, setFormCreditLimit] = useState(50000);
  const [formCommercialId, setFormCommercialId] = useState<number | ''>('');
  const [formCommissionRate, setFormCommissionRate] = useState<number>(5.0);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    if (!formCompany.trim()) {
      notify('Veuillez renseigner le nom de la société.');
      return;
    }

    const assignedComm = commercialUsers.find((u) => u.id === Number(formCommercialId));
    const effectiveCommercialId = isUserCommercial
      ? currentStaffUser?.id
      : formCommercialId !== '' ? Number(formCommercialId) : undefined;

    const effectiveCommercialName = isUserCommercial
      ? (currentStaffUser?.name || 'Commercial')
      : (assignedComm?.name || 'Non affecté');

    const effectiveCommercialRef = isUserCommercial
      ? ((currentStaffUser as any)?.commercial_code || `COM-${currentStaffUser?.id || '001'}`)
      : (assignedComm?.commercial_code || (assignedComm?.id ? `COM-${assignedComm.id}` : undefined));

    const effectiveCommissionRate = isUserCommercial
      ? Number((currentStaffUser as any)?.commission_rate ?? 5.0)
      : Number(formCommissionRate || assignedComm?.commission_rate || 5.0);

    const nextCode = `CLT-${String(clients.length + 1).padStart(3, '0')}`;
    const newClient: CrmClient = {
      id: Date.now(),
      code: nextCode,
      name: formContact.trim() || formCompany.trim(),
      company: formCompany.trim(),
      email: formEmail.trim() || undefined,
      phone: formPhone.trim() || '+212 5 22 00 00 00',
      whatsapp: formPhone.replace(/[^0-9]/g, '') || '212600000000',
      city: formCity.trim(),
      ice: formIce.trim() || '00' + Math.floor(1000000000000 + Math.random() * 9000000000000),
      commercial_name: effectiveCommercialName,
      commercial_reference: effectiveCommercialRef,
      commission_percentage: effectiveCommissionRate,
      creator_name: currentStaffUser?.name,
      price_tier: formPriceTier,
      credit_limit: Number(formCreditLimit) || 50000,
      current_balance: 0,
      overdue_amount: 0,
      orders_count: 0,
      last_order_days_ago: 0,
      status: 'Actif',
    };

    setClients([newClient, ...clients]);
    setShowAddClientModal(false);

    api.createCustomer({
      company: newClient.company,
      name: newClient.name,
      email: formEmail.trim() || undefined,
      password: formPassword.trim() || undefined,
      city: newClient.city,
      phone: newClient.phone,
      whatsapp: newClient.whatsapp,
      ice: newClient.ice,
      price_tier: newClient.price_tier,
      credit_limit: newClient.credit_limit,
      commercial_id: effectiveCommercialId,
      commission_percentage: effectiveCommissionRate,
    }).then((created: any) => {
      if (created?.id) {
        setClients(prev => [{
          ...newClient,
          id: created.id,
          code: created.code,
          commercial_reference: created.commercial_reference || newClient.commercial_reference,
          commission_percentage: created.commission_percentage || newClient.commission_percentage,
        }, ...prev.filter(x => x.id !== newClient.id)]);
      }
    }).catch(err => console.warn('Failed to save client on backend:', err));

    // Reset Form
    setFormCompany('');
    setFormContact('');
    setFormPhone('+212 5');
    setFormEmail('');
    setFormPassword('client1234');
    setFormIce('');
    setFormCreditLimit(50000);
    setFormCommercialId('');
    setFormCommissionRate(5.0);

    notify(`Client « ${newClient.company} » (${newClient.code}) enregistré avec succès !`);
  }

  // Tab State
  const [activeTab, setActiveTab] = useState<'clients' | 'payments' | 'commercials'>('clients');

  // Client Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentClient, setPaymentClient] = useState<CrmClient | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Espèces' | 'Carte bancaire' | 'Chèque bancaire' | 'Virement bancaire' | 'Traite / Effet'>('Espèces');
  const [paymentBank, setPaymentBank] = useState('Attijariwafa Bank');
  const [paymentDocNum, setPaymentDocNum] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('08 Oct 2026');
  const [paymentCollector, setPaymentCollector] = useState('Youssef Bennani');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [receiptModalData, setReceiptModalData] = useState<ClientPaymentRecord | null>(null);

  function openPaymentModal(targetClient: CrmClient | null) {
    const c = targetClient || (clients.length > 0 ? clients[0] : null);
    setPaymentClient(c);
    setPaymentAmount(c && c.current_balance > 0 ? c.current_balance : 10000);
    setPaymentMethod('Espèces');
    setPaymentBank('Attijariwafa Bank');
    setPaymentDocNum(`ESP-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentDueDate('25 Oct 2026');
    setPaymentDate('08 Oct 2026');
    setPaymentCollector(c?.commercial_name || 'Youssef Bennani');
    setPaymentNotes('');
    setShowPaymentModal(true);
  }

  function handleRegisterPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentClient || paymentAmount <= 0) {
      notify('Veuillez sélectionner un client et saisir un montant supérieur à 0 DH.');
      return;
    }

    const prevBal = paymentClient.current_balance;
    const newBal = Math.max(0, prevBal - paymentAmount);
    const newOverdue = Math.max(0, paymentClient.overdue_amount - paymentAmount);
    const nextRecNum = `REC-2026-${String(payments.length + 892).padStart(4, '0')}`;

    const newRecord: ClientPaymentRecord = {
      id: Date.now(),
      receiptNumber: nextRecNum,
      clientId: paymentClient.id,
      clientName: paymentClient.name,
      clientCompany: paymentClient.company,
      clientIce: paymentClient.ice,
      date: paymentDate,
      amount: paymentAmount,
      previousBalance: prevBal,
      newBalance: newBal,
      paymentMethod,
      bankName: paymentMethod !== 'Espèces' ? paymentBank : undefined,
      chequeOrDocNumber: paymentDocNum,
      dueDate: (paymentMethod === 'Chèque bancaire' || paymentMethod === 'Traite / Effet') ? paymentDueDate : undefined,
      collectedBy: paymentCollector,
      notes: paymentNotes,
    };

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === paymentClient.id) {
          const shouldUnblock = c.status === 'Bloqué' && newOverdue === 0 && newBal <= c.credit_limit;
          return {
            ...c,
            current_balance: newBal,
            overdue_amount: newOverdue,
            status: shouldUnblock ? 'Actif' : c.status,
          };
        }
        return c;
      })
    );

    setPayments([newRecord, ...payments]);
    setShowPaymentModal(false);

    api.createPayment({
      customer_id: paymentClient.id,
      amount: paymentAmount,
      method: paymentMethod,
      bank: paymentMethod !== 'Espèces' ? paymentBank : undefined,
      doc_number: paymentDocNum,
      due_date: (paymentMethod === 'Chèque bancaire' || paymentMethod === 'Traite / Effet') ? paymentDueDate : undefined,
      notes: paymentNotes,
    }).then(res => {
      if (res?.payment?.receipt_number) {
        setPayments(prev => prev.map(p => p.id === newRecord.id ? { ...p, receiptNumber: res.payment.receipt_number, id: res.payment.id } : p));
        setReceiptModalData(prev => prev ? { ...prev, receiptNumber: res.payment.receipt_number, id: res.payment.id } : prev);
      }
    }).catch(err => console.warn('Failed to persist payment on backend:', err));

    notify(`Règlement de ${formatMoney(paymentAmount)} DH enregistré pour « ${paymentClient.company} » !`);
    setReceiptModalData(newRecord);
  }

  const filtered = clients.filter((c) => {
    const matchesQ =
      c.company.toLowerCase().includes(query.toLowerCase()) ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.city.toLowerCase().includes(query.toLowerCase()) ||
      c.ice.includes(query);
    const matchesTier = tierFilter === 'all' || c.price_tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesQ && matchesTier && matchesStatus;
  });

  const totalClients = clients.length;
  const totalReceivables = clients.reduce((acc, c) => acc + c.current_balance, 0);
  const totalOverdue = clients.reduce((acc, c) => acc + c.overdue_amount, 0);
  const totalCreditLimit = clients.reduce((acc, c) => acc + c.credit_limit, 0);

  function toggleStatus(id: number) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = c.status === 'Actif' ? 'Bloqué' : 'Actif';
          return { ...c, status: next };
        }
        return c;
      }),
    );
  }

  return (
    <div className="module-page crm-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">RELATION CLIENT B2B <span className="heading-slash">/</span> CRM & ENCOURS</div>
          <h1>Portefeuille Clients & Comptes</h1>
          <p>Gestion des comptes revendeurs, grilles tarifaires, encours de crédit et accès au portail de commande.</p>
        </div>
        <div className="heading-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="button-primary"
            style={{ background: '#10b981', borderColor: '#059669', fontWeight: 600 }}
            onClick={() => openPaymentModal(null)}
            title="Encaisser un règlement de client (Espèces, Chèque, Virement, Traite)"
          >
            <CreditCard size={15} /> + Encaisser un règlement client
          </button>
          <button className="button-secondary">
            <Download size={15} /> Exporter CSV
          </button>
          <button className="button-primary" onClick={() => setShowAddClientModal(true)}>
            <Plus size={16} /> Nouveau client
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>Comptes enregistrés</span>
          <strong className="blue">{totalClients} revendeurs</strong>
        </div>
        <div className="summary-box">
          <span>Encours total clients</span>
          <strong className="neutral">{formatMoney(totalReceivables)} DH</strong>
        </div>
        <div className="summary-box">
          <span>Créances en retard</span>
          <strong className="needs-action">{formatMoney(totalOverdue)} DH</strong>
        </div>
        <div className="summary-box">
          <span>Plafond global autorisé</span>
          <strong className="neutral">{formatMoney(totalCreditLimit)} DH</strong>
        </div>
      </div>

      {/* ── Main CRM Navigation Tabs ── */}
      <div className="table-tabs" style={{ marginBottom: 16 }}>
        <button
          className={`table-tab ${activeTab === 'clients' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <Users size={14} style={{ display: 'inline', marginRight: 6 }} />
          Portefeuille Clients & Encours ({clients.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'payments' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <Receipt size={14} style={{ display: 'inline', marginRight: 6, color: '#10b981' }} />
          Journal des Règlements Clients & Reçus ({payments.length})
        </button>
        <button
          className={`table-tab ${activeTab === 'commercials' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('commercials')}
        >
          <Award size={14} style={{ display: 'inline', marginRight: 6, color: '#f59e0b' }} />
          Portefeuilles Commerciaux & Commissions
        </button>
      </div>

      {/* Table & filters */}
      {activeTab === 'clients' && (
      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">RÉPERTOIRE PRO</span>
            <h2>Clients & conditions commerciales</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} comptes affichés
          </div>
        </div>

        <div className="table-tools">
          <div className="table-tabs">
            {['all', 'Actif', 'À surveiller', 'Bloqué'].map((st) => (
              <button
                key={st}
                className={`table-tab ${statusFilter === st ? 'active-tab' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'all' ? 'Tous les comptes' : st}
              </button>
            ))}
          </div>
          <div className="tool-actions">
            <label className="search-field">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par société, ville, ICE..."
              />
            </label>
            <label className="filter-select">
              <Filter size={14} />
              <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                <option value="all">Toutes les grilles</option>
                <option value="revendeur">Tarif Revendeur</option>
                <option value="grossiste">Tarif Grossiste</option>
                <option value="chantier">Tarif Chantier</option>
                <option value="standard">Tarif Standard</option>
              </select>
            </label>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>CODE / SOCIÉTÉ</th>
                <th>CONTACT & VILLE</th>
                <th>COMMERCIAL</th>
                <th>GRILLE DE PRIX</th>
                <th>ENCOURS / PLAFOND</th>
                <th>STATUT PORTAIL</th>
                <th>ACTIONS RAPIDES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const ratio = Math.min(100, Math.round((c.current_balance / c.credit_limit) * 100));
                const overLimit = c.current_balance > c.credit_limit;
                return (
                  <tr key={c.id}>
                    <td>
                      <b className="table-main">{c.company}</b>
                      <small style={{ display: 'block', color: 'var(--muted)', fontSize: '11px' }}>
                        {c.code} · ICE: {c.ice}
                      </small>
                    </td>
                    <td>
                      <div>
                        <b>{c.name}</b>
                        <small style={{ display: 'block', color: 'var(--muted)' }}>
                          {c.city} · {c.phone}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className="table-secondary" style={{ fontWeight: 600 }}>{c.commercial_name}</span>
                        {c.commercial_reference && (
                          <div style={{ display: 'flex', gap: '4px', marginTop: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.1)', color: '#2563eb', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, fontFamily: 'monospace' }}>
                              {c.commercial_reference}
                            </span>
                            {c.commission_percentage !== undefined && c.commission_percentage !== null && (
                              <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.1)', color: '#059669', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                                {c.commission_percentage}% comm.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="status-pill status-blue" style={{ textTransform: 'capitalize' }}>
                        Tarif {c.price_tier}
                      </span>
                    </td>
                    <td>
                      <div style={{ minWidth: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                          <span style={{ color: overLimit ? '#ef4444' : 'inherit' }}>
                            {formatMoney(c.current_balance)} DH
                          </span>
                          <span style={{ color: 'var(--muted)' }}>{formatMoney(c.credit_limit)} DH</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(100,116,139,0.2)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${ratio}%`,
                              height: '100%',
                              background: overLimit ? '#ef4444' : ratio > 80 ? '#f59e0b' : '#3b82f6',
                            }}
                          />
                        </div>
                        {c.overdue_amount > 0 && (
                          <small style={{ color: '#ef4444', fontSize: '10px', display: 'block', marginTop: '2px' }}>
                            En retard: {formatMoney(c.overdue_amount)} DH
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          c.status === 'Actif'
                            ? 'status-green'
                            : c.status === 'À surveiller'
                            ? 'status-amber'
                            : 'status-red'
                        }`}
                      >
                        <i /> {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions" style={{ gap: '6px' }}>
                        <button
                          className="row-action"
                          title="Encaisser un règlement de ce client"
                          style={{ color: '#10b981' }}
                          onClick={() => openPaymentModal(c)}
                        >
                          <CreditCard size={14} />
                        </button>
                        <a
                          href={`https://wa.me/${c.whatsapp}?text=Bonjour%20${encodeURIComponent(c.name)},%20de%20la%20part%20de%20Hercules%20Distribution.`}
                          target="_blank"
                          rel="noreferrer"
                          className="row-action"
                          title="Contacter sur WhatsApp"
                          style={{ color: '#22c55e' }}
                        >
                          <MessageSquare size={14} />
                        </a>
                        <a
                          href={`tel:${c.phone}`}
                          className="row-action"
                          title="Appeler"
                        >
                          <Phone size={14} />
                        </a>
                        <button
                          className="row-action"
                          title="Modifier la fiche client"
                          style={{ color: '#0284c7' }}
                          onClick={() => openEditClient(c)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="row-action"
                          title="Supprimer ce client"
                          style={{ color: '#ef4444' }}
                          onClick={() => setDeleteConfirmClient(c)}
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          className="row-action"
                          title="Fiche complète"
                          onClick={() => setSelectedClient(c)}
                        >
                          <ChevronRight size={14} />
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

      {/* ── Tab 2: Journal des Règlements Clients & Reçus ── */}
      {activeTab === 'payments' && (
        <section className="panel list-panel">
          <div className="list-panel-heading">
            <div>
              <span className="eyebrow">ENCAISSEMENTS & HISTORIQUE DES RECETTES</span>
              <h2>Journal des Règlements Clients ({payments.length})</h2>
            </div>
            <div className="table-count">
              <button
                className="button-primary"
                style={{ background: '#10b981', borderColor: '#059669', height: 32, fontSize: 12, padding: '0 12px', gap: 6 }}
                onClick={() => openPaymentModal(null)}
              >
                <Plus size={13} /> + Encaisser un règlement
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>N° REÇU / DATE</th>
                  <th>CLIENT & ICE</th>
                  <th>MODE DE PAIEMENT</th>
                  <th>DÉTAILS BANCAIRES</th>
                  <th>MONTANT ENCAISSÉ</th>
                  <th>SOLDE RESTANT</th>
                  <th>ENCAISSÉ PAR</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code className="table-ref" style={{ color: '#0284c7', fontWeight: 700 }}>{p.receiptNumber}</code>
                      <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>{p.date}</small>
                    </td>
                    <td>
                      <b className="table-main">{p.clientCompany}</b>
                      <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>
                        {p.clientName} · ICE: {p.clientIce}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          p.paymentMethod === 'Espèces'
                            ? 'status-green'
                            : p.paymentMethod === 'Carte bancaire'
                            ? 'status-cyan'
                            : p.paymentMethod === 'Chèque bancaire'
                            ? 'status-blue'
                            : p.paymentMethod === 'Virement bancaire'
                            ? 'status-purple'
                            : 'status-amber'
                        }`}
                      >
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <div>
                        <b>{p.bankName || 'Caisse Centrale'}</b>
                        {p.chequeOrDocNumber && (
                          <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11 }}>
                            Réf: {p.chequeOrDocNumber} {p.dueDate ? `· Éch: ${p.dueDate}` : ''}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#16a34a', fontSize: 14 }}>
                        +{formatMoney(p.amount)} DH
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: p.newBalance > 0 ? '#ef4444' : '#16a34a', fontWeight: 600 }}>
                        {formatMoney(p.newBalance)} DH
                      </span>
                    </td>
                    <td>
                      <span className="table-secondary">{p.collectedBy}</span>
                    </td>
                    <td>
                      <button
                        className="button-secondary"
                        style={{ height: 28, fontSize: 11, padding: '0 8px', gap: 4, background: '#f8fafc', border: '1px solid #cbd5e1' }}
                        onClick={() => setReceiptModalData(p)}
                        title="Afficher et imprimer le reçu officiel"
                      >
                        <Eye size={12} /> Voir Reçu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Onglet Portefeuilles Commerciaux & Commissions ── */}
      {activeTab === 'commercials' && (
        <CommercialsPortfolioManagement />
      )}

      {/* ── Modal Nouveau Client (Fiche d'Enregistrement) ── */}
      {showAddClientModal && (
        <div className="modal-backdrop" onClick={() => setShowAddClientModal(false)}>
          <form
            className="record-modal"
            onSubmit={handleCreateClient}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 640,
              width: '95%',
              maxHeight: '90vh',
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
                  RELATION CLIENT B2B · ENREGISTREMENT COMPTE
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Enregistrer un nouveau client pro
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowAddClientModal(false)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div
              style={{
                padding: '18px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 13,
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Raison Sociale / Société *
                  <input
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Ex. Quincaillerie Al Baraka SARL"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Interlocuteur / Contact principal
                  <input
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="Ex. Khalid Tazi"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  ICE Client (15 chiffres) *
                  <input
                    required
                    value={formIce}
                    onChange={(e) => setFormIce(e.target.value)}
                    placeholder="Ex. 002194850000038"
                    maxLength={15}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Téléphone direct *
                  <input
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+212 5 22 XX XX XX"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Ville
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  >
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Fès">Fès</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Meknès">Meknès</option>
                    <option value="Kénitra">Kénitra</option>
                  </select>
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Grille Tarifaire assignée
                  <select
                    value={formPriceTier}
                    onChange={(e) => setFormPriceTier(e.target.value as any)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  >
                    <option value="revendeur">Tarif Revendeur</option>
                    <option value="grossiste">Tarif Grossiste</option>
                    <option value="chantier">Tarif Chantier BTP</option>
                    <option value="standard">Tarif Standard Comptoir</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Plafond de Crédit Autorisé (DH)
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={formCreditLimit}
                    onChange={(e) => setFormCreditLimit(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>
              </div>

              {/* Attribution Commerciale & Commission */}
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Attribution Commerciale &amp; Commission
                </div>

                {isUserCommercial ? (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 12px', borderRadius: 6, fontSize: 12, color: '#065f46' }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>✓ Rattaché directement à votre portefeuille commercial</span>
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 12, fontSize: 11.5 }}>
                      <span>Commercial : <b>{currentStaffUser?.name}</b></span>
                      <span>Réf : <b>{(currentStaffUser as any)?.commercial_code || `COM-${currentStaffUser?.id || '001'}`}</b></span>
                      <span>Commission : <b>{(currentStaffUser as any)?.commission_rate ?? 5}%</b></span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
                    <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                      Commercial Référent
                      <select
                        value={formCommercialId}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : '';
                          setFormCommercialId(val);
                          if (val !== '') {
                            const found = commercialUsers.find((u) => u.id === val);
                            if (found?.commission_rate) {
                              setFormCommissionRate(Number(found.commission_rate));
                            }
                          }
                        }}
                        style={{
                          width: '100%',
                          height: 38,
                          padding: '0 10px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: 13,
                        }}
                      >
                        <option value="">Sélectionner un commercial...</option>
                        {commercialUsers.length > 0 ? (
                          commercialUsers.map((comm) => (
                            <option key={comm.id} value={comm.id}>
                              {comm.name} {comm.commercial_code ? `(${comm.commercial_code})` : ''} - {comm.commission_rate ?? 5}%
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="1">Yassine Mansouri (COM-001) - 5%</option>
                            <option value="3">Sara El Amrani (COM-003) - 6%</option>
                            <option value="4">Tariq Bennani (COM-004) - 5%</option>
                          </>
                        )}
                      </select>
                    </label>

                    <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                      Commission (%)
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={formCommissionRate}
                        onChange={(e) => setFormCommissionRate(Number(e.target.value))}
                        style={{
                          width: '100%',
                          height: 38,
                          padding: '0 10px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: 13,
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Accès Espace Client B2B */}
              <div style={{ padding: '12px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Identifiants Portail Client B2B
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
                  <label className="field-label" style={{ color: '#1e3a8a', fontWeight: 600, fontSize: 12 }}>
                    Email de connexion portail
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="client@entreprise.ma"
                      style={{
                        width: '100%',
                        height: 38,
                        padding: '0 10px',
                        borderRadius: 6,
                        border: '1px solid #93c5fd',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: 13,
                      }}
                    />
                  </label>

                  <label className="field-label" style={{ color: '#1e3a8a', fontWeight: 600, fontSize: 12 }}>
                    Mot de passe initial
                    <input
                      type="text"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="client1234"
                      style={{
                        width: '100%',
                        height: 38,
                        padding: '0 10px',
                        borderRadius: 6,
                        border: '1px solid #93c5fd',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: 13,
                      }}
                    />
                  </label>
                </div>
                <small style={{ color: '#3b82f6', fontSize: 11, display: 'block', marginTop: 4 }}>
                  Le client pourra se connecter immédiatement sur le portail B2B avec ces identifiants pour passer ses commandes.
                </small>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div
              className="modal-actions"
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                margin: 0,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowAddClientModal(false)}
                style={{
                  height: 38,
                  padding: '0 16px',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{
                  height: 38,
                  padding: '0 20px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Plus size={16} /> Enregistrer le client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="modal-backdrop" onClick={() => setSelectedClient(null)}>
          <div
            className="record-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 540,
              width: '95%',
              maxHeight: '90vh',
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
                  {selectedClient.code} · FICHE CLIENT
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  {selectedClient.company}
                </h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedClient(null)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                padding: '18px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                background: '#ffffff',
              }}
            >
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>Interlocuteur</small>
                <b style={{ color: '#0f172a', fontSize: 13 }}>{selectedClient.name}</b>
                <div style={{ fontSize: '11.5px', marginTop: '4px', color: '#64748b' }}>{selectedClient.phone}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>Mentions légales</small>
                <b style={{ color: '#0f172a', fontSize: 13 }}>ICE: {selectedClient.ice}</b>
                <div style={{ fontSize: '11.5px', marginTop: '4px', color: '#64748b' }}>Ville: {selectedClient.city}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>Tarifs & Attribution Commerciale</small>
                <b style={{ textTransform: 'capitalize', color: '#0284c7', fontSize: 13 }}>Tarif {selectedClient.price_tier}</b>
                <div style={{ fontSize: '11.5px', marginTop: '4px', color: '#64748b' }}>
                  Commercial: <b>{selectedClient.commercial_name}</b>
                  {selectedClient.commercial_reference && ` (${selectedClient.commercial_reference})`}
                </div>
                {selectedClient.commission_percentage !== undefined && selectedClient.commission_percentage !== null && (
                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#059669', fontWeight: 600 }}>
                    Commission: {selectedClient.commission_percentage}%
                  </div>
                )}
                {selectedClient.creator_name && (
                  <div style={{ fontSize: '10.5px', marginTop: '2px', color: '#64748b' }}>
                    Créé par: {selectedClient.creator_name}
                  </div>
                )}
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <small style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>Encours & Crédit</small>
                <b style={{ color: '#0f172a', fontSize: 13 }}>{formatMoney(selectedClient.current_balance)} / {formatMoney(selectedClient.credit_limit)} DH</b>
                <div style={{ fontSize: '11.5px', marginTop: '4px', color: '#64748b' }}>Commandes: {selectedClient.orders_count}</div>
              </div>
            </div>

            <div
              className="modal-actions"
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                position: 'sticky',
                bottom: 0,
                display: 'flex',
                justifyContent: 'space-between',
                margin: 0,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                style={{
                  height: 38,
                  padding: '0 14px',
                  background: '#ffffff',
                  color: selectedClient.status === 'Actif' ? '#ef4444' : '#16a34a',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 12.5,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  toggleStatus(selectedClient.id);
                  setSelectedClient((prev) => (prev ? { ...prev, status: prev.status === 'Actif' ? 'Bloqué' : 'Actif' } : null));
                }}
              >
                {selectedClient.status === 'Actif' ? 'Bloquer l’accès portail' : 'Réactiver l’accès'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="button-primary"
                  style={{
                    height: 38,
                    padding: '0 14px',
                    background: '#10b981',
                    borderColor: '#059669',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 12.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onClick={() => {
                    const c = selectedClient;
                    setSelectedClient(null);
                    openPaymentModal(c);
                  }}
                >
                  <CreditCard size={14} /> Encaisser règlement
                </button>
                <button
                  className="button-secondary"
                  onClick={() => setSelectedClient(null)}
                  style={{
                    height: 38,
                    padding: '0 16px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Modifier Client ── */}
      {editingClient && (
        <div className="modal-backdrop" onClick={() => setEditingClient(null)}>
          <form
            className="record-modal"
            onSubmit={handleSaveEditClient}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 640,
              width: '95%',
              padding: 0,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
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
                  MODIFICATION COMPTE CLIENT · {editingClient.code}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Modifier {editingClient.company}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditingClient(null)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Raison sociale *
                  <input
                    required
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Contact principal *
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Ville *
                  <input
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Téléphone *
                  <input
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  N° ICE Maroc
                  <input
                    value={editIce}
                    onChange={(e) => setEditIce(e.target.value)}
                    placeholder="001524389000045"
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Commercial assigné
                  <select
                    value={editCommercial}
                    onChange={(e) => setEditCommercial(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    {commercialUsers.length > 0 ? (
                      commercialUsers.map((comm) => (
                        <option key={comm.id} value={comm.name}>
                          {comm.name} {comm.commercial_code ? `(${comm.commercial_code})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Yassine Mansouri">Yassine Mansouri (COM-001)</option>
                        <option value="Sara El Amrani">Sara El Amrani (COM-003)</option>
                        <option value="Tariq Bennani">Tariq Bennani (COM-004)</option>
                      </>
                    )}
                  </select>
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Grille tarifaire
                  <select
                    value={editPriceTier}
                    onChange={(e) => setEditPriceTier(e.target.value as any)}
                    style={{ width: '100%', height: 38, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option value="revendeur">Tarif Revendeur</option>
                    <option value="grossiste">Tarif Grossiste</option>
                    <option value="chantier">Tarif Chantier</option>
                    <option value="standard">Tarif Standard</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Plafond d'encours autorisé (DH)
                  <input
                    type="number"
                    value={editCreditLimit}
                    onChange={(e) => setEditCreditLimit(Number(e.target.value))}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Statut du compte
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    style={{ width: '100%', height: 38, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12 }}
                  >
                    <option value="Actif">Actif (Autorisé)</option>
                    <option value="À surveiller">À surveiller (Plafond proche)</option>
                    <option value="Bloqué">Bloqué (Impayé)</option>
                  </select>
                </label>
              </div>
            </div>

            <div
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setEditingClient(null)}
                style={{ height: 38, padding: '0 16px', background: '#ffffff', border: '1px solid #cbd5e1' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{ height: 38, padding: '0 20px', background: '#0284c7', borderColor: '#0369a1' }}
              >
                <Check size={14} /> Mettre à jour le client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal Confirmation Suppression Client ── */}
      {deleteConfirmClient && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmClient(null)}>
          <div
            className="record-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 440,
              width: '90%',
              padding: '24px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>
              Supprimer le client {deleteConfirmClient.code} ?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
              Êtes-vous certain de vouloir supprimer le compte client de <b>« {deleteConfirmClient.company} »</b> ? Cette opération supprimera la fiche de la base CRM.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setDeleteConfirmClient(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
              >
                Annuler
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => handleDeleteClient(deleteConfirmClient.id)}
                style={{ padding: '8px 16px', background: '#ef4444', borderColor: '#dc2626', color: '#ffffff' }}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Encaisser un Règlement Client ── */}
      {showPaymentModal && paymentClient && (
        <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <form
            className="record-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleRegisterPayment}
            style={{
              maxWidth: 600,
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
            {/* Modal Header */}
            <div
              className="modal-top"
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CreditCard size={18} />
                </div>
                <div>
                  <span className="eyebrow" style={{ color: '#10b981', fontWeight: 700, fontSize: 11 }}>
                    TRÉSORERIE · ENCAISSEMENT CLIENT
                  </span>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '1px 0 0' }}>
                    Encaisser un règlement client
                  </h2>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowPaymentModal(false)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '18px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 13,
                background: '#ffffff',
              }}
            >
              {/* Client Selection */}
              <div>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Sélectionner le compte client *
                  <select
                    value={paymentClient.id}
                    onChange={(e) => {
                      const found = clients.find((c) => c.id === Number(e.target.value));
                      if (found) {
                        setPaymentClient(found);
                        setPaymentAmount(found.current_balance > 0 ? found.current_balance : 10000);
                        setPaymentCollector(found.commercial_name || 'Youssef Bennani');
                      }
                    }}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 600 }}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company} ({c.code}) — Encours : {formatMoney(c.current_balance)} DH
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Client Debt Summary Card */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 10,
                }}
              >
                <div>
                  <small style={{ color: '#64748b', fontSize: 11, display: 'block', fontWeight: 600 }}>Encours Dû Actuel</small>
                  <strong style={{ color: paymentClient.current_balance > paymentClient.credit_limit ? '#ef4444' : '#0f172a', fontSize: 15 }}>
                    {formatMoney(paymentClient.current_balance)} DH
                  </strong>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontSize: 11, display: 'block', fontWeight: 600 }}>Plafond Autorisé</small>
                  <strong style={{ color: '#0f172a', fontSize: 15 }}>
                    {formatMoney(paymentClient.credit_limit)} DH
                  </strong>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontSize: 11, display: 'block', fontWeight: 600 }}>Statut Compte</small>
                  <span
                    className={`status-pill ${
                      paymentClient.status === 'Actif'
                        ? 'status-green'
                        : paymentClient.status === 'À surveiller'
                        ? 'status-amber'
                        : 'status-red'
                    }`}
                    style={{ marginTop: 2, display: 'inline-flex' }}
                  >
                    {paymentClient.status}
                  </span>
                </div>
              </div>

              {/* Amount to Collect */}
              <div>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Montant à encaisser (DH) *
                  <input
                    type="number"
                    min={1}
                    step={10}
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '0 12px',
                      borderRadius: 6,
                      border: '1px solid #10b981',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#047857',
                      background: '#f0fdf4',
                    }}
                  />
                </label>

                {/* Quick Amount Buttons */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(paymentClient.current_balance)}
                    style={{
                      background: paymentAmount === paymentClient.current_balance ? '#dcfce7' : '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 4,
                      padding: '3px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#047857',
                    }}
                  >
                    Tout solder ({formatMoney(paymentClient.current_balance)} DH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(Math.round(paymentClient.current_balance * 0.5))}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 4,
                      padding: '3px 8px',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: '#475569',
                    }}
                  >
                    50% ({formatMoney(Math.round(paymentClient.current_balance * 0.5))} DH)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(20000)}
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#475569' }}
                  >
                    20 000 DH
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(10000)}
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#475569' }}
                  >
                    10 000 DH
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(5000)}
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer', color: '#475569' }}
                  >
                    5 000 DH
                  </button>
                </div>

                {/* Balance preview banner */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                    marginTop: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: '#64748b' }}>Nouveau solde calculé après ce versement :</span>
                  <strong style={{ color: paymentClient.current_balance - paymentAmount > 0 ? '#0284c7' : '#16a34a' }}>
                    {formatMoney(Math.max(0, paymentClient.current_balance - paymentAmount))} DH
                  </strong>
                </div>
              </div>

              {/* Mode de règlement & Banque */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Mode de règlement *
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const m = e.target.value as any;
                      setPaymentMethod(m);
                      if (m === 'Espèces') setPaymentDocNum(`ESP-${Math.floor(100000 + Math.random() * 900000)}`);
                      else if (m === 'Carte bancaire') setPaymentDocNum(`CB-${Math.floor(100000 + Math.random() * 900000)}`);
                      else if (m === 'Chèque bancaire') setPaymentDocNum(`CHQ-${Math.floor(100000 + Math.random() * 900000)}`);
                      else if (m === 'Virement bancaire') setPaymentDocNum(`VIR-${Math.floor(100000 + Math.random() * 900000)}`);
                      else if (m === 'Traite / Effet') setPaymentDocNum(`EFF-${Math.floor(100000 + Math.random() * 900000)}`);
                    }}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 600 }}
                  >
                    <option value="Espèces">Espèces (Cash / Caisse)</option>
                    <option value="Carte bancaire">Carte bancaire (TPE / CMI / Card)</option>
                    <option value="Chèque bancaire">Chèque bancaire</option>
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Traite / Effet">Traite / Effet de commerce</option>
                  </select>
                </label>

                {paymentMethod !== 'Espèces' ? (
                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                    {paymentMethod === 'Carte bancaire' ? 'Banque acquéreur TPE' : 'Banque émettrice / de dépôt'}
                    <select
                      value={paymentBank}
                      onChange={(e) => setPaymentBank(e.target.value)}
                      style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    >
                      <option value="Attijariwafa Bank">Attijariwafa Bank</option>
                      <option value="Banque Populaire (BCP)">Banque Populaire (BCP)</option>
                      <option value="BMCE Bank of Africa">BMCE Bank of Africa</option>
                      <option value="CIH Bank">CIH Bank</option>
                      <option value="Société Générale Maroc">Société Générale Maroc</option>
                      <option value="BMCI">BMCI</option>
                      <option value="Crédit du Maroc (CDM)">Crédit du Maroc (CDM)</option>
                      <option value="Al Barid Bank">Al Barid Bank</option>
                    </select>
                  </label>
                ) : (
                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                    Caisse d'affectation
                    <input
                      disabled
                      value="Caisse Principale (Casablanca)"
                      style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f1f5f9', fontSize: 13 }}
                    />
                  </label>
                )}
              </div>

              {/* Document Number & Due date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  {paymentMethod === 'Carte bancaire'
                    ? 'N° Ticket TPE / Autorisation *'
                    : paymentMethod === 'Chèque bancaire'
                    ? 'N° du Chèque *'
                    : paymentMethod === 'Traite / Effet'
                    ? 'N° de la Traite *'
                    : paymentMethod === 'Virement bancaire'
                    ? 'Référence du Virement *'
                    : 'N° Quittance Caisse *'}
                  <input
                    required
                    value={paymentDocNum}
                    onChange={(e) => setPaymentDocNum(e.target.value)}
                    placeholder="Ex. CB-990182 ou CHQ-89012"
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>

                {(paymentMethod === 'Chèque bancaire' || paymentMethod === 'Traite / Effet') ? (
                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                    Date d'échéance du titre
                    <input
                      value={paymentDueDate}
                      onChange={(e) => setPaymentDueDate(e.target.value)}
                      placeholder="Ex. 25 Oct 2026"
                      style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </label>
                ) : (
                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                    Date du versement
                    <input
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </label>
                )}
              </div>

              {/* Collector & Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Encaissé par (Commercial / Caissier)
                  <input
                    value={paymentCollector}
                    onChange={(e) => setPaymentCollector(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Motif / Observations
                  <input
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Ex. Acompte sur commandes en cours..."
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              className="modal-actions"
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                position: 'sticky',
                bottom: 0,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                margin: 0,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowPaymentModal(false)}
                style={{ height: 38, padding: '0 16px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: 13 }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{
                  height: 38,
                  padding: '0 20px',
                  background: '#10b981',
                  borderColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Check size={16} /> Valider l'encaissement et générer le reçu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal Reçu de Règlement / Bon d'Encaissement Officiel ── */}
      {receiptModalData && (
        <div className="modal-backdrop" onClick={() => setReceiptModalData(null)}>
          <div
            className="record-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 680,
              width: '95%',
              maxHeight: '94vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: 0,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
              border: '1px solid #cbd5e1',
            }}
          >
            {/* Header Toolbar */}
            <div
              style={{
                padding: '14px 24px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Receipt size={20} style={{ color: '#34d399' }} />
                <div>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    DOCUMENT OFFICIEL · QUITTANCE DE RÈGLEMENT
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#ffffff' }}>
                    Reçu d'Encaissement {receiptModalData.receiptNumber}
                  </h3>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Printer size={14} /> Imprimer
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptModalData(null)}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    borderRadius: 6,
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div
              style={{
                padding: '28px 32px',
                overflowY: 'auto',
                flex: 1,
                background: '#ffffff',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {/* Company Letterhead */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    HERCULES DISTRIBUTION MAROC S.A.R.L.
                  </h2>
                  <p style={{ fontSize: 11.5, color: '#475569', margin: '4px 0 0' }}>
                    Société de Distribution & Négoce en Gros de Matériel et Équipements<br />
                    14, Boulevard Zerktouni, 4ème étage — Casablanca, Maroc<br />
                    Tél : +212 522 34 78 90 · E-mail : contact@hercules-distribution.ma
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: 11, color: '#475569' }}>
                  <div><b>ICE :</b> 002938472000091</div>
                  <div><b>RC :</b> 541982 Casablanca</div>
                  <div><b>IF :</b> 49281726 · <b>Patente :</b> 37194012</div>
                  <div><b>CNSS :</b> 8192736</div>
                </div>
              </div>

              {/* Title & Receipt Info Banner */}
              <div
                style={{
                  margin: '18px 0',
                  padding: '12px 18px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                    REÇU DE RÈGLEMENT CLIENT
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                    N° {receiptModalData.receiptNumber}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Date d'encaissement</span>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>{receiptModalData.date}</strong>
                </div>
              </div>

              {/* Client & Payment Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, background: '#ffffff' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    DÉBITEUR (CLIENT) :
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{receiptModalData.clientCompany}</div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 3 }}>Contact : {receiptModalData.clientName}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>ICE : <b>{receiptModalData.clientIce}</b></div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, background: '#ffffff' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    MODALITÉS DU RÈGLEMENT :
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0284c7' }}>{receiptModalData.paymentMethod}</div>
                  {receiptModalData.bankName && (
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Banque : {receiptModalData.bankName}</div>
                  )}
                  {receiptModalData.chequeOrDocNumber && (
                    <div style={{ fontSize: 12, color: '#475569' }}>N° Titre : <b>{receiptModalData.chequeOrDocNumber}</b></div>
                  )}
                  {receiptModalData.dueDate && (
                    <div style={{ fontSize: 12, color: '#475569' }}>Échéance : {receiptModalData.dueDate}</div>
                  )}
                </div>
              </div>

              {/* Big Highlight Amount Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '1.5px solid #10b981',
                  borderRadius: 10,
                  padding: '16px 20px',
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  MONTANT TOTAL DU RÈGLEMENT REÇU :
                </span>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                  {formatMoney(receiptModalData.amount)} DH
                </div>
              </div>

              {/* Account Statement Recap Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 12.5 }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>Ancien solde débiteur avant versement :</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{formatMoney(receiptModalData.previousBalance)} DH</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td style={{ padding: '8px 12px', color: '#16a34a', fontWeight: 600 }}>Moins : Règlement encaissé ce jour :</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>- {formatMoney(receiptModalData.amount)} DH</td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid #0f172a', background: '#f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>NOUVEAU SOLDE DÉBITEUR RESTANT :</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: receiptModalData.newBalance > 0 ? '#ef4444' : '#16a34a', fontSize: 14 }}>
                      {formatMoney(receiptModalData.newBalance)} DH
                    </td>
                  </tr>
                </tbody>
              </table>

              {receiptModalData.notes && (
                <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginBottom: 24 }}>
                  <b>Note / Observation :</b> {receiptModalData.notes}
                </div>
              )}

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 30, paddingTop: 10 }}>
                <div style={{ border: '1px dashed #cbd5e1', borderRadius: 8, padding: '16px', minHeight: 90, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Signature & Cachet du Dépositaire
                  </span>
                  <div style={{ height: 40 }} />
                </div>
                <div style={{ border: '1px dashed #cbd5e1', borderRadius: 8, padding: '16px', minHeight: 90, textAlign: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Visa & Cachet Hercules Distribution
                  </span>
                  <div style={{ fontSize: 11, color: '#0284c7', marginTop: 4, fontWeight: 600 }}>
                    Par : {receiptModalData.collectedBy}
                  </div>
                  <div style={{ height: 30 }} />
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 11, color: '#64748b' }}>
                Ce reçu constitue une pièce justificative officielle de paiement libératoire.
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => notify(`Reçu N° ${receiptModalData.receiptNumber} téléchargé en PDF.`)}
                  style={{ height: 36, padding: '0 14px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: 12.5 }}
                >
                  <Download size={14} /> Télécharger PDF
                </button>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setReceiptModalData(null)}
                  style={{ height: 36, padding: '0 16px', background: '#0284c7', fontSize: 12.5 }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
