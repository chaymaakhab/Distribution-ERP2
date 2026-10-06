import { useState } from 'react';
import {
  Users, ClipboardCheck, AlertTriangle, MessageSquare, Phone,
  CheckCircle2, XCircle, ShoppingBag, ArrowRight, DollarSign,
  Clock, Package, TrendingUp, Calendar, ChevronRight,
} from 'lucide-react';
import { formatMoney } from '../api';

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
}

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
  },
];

const INACTIVE_CLIENTS = [
  {
    name: 'Maison du Bricolage',
    city: 'Marrakech',
    contact: 'Hassan Mansouri',
    phone: '+212 524 38 05 17',
    whatsapp: '212662112233',
    days_inactive: 18,
    last_order_amount: '9 735 DH',
  },
  {
    name: 'Comptoir Al Amal',
    city: 'Fès',
    contact: 'Mohamed Fassi',
    phone: '+212 535 61 20 08',
    whatsapp: '212663445566',
    days_inactive: 22,
    last_order_amount: '32 100 DH',
  },
  {
    name: 'Quincaillerie Saada',
    city: 'Agadir',
    contact: 'Omar Slaoui',
    phone: '+212 528 84 55 60',
    whatsapp: '212664778899',
    days_inactive: 32,
    last_order_amount: '14 950 DH',
  },
];

export default function SalesDashboard({ onNavigate }: { onNavigate?: (module: string) => void }) {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>(INITIAL_PENDING_ORDERS);
  const [rejectModalOrder, setRejectModalOrder] = useState<PendingOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleValidate(order: PendingOrder) {
    setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
    notify(`Commande ${order.ref} validée avec succès ! Stock réservé et transmise à la préparation.`);
  }

  function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectModalOrder) return;
    setPendingOrders((prev) => prev.filter((o) => o.id !== rejectModalOrder.id));
    notify(`Commande ${rejectModalOrder.ref} refusée (Motif: ${rejectReason}). Client notifié.`);
    setRejectModalOrder(null);
    setRejectReason('');
  }

  return (
    <div className="dashboard-page sales-workspace">
      {/* Header */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">ESPACE COMMERCIAL <span className="eyebrow-sep">/</span> GESTION DES VENTES & PORTEFEUILLE</span>
          <h1>Cockpit Commercial<span className="title-period">.</span></h1>
          <p>Validez les commandes de vos clients, suivez vos créances et relancez les clients inactifs.</p>
        </div>
        <button className="button-primary" onClick={() => onNavigate?.('orders')}>
          <ShoppingBag size={16} /> Saisir une commande
        </button>
      </div>

      {/* KPI Cards */}
      <div className="metric-grid">
        <div className="metric-card metric-blue">
          <div className="metric-top">
            <span>Commandes à valider</span>
            <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <ClipboardCheck size={16} />
            </div>
          </div>
          <div className="metric-number">{pendingOrders.length}</div>
          <div className="metric-foot">
            <span className="metric-change change-up">{formatMoney(pendingOrders.reduce((a, b) => a + b.total_ttc, 0))} DH</span>
            <span>En attente de validation</span>
          </div>
        </div>

        <div className="metric-card metric-green">
          <div className="metric-top">
            <span>Mes Ventes du mois</span>
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

        <div className="metric-card metric-amber">
          <div className="metric-top">
            <span>Clients à relancer</span>
            <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-number">{INACTIVE_CLIENTS.length}</div>
          <div className="metric-foot">
            <span className="metric-change change-down">&gt; 15 jours</span>
            <span>Sans commande récente</span>
          </div>
        </div>

        <div className="metric-card metric-cyan">
          <div className="metric-top">
            <span>Portefeuille Actif</span>
            <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
              <Users size={16} />
            </div>
          </div>
          <div className="metric-number">28</div>
          <div className="metric-foot">
            <span>Encours: 184 200 DH</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Orders to validate & Inactive clients */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.2fr)', gap: '16px' }}>
        {/* Orders Pending Validation (CDC p.9-10) */}
        <section className="panel" style={{ padding: '16px' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">FILE D'ATTENTE CLIENTS (PORTAIL MOBILE & WEB)</span>
              <h2>Commandes clients à valider ({pendingOrders.length})</h2>
            </div>
            <span className="status-pill status-amber"><i /> {pendingOrders.length} à traiter</span>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '36px 20px' }}>
              <CheckCircle2 size={32} style={{ color: '#22c55e', margin: '0 auto 8px' }} />
              <b>Toutes les commandes clients sont validées !</b>
              <span>Aucune commande en attente pour le moment.</span>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="table-ref">{ord.ref}</span>
                        <b style={{ fontSize: '13px' }}>{ord.client}</b>
                        <small style={{ color: 'var(--muted)' }}>· {ord.city}</small>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                        Envoyée: {ord.date} · Livraison souhaitée: <b>{ord.desired_date}</b>
                      </div>
                      {ord.note && (
                        <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', fontStyle: 'italic' }}>
                          Note client : « {ord.note} »
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--text)' }}>{formatMoney(ord.total_ttc)} DH</strong>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{ord.items_count} articles</div>
                      {ord.credit_status === 'depasse' && (
                        <span className="status-pill status-red" style={{ fontSize: '10px', marginTop: '4px' }}>
                          <AlertTriangle size={10} /> Crédit dépassé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for this order */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                    <button
                      className="button-secondary"
                      style={{ fontSize: '11px', height: '30px', padding: '0 10px', color: '#ef4444' }}
                      onClick={() => setRejectModalOrder(ord)}
                    >
                      <XCircle size={13} /> Refuser avec motif
                    </button>
                    <button
                      className="button-primary"
                      style={{ fontSize: '11px', height: '30px', padding: '0 12px', background: '#22c55e', borderColor: '#16a34a' }}
                      onClick={() => handleValidate(ord)}
                    >
                      <CheckCircle2 size={13} /> Valider la commande
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Clients to re-engage (CDC p.14) */}
        <section className="panel" style={{ padding: '16px' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RELANCE PROACTIVE (&gt; 15 JOURS SANS COMMANDE)</span>
              <h2>Clients à relancer</h2>
            </div>
            <button className="more-button" onClick={() => onNavigate?.('customers')}>
              Voir CRM <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {INACTIVE_CLIENTS.map((cl, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  padding: '12px',
                  background: 'var(--navy-2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <b>{cl.name}</b>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      {cl.contact} · {cl.city}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#f59e0b', marginTop: '3px' }}>
                      Inactif depuis <b>{cl.days_inactive} jours</b> (Dernière cde: {cl.last_order_amount})
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a
                      href={`https://wa.me/${cl.whatsapp}?text=Bonjour%20${encodeURIComponent(cl.contact)},%20votre%20commercial%20Hercules%20Distribution.%20Avez-vous%20besoin%20d'un%20r%C3%A9assortiment%20de%20stock%20cette%20semaine%20?`}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary"
                      style={{ height: '30px', padding: '0 8px', color: '#22c55e', gap: '4px' }}
                      title="Relancer sur WhatsApp"
                    >
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                    <a
                      href={`tel:${cl.phone}`}
                      className="button-secondary"
                      style={{ height: '30px', padding: '0 8px', gap: '4px' }}
                      title="Appeler"
                    >
                      <Phone size={13} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)', fontSize: '11.5px', color: 'var(--text)' }}>
            💡 <b>Règle métier CDC :</b> Le commercial est notifié automatiquement après 15 jours sans commande d'un client. Les modèles de relance sont personnalisés en Français ou Darija.
          </div>
        </section>
      </div>

      {/* Reject Modal */}
      {rejectModalOrder && (
        <div className="modal-backdrop" onClick={() => setRejectModalOrder(null)}>
          <form className="record-modal" onSubmit={handleRejectSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">REFUS DE COMMANDE · {rejectModalOrder.ref}</span>
                <h2>Motif de refus</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setRejectModalOrder(null)}>✕</button>
            </div>
            <p className="modal-note">
              Conformément au cahier des charges, tout refus de commande client doit obligatoirement comporter un motif transmis au client.
            </p>
            <label className="field-label">
              Sélectionnez ou saisissez le motif :
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
                <option value="Adresse de livraison hors zone de tournée">Adresse de livraison hors zone de tournée</option>
                <option value="Factures antérieures impayées en attente de règlement">Factures antérieures impayées en attente de règlement</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={() => setRejectModalOrder(null)}>Annuler</button>
              <button className="button-primary" type="submit" style={{ background: '#ef4444', borderColor: '#dc2626' }}>
                Confirmer le refus
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
