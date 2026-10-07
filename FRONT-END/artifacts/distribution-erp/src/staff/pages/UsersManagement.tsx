import { useState } from 'react';
import {
  UserCheck, Search, Filter, Plus, Edit2, ShieldCheck,
  CheckCircle2, XCircle, Warehouse, Mail, Phone, Lock, X,
} from 'lucide-react';

export interface StaffUserItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  primary_role: string;
  role_label: string;
  warehouse_name: string;
  is_active: boolean;
  last_login: string;
}

const INITIAL_USERS: StaffUserItem[] = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'superadmin@hercules-erp.ma',
    phone: '+212 522 00 00 00',
    primary_role: 'superadmin',
    role_label: 'Super Admin',
    warehouse_name: 'Tous les dépôts',
    is_active: true,
    last_login: 'Aujourd’hui 17:30',
  },
  {
    id: 2,
    name: 'Amine El Fassi',
    email: 'admin@hercules-erp.ma',
    phone: '+212 661 11 22 33',
    primary_role: 'admin',
    role_label: 'Administrateur',
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 16:45',
  },
  {
    id: 3,
    name: 'Nadia El Amrani',
    email: 'depot@hercules-erp.ma',
    phone: '+212 662 33 44 55',
    primary_role: 'warehouse',
    role_label: 'Responsable Dépôt',
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 15:20',
  },
  {
    id: 4,
    name: 'Youssef Bennani',
    email: 'commercial@hercules-erp.ma',
    phone: '+212 663 55 66 77',
    primary_role: 'commercial',
    role_label: 'Commercial',
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 14:10',
  },
  {
    id: 5,
    name: 'Karim Ouazzani',
    email: 'preparation@hercules-erp.ma',
    phone: '+212 664 77 88 99',
    primary_role: 'preparation',
    role_label: 'Préparateur',
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 11:30',
  },
  {
    id: 6,
    name: 'Mehdi Lahlou',
    email: 'livreur@hercules-erp.ma',
    phone: '+212 665 99 00 11',
    primary_role: 'delivery',
    role_label: 'Livreur',
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 12:00',
  },
  {
    id: 7,
    name: 'Sofia Cherkaoui',
    email: 'compta@hercules-erp.ma',
    phone: '+212 666 12 34 56',
    primary_role: 'accounting',
    role_label: 'Comptable',
    warehouse_name: 'Siège Casablanca',
    is_active: true,
    last_login: 'Aujourd’hui 16:00',
  },
  {
    id: 8,
    name: 'Salma Idrissi',
    email: 'salma@hercules-erp.ma',
    phone: '+212 667 23 45 67',
    primary_role: 'commercial',
    role_label: 'Commercial',
    warehouse_name: 'Rabat (DEP-02)',
    is_active: true,
    last_login: 'Hier 18:00',
  },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<StaffUserItem[]>(INITIAL_USERS);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUserItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('commercial');
  const [formDepot, setFormDepot] = useState('Casablanca (DEP-01)');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = users.filter((u) => {
    const matchQ =
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.warehouse_name.toLowerCase().includes(query.toLowerCase());
    const matchRole = roleFilter === 'all' || u.primary_role === roleFilter;
    return matchQ && matchRole;
  });

  function handleOpenAdd() {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('commercial');
    setFormDepot('Casablanca (DEP-01)');
    setModalOpen(true);
  }

  function handleOpenEdit(user: StaffUserItem) {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.primary_role);
    setFormDepot(user.warehouse_name);
    setModalOpen(true);
  }

  function handleToggleActive(id: number) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = !u.is_active;
          notify(`Compte de ${u.name} ${next ? 'réactivé' : 'suspendu'}.`);
          return { ...u, is_active: next };
        }
        return u;
      })
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const roleLabels: Record<string, string> = {
      superadmin: 'Super Admin',
      admin: 'Administrateur',
      commercial: 'Commercial',
      warehouse: 'Responsable Dépôt',
      preparation: 'Préparateur',
      delivery: 'Livreur',
      accounting: 'Comptable',
    };

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formName,
                email: formEmail,
                phone: formPhone,
                primary_role: formRole,
                role_label: roleLabels[formRole] || formRole,
                warehouse_name: formDepot,
              }
            : u
        )
      );
      notify(`Utilisateur ${formName} mis à jour avec succès.`);
    } else {
      const newUser: StaffUserItem = {
        id: Date.now(),
        name: formName,
        email: formEmail,
        phone: formPhone,
        primary_role: formRole,
        role_label: roleLabels[formRole] || formRole,
        warehouse_name: formDepot,
        is_active: true,
        last_login: 'Jamais connecté',
      };
      setUsers((prev) => [newUser, ...prev]);
      notify(`Nouvel utilisateur ${formName} créé avec succès.`);
    }
    setModalOpen(false);
  }

  return (
    <div className="module-page users-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRATION ERP <span className="heading-slash">/</span> GESTION DES COMPTES</div>
          <h1>Utilisateurs & Collaborateurs</h1>
          <p>Gestion des comptes internes, attributions de rôles et rattachements aux dépôts.</p>
        </div>
        <div className="heading-actions">
          <button className="button-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="summary-strip">
        <div className="summary-box">
          <span>Comptes actifs</span>
          <strong className="blue">{users.filter((u) => u.is_active).length} collaborateurs</strong>
        </div>
        <div className="summary-box">
          <span>Équipe commerciale</span>
          <strong className="neutral">{users.filter((u) => u.primary_role === 'commercial').length} commerciaux</strong>
        </div>
        <div className="summary-box">
          <span>Logistique & Terrain</span>
          <strong className="neutral">{users.filter((u) => ['warehouse', 'preparation', 'delivery'].includes(u.primary_role)).length} agents</strong>
        </div>
        <div className="summary-box">
          <span>Administrateurs</span>
          <strong className="neutral">{users.filter((u) => ['superadmin', 'admin'].includes(u.primary_role)).length} accès complets</strong>
        </div>
      </div>

      {/* Main Table Panel */}
      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">ANNUAIRE DES COLLABORATEURS</span>
            <h2>Liste des comptes internes ({filtered.length})</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} utilisateurs
          </div>
        </div>

        <div className="table-tools">
          <div className="table-tabs">
            {['all', 'superadmin', 'admin', 'commercial', 'warehouse', 'preparation', 'delivery', 'accounting'].map((r) => (
              <button
                key={r}
                className={`table-tab ${roleFilter === r ? 'active-tab' : ''}`}
                onClick={() => setRoleFilter(r)}
              >
                {r === 'all'
                  ? 'Tous les rôles'
                  : r === 'superadmin'
                  ? 'Super Admin'
                  : r === 'admin'
                  ? 'Admin'
                  : r === 'commercial'
                  ? 'Commercial'
                  : r === 'warehouse'
                  ? 'Dépôt'
                  : r === 'preparation'
                  ? 'Préparation'
                  : r === 'delivery'
                  ? 'Livreur'
                  : 'Comptable'}
              </button>
            ))}
          </div>
          <div className="tool-actions">
            <label className="search-field">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par nom, email, dépôt..."
              />
            </label>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>COLLABORATEUR</th>
                <th>CONTACT & EMAIL</th>
                <th>RÔLE PRINCIPAL</th>
                <th>DÉPÔT RATTACHÉ</th>
                <th>DERNIÈRE CONNEXION</th>
                <th>STATUT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                        {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div>
                        <b className="table-main">{u.name}</b>
                        <small style={{ display: 'block', color: 'var(--muted)', fontSize: '11px' }}>
                          ID: #{u.id}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span>{u.email}</span>
                      <small style={{ display: 'block', color: 'var(--muted)' }}>{u.phone}</small>
                    </div>
                  </td>
                  <td>
                    <span className="status-pill status-blue">
                      <ShieldCheck size={12} /> {u.role_label}
                    </span>
                  </td>
                  <td>
                    <span className="table-secondary">{u.warehouse_name}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{u.last_login}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${u.is_active ? 'status-green' : 'status-red'}`}>
                      <i /> {u.is_active ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="row-action"
                        title="Modifier l'utilisateur"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="row-action"
                        title={u.is_active ? 'Suspendre le compte' : 'Activer le compte'}
                        onClick={() => handleToggleActive(u.id)}
                        style={{ color: u.is_active ? '#ef4444' : '#22c55e' }}
                      >
                        {u.is_active ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form
            className="record-modal"
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 540,
              width: '95%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              padding: 0,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 12,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              border: '1px solid #e2e8f0',
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
                  {editingUser ? 'GESTION DES ACCÈS · MODIFICATION' : 'GESTION DES ACCÈS · NOUVEAU COMPTE'}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  {editingUser ? `Modifier ${editingUser.name}` : 'Enregistrer un nouveau collaborateur'}
                </h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setModalOpen(false)}
                style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                padding: '18px 22px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: '#ffffff',
              }}
            >
              <p
                style={{
                  fontSize: 12.5,
                  color: '#64748b',
                  margin: 0,
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                }}
              >
                L'utilisateur recevra ses accès sécurisés avec le rôle et le dépôt assignés conformément à la matrice de sécurité.
              </p>

              <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                Nom et prénom *
                <input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex. Youssef Bennani"
                  style={{
                    width: '100%',
                    height: 38,
                    padding: '0 10px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: 13,
                  }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Email professionnel *
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="nom@hercules-erp.ma"
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Téléphone mobile
                  <input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+212 6..."
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Rôle attribué
                  <select
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                  >
                    <option value="superadmin">Super Admin (Accès total)</option>
                    <option value="admin">Administrateur</option>
                    <option value="commercial">Commercial</option>
                    <option value="warehouse">Responsable Dépôt</option>
                    <option value="preparation">Préparateur</option>
                    <option value="delivery">Livreur</option>
                    <option value="accounting">Comptable</option>
                  </select>
                </label>

                <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                  Dépôt de rattachement
                  <select
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 10px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: 13,
                    }}
                    value={formDepot}
                    onChange={(e) => setFormDepot(e.target.value)}
                  >
                    <option value="Casablanca (DEP-01)">Casablanca (DEP-01)</option>
                    <option value="Rabat (DEP-02)">Rabat (DEP-02)</option>
                    <option value="Marrakech (DEP-03)">Marrakech (DEP-03)</option>
                    <option value="Tanger (DEP-04)">Tanger (DEP-04)</option>
                    <option value="Tous les dépôts">Tous les dépôts (Siège)</option>
                  </select>
                </label>
              </div>
            </div>

            <div
              className="modal-actions"
              style={{
                padding: '12px 22px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                position: 'sticky',
                bottom: 0,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                margin: 0,
              }}
            >
              <button
                type="button"
                className="button-secondary"
                onClick={() => setModalOpen(false)}
                style={{
                  height: 38,
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
                className="button-primary"
                type="submit"
                style={{
                  height: 38,
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
                <CheckCircle2 size={16} />
                {editingUser ? 'Enregistrer les modifications' : 'Enregistrer le collaborateur'}
              </button>
            </div>
          </form>
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
