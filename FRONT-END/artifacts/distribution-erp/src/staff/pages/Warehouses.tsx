import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  MapPin, Phone, User, Boxes, ClipboardList, Package, Wallet, AlertTriangle, ArrowRight,
  Plus, BarChart3, Map as MapIcon, Table, CheckCircle2, X, Building2, Layers,
} from 'lucide-react';
import { api, formatMoney, type WarehouseNode } from '../api';
import { useStaffAuth } from '../auth';
import { MapCanvas, MapLegend } from '../components/MapCanvas';
import DepotsMultiCityAnalytics from '../components/DepotsMultiCityAnalytics';
import RoleQuickActionsBar from '../components/RoleQuickActionsBar';
import '../admin.css';

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const DEPOT_KEY = 'hercules.staff.depot';

export default function Warehouses() {
  const { workspace } = useStaffAuth();
  const [, setLocation] = useLocation();
  const [warehouses, setWarehouses] = useState<WarehouseNode[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'map' | 'list'>('analytics');
  const [isNewDepotModalOpen, setIsNewDepotModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Depot Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newManager, setNewManager] = useState('');
  const [newPhone, setNewPhone] = useState('+212 ');
  const [newCapacity, setNewCapacity] = useState('35000');

  // Honour a depot pre-selected from the dashboard mini-map
  const initialId = useMemo(() => {
    const v = sessionStorage.getItem(DEPOT_KEY);
    sessionStorage.removeItem(DEPOT_KEY);
    return v ? Number(v) : null;
  }, []);

  function notify(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  useEffect(() => {
    let alive = true;
    api.adminWarehouses()
      .then((res) => {
        if (!alive) return;
        setWarehouses(res.data);
        setSelectedId((prev) => prev ?? initialId ?? res.data[0]?.id ?? null);
      })
      .catch((e) => alive && setError(e?.message ?? 'Impossible de charger les dépôts.'));
    return () => {
      alive = false;
    };
  }, [initialId]);

  function handleCreateDepot(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newCity.trim()) {
      alert('Veuillez renseigner le nom et la ville du dépôt.');
      return;
    }

    const created: WarehouseNode = {
      id: Date.now(),
      code: newCode.trim() || `DEP-0${(warehouses?.length ?? 0) + 1}`,
      name: newName.trim(),
      city: newCity.trim(),
      address: newAddress.trim() || `Zone Industrielle, ${newCity.trim()}`,
      phone: newPhone.trim(),
      manager_name: newManager.trim() || 'Responsable Dépôt',
      lat: 33.5731,
      lng: -7.5898,
      status: 'Actif',
      stock_on_hand: 0,
      stock_available: 0,
      products_count: 0,
      revenue: 0,
      orders_pending: 0,
      orders_in_progress: 0,
      orders_done: 0,
    };

    setWarehouses((prev) => (prev ? [created, ...prev] : [created]));
    setSelectedId(created.id);
    setIsNewDepotModalOpen(false);
    notify(`Nouveau dépôt "${created.name}" (${created.city}) créé avec succès !`);

    // Reset form
    setNewCode('');
    setNewName('');
    setNewCity('');
    setNewAddress('');
    setNewManager('');
    setNewPhone('+212 ');
    setNewCapacity('35000');
  }

  if (error) {
    return (
      <div className="sx-denied">
        <div className="sx-denied-icon"><AlertTriangle size={24} /></div>
        <h2>Données indisponibles</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!warehouses) return <div className="sx-panel sx-skeleton sx-skeleton-lg" />;

  const selected = warehouses.find((w) => w.id === selectedId) ?? warehouses[0];

  return (
    <div className="module-page sx-warehouses" style={{ maxWidth: 1440, margin: '0 auto', paddingBottom: 40 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #22c55e',
            borderRadius: 8,
            padding: '12px 18px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">RÉSEAU LOGISTIQUE · ROYAUME DU MAROC</div>
          <h1>Tableau de bord & Dépôts Régionaux</h1>
          <p>Supervision des 7 dépôts nationaux : saturation, stocks, chiffre d’affaires et flotte.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="button-primary"
            onClick={() => setIsNewDepotModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> Nouveau Dépôt
          </button>
        </div>
      </div>

      {/* Role Quick Actions Bar for Depots */}
      <RoleQuickActionsBar
        roleTitle="Pilotage des Dépôts & Hubs Régionaux"
        actions={[
          {
            id: 'qa-new-depot',
            label: '+ Nouveau Dépôt',
            description: 'Créer un nouvel entrepôt ou hub régional logistique',
            icon: Plus,
            primary: true,
            onClick: () => setIsNewDepotModalOpen(true),
          },
          {
            id: 'qa-inter-depot',
            label: '+ Transfert Inter-Dépôts',
            description: 'Initier un bon de transfert de stock entre deux villes',
            icon: Layers,
            onClick: () => setLocation(`/${workspace}/inventory`),
          },
          {
            id: 'qa-adjust-stock',
            label: '+ Ajustement Stock',
            description: 'Déclarer un inventaire tournant ou régularisation',
            icon: Boxes,
            onClick: () => setLocation(`/${workspace}/inventory`),
          },
          {
            id: 'qa-fleet-depot',
            label: 'Suivi Flotte & Livreurs',
            description: 'Affectation des camions et tournées par dépôt',
            icon: ArrowRight,
            onClick: () => setLocation(`/${workspace}/fleet`),
          },
        ]}
      />

      {/* View Mode Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid var(--line)',
          marginBottom: 20,
          paddingBottom: 6,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: activeTab === 'analytics' ? '1px solid #0284c7' : '1px solid transparent',
            background: activeTab === 'analytics' ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
            color: activeTab === 'analytics' ? '#38bdf8' : 'var(--muted)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BarChart3 size={16} />
          Visualisation Data &amp; Statistiques ({warehouses.length} Villes)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: activeTab === 'map' ? '1px solid #0284c7' : '1px solid transparent',
            background: activeTab === 'map' ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
            color: activeTab === 'map' ? '#38bdf8' : 'var(--muted)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MapIcon size={16} />
          Carte Interactive du Réseau Maroc
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('list')}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            border: activeTab === 'list' ? '1px solid #0284c7' : '1px solid transparent',
            background: activeTab === 'list' ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
            color: activeTab === 'list' ? '#38bdf8' : 'var(--muted)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Table size={16} />
          Annuaire des Dépôts ({warehouses.length})
        </button>
      </div>

      {/* Tab 1: Comprehensive Multi-City Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div>
          <DepotsMultiCityAnalytics
            onNavigateToWarehouse={() => setActiveTab('map')}
          />
        </div>
      )}

      {/* Tab 2: Moroccan Interactive Map Canvas */}
      {activeTab === 'map' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <MapLegend />
          </div>

          <div className="sx-map-layout">
            <section className="panel sx-panel sx-map-panel">
              <MapCanvas warehouses={warehouses} selectedId={selected?.id} onSelect={setSelectedId} />
            </section>

            <div className="sx-map-side">
              <div className="sx-depot-list">
                {warehouses.map((w) => (
                  <button
                    key={w.id}
                    className={`sx-depot-item ${selected?.id === w.id ? 'active' : ''}`}
                    onClick={() => setSelectedId(w.id)}
                  >
                    <span className={`sx-depot-dot s-${slug(w.status)}`} />
                    <span className="sx-depot-meta">
                      <b>{w.name}</b>
                      <small>{w.city} · {w.code}</small>
                    </span>
                    <span className="sx-depot-fig">{formatMoney(w.revenue)} DH</span>
                  </button>
                ))}
              </div>

              {selected && <DepotSheet w={selected} onOpenStock={() => setLocation(`/${workspace}/inventory`)} />}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Complete Depots Directory Table */}
      {activeTab === 'list' && (
        <section className="panel sx-panel" style={{ padding: 18, overflowX: 'auto' }}>
          <table className="data-table sx-table" style={{ width: '100%', minWidth: 700 }}>
            <thead>
              <tr>
                <th>Code &amp; Dépôt</th>
                <th>Ville &amp; Emplacement</th>
                <th>Responsable</th>
                <th>Stock Physique</th>
                <th>Disponible</th>
                <th>Références</th>
                <th>Chiffre d’Affaires</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {w.code.replace('DEP-', '')}
                      </div>
                      <div>
                        <b>{w.name}</b>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{w.code}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong style={{ color: 'var(--text)' }}>{w.city}</strong>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{w.address ?? 'Zone industrielle'}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                      <User size={13} style={{ color: 'var(--muted)' }} />
                      <span>{w.manager_name ?? 'Non assigné'}</span>
                    </div>
                    {w.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        <Phone size={11} /> {w.phone}
                      </div>
                    )}
                  </td>
                  <td>
                    <b>{formatMoney(w.stock_on_hand)}</b>
                  </td>
                  <td>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>{formatMoney(w.stock_available)}</span>
                  </td>
                  <td>{w.products_count}</td>
                  <td>
                    <strong style={{ color: '#38bdf8' }}>{formatMoney(w.revenue)} DH</strong>
                  </td>
                  <td>
                    <span className={`status-pill status-${w.status === 'Actif' ? 'green' : 'amber'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button-secondary"
                      style={{ height: 28, fontSize: 11, padding: '0 8px' }}
                      onClick={() => {
                        setSelectedId(w.id);
                        setActiveTab('map');
                      }}
                    >
                      Voir Carte
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── Modal Création Nouveau Dépôt ── */}
      {isNewDepotModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewDepotModalOpen(false)}>
          <form
            className="record-modal"
            onSubmit={handleCreateDepot}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 540, width: '90%', background: '#ffffff', color: '#0f172a', borderRadius: 12, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Ajouter un Nouveau Dépôt Régional</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsNewDepotModalOpen(false)}
                style={{ color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Code Dépôt *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`DEP-0${(warehouses.length || 0) + 1}`}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Nom du Dépôt *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Dépôt Régional Tétouan"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Tétouan, Nador, Kénitra..."
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Capacité Maximale (unités)
                  </label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Adresse / Zone d’activité
                </label>
                <input
                  type="text"
                  placeholder="ex. Zone Industrielle Tétouan Park, Lot 14"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Responsable Dépôt
                  </label>
                  <input
                    type="text"
                    placeholder="Nom du manager"
                    value={newManager}
                    onChange={(e) => setNewManager(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Téléphone de contact
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setIsNewDepotModalOpen(false)}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="button-primary"
                style={{ background: '#0284c7', borderColor: '#0369a1' }}
              >
                Enregistrer le Dépôt
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function DepotSheet({ w, onOpenStock }: { w: WarehouseNode; onOpenStock?: () => void }) {
  return (
    <div className="panel sx-panel sx-depot-sheet">
      <div className="sx-sheet-head">
        <div>
          <span className="eyebrow">FICHE DÉPÔT · {w.code}</span>
          <h2>{w.name}</h2>
          <span className={`sx-status s-${slug(w.status)}`}>{w.status}</span>
        </div>
      </div>

      <ul className="sx-sheet-info">
        <li><MapPin size={14} /> {w.address ?? w.city}</li>
        {w.phone && <li><Phone size={14} /> {w.phone}</li>}
        {w.manager_name && <li><User size={14} /> Responsable · {w.manager_name}</li>}
        {w.lat !== null && w.lng !== null && <li><MapPin size={14} /> {w.lat.toFixed(4)}, {w.lng.toFixed(4)}</li>}
      </ul>

      <div className="sx-sheet-stats">
        <div><span className="sx-stat-label"><Boxes size={13} /> Stock physique</span><strong>{w.stock_on_hand}</strong></div>
        <div><span className="sx-stat-label"><Package size={13} /> Disponible</span><strong>{w.stock_available}</strong></div>
        <div><span className="sx-stat-label"><Boxes size={13} /> Références</span><strong>{w.products_count}</strong></div>
        <div><span className="sx-stat-label"><Wallet size={13} /> CA</span><strong>{formatMoney(w.revenue)} DH</strong></div>
      </div>

      <div className="sx-sheet-orders">
        <span className="eyebrow"><ClipboardList size={11} /> COMMANDES</span>
        <div className="sx-order-pills">
          <span className="sx-pill amber">{w.orders_pending} en attente</span>
          <span className="sx-pill blue">{w.orders_in_progress} en cours</span>
          <span className="sx-pill green">{w.orders_done} livrées</span>
        </div>
      </div>

      <button className="button-secondary sx-sheet-btn" onClick={onOpenStock}>
        Consulter Stock Dépôt <ArrowRight size={14} />
      </button>
    </div>
  );
}

