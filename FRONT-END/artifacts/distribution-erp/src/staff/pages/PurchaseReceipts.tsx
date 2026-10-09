import { useState } from 'react';
import {
  PackagePlus, Search, Filter, Plus, CheckCircle2, ShoppingCart,
  Printer, Eye, Calendar, Building2, Check, AlertTriangle,
} from 'lucide-react';
import { formatMoney } from '../api';

interface PurchaseReceiptItem {
  id: number;
  ref: string;
  po_ref: string;
  supplier: string;
  warehouse: string;
  received_date: string;
  total_ht: number;
  lines_count: number;
  status: 'Conforme' | 'Partielle' | 'Écart / Litige' | 'En attente contrôle';
  inspector: string;
}

const INITIAL_RECEIPTS: PurchaseReceiptItem[] = [
  { id: 1, ref: 'BR-2025-0097', po_ref: 'ACH-0097', supplier: 'Société Outillage du Nord', warehouse: 'Dépôt Casablanca', received_date: 'Aujourd’hui', total_ht: 38750, lines_count: 5, status: 'Conforme', inspector: 'Nadia El Amrani' },
  { id: 2, ref: 'BR-2025-0096', po_ref: 'ACH-0096', supplier: 'Electro Maroc Distribution', warehouse: 'Dépôt Rabat', received_date: '28 Fév 2025', total_ht: 24900, lines_count: 4, status: 'Partielle', inspector: 'Said Amrani' },
  { id: 3, ref: 'BR-2025-0095', po_ref: 'ACH-0095', supplier: 'HydroTech Maghreb SARL', warehouse: 'Dépôt Casablanca', received_date: '26 Fév 2025', total_ht: 17600, lines_count: 3, status: 'Conforme', inspector: 'Nadia El Amrani' },
  { id: 4, ref: 'BR-2025-0094', po_ref: 'ACH-0094', supplier: 'Câbles & Énergie Maroc', warehouse: 'Dépôt Casablanca', received_date: '24 Fév 2025', total_ht: 42150, lines_count: 6, status: 'Écart / Litige', inspector: 'Karim Ouazzani' },
];

export default function PurchaseReceipts({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [receipts, setReceipts] = useState<PurchaseReceiptItem[]>(INITIAL_RECEIPTS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = receipts.filter((r) => {
    const matchQ =
      r.ref.toLowerCase().includes(query.toLowerCase()) ||
      r.po_ref.toLowerCase().includes(query.toLowerCase()) ||
      r.supplier.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || r.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ENTREPÔT & APPROVISIONNEMENT / RÉCEPTIONS D'ACHATS (BR)</div>
          <h1>Bons de Réception d’Achats (BR)</h1>
          <p>Enregistrez les entrées de marchandises fournisseurs, contrôlez la conformité et ajustez le stock physique.</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={() => window.print()}>
            <Printer size={15} /> Imprimer registre
          </button>
        </div>
      </div>

      <div className="summary-strip">
        <div className="summary-box">
          <span>Réceptions Effectuées</span>
          <strong className="blue">{receipts.length} BR</strong>
        </div>
        <div className="summary-box">
          <span>Conformes à 100%</span>
          <strong className="green">{receipts.filter((r) => r.status === 'Conforme').length} conformes</strong>
        </div>
        <div className="summary-box">
          <span>Réceptions Partielles</span>
          <strong className="amber">{receipts.filter((r) => r.status === 'Partielle').length} à compléter</strong>
        </div>
        <div className="summary-box">
          <span>Écarts & Litiges</span>
          <strong className="neutral">{receipts.filter((r) => r.status === 'Écart / Litige').length} litiges</strong>
        </div>
      </div>

      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">REGISTRE DES ENTRÉES</span>
            <h2>Tous les bons de réception fournisseurs</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} réceptions
          </div>
        </div>

        <div className="table-tools">
          <div className="tool-actions" style={{ width: '100%', display: 'flex', gap: 12 }}>
            <label className="search-field" style={{ flex: 1 }}>
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par n° de BR, commande d'achat ou fournisseur…"
              />
            </label>

            <select
              className="select-compact"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="all">Tous les statuts</option>
              <option value="Conforme">Conformes</option>
              <option value="Partielle">Partielles</option>
              <option value="Écart / Litige">Écarts & Litiges</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>N° BON RÉCEPTION</th>
                <th>COMMANDE ACHAT (PO)</th>
                <th>FOURNISSEUR</th>
                <th>DÉPÔT RÉCEPTIONNAIRE</th>
                <th>LIGNES & ARTICLES</th>
                <th>MONTANT REÇU HT</th>
                <th>CONFORMITÉ</th>
                <th>RÉCEPTIONNÉ PAR</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="table-ref">{r.ref}</span>
                    <small className="under-ref">{r.received_date}</small>
                  </td>
                  <td>
                    <b>{r.po_ref}</b>
                  </td>
                  <td>
                    <b className="table-main">{r.supplier}</b>
                  </td>
                  <td>
                    <span>{r.warehouse}</span>
                  </td>
                  <td>
                    <b>{r.lines_count} références</b>
                  </td>
                  <td className="table-amount">{formatMoney(r.total_ht)}</td>
                  <td>
                    <span className={`status-pill ${
                      r.status === 'Conforme' ? 'status-green' :
                      r.status === 'Partielle' ? 'status-blue' : 'status-amber'
                    }`}>
                      <i /> {r.status}
                    </span>
                  </td>
                  <td>
                    <span>{r.inspector}</span>
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
