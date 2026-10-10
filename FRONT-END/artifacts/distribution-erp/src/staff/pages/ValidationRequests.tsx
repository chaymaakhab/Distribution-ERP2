import { useState } from 'react';
import {
  ShieldAlert, Search, Filter, CheckCircle2, XCircle, Clock,
  Calendar, User, Building2, Check, AlertCircle, DollarSign,
  FileText, ShieldCheck, X,
} from 'lucide-react';
import { formatMoney } from '../api';

interface ValidationItem {
  id: number;
  ref: string;
  type: 'Dépassement crédit' | 'Remise exceptionnelle' | 'Délai de paiement (60j)' | 'Commande urgente dérogatoire';
  requester: string;
  customer: string;
  city: string;
  requested_amount: number;
  credit_limit: number;
  current_balance: number;
  reason: string;
  created_at: string;
  status: 'En attente' | 'Approuvée' | 'Rejetée';
  reviewed_by?: string;
}

const INITIAL_VALIDATIONS: ValidationItem[] = [
  { id: 1, ref: 'VAL-2025-019', type: 'Dépassement crédit', requester: 'Youssef Bennani (Commercial)', customer: 'Atlas Équipements SARL', city: 'Casablanca', requested_amount: 95000, credit_limit: 80000, current_balance: 78500, reason: 'Grosse commande de chantiers BTP livrée ce lundi. Paiement régulier par chèques certifiés.', created_at: 'Il y a 25 min', status: 'En attente' },
  { id: 2, ref: 'VAL-2025-018', type: 'Remise exceptionnelle', requester: 'Mehdi Lahlou (Commercial)', customer: 'Nord Industrie', city: 'Tanger', requested_amount: 18, credit_limit: 50000, current_balance: 12000, reason: 'Demande remise de 18% (au lieu de 12% max) sur lot de 50 disjoncteurs pour contrer un concurrent.', created_at: 'Il y a 2 h', status: 'En attente' },
  { id: 3, ref: 'VAL-2025-017', type: 'Délai de paiement (60j)', requester: 'Hamid El Meskini (Commercial)', customer: 'BatiPro Maroc', city: 'Rabat', requested_amount: 45000, credit_limit: 60000, current_balance: 35000, reason: 'Demande règlement par traite à 60 jours au lieu de 30 jours pour fin de chantier tramway.', created_at: 'Hier 15:40', status: 'Approuvée', reviewed_by: 'Amine El Fassi (Admin)' },
  { id: 4, ref: 'VAL-2025-016', type: 'Dépassement crédit', requester: 'Youssef Bennani (Commercial)', customer: 'Comptoir Al Amal', city: 'Fès', requested_amount: 120000, credit_limit: 100000, current_balance: 98000, reason: 'Commande urgente pompe immergée. Retard sur encaissement précédent.', created_at: '26 Fév', status: 'Rejetée', reviewed_by: 'Super Admin' },
];

export default function ValidationRequests({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [requests, setRequests] = useState<ValidationItem[]>(INITIAL_VALIDATIONS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleDecision(id: number, decision: 'Approuvée' | 'Rejetée') {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: decision, reviewed_by: 'Vous (Validation Immédiate)' } : r
      )
    );
    notify(`Demande ${decision === 'Approuvée' ? 'validée avec succès' : 'rejetée'}.`);
  }

  const filtered = requests.filter((r) => {
    const matchQ =
      r.ref.toLowerCase().includes(query.toLowerCase()) ||
      r.customer.toLowerCase().includes(query.toLowerCase()) ||
      r.requester.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || r.status === statusFilter;
    return matchQ && matchS;
  });

  const pendingCount = requests.filter((r) => r.status === 'En attente').length;
  const approvedCount = requests.filter((r) => r.status === 'Approuvée').length;

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PILOTAGE & SÉCURITÉ / DÉROGATIONS COMMERCIALES</div>
          <h1>Validations & Dérogations</h1>
          <p>Supervisez les demandes de dépassement d'encours, de remises exceptionnelles et de délais de paiement.</p>
        </div>
      </div>

      <div className="summary-strip">
        <div className="summary-box">
          <span>En Attente d'Approbation</span>
          <strong className="amber">{pendingCount} requêtes</strong>
        </div>
        <div className="summary-box">
          <span>Approuvées ce Mois</span>
          <strong className="green">{approvedCount} dérogations</strong>
        </div>
        <div className="summary-box">
          <span>Rejetées</span>
          <strong className="neutral">{requests.filter((r) => r.status === 'Rejetée').length} refus</strong>
        </div>
        <div className="summary-box">
          <span>Temps Moyen Décision</span>
          <strong className="blue">&lt; 45 minutes</strong>
        </div>
      </div>

      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">CIRCUIT DE VALIDATION</span>
            <h2>Demandes de dérogation hiérarchique</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} demandes
          </div>
        </div>

        <div className="table-tools">
          <div className="tool-actions" style={{ width: '100%', display: 'flex', gap: 12 }}>
            <label className="search-field" style={{ flex: 1 }}>
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par référence, client ou commercial demandeur…"
              />
            </label>

            <select
              className="select-compact"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente uniquement</option>
              <option value="Approuvée">Approuvées</option>
              <option value="Rejetée">Rejetées</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>RÉFÉRENCE</th>
                <th>OBJET DE LA DÉROGATION</th>
                <th>DEMANDEUR</th>
                <th>CLIENT CONCERNÉ</th>
                <th>ENCOURS / VALEUR</th>
                <th>JUSTIFICATION</th>
                <th>STATUT</th>
                <th>DÉCISION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="table-ref">{r.ref}</span>
                    <small className="under-ref">{r.created_at}</small>
                  </td>
                  <td>
                    <b style={{ color: 'var(--brand)' }}>{r.type}</b>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{r.requester}</span>
                  </td>
                  <td>
                    <b className="table-main">{r.customer}</b>
                    <small>{r.city}</small>
                  </td>
                  <td>
                    {r.type === 'Remise exceptionnelle' ? (
                      <b>{r.requested_amount}% de remise</b>
                    ) : (
                      <>
                        <b>{formatMoney(r.requested_amount)}</b>
                        <small>Plafond actuel : {formatMoney(r.credit_limit)}</small>
                      </>
                    )}
                  </td>
                  <td style={{ maxWidth: 260 }}>
                    <small style={{ color: 'var(--text-secondary)' }}>{r.reason}</small>
                    {r.reviewed_by && (
                      <small style={{ display: 'block', marginTop: 4, color: 'var(--brand)', fontWeight: 600 }}>
                        Décision par : {r.reviewed_by}
                      </small>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${
                      r.status === 'Approuvée' ? 'status-green' :
                      r.status === 'En attente' ? 'status-amber' : 'status-red'
                    }`}>
                      <i /> {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'En attente' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="button-primary"
                          style={{ padding: '4px 8px', fontSize: 11, background: '#059669' }}
                          onClick={() => handleDecision(r.id, 'Approuvée')}
                          title="Approuver la dérogation"
                        >
                          <Check size={12} /> Approuver
                        </button>
                        <button
                          className="button-secondary"
                          style={{ padding: '4px 8px', fontSize: 11, color: '#dc2626' }}
                          onClick={() => handleDecision(r.id, 'Rejetée')}
                          title="Rejeter la demande"
                        >
                          <X size={12} /> Refuser
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>
                        Traitée
                      </span>
                    )}
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
