import { useState } from 'react';
import {
  Boxes, Warehouse, ArrowDownRight, ArrowUpRight, ArrowLeftRight,
  AlertTriangle, CheckCircle2, Clock, Plus, Download, ShieldCheck,
  Calendar, Layers, X,
} from 'lucide-react';
import { formatMoney } from '../api';

interface StockItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  warehouse: 'Casablanca (DEP-01)' | 'Rabat (DEP-02)';
  physical: number;
  reserved: number;
  available: number;
  min_threshold: number;
  unit: string;
  unit_price: number;
  lot_number?: string;
  expiry_date?: string;
}

const INITIAL_STOCKS: StockItem[] = [
  {
    id: 1,
    sku: 'HRC-0850',
    name: 'Perceuse à percussion 850W',
    category: 'Outillage',
    warehouse: 'Casablanca (DEP-01)',
    physical: 120,
    reserved: 18,
    available: 102,
    min_threshold: 20,
    unit: 'Carton 4 pcs',
    unit_price: 1249,
    lot_number: 'LOT-2025-019',
    expiry_date: 'N/A',
  },
  {
    id: 2,
    sku: 'PMP-15HP',
    name: 'Pompe immergée 1.5 HP',
    category: 'Plomberie',
    warehouse: 'Casablanca (DEP-01)',
    physical: 8,
    reserved: 3,
    available: 5,
    min_threshold: 10,
    unit: 'Pièce',
    unit_price: 3840,
    lot_number: 'LOT-2025-004',
    expiry_date: 'N/A',
  },
  {
    id: 3,
    sku: 'CUT-230D',
    name: 'Disque diamant 230 mm',
    category: 'Outillage',
    warehouse: 'Rabat (DEP-02)',
    physical: 64,
    reserved: 12,
    available: 52,
    min_threshold: 15,
    unit: 'Pièce',
    unit_price: 189.5,
    lot_number: 'LOT-2024-890',
    expiry_date: 'N/A',
  },
  {
    id: 4,
    sku: 'CAB-3G25',
    name: 'Câble électrique 3G2.5',
    category: 'Électricité',
    warehouse: 'Casablanca (DEP-01)',
    physical: 480,
    reserved: 60,
    available: 420,
    min_threshold: 100,
    unit: 'Mètre',
    unit_price: 12.8,
    lot_number: 'LOT-CAB-2025',
    expiry_date: 'N/A',
  },
  {
    id: 5,
    sku: 'GEN-5000',
    name: 'Groupe électrogène 5 kVA',
    category: 'Énergie',
    warehouse: 'Casablanca (DEP-01)',
    physical: 3,
    reserved: 2,
    available: 1,
    min_threshold: 5,
    unit: 'Pièce',
    unit_price: 8950,
    lot_number: 'LOT-GEN-99',
    expiry_date: 'N/A',
  },
  {
    id: 6,
    sku: 'CHA-100I',
    name: 'Charnière inox 100 mm',
    category: 'Quincaillerie',
    warehouse: 'Rabat (DEP-02)',
    physical: 210,
    reserved: 15,
    available: 195,
    min_threshold: 30,
    unit: 'Sachet 6 pcs',
    unit_price: 15.5,
    lot_number: 'LOT-QUI-2025',
    expiry_date: 'N/A',
  },
];

const MOVEMENTS = [
  { type: 'Réception Achat', ref: 'ACH-0097', prod: 'Perceuse 850W', qty: '+24', depot: 'Casablanca', time: '10:45' },
  { type: 'Réservation Vente', ref: 'CMD-2406', prod: 'Pompe 1.5 HP', qty: '-3', depot: 'Casablanca', time: '10:15' },
  { type: 'Transfert Déposé', ref: 'TRF-0012', prod: 'Disque diamant', qty: '-16 (Sortie)', depot: 'Casa → Rabat', time: '09:20' },
  { type: 'Ajustement Inventaire', ref: 'INV-0225', prod: 'Câble 3G2.5', qty: '+5 (Écart)', depot: 'Rabat', time: 'Hier' },
];

export default function WarehouseDashboard() {
  const [stocks, setStocks] = useState<StockItem[]>(INITIAL_STOCKS);
  const [selectedDepot, setSelectedDepot] = useState<'all' | 'Casablanca (DEP-01)' | 'Rabat (DEP-02)'>('all');
  const [transferModal, setTransferModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = stocks.filter((s) => selectedDepot === 'all' || s.warehouse === selectedDepot);

  const totalValue = filtered.reduce((acc, s) => acc + s.physical * s.unit_price, 0);
  const lowStockCount = filtered.filter((s) => s.available <= s.min_threshold).length;
  const totalPhysical = filtered.reduce((acc, s) => acc + s.physical, 0);
  const totalReserved = filtered.reduce((acc, s) => acc + s.reserved, 0);
  const totalAvailable = filtered.reduce((acc, s) => acc + s.available, 0);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="dashboard-page warehouse-workspace">
      {/* Header */}
      <div className="page-heading dash-heading">
        <div>
          <span className="eyebrow">RESPONSABLE DÉPÔT <span className="eyebrow-sep">/</span> GESTION DES STOCKS & ENTREPÔTS</span>
          <h1>Espace Entrepôt & Dépôts<span className="title-period">.</span></h1>
          <p>Disponibilité = Physique − Réservé. Suivez les mouvements, réapprovisionnements et transferts.</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={() => setClosingModal(true)}>
            <ShieldCheck size={15} /> Clôture caisse dépôt
          </button>
          <button className="button-primary" onClick={() => setTransferModal(true)}>
            <ArrowLeftRight size={16} /> Transfert inter-dépôts
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="metric-grid">
        <div className="metric-card metric-blue">
          <div className="metric-top">
            <span>Stock Réel Disponible</span>
            <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              <Boxes size={16} />
            </div>
          </div>
          <div className="metric-number">{totalAvailable} <small>unités</small></div>
          <div className="metric-foot">
            <span>Physique: {totalPhysical} · Réservé: {totalReserved}</span>
          </div>
        </div>

        <div className="metric-card metric-green">
          <div className="metric-top">
            <span>Valorisation du stock</span>
            <div className="metric-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
              <Warehouse size={16} />
            </div>
          </div>
          <div className="metric-number">{formatMoney(totalValue)} <small>DH</small></div>
          <div className="metric-foot">
            <span>Périmètre : {selectedDepot === 'all' ? 'Tous dépôts' : selectedDepot}</span>
          </div>
        </div>

        <div className="metric-card metric-amber">
          <div className="metric-top">
            <span>Sous seuil minimum</span>
            <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="metric-number">{lowStockCount} <small>articles</small></div>
          <div className="metric-foot">
            <span className="metric-change change-down">Alerte réassort</span>
          </div>
        </div>

        <div className="metric-card metric-cyan">
          <div className="metric-top">
            <span>Dépôts Opérationnels</span>
            <div className="metric-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
              <Layers size={16} />
            </div>
          </div>
          <div className="metric-number">2 <small>dépôts</small></div>
          <div className="metric-foot">
            <span>Casablanca (Principal) & Rabat</span>
          </div>
        </div>
      </div>

      {/* CDC Equation Banner */}
      <div className="inventory-note" style={{ margin: '14px 0' }}>
        <div className="note-symbol"><Boxes size={18} /></div>
        <div>
          <b>Règle critique CDC : Stock Disponible = Stock Physique − Stock Réservé</b>
          <span>Tout mouvement (réception, réservation commande, transfert ou casse) est validé sous transaction verrouillée.</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            className={`button-secondary ${selectedDepot === 'all' ? 'active-tab' : ''}`}
            onClick={() => setSelectedDepot('all')}
          >
            Tous dépôts
          </button>
          <button
            className={`button-secondary ${selectedDepot === 'Casablanca (DEP-01)' ? 'active-tab' : ''}`}
            onClick={() => setSelectedDepot('Casablanca (DEP-01)')}
          >
            Casablanca
          </button>
          <button
            className={`button-secondary ${selectedDepot === 'Rabat (DEP-02)' ? 'active-tab' : ''}`}
            onClick={() => setSelectedDepot('Rabat (DEP-02)')}
          >
            Rabat
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '16px' }}>
        <section className="panel list-panel">
          <div className="list-panel-heading">
            <div>
              <span className="eyebrow">REGISTRE D'ENTREPÔT</span>
              <h2>Niveaux de stock par référence</h2>
            </div>
            <div className="table-count">
              <span className="count-pulse" />
              {filtered.length} références
            </div>
          </div>

          <div className="table-container">
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>RÉF / SKU</th>
                  <th>DÉSIGNATION & CATÉGORIE</th>
                  <th>DÉPÔT</th>
                  <th>PHYSIQUE / RÉSERVÉ / DISPO</th>
                  <th>VALORISATION</th>
                  <th>ÉTAT</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isLow = item.available <= item.min_threshold;
                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="table-ref">{item.sku}</span>
                        <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px' }}>
                          Lot: {item.lot_number}
                        </small>
                      </td>
                      <td>
                        <b className="table-main">{item.name}</b>
                        <small style={{ display: 'block', color: 'var(--muted)' }}>
                          {item.category} · {item.unit}
                        </small>
                      </td>
                      <td>
                        <span className="table-secondary">{item.warehouse.split(' ')[0]}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--app-font-mono)' }}>
                          <span>{item.physical}</span>
                          <span style={{ color: 'var(--muted)' }}>/</span>
                          <span style={{ color: '#f59e0b' }}>{item.reserved}</span>
                          <span style={{ color: 'var(--muted)' }}>/</span>
                          <b style={{ color: isLow ? '#ef4444' : '#22c55e', fontWeight: 700 }}>{item.available}</b>
                        </div>
                        <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
                          Seuil min: {item.min_threshold}
                        </small>
                      </td>
                      <td>
                        <b>{formatMoney(item.physical * item.unit_price)} DH</b>
                        <small style={{ display: 'block', color: 'var(--muted)', fontSize: '10px' }}>
                          {formatMoney(item.unit_price)} DH / un.
                        </small>
                      </td>
                      <td>
                        <span className={`status-pill ${isLow ? 'status-red' : 'status-green'}`}>
                          <i /> {isLow ? 'Stock Faible' : 'Disponible'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent movements */}
        <section className="panel" style={{ padding: '16px' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">TRAÇABILITÉ COMPLÈTE</span>
              <h2>Derniers mouvements de stock</h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {MOVEMENTS.map((m, idx) => (
              <div
                key={idx}
                style={{
                  padding: '11px',
                  borderRadius: '7px',
                  border: '1px solid var(--line)',
                  background: 'var(--navy-2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b>{m.type}</b>
                  <span style={{ fontSize: '11px', color: m.qty.startsWith('+') ? '#22c55e' : '#38bdf8', fontWeight: 700 }}>
                    {m.qty}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>
                  {m.prod} <small style={{ color: 'var(--muted)' }}>({m.ref})</small>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>
                  <span>{m.depot}</span>
                  <span>{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(234,179,8,0.08)', borderRadius: '8px', border: '1px solid rgba(234,179,8,0.2)', fontSize: '11px', color: 'var(--text)' }}>
            <b>Règle de transfert :</b> Un transfert inter-dépôts s'effectue en deux étapes : sortie enregistrée au dépôt source puis validation avec contrôle d'écarts à la réception.
          </div>
        </section>
      </div>

      {/* Transfer Modal */}
      {transferModal && (
        <div className="modal-backdrop" onClick={() => setTransferModal(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">MOUVEMENT INTER-DÉPÔTS</span>
                <h2>Nouveau transfert de stock</h2>
              </div>
              <button className="icon-button" onClick={() => setTransferModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">Sortie immédiate du dépôt source et mise en transit vers le dépôt destinataire.</p>
            <label className="field-label">
              Article à transférer
              <select className="select-compact" style={{ width: '100%', height: '36px' }}>
                <option>HRC-0850 · Perceuse à percussion 850W</option>
                <option>PMP-15HP · Pompe immergée 1.5 HP</option>
                <option>CAB-3G25 · Câble électrique 3G2.5</option>
              </select>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0' }}>
              <label className="field-label">
                Dépôt source
                <select className="select-compact" style={{ width: '100%', height: '36px' }}>
                  <option>Casablanca (DEP-01)</option>
                </select>
              </label>
              <label className="field-label">
                Dépôt destinataire
                <select className="select-compact" style={{ width: '100%', height: '36px' }}>
                  <option>Rabat (DEP-02)</option>
                </select>
              </label>
            </div>
            <label className="field-label">
              Quantité à transférer
              <input type="number" defaultValue="10" />
            </label>
            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setTransferModal(false)}>Annuler</button>
              <button
                className="button-primary"
                onClick={() => {
                  setTransferModal(false);
                  notify('Transfert initié en étape 1 (Sortie enregistrée) !');
                }}
              >
                Valider le transfert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Closing Modal */}
      {closingModal && (
        <div className="modal-backdrop" onClick={() => setClosingModal(false)}>
          <div className="record-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <span className="eyebrow">FIN DE JOURNÉE</span>
                <h2>Clôture de caisse du dépôt</h2>
              </div>
              <button className="icon-button" onClick={() => setClosingModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="modal-note">Validation des règlements au comptoir et encaissements du dépôt.</p>
            <div style={{ background: 'var(--navy-2)', padding: '12px', borderRadius: '8px', margin: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Montant attendu (Comptoir) :</span>
                <b>18 450,00 DH</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
                <span>Chèques réceptionnés :</span>
                <b>2 chèques (12 500 DH)</b>
              </div>
            </div>
            <label className="field-label">
              Espèces réellement remises (DH)
              <input type="number" defaultValue="18450" />
            </label>
            <div className="modal-actions">
              <button className="button-secondary" onClick={() => setClosingModal(false)}>Annuler</button>
              <button
                className="button-primary"
                onClick={() => {
                  setClosingModal(false);
                  notify('Clôture de caisse du dépôt validée et verrouillée.');
                }}
              >
                Verrouiller la clôture
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-note"><CheckCircle2 size={16} />{toast}</div>}
    </div>
  );
}
