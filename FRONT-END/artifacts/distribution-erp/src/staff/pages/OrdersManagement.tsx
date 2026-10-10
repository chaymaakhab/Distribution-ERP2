import { useState, useEffect } from 'react';
import {
  ClipboardList, Search, Filter, Plus, CheckCircle2, XCircle,
  Eye, Download, ShoppingBag, Truck, Calendar, ArrowRight,
  PackageCheck, FileText, Printer, BadgeDollarSign, Edit2, Trash2, X, Check,
} from 'lucide-react';
import { api, formatMoney } from '../api';
import InvoiceDocumentModal, { type InvoiceData } from '../components/InvoiceDocumentModal';
import DeliverySlipDocumentModal, { type DeliverySlipData } from '../components/DeliverySlipDocumentModal';
import NewInvoiceModal from '../components/NewInvoiceModal';
import { RealOrdersExpeditionMap } from '../components/RealOrdersExpeditionMap';

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

const DEMO_CLIENTS = [
  { name: 'Atlas Équipements SARL', city: 'Casablanca', ice: '001524389000045' },
  { name: 'BatiPro Maroc', city: 'Rabat', ice: '002495810000078' },
  { name: 'Maison du Bricolage', city: 'Marrakech', ice: '001984220000063' },
  { name: 'Comptoir Al Amal', city: 'Fès', ice: '003147829000064' },
  { name: 'Nord Industrie', city: 'Tanger', ice: '002871040000091' },
  { name: 'Quincaillerie Saada', city: 'Agadir', ice: '004128900000019' },
  { name: 'Électricité Benali', city: 'Meknès', ice: '003901450000082' },
  { name: 'Chantiers El Idrissi', city: 'Kénitra', ice: '005230910000027' },
];

const ORDER_PRODUCTS_CATALOG = [
  { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', price_ht: 1040.83 },
  { sku: 'CUT-230D', name: 'Disque diamant 230 mm', price_ht: 157.92 },
  { sku: 'PMP-15HP', name: 'Pompe immergée 1.5 HP', price_ht: 3368.42 },
  { sku: 'CAB-3G25', name: 'Câble électrique 3G2.5 (100m)', price_ht: 1067.0 },
  { sku: 'GEN-5000', name: 'Groupe électrogène 5 kVA', price_ht: 7458.33 },
  { sku: 'CHA-100I', name: 'Charnière inox 100 mm (Lot 6)', price_ht: 77.52 },
];

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
  const [activeBcOrder, setActiveBcOrder] = useState<OrderItemRow | null>(null);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  useEffect(() => {
    api.getOrders()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: OrderItemRow[] = data.map((o: any) => ({
            ref: o.ref,
            customer: o.customer,
            city: o.city,
            date: o.date,
            total: Number(o.total) || 0,
            status: o.status,
            source: o.source || 'Commercial',
            items_count: o.items_count || (o.items ? o.items.length : 1),
          }));
          setOrders(mapped);
        }
      })
      .catch((err) => {
        console.warn('Backend orders indisponibles, utilisation liste locale:', err);
      });
  }, []);

  // Edit Order Modal State
  const [editingOrder, setEditingOrder] = useState<OrderItemRow | null>(null);
  const [editCustomer, setEditCustomer] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editTotal, setEditTotal] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<OrderItemRow['status']>('Confirmée');
  const [editSource, setEditSource] = useState('Commercial');

  // Delete Confirm State
  const [deleteConfirmOrder, setDeleteConfirmOrder] = useState<OrderItemRow | null>(null);

  function openEditOrder(ord: OrderItemRow) {
    setEditingOrder(ord);
    setEditCustomer(ord.customer);
    setEditCity(ord.city);
    setEditTotal(ord.total);
    setEditStatus(ord.status);
    setEditSource(ord.source);
  }

  function handleSaveEditOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!editingOrder) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.ref === editingOrder.ref) {
          return {
            ...o,
            customer: editCustomer.trim(),
            city: editCity.trim(),
            total: Number(editTotal) || o.total,
            status: editStatus,
            source: editSource,
          };
        }
        return o;
      })
    );

    api.updateOrder(editingOrder.ref, {
      city: editCity.trim(),
      total: Number(editTotal) || editingOrder.total,
      status: editStatus,
      source: editSource,
    }).catch(err => console.warn('Failed to update order on backend:', err));

    notify(`Commande ${editingOrder.ref} modifiée avec succès !`);
    setEditingOrder(null);
  }

  function handleDeleteOrder(ref: string) {
    api.deleteOrder(ref).catch(err => console.warn('Failed to delete order on backend:', err));
    setOrders((prev) => prev.filter((o) => o.ref !== ref));
    setDeleteConfirmOrder(null);
    notify(`Commande ${ref} supprimée / annulée avec succès.`);
  }

  // New Sales Order Modal State
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState(DEMO_CLIENTS[0].name);
  const [orderSource, setOrderSource] = useState<'Commercial' | 'Portail client' | 'Téléphone'>('Commercial');
  const [orderDeliveryDate, setOrderDeliveryDate] = useState('Livraison sous 24h');
  const [orderPaymentTerm, setOrderPaymentTerm] = useState('30 jours date facture');
  const [orderLines, setOrderLines] = useState([
    { sku: 'HRC-0850', name: 'Perceuse à percussion 850W', qty: 2, unit_price: 1040.83 },
    { sku: 'CUT-230D', name: 'Disque diamant 230 mm', qty: 5, unit_price: 157.92 },
  ]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function addOrderLine() {
    const item = ORDER_PRODUCTS_CATALOG[orderLines.length % ORDER_PRODUCTS_CATALOG.length];
    setOrderLines((prev) => [
      ...prev,
      { sku: item.sku, name: item.name, qty: 1, unit_price: item.price_ht },
    ]);
  }

  function removeOrderLine(idx: number) {
    if (orderLines.length <= 1) return;
    setOrderLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateOrderLine(idx: number, field: string, val: any) {
    setOrderLines((prev) =>
      prev.map((l, i) => {
        if (i !== idx) return l;
        if (field === 'sku') {
          const item = ORDER_PRODUCTS_CATALOG.find((it) => it.sku === val);
          if (item) {
            return { ...l, sku: item.sku, name: item.name, unit_price: item.price_ht };
          }
        }
        return { ...l, [field]: val };
      })
    );
  }

  const orderTotalHt = orderLines.reduce((s, l) => s + l.qty * l.unit_price, 0);
  const orderTotalTva = orderTotalHt * 0.2;
  const orderTotalTtc = orderTotalHt + orderTotalTva;

  function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    const cl = DEMO_CLIENTS.find((c) => c.name === selectedClientName) || DEMO_CLIENTS[0];
    const newRef = `CMD-${2407 + orders.length}`;
    const newOrder: OrderItemRow = {
      ref: newRef,
      customer: cl.name,
      city: cl.city,
      date: '07 Oct 2026',
      total: Math.round(orderTotalTtc * 100) / 100,
      status: 'À valider',
      source: orderSource,
      items_count: orderLines.length,
    };

    setOrders([newOrder, ...orders]);
    setShowNewOrderModal(false);

    api.createOrder({
      ref: newOrder.ref,
      customer: newOrder.customer,
      city: newOrder.city,
      date: newOrder.date,
      total: newOrder.total,
      status: newOrder.status,
      source: newOrder.source,
    }).catch(err => console.warn('Failed to save order to backend:', err));

    notify(`Bon de Commande ${newOrder.ref} pour ${newOrder.customer} enregistré avec succès !`);
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
        <div className="heading-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: 3, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              className={viewMode === 'table' ? 'button-primary' : 'button-secondary'}
              onClick={() => setViewMode('table')}
              style={{ height: 32, fontSize: 12, padding: '0 10px', gap: 5 }}
            >
              <ClipboardList size={13} /> Liste
            </button>
            <button
              className={viewMode === 'map' ? 'button-primary' : 'button-secondary'}
              onClick={() => setViewMode('map')}
              style={{ height: 32, fontSize: 12, padding: '0 10px', gap: 5 }}
            >
              <Truck size={13} /> Carte Expéditions (GPS)
            </button>
          </div>

          <button className="button-secondary" onClick={exportCsv}>
            <Download size={15} /> Exporter CSV
          </button>
          <button className="button-secondary" onClick={() => setShowNewInvoiceModal(true)}>
            <FileText size={15} /> Nouvelle Facture
          </button>
          <button className="button-primary" onClick={() => setShowNewOrderModal(true)}>
            <Plus size={15} /> Nouveau Bon de Commande
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

      {/* Real Interactive Map for Orders & Expeditions */}
      {viewMode === 'map' && (
        <section className="panel" style={{ padding: '16px', borderRadius: '12px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span className="eyebrow">FLUX LOGISTIQUES & LIVRAISONS</span>
              <h2 style={{ margin: 0, fontSize: 16 }}>Carte des Expéditions vers les Clients</h2>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {orders.length} commandes en cours d’expédition / livraison
            </div>
          </div>
          <RealOrdersExpeditionMap
            orders={filtered}
            onInspectOrder={(o) => setActiveBcOrder(o)}
          />
        </section>
      )}

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
                        title="Consulter le Bon de Commande (BC)"
                        style={{ color: '#f59e0b' }}
                        onClick={() => setActiveBcOrder(ord)}
                      >
                        <ClipboardList size={14} />
                      </button>
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
                        title="Modifier cette commande"
                        style={{ color: '#0284c7' }}
                        onClick={() => openEditOrder(ord)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="row-action"
                        title="Supprimer / Annuler cette commande"
                        style={{ color: '#ef4444' }}
                        onClick={() => setDeleteConfirmOrder(ord)}
                      >
                        <Trash2 size={14} />
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

      {/* ── Nouveau Bon de Commande Modal (Papier Blanc / Sortir du Dark Mode) ── */}
      {showNewOrderModal && (
        <div className="doc-modal-backdrop" onClick={() => setShowNewOrderModal(false)}>
          <form
            className="doc-modal-container"
            onSubmit={handleCreateOrder}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 720,
              width: '95%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: 0,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 24px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0284c7',
                  }}
                >
                  <ClipboardList size={18} />
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    VENTES & DISTRIBUTION · ÉMISSION COMMANDE
                  </span>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '1px 0 0' }}>
                    Nouveau Bon de Commande Client (BC)
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  color: '#64748b',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <XCircle size={17} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                background: '#ffffff',
                color: '#0f172a',
              }}
            >
              {/* Client & City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    CLIENT DESTINATAIRE *
                  </label>
                  <select
                    value={selectedClientName}
                    onChange={(e) => setSelectedClientName(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '12.5px',
                    }}
                  >
                    {DEMO_CLIENTS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.city} · ICE: {c.ice})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    CANAL DE PRISE DE COMMANDE
                  </label>
                  <select
                    value={orderSource}
                    onChange={(e) => setOrderSource(e.target.value as any)}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '12.5px',
                    }}
                  >
                    <option value="Commercial">Commercial terrain</option>
                    <option value="Portail client">Portail client B2B</option>
                    <option value="Téléphone">Téléphone / Comptoir</option>
                  </select>
                </div>
              </div>

              {/* Delivery & Payment Term */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    DÉLAI DE LIVRAISON SOUHAITÉ
                  </label>
                  <input
                    value={orderDeliveryDate}
                    onChange={(e) => setOrderDeliveryDate(e.target.value)}
                    placeholder="Ex. Livraison sous 24h"
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '12.5px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '5px' }}>
                    MODALITÉ DE PAIEMENT PRÉVUE
                  </label>
                  <select
                    value={orderPaymentTerm}
                    onChange={(e) => setOrderPaymentTerm(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '12.5px',
                    }}
                  >
                    <option value="30 jours date facture">30 jours date facture</option>
                    <option value="60 jours fin de mois">60 jours fin de mois (Traite / LCR)</option>
                    <option value="Comptant livraison">Comptant à la livraison (Chèque)</option>
                    <option value="Espèces">Espèces au déchargement</option>
                  </select>
                </div>
              </div>

              {/* Order Lines */}
              <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                    ARTICLES COMMANDÉS ({orderLines.length})
                  </span>
                  <button
                    type="button"
                    onClick={addOrderLine}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 0,
                      padding: '5px 12px',
                      borderRadius: '5px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <Plus size={13} /> Ajouter un article
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {orderLines.map((l, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.6fr 75px 95px 95px auto',
                        gap: '8px',
                        alignItems: 'center',
                        background: '#f8fafc',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <select
                        value={l.sku}
                        onChange={(e) => updateOrderLine(idx, 'sku', e.target.value)}
                        style={{
                          height: '34px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontSize: '12px',
                          borderRadius: '5px',
                          padding: '0 8px',
                        }}
                      >
                        {ORDER_PRODUCTS_CATALOG.map((p) => (
                          <option key={p.sku} value={p.sku}>
                            {p.name} ({formatMoney(p.price_ht)} DH)
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={l.qty}
                        onChange={(e) => updateOrderLine(idx, 'qty', Number(e.target.value))}
                        title="Quantité"
                        style={{
                          height: '34px',
                          width: '100%',
                          textAlign: 'center',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontSize: '12px',
                          borderRadius: '5px',
                        }}
                      />

                      <input
                        type="number"
                        step="0.5"
                        value={l.unit_price}
                        onChange={(e) => updateOrderLine(idx, 'unit_price', Number(e.target.value))}
                        title="Prix Unitaire HT"
                        style={{
                          height: '34px',
                          width: '100%',
                          textAlign: 'right',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontSize: '12px',
                          borderRadius: '5px',
                          paddingRight: '6px',
                        }}
                      />

                      <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                        {formatMoney(l.qty * l.unit_price)} DH
                      </div>

                      <button
                        type="button"
                        onClick={() => removeOrderLine(idx)}
                        disabled={orderLines.length <= 1}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: orderLines.length <= 1 ? '#cbd5e1' : '#ef4444',
                          cursor: orderLines.length <= 1 ? 'not-allowed' : 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Calculations */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  background: '#f8fafc',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginTop: '4px',
                }}
              >
                <div style={{ width: '250px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Total Marchandise HT :</span>
                    <b style={{ color: '#0f172a' }}>{formatMoney(orderTotalHt)} DH</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>TVA Facturée (20%) :</span>
                    <b style={{ color: '#0f172a' }}>{formatMoney(orderTotalTva)} DH</b>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: '6px',
                      fontSize: '14px',
                      color: '#0284c7',
                      fontWeight: 800,
                    }}
                  >
                    <span>Total TTC Commande :</span>
                    <span>{formatMoney(orderTotalTtc)} DH</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '12px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowNewOrderModal(false)}
                style={{
                  height: '38px',
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
                  height: '38px',
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
                <CheckCircle2 size={16} /> Enregistrer le Bon de Commande
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal Modifier Commande ── */}
      {editingOrder && (
        <div className="modal-backdrop" onClick={() => setEditingOrder(null)}>
          <form
            className="record-modal"
            onSubmit={handleSaveEditOrder}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 580,
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
                  MODIFICATION COMMANDE CLIENT · {editingOrder.ref}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Modifier {editingOrder.ref}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEditingOrder(null)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Client destinataire *
                  <input
                    required
                    value={editCustomer}
                    onChange={(e) => setEditCustomer(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Ville *
                  <input
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Montant total TTC (DH) *
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editTotal}
                    onChange={(e) => setEditTotal(Number(e.target.value))}
                    style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Statut de la commande
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    style={{ width: '100%', height: 38, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  >
                    <option value="À valider">À valider</option>
                    <option value="Confirmée">Confirmée</option>
                    <option value="En préparation">En préparation</option>
                    <option value="Préparée">Préparée</option>
                    <option value="En livraison">En livraison</option>
                    <option value="Livrée">Livrée</option>
                    <option value="Annulée">Annulée</option>
                  </select>
                </label>
              </div>

              <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                Canal / Source
                <select
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                  style={{ width: '100%', height: 38, padding: '0 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  <option value="Commercial">Commercial (Vente terrain)</option>
                  <option value="Portail client">Portail client B2B</option>
                  <option value="Téléphone">Téléphone / WhatsApp</option>
                  <option value="Livreur-pré-vendeur">Livreur-pré-vendeur (Van Sales)</option>
                </select>
              </label>
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
                onClick={() => setEditingOrder(null)}
                style={{ height: 38, padding: '0 16px', background: '#ffffff', border: '1px solid #cbd5e1' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{ height: 38, padding: '0 20px', background: '#0284c7', borderColor: '#0369a1' }}
              >
                <Check size={14} /> Mettre à jour la commande
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal Confirmation Suppression Commande ── */}
      {deleteConfirmOrder && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmOrder(null)}>
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
              Supprimer la commande {deleteConfirmOrder.ref} ?
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
              Êtes-vous certain de vouloir annuler et supprimer la commande de <b>« {deleteConfirmOrder.customer} »</b> pour un montant de <b>{formatMoney(deleteConfirmOrder.total)} DH</b> ?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setDeleteConfirmOrder(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
              >
                Garder la commande
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => handleDeleteOrder(deleteConfirmOrder.ref)}
                style={{ padding: '8px 16px', background: '#ef4444', borderColor: '#dc2626', color: '#ffffff' }}
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Visualisation Bon de Commande (BC) ── */}
      {activeBcOrder && (
        <div className="modal-backdrop" onClick={() => setActiveBcOrder(null)}>
          <div
            className="record-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 600,
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
                  DOCUMENT OFFICIEL · BON DE COMMANDE
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  Bon de Commande {activeBcOrder.ref}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setActiveBcOrder(null)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Client</span>
                  <b style={{ fontSize: 13, display: 'block', color: '#0f172a' }}>{activeBcOrder.customer}</b>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Ville: {activeBcOrder.city}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Date & Source</span>
                  <b style={{ fontSize: 13, display: 'block', color: '#0f172a' }}>{activeBcOrder.date}</b>
                  <span style={{ fontSize: 11, color: '#0284c7' }}>Canal: {activeBcOrder.source}</span>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Lignes du Bon de Commande ({activeBcOrder.items_count} articles) :
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ORDER_PRODUCTS_CATALOG.slice(0, activeBcOrder.items_count || 3).map((item, idx) => (
                    <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px dashed #f1f5f9' }}>
                      <span>{item.name} (×{idx + 1})</span>
                      <b style={{ color: '#0f172a' }}>{formatMoney(item.price_ht * (idx + 1) * 1.2)} DH TTC</b>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid #cbd5e1' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Statut: <b>{activeBcOrder.status}</b></span>
                  <strong style={{ fontSize: 16, color: '#0284c7' }}>
                    Total TTC : {formatMoney(activeBcOrder.total)} DH
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  window.print();
                }}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Printer size={14} /> Imprimer le Bon de Commande
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={() => setActiveBcOrder(null)}
                style={{ background: '#0284c7', borderColor: '#0369a1' }}
              >
                Fermer
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
