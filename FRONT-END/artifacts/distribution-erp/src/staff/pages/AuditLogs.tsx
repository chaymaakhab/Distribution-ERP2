import { useState } from 'react';
import {
  ScrollText, Search, Filter, Download, ShieldCheck, CheckCircle2,
  Calendar, Clock, User, ArrowRight,
} from 'lucide-react';

interface AuditItem {
  id: number;
  timestamp: string;
  user_name: string;
  role: string;
  action: string;
  category: 'auth' | 'orders' | 'stock' | 'finance' | 'delivery' | 'settings';
  description: string;
  ref: string;
  ip_address: string;
  status: 'Succès' | 'Alerte';
}

const INITIAL_LOGS: AuditItem[] = [
  {
    id: 1,
    timestamp: '28 Fév 2025 · 17:30:14',
    user_name: 'Super Admin',
    role: 'Super Admin',
    action: 'auth.login',
    category: 'auth',
    description: 'Connexion réussie à l’espace Super Admin',
    ref: 'AUTH-9821',
    ip_address: '196.12.45.102 (Casablanca)',
    status: 'Succès',
  },
  {
    id: 2,
    timestamp: '28 Fév 2025 · 17:15:42',
    user_name: 'Youssef Bennani',
    role: 'Commercial',
    action: 'orders.validate',
    category: 'orders',
    description: 'Validation commande client CMD-2406 (24 860 DH) et réservation de stock',
    ref: 'CMD-2406',
    ip_address: '105.158.22.4 (Casablanca)',
    status: 'Succès',
  },
  {
    id: 3,
    timestamp: '28 Fév 2025 · 16:50:11',
    user_name: 'Mehdi Lahlou',
    role: 'Livreur',
    action: 'delivery.complete',
    category: 'delivery',
    description: 'Validation livraison et signature tactile client Mohamed Fassi (Chèque 32 100 DH)',
    ref: 'LIV-CMD-2403',
    ip_address: '105.154.89.12 (Fès Mobile)',
    status: 'Succès',
  },
  {
    id: 4,
    timestamp: '28 Fév 2025 · 15:40:00',
    user_name: 'Nadia El Amrani',
    role: 'Responsable Dépôt',
    action: 'stock.transfer',
    category: 'stock',
    description: 'Sortie enregistrée pour transfert TRF-0012 vers Dépôt Rabat (16 disques diamant)',
    ref: 'TRF-0012',
    ip_address: '196.12.45.105 (Casablanca)',
    status: 'Succès',
  },
  {
    id: 5,
    timestamp: '28 Fév 2025 · 14:22:30',
    user_name: 'Sofia Cherkaoui',
    role: 'Comptable',
    action: 'invoices.remittance',
    category: 'finance',
    description: 'Génération du bordereau officiel de remise en banque pour 2 effets (12 500 DH)',
    ref: 'BOR-2025-018',
    ip_address: '196.12.45.102 (Casablanca)',
    status: 'Succès',
  },
  {
    id: 6,
    timestamp: '28 Fév 2025 · 11:45:00',
    user_name: 'Karim Ouazzani',
    role: 'Préparateur',
    action: 'preparation.scan',
    category: 'stock',
    description: 'Scan et validation bon de préparation groupé tournée Casablanca Sud',
    ref: 'PREP-2025-044',
    ip_address: '196.12.45.108 (Entrepôt Aïn Sebaâ)',
    status: 'Succès',
  },
  {
    id: 7,
    timestamp: '27 Fév 2025 · 18:00:22',
    user_name: 'Mehdi Lahlou',
    role: 'Livreur',
    action: 'cash_closing.validate',
    category: 'delivery',
    description: 'Clôture caisse livreur TRN-2026-07 : 75 000 DH remis avec justification écart',
    ref: 'CLO-TRN-07',
    ip_address: '196.12.45.102 (Casablanca)',
    status: 'Succès',
  },
  {
    id: 8,
    timestamp: '27 Fév 2025 · 16:30:15',
    user_name: 'Amine El Fassi',
    role: 'Administrateur',
    action: 'customer.limit_change',
    category: 'settings',
    description: 'Augmentation du plafond de crédit pour Atlas Équipements de 50 000 à 80 000 DH',
    ref: 'CLI-0084',
    ip_address: '196.12.45.102 (Casablanca)',
    status: 'Succès',
  },
];

export default function AuditLogs() {
  const [logs] = useState<AuditItem[]>(INITIAL_LOGS);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = logs.filter((log) => {
    const matchQ =
      log.user_name.toLowerCase().includes(query.toLowerCase()) ||
      log.action.toLowerCase().includes(query.toLowerCase()) ||
      log.description.toLowerCase().includes(query.toLowerCase()) ||
      log.ref.toLowerCase().includes(query.toLowerCase()) ||
      log.ip_address.toLowerCase().includes(query.toLowerCase());
    const matchCat = catFilter === 'all' || log.category === catFilter;
    return matchQ && matchCat;
  });

  function exportCsv() {
    const csv = [
      'Date;Utilisateur;Rôle;Action;Description;Référence;IP;Statut',
      ...filtered.map(
        (l) =>
          `"${l.timestamp}";"${l.user_name}";"${l.role}";"${l.action}";"${l.description}";"${l.ref}";"${l.ip_address}";"${l.status}"`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-log-${Date.now()}.csv`;
    link.click();
    notify('Journal d’audit exporté en CSV.');
  }

  return (
    <div className="module-page audit-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">SÉCURITÉ & CONFORMITÉ <span className="heading-slash">/</span> TRAÇABILITÉ</div>
          <h1>Journal d’Audit & Événements</h1>
          <p>Traçabilité complète des opérations critiques : connexions, validations, règlements, stocks et livraisons.</p>
        </div>
        <div className="heading-actions">
          <button className="button-secondary" onClick={exportCsv}>
            <Download size={15} /> Exporter le journal
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>Événements tracés</span>
          <strong className="blue">{logs.length} enregistrements</strong>
        </div>
        <div className="summary-box">
          <span>Opérations de vente</span>
          <strong className="neutral">{logs.filter((l) => l.category === 'orders').length} commandes</strong>
        </div>
        <div className="summary-box">
          <span>Mouvements logistiques</span>
          <strong className="neutral">{logs.filter((l) => ['stock', 'delivery'].includes(l.category)).length} actions</strong>
        </div>
        <div className="summary-box">
          <span>Statut d’intégrité</span>
          <strong className="needs-action" style={{ color: '#22c55e' }}>100% vérifié</strong>
        </div>
      </div>

      {/* Main Table Panel */}
      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">REGISTRE DES TRANSACTIONS</span>
            <h2>Historique chronologique des actions</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} événements
          </div>
        </div>

        <div className="table-tools">
          <div className="table-tabs">
            {['all', 'auth', 'orders', 'stock', 'delivery', 'finance', 'settings'].map((c) => (
              <button
                key={c}
                className={`table-tab ${catFilter === c ? 'active-tab' : ''}`}
                onClick={() => setCatFilter(c)}
              >
                {c === 'all'
                  ? 'Tous les événements'
                  : c === 'auth'
                  ? 'Connexions'
                  : c === 'orders'
                  ? 'Commandes'
                  : c === 'stock'
                  ? 'Stocks & Dépôts'
                  : c === 'delivery'
                  ? 'Livraisons'
                  : c === 'finance'
                  ? 'Finance'
                  : 'Configuration'}
              </button>
            ))}
          </div>
          <div className="tool-actions">
            <label className="search-field">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par utilisateur, action, IP, réf..."
              />
            </label>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>HORODATAGE</th>
                <th>UTILISATEUR & RÔLE</th>
                <th>ACTION TRACÉE</th>
                <th>DÉTAIL DE L'OPÉRATION</th>
                <th>RÉFÉRENCE</th>
                <th>ADRESSE IP</th>
                <th>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontSize: '11.5px', fontFamily: 'var(--app-font-mono)', color: 'var(--text)' }}>
                      {log.timestamp}
                    </span>
                  </td>
                  <td>
                    <div>
                      <b className="table-main">{log.user_name}</b>
                      <small style={{ display: 'block', color: 'var(--muted)' }}>{log.role}</small>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '11px', color: '#38bdf8' }}>{log.action}</code>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text)' }}>{log.description}</span>
                  </td>
                  <td>
                    <span className="table-ref">{log.ref}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--app-font-mono)' }}>
                      {log.ip_address}
                    </span>
                  </td>
                  <td>
                    <span className="status-pill status-green">
                      <i /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
