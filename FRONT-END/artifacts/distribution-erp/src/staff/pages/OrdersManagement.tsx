import { useState } from 'react';
import {
  ClipboardList, Search, Filter, Plus, CheckCircle2, XCircle,
  Eye, Download, ShoppingBag, Truck, Calendar, ArrowRight,
  PackageCheck, FileText, Printer, BadgeDollarSign,
} from 'lucide-react';
import { formatMoney } from '../api';
import InvoiceDocumentModal, { type InvoiceData } from '../components/InvoiceDocumentModal';
import DeliverySlipDocumentModal, { type DeliverySlipData } from '../components/DeliverySlipDocumentModal';
import NewInvoiceModal from '../components/NewInvoiceModal';

interface OrderItemRow {
  ref: string;
  customer: string;
  city: string;
  date: string;
  total: number;
  status: 'À valider' | 'Confirmée' | 'En préparation' | 'Préparée' | 'En livraison' | 'Livrée' | 'Annulée';
  source: string;
  items_count: number;
}

const INITIAL_ORDERS: OrderItemRow[] = [
  { ref: 'CMD-2406', customer: 'Atlas Équipements SARL', city: 'Casablanca', date: '28 Fév 2025', total: 24860.0, status: 'À valider', source: 'Portail client', items_count: 5 },
  { ref: 'CMD-2405', customer: 'BatiPro Maroc', city: 'Rabat', date: '28 Fév 2025', total: 18420.5, status: 'En préparation', source: 'Commercial', items_count: 4 },
  { ref: 'CMD-2404', customer: 'Maison du Bricolage', city: 'Marrakech', date: '27 Fév 2025', total: 9735.0, status: 'Confirmée', source: 'Portail client', items_count: 3 },
  { ref: 'CMD-2403', customer: 'Comptoir Al Amal', city: 'Fès', date: '27 Fév 2025', total: 32100.0, status: 'En livraison', source: 'Commercial', items_count: 8 },
  { ref: 'CMD-2402', customer: 'Nord Industrie', city: 'Tanger', date: '26 Fév 2025', total: 6280.0, status: 'Livrée', source: 'Commercial', items_count: 2 },
  { ref: 'CMD-2401', customer: 'Quincaillerie Saada', city: 'Agadir', date: '26 Fév 2025', total: 14950.0, status: 'En livraison', source: 'Téléphone', items_count: 6 },
  { ref: 'CMD-2400', customer: 'Électricité Benali', city: 'Meknès', date: '26 Fév 2025', total: 4120.0, status: 'Préparée', source: 'Commercial', items_count: 3 },
  { ref: 'CMD-2399', customer: 'Chantiers El Idrissi', city: 'Kénitra', date: '25 Fév 2025', total: 51700.0, status: 'Livrée', source: 'Portail client', items_count: 12 },
];

export default function OrdersManagement() {
  const [orders, setOrders] = useState<OrderItemRow[]>(INITIAL_ORDERS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<OrderItemRow | null>(null);
  const [activeBlOrder, setActiveBlOrder] = useState<OrderItemRow | null>(null);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = orders.filter((o) => {
    const matchQ =
      o.ref.toLowerCase().includes(query.toLowerCase()) ||
      o.customer.toLowerCase().includes(query.toLowerCase()) ||
      o.city.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchQ && matchStatus;
  });

  function validateOrder(ref: string) {
    setOrders((prev) =>
      prev.map((o) => (o.ref === ref ? { ...o, status: 'Confirmée' } : o))
    );
    notify(`Commande ${ref} validée avec succès ! Stock réservé.`);
  }

  function exportCsv() {
    const csv = [
      'Réf;Client;Ville;Date;Total TTC;Statut;Source',
      ...filtered.map(
        (o) =>
          `"${o.ref}";"${o.customer}";"${o.city}";"${o.date}";"${o.total}";"${o.status}";"${o.source}"`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commandes-${Date.now()}.csv`;
    link.click();
    notify('Export CSV des commandes téléchargé.');
  }

  return (
    <div className="module-page orders-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">VENTES & OPÉRATIONS <span className="heading-slash">/</span> SUIVI DES COMMANDES</div>
          <h1>Gestion des Commandes</h1>
          <p>Supervision des commandes multi-canaux (Portail client, Commercial, Téléphone) et ordonnancement logistique.</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={exportCsv}>
            <Download size={15} /> Exporter CSV
          </button>
          <button className="button-primary" onClick={() => setShowNewInvoiceModal(true)}>
            <Plus size={15} /> Nouvelle Facture
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>À valider</span>
          <strong className="needs-action">{orders.filter((o) => o.status === 'À valider').length} commandes</strong>
        </div>
        <div className="summary-box">
          <span>En préparation</span>
          <strong className="neutral">{orders.filter((o) => o.status === 'En préparation').length} commandes</strong>
        </div>
        <div className="summary-box">
          <span>En tournée / livraison</span>
          <strong className="blue">{orders.filter((o) => o.status === 'En livraison').length} tournées</strong>
        </div>
        <div className="summary-box">
          <span>Total volume ce mois</span>
          <strong className="neutral">{formatMoney(orders.reduce((a, b) => a + b.total, 0))} DH</strong>
        </div>
      </div>

      {/* Main Table Panel */}
      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">REGISTRE CENTRAL</span>
            <h2>Toutes les commandes ({filtered.length})</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} commandes affichées
          </div>
        </div>

        <div className="table-tools">
          <div className="table-tabs">
            {['all', 'À valider', 'Confirmée', 'En préparation', 'Préparée', 'En livraison', 'Livrée'].map((st) => (
              <button
                key={st}
                className={`table-tab ${statusFilter === st ? 'active-tab' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'all' ? 'Toutes' : st}
              </button>
            ))}
          </div>
          <div className="tool-actions">
            <label className="search-field">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher référence, client, ville..."
              />
            </label>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>RÉFÉRENCE</th>
                <th>CLIENT DESTINATAIRE</th>
                <th>VILLE & SOURCE</th>
                <th>DATE SAISIE</th>
                <th>MONTANT TOTAL TTC</th>
                <th>STATUT COMMANDE</th>
                <th>ACTIONS RAPIDES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ord) => (
                <tr key={ord.ref}>
                  <td>
                    <span className="table-ref">{ord.ref}</span>
                    <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px' }}>
                      {ord.items_count} articles
                    </small>
                  </td>
                  <td>
                    <b className="table-main">{ord.customer}</b>
                  </td>
                  <td>
                    <span>{ord.city}</span>
                    <small style={{ display: 'block', color: 'var(--muted)' }}>Source : {ord.source}</small>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{ord.date}</span>
                  </td>
                  <td className="table-amount">
                    <b>{formatMoney(ord.total)} DH</b>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        ord.status === 'Livrée'
                          ? 'status-green'
                          : ord.status === 'À valider'
                          ? 'status-amber'
                          : ord.status === 'En livraison'
                          ? 'status-blue'
                          : ord.status === 'En préparation' || ord.status === 'Préparée'
                          ? 'status-blue'
                          : 'status-muted'
                      }`}
                    >
                      <i /> {ord.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      {ord.status === 'À valider' && (
                        <button
                          className="button-primary"
                          style={{ fontSize: '11px', height: '28px', padding: '0 8px', background: '#22c55e', borderColor: '#16a34a' }}
                          onClick={() => validateOrder(ord.ref)}
                          title="Valider en 1 clic"
                        >
                          <CheckCircle2 size={13} /> Valider
                        </button>
                      )}
                      <button
                        className="row-action"
                        title="Éditer / Imprimer le Bon de Livraison (BL)"
                        style={{ color: '#38bdf8' }}
                        onClick={() => setActiveBlOrder(ord)}
                      >
                        <Truck size={14} />
                      </button>
                      <button
                        className="row-action"
                        title="Éditer / Imprimer la Facture officielle"
                        style={{ color: '#22c55e' }}
                        onClick={() => setActiveInvoiceOrder(ord)}
                      >
                        <FileText size={14} />
                      </button>
                      <button
                        className="row-action"
                        title="Voir détail"
                        onClick={() => notify(`Détail commande ${ord.ref} · Client ${ord.customer}.`)}
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Official Invoice Document Modal ── */}
      {activeInvoiceOrder && (
        <InvoiceDocumentModal
          invoice={{
            ref: `FAC-2025-${activeInvoiceOrder.ref.replace('CMD-', '')}`,
            order_ref: activeInvoiceOrder.ref,
            client: activeInvoiceOrder.customer,
            client_city: activeInvoiceOrder.city,
            client_phone: '+212 522 34 78 90',
            date_issued: activeInvoiceOrder.date,
            due_date: '30 jours date facture',
            status: activeInvoiceOrder.status === 'Livrée' ? 'Payée' : 'Impayée',
            payment_method: 'Virement bancaire / Chèque',
            lines: [
              { sku: 'HRC-0850', name: 'Articles commandés · ' + activeInvoiceOrder.customer, qty: activeInvoiceOrder.items_count, unit_price_ht: Math.round((activeInvoiceOrder.total / 1.2 / activeInvoiceOrder.items_count) * 100) / 100, tva_rate: 20 },
            ],
          }}
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}

      {/* ── Official Delivery Slip (BL) Document Modal ── */}
      {activeBlOrder && (
        <DeliverySlipDocumentModal
          slip={{
            bl_ref: `BL-2026-${activeBlOrder.ref.replace('CMD-', '')}`,
            order_ref: activeBlOrder.ref,
            client: activeBlOrder.customer,
            client_address: `Zone industrielle & commerciale, ${activeBlOrder.city}`,
            client_city: activeBlOrder.city,
            client_phone: '+212 522 34 78 90',
            whatsapp: '212661234567',
            driver_name: 'Mehdi Lahlou',
            vehicle: 'Renault Master 23-A-54321',
            tour_ref: 'TRN-2026-08',
            date_dispatched: activeBlOrder.date,
            date_delivered: activeBlOrder.status === 'Livrée' ? activeBlOrder.date : undefined,
            warehouse: 'Casablanca (DEP-01 Central)',
            status: activeBlOrder.status === 'Livrée' ? 'Livré' : activeBlOrder.status === 'En livraison' ? 'En cours' : 'En attente',
            amount_to_collect: activeBlOrder.total,
            receiver_name: activeBlOrder.customer.split(' ')[0],
            lines: [
              { sku: 'SKU-' + activeBlOrder.ref.slice(-4), name: 'Articles commandés (' + activeBlOrder.items_count + ' réf.)', qty_ordered: activeBlOrder.items_count, qty_delivered: activeBlOrder.items_count, unit: 'Colis' },
            ],
          }}
          onClose={() => setActiveBlOrder(null)}
        />
      )}

      {/* ── New Invoice Modal ── */}
      {showNewInvoiceModal && (
        <NewInvoiceModal
          onClose={() => setShowNewInvoiceModal(false)}
          onCreate={(inv) => {
            notify(`Facture ${inv.ref} créée avec succès pour ${inv.client} !`);
          }}
        />
      )}

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
