import { useState } from 'react';
import {
  Users, Search, Filter, Phone, MessageSquare, ShieldAlert,
  ArrowUpRight, Building2, CheckCircle2, ChevronRight, Download, Plus,
  CreditCard, ExternalLink, X,
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
          <button className="button-primary">
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

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="modal-backdrop" onClick={() => setSelectedClient(null)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">{selectedClient.code} · FICHE CLIENT</span>
                <h2>{selectedClient.company}</h2>
              </div>
              <button className="icon-button" onClick={() => setSelectedClient(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '16px 0' }}>
              <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px' }}>
                <small style={{ color: 'var(--muted)', display: 'block' }}>Interlocuteur</small>
                <b>{selectedClient.name}</b>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>{selectedClient.phone}</div>
              </div>
              <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px' }}>
                <small style={{ color: 'var(--muted)', display: 'block' }}>Mentions légales</small>
                <b>ICE: {selectedClient.ice}</b>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Ville: {selectedClient.city}</div>
              </div>
              <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px' }}>
                <small style={{ color: 'var(--muted)', display: 'block' }}>Conditions tarifaires</small>
                <b style={{ textTransform: 'capitalize' }}>Tarif {selectedClient.price_tier}</b>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Commercial: {selectedClient.commercial_name}</div>
              </div>
              <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px' }}>
                <small style={{ color: 'var(--muted)', display: 'block' }}>Encours & Crédit</small>
                <b>{formatMoney(selectedClient.current_balance)} / {formatMoney(selectedClient.credit_limit)} DH</b>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Commandes passées: {selectedClient.orders_count}</div>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className={`button-secondary ${selectedClient.status === 'Actif' ? 'text-red-500' : 'text-green-500'}`}
                onClick={() => {
                  toggleStatus(selectedClient.id);
                  setSelectedClient((prev) => (prev ? { ...prev, status: prev.status === 'Actif' ? 'Bloqué' : 'Actif' } : null));
                }}
              >
                {selectedClient.status === 'Actif' ? 'Bloquer l’accès portail' : 'Réactiver l’accès'}
              </button>
              <button className="button-primary" onClick={() => setSelectedClient(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
