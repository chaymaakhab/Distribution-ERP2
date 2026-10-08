import { useState } from 'react';
import {
  Users, Search, Filter, Phone, MessageSquare, ShieldAlert,
  ArrowUpRight, Building2, CheckCircle2, ChevronRight, Download, Plus,
  CreditCard, ExternalLink, X, Edit2, Trash2, Check,
} from 'lucide-react';
import { formatMoney } from '../api';

export interface CrmClient {
  id: number;
  code: string;
  name: string;
  company: string;
  city: string;
  phone: string;
  whatsapp: string;
  ice: string;
  commercial_name: string;
  price_tier: 'revendeur' | 'grossiste' | 'chantier' | 'standard';
  credit_limit: number;
  current_balance: number;
  overdue_amount: number;
  orders_count: number;
  last_order_days_ago: number;
  status: 'Actif' | 'Bloqué' | 'À surveiller';
}

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
  const [clients, setClients] = useState<CrmClient[]>(DEMO_CLIENTS);
  const [query, setQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<CrmClient | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

    notify(`Fiche client « ${editCompany} » mise à jour avec succès !`);
    setEditingClient(null);
  }

  function handleDeleteClient(id: number) {
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
  const [formCity, setFormCity] = useState('Casablanca');
  const [formIce, setFormIce] = useState('');
  const [formPriceTier, setFormPriceTier] = useState<'revendeur' | 'grossiste' | 'chantier' | 'standard'>('revendeur');
  const [formCreditLimit, setFormCreditLimit] = useState(50000);
  const [formCommercial, setFormCommercial] = useState('Yassine Mansouri');

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
    const nextCode = `CLT-${String(clients.length + 1).padStart(3, '0')}`;
    const newClient: CrmClient = {
      id: Date.now(),
      code: nextCode,
      name: formContact.trim() || 'Gérant Principal',
      company: formCompany.trim(),
      phone: formPhone.trim() || '+212 5 22 00 00 00',
      whatsapp: formPhone.replace(/[^0-9]/g, '') || '212600000000',
      city: formCity.trim(),
      ice: formIce.trim() || '00' + Math.floor(1000000000000 + Math.random() * 9000000000000),
      commercial_name: formCommercial,
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

    // Reset Form
    setFormCompany('');
    setFormContact('');
    setFormPhone('+212 5');
    setFormEmail('');
    setFormIce('');
    setFormCreditLimit(50000);

    notify(`Client « ${newClient.company} » (${newClient.code}) enregistré avec succès !`);
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
        <div className="heading-actions">
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

      {/* Table & filters */}
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
                      <span className="table-secondary">{c.commercial_name}</span>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Commercial Référent
                  <select
                    value={formCommercial}
                    onChange={(e) => setFormCommercial(e.target.value)}
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
                    <option value="Yassine Mansouri">Yassine Mansouri</option>
                    <option value="Sara El Amrani">Sara El Amrani</option>
                    <option value="Tariq Bennani">Tariq Bennani</option>
                  </select>
                </label>
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
                <small style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>Conditions tarifaires</small>
                <b style={{ textTransform: 'capitalize', color: '#0284c7', fontSize: 13 }}>Tarif {selectedClient.price_tier}</b>
                <div style={{ fontSize: '11.5px', marginTop: '4px', color: '#64748b' }}>Commercial: {selectedClient.commercial_name}</div>
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
              <button
                className="button-primary"
                onClick={() => setSelectedClient(null)}
                style={{
                  height: 38,
                  padding: '0 18px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
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
                    <option value="Youssef Bennani">Youssef Bennani (Casablanca)</option>
                    <option value="Ahmed Idrissi">Ahmed Idrissi (Marrakech / Sud)</option>
                    <option value="Salma Benjelloun">Salma Benjelloun (Rabat / Nord)</option>
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

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
