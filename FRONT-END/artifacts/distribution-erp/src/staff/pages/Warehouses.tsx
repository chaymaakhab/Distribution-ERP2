import { useEffect, useMemo, useState } from 'react';
import {
  MapPin, Phone, User, Boxes, ClipboardList, Package, Wallet, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { api, formatMoney, type WarehouseNode } from '../api';
import { MapCanvas, MapLegend } from '../components/MapCanvas';
import '../admin.css';

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const DEPOT_KEY = 'hercules.staff.depot';

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<WarehouseNode[] | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Honour a depot pre-selected from the dashboard mini-map (passed via storage,
  // not the URL, to keep the /:ws/:module route matcher clean).
  const initialId = useMemo(() => {
    const v = sessionStorage.getItem(DEPOT_KEY);
    sessionStorage.removeItem(DEPOT_KEY);
    return v ? Number(v) : null;
  }, []);

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
    <div className="module-page sx-warehouses">
      <div className="page-heading">
        <div>
          <div className="eyebrow">RÉSEAU <span className="heading-slash">/</span> CARTOGRAPHIE</div>
          <h1>Carte des dépôts</h1>
          <p>Localisation, état du stock et activité de chaque dépôt autorisé.</p>
        </div>
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

          {selected && <DepotSheet w={selected} />}
        </div>
      </div>
    </div>
  );
}

function DepotSheet({ w }: { w: WarehouseNode }) {
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

      <button className="button-secondary sx-sheet-btn">
        Ouvrir le dépôt <ArrowRight size={14} />
      </button>
    </div>
  );
}
