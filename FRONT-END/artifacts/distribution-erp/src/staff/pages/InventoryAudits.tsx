import { useState } from 'react';
import {
  ClipboardCheck, Search, Filter, Plus, CheckCircle2, Boxes,
  Printer, Eye, Calendar, Check, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { formatMoney } from '../api';

interface AuditItem {
  id: number;
  ref: string;
  warehouse: string;
  type: 'Inventaire Tournant' | 'Inventaire Général' | 'Contrôle Spécifique';
  date: string;
  counted_items: number;
  items_with_discrepancy: number;
  variance_value: number;
  responsible: string;
  status: 'En cours' | 'Validé & Ajusté' | 'Clôturé';
}

const INITIAL_AUDITS: AuditItem[] = [
  { id: 1, ref: 'INV-2025-01', warehouse: 'Dépôt Casablanca', type: 'Inventaire Tournant', date: '28 Fév 2025', counted_items: 45, items_with_discrepancy: 2, variance_value: -340, responsible: 'Nadia El Amrani', status: 'Validé & Ajusté' },
  { id: 2, ref: 'INV-2025-02', warehouse: 'Dépôt Rabat', type: 'Inventaire Tournant', date: '25 Fév 2025', counted_items: 38, items_with_discrepancy: 0, variance_value: 0, responsible: 'Said Amrani', status: 'Clôturé' },
  { id: 3, ref: 'INV-2024-ANNUEL', warehouse: 'Casablanca & Rabat', type: 'Inventaire Général', date: '31 Déc 2024', counted_items: 1248, items_with_discrepancy: 12, variance_value: -1850, responsible: 'Amine El Fassi', status: 'Clôturé' },
];

export default function InventoryAudits({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [audits, setAudits] = useState<AuditItem[]>(INITIAL_AUDITS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = audits.filter((a) => {
    const matchQ =
      a.ref.toLowerCase().includes(query.toLowerCase()) ||
      a.warehouse.toLowerCase().includes(query.toLowerCase()) ||
      a.responsible.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || a.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ENTREPÔT & STOCK / AUDITS D'INVENTAIRE PHYSIQUE</div>
          <h1>Audits d’Inventaire</h1>
          <p>Confrontez le comptage physique sur les étagères avec le stock théorique de l'ERP et ajustez les écarts.</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={() => window.print()}>
            <Printer size={15} /> Imprimer rapport
          </button>
        </div>
      </div>

      <div className="summary-strip">
        <div className="summary-box">
          <span>Audits Réalisés</span>
          <strong className="blue">{audits.length} sessions</strong>
        </div>
        <div className="summary-box">
          <span>Précision Moyenne du Stock</span>
          <strong className="green">98.9%</strong>
        </div>
        <div className="summary-box">
          <span>Écart Net Constaté</span>
          <strong className="amber">{formatMoney(audits.reduce((acc, a) => acc + a.variance_value, 0))}</strong>
        </div>
        <div className="summary-box">
          <span>Dernier Inventaire</span>
          <strong className="neutral">28 Fév 2025</strong>
        </div>
      </div>

      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">SESSIONS D'INVENTAIRE</span>
            <h2>Historique des comptages physiques</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} audits
          </div>
        </div>

        <div className="table-tools">
          <div className="tool-actions" style={{ width: '100%', display: 'flex', gap: 12 }}>
            <label className="search-field" style={{ flex: 1 }}>
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par référence, dépôt ou responsable…"
              />
            </label>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>RÉFÉRENCE</th>
                <th>DÉPÔT CONCERNÉ</th>
                <th>TYPE D'INVENTAIRE</th>
                <th>DATE</th>
                <th>ARTICLES AUDITÉS</th>
                <th>ÉCARTS DÉTECTÉS</th>
                <th>VALORISATION ÉCART</th>
                <th>RESPONSABLE</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="table-ref">{a.ref}</span>
                  </td>
                  <td>
                    <b className="table-main">{a.warehouse}</b>
                  </td>
                  <td>
                    <span>{a.type}</span>
                  </td>
                  <td>
                    <span>{a.date}</span>
                  </td>
                  <td>
                    <b>{a.counted_items} réf.</b>
                  </td>
                  <td>
                    <span style={{ color: a.items_with_discrepancy > 0 ? '#d97706' : '#059669', fontWeight: 700 }}>
                      {a.items_with_discrepancy} réf.
                    </span>
                  </td>
                  <td>
                    <b style={{ color: a.variance_value < 0 ? '#dc2626' : a.variance_value > 0 ? '#059669' : 'inherit' }}>
                      {formatMoney(a.variance_value)}
                    </b>
                  </td>
                  <td>
                    <span>{a.responsible}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      a.status === 'Clôturé' ? 'status-green' :
                      a.status === 'Validé & Ajusté' ? 'status-blue' : 'status-amber'
                    }`}>
                      <i /> {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {toast && <div className="toast-note"><Check size={16} />{toast}</div>}
    </div>
  );
}
