import { useState } from 'react';
import {
  Tag, Search, Filter, Plus, CheckCircle2, XCircle, Clock,
  Calendar, Layers, Percent, Check, AlertCircle, Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PromoItem {
  id: number;
  code: string;
  name: string;
  type: 'Pourcentage' | 'Montant Fixe' | 'Franco de port';
  value: number;
  category: string;
  min_order_amount: number;
  start_date: string;
  end_date: string;
  status: 'Active' | 'Planifiée' | 'Expirée' | 'Désactivée';
  usage_count: number;
}

const INITIAL_PROMOS: PromoItem[] = [
  { id: 1, code: 'RAMADAN-2025', name: 'Offre Spéciale Ramadan B2B', type: 'Pourcentage', value: 10, category: 'Outillage & Électricité', min_order_amount: 10000, start_date: '01 Mar 2025', end_date: '31 Mar 2025', status: 'Active', usage_count: 24 },
  { id: 2, code: 'FLASH-POMPES', name: 'Déstockage Pompage Inox', type: 'Pourcentage', value: 15, category: 'Plomberie', min_order_amount: 5000, start_date: '20 Fév 2025', end_date: '05 Mar 2025', status: 'Active', usage_count: 12 },
  { id: 3, code: 'FRANCO-FREE', name: 'Livraison Gratuite 1ère Commande', type: 'Franco de port', value: 0, category: 'Tout le catalogue', min_order_amount: 2000, start_date: '01 Jan 2025', end_date: '31 Déc 2025', status: 'Active', usage_count: 85 },
  { id: 4, code: 'PRINTEMPS-CAB', name: 'Pack Câblage Industriel 3G2.5', type: 'Montant Fixe', value: 500, category: 'Électricité', min_order_amount: 15000, start_date: '15 Mar 2025', end_date: '30 Avr 2025', status: 'Planifiée', usage_count: 0 },
  { id: 5, code: 'HIVER-2024', name: 'Campagne Hiver Outillage', type: 'Pourcentage', value: 8, category: 'Outillage', min_order_amount: 8000, start_date: '01 Déc 2024', end_date: '31 Jan 2025', status: 'Expirée', usage_count: 64 },
];

export default function PromotionsManagement({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [promos, setPromos] = useState<PromoItem[]>(INITIAL_PROMOS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleToggleStatus(id: number) {
    setPromos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = p.status === 'Active' ? 'Désactivée' : 'Active';
        return { ...p, status: next };
      })
    );
    notify('Statut de la promotion mis à jour.');
  }

  const filtered = promos.filter((p) => {
    const matchQ =
      p.code.toLowerCase().includes(query.toLowerCase()) ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === 'all' || p.status === statusFilter;
    return matchQ && matchS;
  });

  const activeCount = promos.filter((p) => p.status === 'Active').length;

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">VENTES & MARKETING / REMISES & CAMPAGNES</div>
          <h1>Promotions & Remises</h1>
          <p>Configurez les codes promotionnels, les remises de volume et les conditions de franco.</p>
        </div>
        <div className="heading-actions">
          <button className="button-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Nouvelle promotion
          </button>
        </div>
      </div>

      <div className="summary-strip">
        <div className="summary-box">
          <span>Campagnes Actives</span>
          <strong className="green">{activeCount} promotions</strong>
        </div>
        <div className="summary-box">
          <span>Total Utilisations</span>
          <strong className="blue">{promos.reduce((s, p) => s + p.usage_count, 0)} fois</strong>
        </div>
        <div className="summary-box">
          <span>Planifiées à venir</span>
          <strong className="neutral">{promos.filter((p) => p.status === 'Planifiée').length} campagnes</strong>
        </div>
        <div className="summary-box">
          <span>Remise Moyenne</span>
          <strong className="amber">11.5%</strong>
        </div>
      </div>

      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">REGISTRE DES PROMOTIONS</span>
            <h2>Campagnes actives et archivées</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} campagnes
          </div>
        </div>

        <div className="table-tools">
          <div className="tool-actions" style={{ width: '100%', display: 'flex', gap: 12 }}>
            <label className="search-field" style={{ flex: 1 }}>
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par code promo, nom de campagne ou rayon…"
              />
            </label>

            <select
              className="select-compact"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="all">Tous les statuts</option>
              <option value="Active">Actives</option>
              <option value="Planifiée">Planifiées</option>
              <option value="Expirée">Expirées</option>
              <option value="Désactivée">Désactivées</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>CODE PROMO</th>
                <th>INTITULÉ DE L'OFFRE</th>
                <th>TYPE & VALEUR</th>
                <th>RAYON / FAMILLE</th>
                <th>MINIMUM COMMANDE</th>
                <th>VALIDITÉ</th>
                <th>UTILISATIONS</th>
                <th>STATUT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="table-ref" style={{ color: 'var(--brand)', fontWeight: 800 }}>{p.code}</span>
                  </td>
                  <td>
                    <b className="table-main">{p.name}</b>
                  </td>
                  <td>
                    <b>
                      {p.type === 'Pourcentage' ? `-${p.value}%` :
                       p.type === 'Montant Fixe' ? `-${p.value} DH` : 'Franco de port offert'}
                    </b>
                  </td>
                  <td>
                    <span>{p.category}</span>
                  </td>
                  <td>
                    <span>{p.min_order_amount ? `${p.min_order_amount.toLocaleString('fr-FR')} DH` : 'Aucun'}</span>
                  </td>
                  <td>
                    <small>{p.start_date} → {p.end_date}</small>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{p.usage_count}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      p.status === 'Active' ? 'status-green' :
                      p.status === 'Planifiée' ? 'status-blue' :
                      p.status === 'Expirée' ? 'status-red' : 'status-muted'
                    }`}>
                      <i /> {p.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="button-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                      onClick={() => handleToggleStatus(p.id)}
                    >
                      {p.status === 'Active' ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* New Promo Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <form
            className="record-modal"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const newP: PromoItem = {
                id: Date.now(),
                code: String(form.get('code')).toUpperCase(),
                name: String(form.get('name')),
                type: 'Pourcentage',
                value: Number(form.get('value')) || 10,
                category: String(form.get('category')) || 'Général',
                min_order_amount: Number(form.get('min_order_amount')) || 5000,
                start_date: 'Aujourd’hui',
                end_date: 'Dans 30 jours',
                status: 'Active',
                usage_count: 0,
              };
              setPromos([newP, ...promos]);
              setShowCreateModal(false);
              notify(`Promotion ${newP.code} activée avec succès.`);
            }}
          >
            <div className="modal-top">
              <div>
                <span className="eyebrow">NOUVELLE CAMPAGNE</span>
                <h2>Créer un code promo</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <label className="field-label">
              Code Promotionnel (ex: PROMO-10)
              <input name="code" placeholder="EX: REMISE-MAROC" required />
            </label>
            <label className="field-label">
              Nom de l'opération
              <input name="name" placeholder="Ex: Offre de bienvenue grossistes" required />
            </label>
            <label className="field-label">
              Remise en %
              <input name="value" type="number" defaultValue="10" required />
            </label>
            <label className="field-label">
              Rayon concerné
              <input name="category" placeholder="Ex: Outillage & Électroportatif" defaultValue="Tout le catalogue" required />
            </label>
            <label className="field-label">
              Seuil minimum de commande (DH HT)
              <input name="min_order_amount" type="number" defaultValue="5000" required />
            </label>

            <div className="modal-actions">
              <button type="button" className="button-secondary" onClick={() => setShowCreateModal(false)}>Annuler</button>
              <button type="submit" className="button-primary">Créer et activer</button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast-note"><Check size={16} />{toast}</div>}
    </div>
  );
}
