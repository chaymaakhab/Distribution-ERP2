import { useState } from 'react';
import {
  MapPin, Search, Filter, Plus, CheckCircle2, Clock,
  Calendar, User, Building2, Check, AlertCircle, Phone,
  FileText, ArrowRight, MessageSquare, Map as MapIcon,
} from 'lucide-react';
import { api } from '../api';
import { RealCommercialVisitsMap } from '../components/RealCommercialVisitsMap';

interface CommercialVisitItem {
  id: number;
  customer: string;
  city: string;
  commercial: string;
  scheduled_at: string;
  type: 'Prospection' | 'Prise de commande' | 'Recouvrement' | 'Litige / Réclamation';
  status: 'Planifiée' | 'En cours' | 'Réalisée' | 'Reportée' | 'Annulée';
  notes: string;
  order_taken?: boolean;
}

const INITIAL_VISITS: CommercialVisitItem[] = [
  { id: 1, customer: 'Atlas Équipements SARL', city: 'Casablanca (Aïn Sebaâ)', commercial: 'Youssef Bennani', scheduled_at: 'Aujourd’hui 10:30', type: 'Prise de commande', status: 'Réalisée', notes: 'Commande CMD-2406 prise sur place. Client souhaite augmenter son plafond à 100k DH.', order_taken: true },
  { id: 2, customer: 'Comptoir Al Amal', city: 'Fès (Dokkarat)', commercial: 'Youssef Bennani', scheduled_at: 'Aujourd’hui 14:00', type: 'Recouvrement', status: 'En cours', notes: 'Récupération chèque de règlement 18 000 DH attendue.', order_taken: false },
  { id: 3, customer: 'BatiPro Maroc', city: 'Rabat (Agdal)', commercial: 'Mehdi Lahlou', scheduled_at: 'Demain 09:30', type: 'Prospection', status: 'Planifiée', notes: 'Présentation de la nouvelle gamme outillage et câbles 3G2.5.', order_taken: false },
  { id: 4, customer: 'Nord Industrie', city: 'Tanger (Gzenaya)', commercial: 'Mehdi Lahlou', scheduled_at: 'Demain 11:45', type: 'Prise de commande', status: 'Planifiée', notes: 'Réassort pompe immergée et disjoncteurs.', order_taken: false },
  { id: 5, customer: 'Maison du Bricolage', city: 'Marrakech (Géliz)', commercial: 'Hamid El Meskini', scheduled_at: 'Hier 16:00', type: 'Litige / Réclamation', status: 'Réalisée', notes: 'Échange 2 pièces défectueuses effectué. Client satisfait.', order_taken: false },
  { id: 6, customer: 'Quincaillerie Saada', city: 'Agadir (Dakhla)', commercial: 'Hamid El Meskini', scheduled_at: '25 Fév 15:00', type: 'Prise de commande', status: 'Reportée', notes: 'Gérant en déplacement, reporté au lundi suivant.', order_taken: false },
];

export default function CommercialVisits({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [visits, setVisits] = useState<CommercialVisitItem[]>(INITIAL_VISITS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleStatusChange(id: number, newStatus: CommercialVisitItem['status']) {
    setVisits((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
    notify(`Statut de la visite mis à jour : ${newStatus}`);
  }

  const filtered = visits.filter((v) => {
    const matchQ =
      v.customer.toLowerCase().includes(query.toLowerCase()) ||
      v.city.toLowerCase().includes(query.toLowerCase()) ||
      v.commercial.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || v.status === statusFilter;
    return matchQ && matchS;
  });

  const todayCount = visits.filter((v) => v.scheduled_at.includes('Aujourd')).length;
  const doneCount = visits.filter((v) => v.status === 'Réalisée').length;
  const ordersCount = visits.filter((v) => v.order_taken).length;

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">VENTES / CRM TERRAIN & TOURNÉES COMMERCIALES</div>
          <h1>Visites Commerciales Terrain</h1>
          <p>Planifiez les tournées des commerciaux, enregistrez les comptes-rendus et suivez le recouvrement en direct sur la carte.</p>
        </div>
        <div className="heading-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: 3, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              className={viewMode === 'map' ? 'button-primary' : 'button-secondary'}
              onClick={() => setViewMode('map')}
              style={{ height: 32, fontSize: 12, padding: '0 12px', gap: 6 }}
            >
              <MapIcon size={14} /> Carte GPS
            </button>
            <button
              className={viewMode === 'table' ? 'button-primary' : 'button-secondary'}
              onClick={() => setViewMode('table')}
              style={{ height: 32, fontSize: 12, padding: '0 12px', gap: 6 }}
            >
              <FileText size={14} /> Liste Agenda
            </button>
          </div>

          <button className="button-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Planifier une visite
          </button>
        </div>
      </div>

      <div className="summary-strip">
        <div className="summary-box">
          <span>Visites du Jour</span>
          <strong className="blue">{todayCount} visites</strong>
        </div>
        <div className="summary-box">
          <span>Visites Réalisées</span>
          <strong className="green">{doneCount} effectuées</strong>
        </div>
        <div className="summary-box">
          <span>Commandes Signées Terrain</span>
          <strong className="green">{ordersCount} commandes</strong>
        </div>
        <div className="summary-box">
          <span>En Attente / Planifiées</span>
          <strong className="amber">{visits.filter((v) => v.status === 'Planifiée').length} planifiées</strong>
        </div>
      </div>

      {/* Real Interactive Map for Commercial Visits */}
      {viewMode === 'map' && (
        <section className="panel" style={{ padding: '16px', borderRadius: '12px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span className="eyebrow">GÉOLOCALISATION CLIENTS & COMMERCIAUX</span>
              <h2 style={{ margin: 0, fontSize: 16 }}>Carte Satellite & Itinéraires des Tournées</h2>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {visits.length} points de visite répertoriés au Maroc
            </div>
          </div>
          <RealCommercialVisitsMap visits={visits} onStatusChange={handleStatusChange} />
        </section>
      )}

      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">AGENDA TERRAIN</span>
            <h2>Tournées et rendez-vous clients</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} visites répertoriées
          </div>
        </div>

        <div className="table-tools">
          <div className="tool-actions" style={{ width: '100%', display: 'flex', gap: 12 }}>
            <label className="search-field" style={{ flex: 1 }}>
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par client, commercial ou secteur…"
              />
            </label>

            <select
              className="select-compact"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="all">Tous les statuts</option>
              <option value="Planifiée">Planifiée</option>
              <option value="En cours">En cours</option>
              <option value="Réalisée">Réalisée</option>
              <option value="Reportée">Reportée</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>CLIENT & SECTEUR</th>
                <th>COMMERCIAL</th>
                <th>DATE & HEURE</th>
                <th>OBJECTIF VISITE</th>
                <th>RAPPORT / NOTES</th>
                <th>STATUT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <b className="table-main">{v.customer}</b>
                    <small><MapPin size={11} style={{ display: 'inline', marginRight: 2 }} /> {v.city}</small>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{v.commercial}</span>
                  </td>
                  <td>
                    <span>{v.scheduled_at}</span>
                  </td>
                  <td>
                    <span className="badge-tag" style={{
                      background: v.type === 'Prise de commande' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                      color: v.type === 'Prise de commande' ? '#059669' : '#0284c7',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 4,
                    }}>
                      {v.type}
                    </span>
                  </td>
                  <td style={{ maxWidth: 280 }}>
                    <small style={{ color: 'var(--text-secondary)' }}>{v.notes}</small>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      v.status === 'Réalisée' ? 'status-green' :
                      v.status === 'En cours' ? 'status-blue' :
                      v.status === 'Planifiée' ? 'status-amber' : 'status-red'
                    }`}>
                      <i /> {v.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {v.status !== 'Réalisée' && (
                        <button
                          className="button-primary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => handleStatusChange(v.id, 'Réalisée')}
                        >
                          <Check size={12} /> Clôturer
                        </button>
                      )}
                      {v.order_taken && (
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                          ✓ Bon signé
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Plan Visit Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <form
            className="record-modal"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const newV: CommercialVisitItem = {
                id: Date.now(),
                customer: String(form.get('customer')),
                city: String(form.get('city')),
                commercial: String(form.get('commercial')) || 'Youssef Bennani',
                scheduled_at: String(form.get('scheduled_at')) || 'Demain 10:00',
                type: (form.get('type') as any) || 'Prise de commande',
                status: 'Planifiée',
                notes: String(form.get('notes') || 'Visite planifiée dans la tournée.'),
                order_taken: false,
              };
              setVisits([newV, ...visits]);
              setShowCreateModal(false);
              notify(`Visite chez ${newV.customer} enregistrée au planning.`);
            }}
          >
            <div className="modal-top">
              <div>
                <span className="eyebrow">PLANNING TERRAIN</span>
                <h2>Nouvelle visite commerciale</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <label className="field-label">
              Client
              <input name="customer" placeholder="Ex: BatiPro Maroc" required />
            </label>
            <label className="field-label">
              Ville & Adresse
              <input name="city" placeholder="Ex: Rabat (Agdal)" required />
            </label>
            <label className="field-label">
              Commercial affecté
              <input name="commercial" defaultValue="Youssef Bennani" required />
            </label>
            <label className="field-label">
              Date & Heure
              <input name="scheduled_at" defaultValue="Demain 10:30" required />
            </label>
            <label className="field-label">
              Type de visite
              <select name="type">
                <option value="Prise de commande">Prise de commande</option>
                <option value="Prospection">Prospection & Nouveau compte</option>
                <option value="Recouvrement">Recouvrement / Récupération effets</option>
                <option value="Litige / Réclamation">Litige / SAV</option>
              </select>
            </label>
            <label className="field-label">
              Notes de préparation
              <input name="notes" placeholder="Points importants à aborder avec le client..." />
            </label>

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={() => setShowCreateModal(false)}>Annuler</button>
              <button type="submit" className="button-primary">Ajouter au planning</button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast-note"><Check size={16} />{toast}</div>}
    </div>
  );
}
