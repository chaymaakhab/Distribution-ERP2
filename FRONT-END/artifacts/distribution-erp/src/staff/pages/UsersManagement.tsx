import { useState } from 'react';
import {
  UserCheck, Search, Filter, Plus, Edit2, ShieldCheck,
  CheckCircle2, XCircle, Warehouse, Mail, Phone, Lock, X,
  Check, RefreshCw, CheckSquare, Square, Layers, Sparkles, Trash2,
} from 'lucide-react';
import {
  getStoredStaffUsers, saveStoredStaffUsers, DEFAULT_STAFF_USERS,
  ROLE_PERMISSIONS as DEFAULT_ROLE_PERMS,
  type StaffUserRecord as StaffUserItem,
} from '../mockAuth';

export type { StaffUserItem };

export interface RoleOption {
  code: string;
  label: string;
  badge: string;
  desc: string;
  color: string;
}

export const AVAILABLE_ROLES: RoleOption[] = [
  {
    code: 'superadmin',
    label: 'Super Admin',
    badge: 'Accès Total (*)',
    desc: 'Supervision multi-dépôts, audit, configuration et gestion intégrale.',
    color: '#0284c7',
  },
  {
    code: 'admin',
    label: 'Administrateur',
    badge: 'Gestion Globale',
    desc: 'Opérations complètes : dépôts, achats, clients, stocks et facturation.',
    color: '#0284c7',
  },
  {
    code: 'commercial',
    label: 'Commercial',
    badge: 'Ventes & CRM',
    desc: 'Devis, clients, commandes, tournées de visite et encaissements terrain.',
    color: '#0284c7',
  },
  {
    code: 'warehouse',
    label: 'Responsable Dépôt',
    badge: 'Stocks & Entrepôt',
    desc: 'Gestion des stocks physiques, transferts 2 étapes, réceptions et inventaires.',
    color: '#0284c7',
  },
  {
    code: 'preparation',
    label: 'Préparateur',
    badge: 'Scan Préparation',
    desc: 'Bons de préparation groupés par tournée, scanning code-barres et clôture.',
    color: '#0284c7',
  },
  {
    code: 'delivery',
    label: 'Livreur Dépôt',
    badge: 'Dépôt → Client',
    desc: 'Tournées de livraison, signature électronique (POD) et clôture caisse.',
    color: '#0284c7',
  },
  {
    code: 'pre_seller',
    label: 'Livreur-pré-vendeur',
    badge: 'Van Sales / Hwanet',
    desc: 'Vente directe hwanet/épiceries, prise de commandes directes et encaissement.',
    color: '#0284c7',
  },
  {
    code: 'accounting',
    label: 'Comptable',
    badge: 'Finance & Trésorerie',
    desc: 'Factures légales (ICE/IF), devis, règlements, chèques/effets et avoirs.',
    color: '#0284c7',
  },
];

export interface PermissionItem {
  code: string;
  label: string;
  desc: string;
}

export interface PermissionModuleGroup {
  id: string;
  name: string;
  permissions: PermissionItem[];
}

export const PERMISSION_MODULES: PermissionModuleGroup[] = [
  {
    id: 'pilotage',
    name: 'Pilotage & Tableaux de bord',
    permissions: [
      { code: 'dashboard.view', label: 'Accès tableau de bord', desc: 'Visualisation des indicateurs et KPIs d’activité' },
      { code: 'reports.view', label: 'Consulter les rapports', desc: 'Génération et export des rapports d’activité' },
    ],
  },
  {
    id: 'sales',
    name: 'Ventes, Devis & CRM Clients',
    permissions: [
      { code: 'orders.view', label: 'Consulter les commandes', desc: 'Liste et détail des commandes' },
      { code: 'orders.create', label: 'Créer une commande', desc: 'Saisie de bons de commandes' },
      { code: 'orders.validate', label: 'Valider / Refuser commandes', desc: 'Approbation en 1-clic des commandes clients' },
      { code: 'quotes.view', label: 'Consulter les devis', desc: 'Consultation des propositions chiffrées' },
      { code: 'quotes.create', label: 'Créer devis & proformas', desc: 'Établissement et conversion en facture' },
      { code: 'visits.view', label: 'Visites commerciales terrain', desc: 'Planning et comptes-rendus de visite' },
      { code: 'customers.view', label: 'Consulter le CRM clients', desc: 'Fiches clients, encours et historique' },
      { code: 'customers.create', label: 'Créer / Modifier clients', desc: 'Coordonnées, plafonds et tarifs' },
    ],
  },
  {
    id: 'catalog',
    name: 'Référentiel & Catalogue',
    permissions: [
      { code: 'products.view', label: 'Consulter le catalogue', desc: 'Fiches articles, codes-barres et tarifs' },
      { code: 'products.create', label: 'Créer / Modifier articles', desc: 'Ajout de références, TVA et prix' },
      { code: 'suppliers.view', label: 'Gestion des fournisseurs', desc: 'Annuaire et conditions fournisseurs' },
    ],
  },
  {
    id: 'warehouse',
    name: 'Entrepôt, Stocks & Achats',
    permissions: [
      { code: 'stock.view', label: 'Consulter les stocks', desc: 'Stocks physiques, réservés et disponibles' },
      { code: 'stock.transfer', label: 'Transferts inter-dépôts', desc: 'Expédition et réception en 2 étapes' },
      { code: 'stock.adjust', label: 'Ajustements & inventaires', desc: 'Régularisations de stock physique' },
      { code: 'warehouses.view', label: 'Gestion des dépôts', desc: 'Cartographie et indicateurs dépôts' },
      { code: 'purchases.view', label: 'Consulter les achats', desc: 'Bons de commandes et approvisionnement' },
      { code: 'purchases.receive', label: 'Réception des achats', desc: 'Contrôle quai réceptions fournisseurs' },
    ],
  },
  {
    id: 'prep',
    name: 'Préparation de Commandes',
    permissions: [
      { code: 'preparation.view', label: 'Bons de préparation', desc: 'Affichage des bons ordonnés par tournée' },
      { code: 'preparation.complete', label: 'Scan & validation préparation', desc: 'Scanning code-barres et clôture' },
    ],
  },
  {
    id: 'delivery',
    name: 'Distribution, Flotte & POD',
    permissions: [
      { code: 'deliveries.view', label: 'Consulter les livraisons', desc: 'Feuilles de route et arrêts livreurs' },
      { code: 'deliveries.start', label: 'Démarrer & suivre livraisons', desc: 'Statuts en route / arrivé' },
      { code: 'deliveries.complete', label: 'Preuve POD & signature', desc: 'Signature tactile et horodatage' },
      { code: 'cash_closings.create', label: 'Clôture de caisse livreur', desc: 'Déclaration des espèces et chèques reçus' },
    ],
  },
  {
    id: 'returns',
    name: 'Retours Marchandises & Avaries',
    permissions: [
      { code: 'returns.view', label: 'Consulter les retours', desc: 'Registre complet des retours et motifs' },
      { code: 'returns.create', label: 'Créer bon de retour', desc: 'Enregistrement de retour quai / camion' },
      { code: 'returns.confirm', label: 'Valider réintégration stock', desc: 'Verdict conformité et remise en stock' },
    ],
  },
  {
    id: 'finance',
    name: 'Finance, Facturation & Règlements',
    permissions: [
      { code: 'invoices.view', label: 'Consulter les factures', desc: 'Visualisation et export des factures légales' },
      { code: 'invoices.create', label: 'Émettre des factures', desc: 'Facturation légale avec mentions ICE/IF' },
      { code: 'credit_notes.create', label: 'Émettre des factures d’avoir', desc: 'Avoirs suite à retour ou régularisation' },
      { code: 'payments.view', label: 'Consulter les paiements', desc: 'Historique des règlements encaissés' },
      { code: 'payments.create', label: 'Enregistrer des règlements', desc: 'Paiements espèces, chèques, virements' },
      { code: 'cheques.view', label: 'Registre des chèques & traites', desc: 'Portefeuille et remises bancaires' },
      { code: 'cash_closings.validate', label: 'Valider clôtures de caisse', desc: 'Vérification et verrouillage comptable' },
    ],
  },
  {
    id: 'admin',
    name: 'Administration, Sécurité & Audit',
    permissions: [
      { code: 'users.view', label: 'Gestion des utilisateurs', desc: 'Comptes internes et attributions de rôles' },
      { code: 'roles.view', label: 'Matrice RBAC des rôles', desc: 'Configuration des permissions' },
      { code: 'settings.view', label: 'Paramètres système & fiscaux', desc: 'Configuration générale de la société' },
      { code: 'audit.view', label: 'Journal d’audit système', desc: 'Traçabilité des opérations sensibles' },
    ],
  },
];

export default function UsersManagement() {
  const [users, setUsers] = useState<StaffUserItem[]>(() => getStoredStaffUsers());
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUserItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRoles, setFormRoles] = useState<string[]>(['commercial']);
  const [formPermissions, setFormPermissions] = useState<string[]>(DEFAULT_ROLE_PERMS.commercial);
  const [formDepot, setFormDepot] = useState('Casablanca (DEP-01)');
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'roles' | 'permissions'>('roles');

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const roleNameMap: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Administrateur',
    commercial: 'Commercial',
    warehouse: 'Responsable Dépôt',
    preparation: 'Préparateur',
    delivery: 'Livreur Dépôt',
    pre_seller: 'Livreur-pré-vendeur (Hwanet)',
    accounting: 'Comptable',
  };

  const filtered = users.filter((u) => {
    const matchQ =
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.warehouse_name.toLowerCase().includes(query.toLowerCase()) ||
      u.roles.some((r) => (roleNameMap[r] || r).toLowerCase().includes(query.toLowerCase()));
    const matchRole = roleFilter === 'all' || u.roles.includes(roleFilter);
    return matchQ && matchRole;
  });

  function handleOpenAdd() {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRoles(['commercial']);
    setFormPermissions([...DEFAULT_ROLE_PERMS.commercial]);
    setFormDepot('Casablanca (DEP-01)');
    setActiveModalTab('profile');
    setModalOpen(true);
  }

  function handleOpenEdit(user: StaffUserItem) {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRoles(user.roles && user.roles.length > 0 ? user.roles : [user.primary_role]);
    setFormPermissions(user.custom_permissions && user.custom_permissions.length > 0 ? user.custom_permissions : ['dashboard.view']);
    setFormDepot(user.warehouse_name);
    setActiveModalTab('roles');
    setModalOpen(true);
  }

  function syncPermsForRoles(rolesList: string[]) {
    if (rolesList.includes('superadmin')) {
      setFormPermissions(['*']);
      return;
    }
    const unionPerms = new Set<string>();
    rolesList.forEach((r) => {
      const pList = DEFAULT_ROLE_PERMS[r] || [];
      pList.forEach((p) => unionPerms.add(p));
    });
    unionPerms.add('dashboard.view');
    setFormPermissions(Array.from(unionPerms));
  }

  function handleToggleRole(roleCode: string) {
    setFormRoles((prev) => {
      let updated: string[];
      if (prev.includes(roleCode)) {
        if (prev.length === 1) {
          notify('Un utilisateur doit posséder au moins un rôle assigné.');
          return prev;
        }
        updated = prev.filter((r) => r !== roleCode);
      } else {
        updated = [...prev, roleCode];
      }
      syncPermsForRoles(updated);
      return updated;
    });
  }

  function handleSyncPermissions() {
    syncPermsForRoles(formRoles);
    if (formRoles.includes('superadmin')) {
      notify('Permissions synchronisées : Accès total accordé (Super Admin).');
    } else {
      notify(`Permissions synchronisées : droits affectés selon les ${formRoles.length} rôles cochés.`);
    }
  }

  function handleSelectAllPermissions() {
    const allPerms: string[] = [];
    PERMISSION_MODULES.forEach((mod) => {
      mod.permissions.forEach((p) => {
        allPerms.push(p.code);
      });
    });
    setFormPermissions(allPerms);
    notify(`Toutes les permissions (${allPerms.length}) ont été sélectionnées.`);
  }

  function handleClearAllPermissions() {
    setFormPermissions(['dashboard.view']);
    notify('Toutes les permissions secondaires ont été décochées (accès tableau de bord conservé).');
  }

  function handleTogglePermission(permCode: string) {
    setFormPermissions((prev) => {
      if (prev.includes('*')) {
        const all: string[] = [];
        PERMISSION_MODULES.forEach((m) => m.permissions.forEach((p) => all.push(p.code)));
        return all.filter((p) => p !== permCode);
      }
      if (prev.includes(permCode)) {
        return prev.filter((p) => p !== permCode);
      }
      return [...prev, permCode];
    });
  }

  function handleToggleActive(id: number) {
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === id) {
          const next = !u.is_active;
          notify(`Compte de ${u.name} ${next ? 'réactivé' : 'suspendu'}.`);
          return { ...u, is_active: next };
        }
        return u;
      });
      saveStoredStaffUsers(updated);
      return updated;
    });
  }

  function handleDeleteUser(id: number, name: string) {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${name} ?`)) {
      setUsers((prev) => {
        const updated = prev.filter((u) => u.id !== id);
        saveStoredStaffUsers(updated);
        return updated;
      });
      notify(`Compte de ${name} supprimé avec succès.`);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (formRoles.length === 0) {
      notify('Erreur : Veuillez sélectionner au moins un rôle pour ce collaborateur.');
      return;
    }

    const assignedRoleLabels = formRoles.map((r) => roleNameMap[r] || r);
    const primaryRole = formRoles[0];
    const mainLabel = assignedRoleLabels.join(' + ');

    let finalPerms = [...formPermissions];
    if (finalPerms.length === 0) {
      const union = new Set<string>();
      formRoles.forEach((r) => {
        const pList = DEFAULT_ROLE_PERMS[r] || [];
        pList.forEach((p) => union.add(p));
      });
      finalPerms = Array.from(union);
    }
    if (!finalPerms.includes('*') && !finalPerms.includes('dashboard.view')) {
      finalPerms.unshift('dashboard.view');
    }

    let updatedList: StaffUserItem[];
    if (editingUser) {
      updatedList = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formName.trim(),
              email: formEmail.trim(),
              phone: formPhone.trim(),
              roles: formRoles,
              primary_role: primaryRole,
              role_label: mainLabel,
              role_labels: assignedRoleLabels,
              custom_permissions: finalPerms,
              warehouse_name: formDepot,
            }
          : u
      );
      notify(`Collaborateur ${formName} mis à jour (${formRoles.length} rôles, ${finalPerms.length} permissions sauvegardées).`);
    } else {
      const newUser: StaffUserItem = {
        id: Date.now(),
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        roles: formRoles,
        primary_role: primaryRole,
        role_label: mainLabel,
        role_labels: assignedRoleLabels,
        custom_permissions: finalPerms,
        warehouse_name: formDepot,
        is_active: true,
        last_login: 'Jamais connecté',
      };
      updatedList = [newUser, ...users];
      notify(`Nouveau collaborateur ${formName} créé avec succès (${finalPerms.length} permissions enregistrées).`);
    }
    setUsers(updatedList);
    saveStoredStaffUsers(updatedList);
    setModalOpen(false);
  }

  return (
    <div className="module-page users-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRATION ERP <span className="heading-slash">/</span> GESTION DES COMPTES & MULTI-RÔLES</div>
          <h1>Utilisateurs, Multi-Rôles & Permissions</h1>
          <p>
            Attribution des rôles cumulables (ex. Responsable dépôt + Préparateur + Livreur), gestion des permissions par case à cocher et rattachements aux dépôts.
          </p>
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
          <span>Utilisateurs Multi-Rôles</span>
          <strong style={{ color: '#0284c7' }}>
            {users.filter((u) => u.roles.length > 1).length} polyvalents
          </strong>
        </div>
        <div className="summary-box">
          <span>Flotte & Pré-vendeurs</span>
          <strong className="neutral">
            {users.filter((u) => u.roles.includes('delivery') || u.roles.includes('pre_seller')).length} chauffeurs / van
          </strong>
        </div>
        <div className="summary-box">
          <span>Administrateurs</span>
          <strong className="neutral">
            {users.filter((u) => u.roles.includes('superadmin') || u.roles.includes('admin')).length} superviseurs
          </strong>
        </div>
      </div>

      {/* Main Table Panel */}
      <section className="panel list-panel">
        <div className="list-panel-heading">
          <div>
            <span className="eyebrow">ANNUAIRE DES COLLABORATEURS ET HABILITATIONS</span>
            <h2>Liste des comptes internes ({filtered.length})</h2>
          </div>
          <div className="table-count">
            <span className="count-pulse" />
            {filtered.length} utilisateurs
          </div>
        </div>

        <div className="table-tools">
          <div className="table-tabs" style={{ flexWrap: 'wrap', gap: 6 }}>
            {[
              { id: 'all', label: 'Tous les rôles' },
              { id: 'superadmin', label: 'Super Admin' },
              { id: 'admin', label: 'Admin' },
              { id: 'commercial', label: 'Commercial' },
              { id: 'warehouse', label: 'Dépôt' },
              { id: 'preparation', label: 'Préparation' },
              { id: 'delivery', label: 'Livreur' },
              { id: 'pre_seller', label: 'Livreur-pré-vendeur' },
              { id: 'accounting', label: 'Comptable' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`table-tab ${roleFilter === tab.id ? 'active-tab' : ''}`}
                onClick={() => setRoleFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tool-actions">
            <label className="search-field">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher par nom, email, rôle, dépôt..."
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
                <th>RÔLES ATTRIBUÉS (MULTI-RÔLES)</th>
                <th>PERMISSIONS</th>
                <th>DÉPÔT RATTACHÉ</th>
                <th>DERNIÈRE CONNEXION</th>
                <th>STATUT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isMultiRole = u.roles.length > 1;
                const isSuper = u.roles.includes('superadmin');
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '11px', background: isMultiRole ? '#0369a1' : undefined }}>
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
                      {/* Multi-role badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 280 }}>
                        {u.roles.map((rCode) => (
                          <span
                            key={rCode}
                            className="status-pill status-blue"
                            style={{
                              fontSize: 10.5,
                              padding: '2px 8px',
                              fontWeight: 600,
                              background: rCode === 'superadmin' ? 'rgba(2,132,199,0.18)' : rCode === 'pre_seller' ? 'rgba(16,185,129,0.15)' : undefined,
                              color: rCode === 'pre_seller' ? '#059669' : undefined,
                              borderColor: rCode === 'pre_seller' ? 'rgba(16,185,129,0.3)' : undefined,
                            }}
                          >
                            <ShieldCheck size={11} style={{ display: 'inline', marginRight: 3 }} />
                            {roleNameMap[rCode] || rCode}
                          </span>
                        ))}
                      </div>
                      {isMultiRole && (
                        <span style={{ fontSize: 10, color: '#0284c7', fontWeight: 600, marginTop: 3, display: 'inline-block' }}>
                          ★ Cumul de {u.roles.length} rôles
                        </span>
                      )}
                    </td>
                    <td>
                      {isSuper || (u.custom_permissions && u.custom_permissions.includes('*')) ? (
                        <span className="status-pill status-blue" style={{ fontSize: 11, fontWeight: 700 }}>
                          Accès Intégral (*)
                        </span>
                      ) : (
                        <span style={{ fontSize: 11.5, color: '#334155', fontWeight: 600 }}>
                          {u.custom_permissions?.length || 0} droits cochés
                        </span>
                      )}
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
                          title="Modifier l'utilisateur & ajuster permissions"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="row-action"
                          title={u.is_active ? 'Suspendre le compte' : 'Activer le compte'}
                          onClick={() => handleToggleActive(u.id)}
                          style={{ color: u.is_active ? '#f59e0b' : '#22c55e' }}
                        >
                          {u.is_active ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                        {u.roles[0] !== 'superadmin' && (
                          <button
                            className="row-action"
                            title="Supprimer ce collaborateur"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Add / Edit Modal with Multi-Roles & Granular Permissions Checkboxes ── */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form
            className="record-modal"
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 760,
              width: '95%',
              maxHeight: '92vh',
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
            {/* Modal Top */}
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
                  {editingUser ? 'GESTION DES ACCÈS · ATTRIBUTION MULTI-RÔLES & PERMISSIONS' : 'NOUVEAU COMPTE · CONFIGURATION RBAC'}
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>
                  {editingUser ? `Modifier ${editingUser.name}` : 'Créer un nouveau collaborateur'}
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

            {/* Modal Internal Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                borderBottom: '1px solid #e2e8f0',
                padding: '0 16px',
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveModalTab('profile')}
                style={{
                  padding: '10px 14px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: activeModalTab === 'profile' ? '2px solid #0284c7' : '2px solid transparent',
                  color: activeModalTab === 'profile' ? '#0284c7' : '#64748b',
                }}
              >
                1. Profil & Contact
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('roles')}
                style={{
                  padding: '10px 14px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: activeModalTab === 'roles' ? '2px solid #0284c7' : '2px solid transparent',
                  color: activeModalTab === 'roles' ? '#0284c7' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                2. Rôles cumulés ({formRoles.length})
                <span style={{ background: '#0284c7', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 6px' }}>
                  Multi-rôles
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('permissions')}
                style={{
                  padding: '10px 14px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: activeModalTab === 'permissions' ? '2px solid #0284c7' : '2px solid transparent',
                  color: activeModalTab === 'permissions' ? '#0284c7' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                3. Permissions par Checkbox ({formPermissions.includes('*') ? 'Accès Total' : formPermissions.length})
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                background: '#ffffff',
              }}
            >
              {/* TAB 1: Profile & Contact */}
              {activeModalTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                    Nom et prénom *
                    <input
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex. Nadia El Amrani"
                      style={{
                        width: '100%',
                        height: 38,
                        padding: '0 10px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                          marginTop: 4,
                        }}
                      />
                    </label>

                    <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                      Téléphone mobile *
                      <input
                        required
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
                          marginTop: 4,
                        }}
                      />
                    </label>
                  </div>

                  <label className="field-label" style={{ color: '#334155', fontWeight: 600, fontSize: 12 }}>
                    Dépôt d'attachement principal
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
                        marginTop: 4,
                      }}
                      value={formDepot}
                      onChange={(e) => setFormDepot(e.target.value)}
                    >
                      <option value="Casablanca (DEP-01)">Casablanca (DEP-01)</option>
                      <option value="Rabat (DEP-02)">Rabat (DEP-02)</option>
                      <option value="Marrakech (DEP-03)">Marrakech (DEP-03)</option>
                      <option value="Tanger (DEP-04)">Tanger (DEP-04)</option>
                      <option value="Tous les dépôts">Tous les dépôts (Siège multi-sites)</option>
                    </select>
                  </label>

                  <div
                    style={{
                      background: '#f8fafc',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                      color: '#475569',
                    }}
                  >
                    💡 <b>Astuce :</b> Vous pouvez cocher plusieurs rôles dans l’onglet suivant (ex: Responsable Dépôt + Préparateur + Livreur), puis personnaliser les droits d’accès à la carte.
                  </div>
                </div>
              )}

              {/* TAB 2: Multi-Roles Checkboxes (User requested: "kola utilisateur plusiers roles par exemple responsable depo y9ed ykon preparateur et aussi livreur") */}
              {activeModalTab === 'roles' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    style={{
                      padding: '10px 14px',
                      background: '#f0f9ff',
                      borderRadius: 8,
                      border: '1px solid #bae6fd',
                      fontSize: 12.5,
                      color: '#0369a1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      <b>Attribution multi-rôles :</b> Cochez les cases pour cumuler les responsabilités de ce collaborateur.
                    </span>
                    <button
                      type="button"
                      onClick={handleSyncPermissions}
                      style={{
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '5px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <RefreshCw size={12} /> Synchroniser les droits
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
                    {AVAILABLE_ROLES.map((role) => {
                      const isChecked = formRoles.includes(role.code);
                      return (
                        <div
                          key={role.code}
                          onClick={() => handleToggleRole(role.code)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 8,
                            border: isChecked ? '2px solid #0284c7' : '1px solid #cbd5e1',
                            background: isChecked ? '#f0f9ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent onClick
                            style={{
                              marginTop: 3,
                              width: 17,
                              height: 17,
                              accentColor: '#0284c7',
                              cursor: 'pointer',
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <b style={{ fontSize: 13, color: isChecked ? '#0369a1' : '#0f172a' }}>
                                {role.label}
                              </b>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: isChecked ? '#0284c7' : '#f1f5f9',
                                  color: isChecked ? '#ffffff' : '#64748b',
                                  borderRadius: 4,
                                  padding: '1px 6px',
                                }}
                              >
                                {role.badge}
                              </span>
                            </div>
                            <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#64748b', lineHeight: 1.35 }}>
                              {role.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 12,
                    }}
                  >
                    <span>
                      Rôles actuellement cochés : <b>{formRoles.map((r) => roleNameMap[r] || r).join(', ')}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('permissions')}
                      style={{
                        background: '#e2e8f0',
                        color: '#334155',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Ajuster les permissions individuelles →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Granular Permissions Checkboxes (User requested: "super admin et le admin y9ed y3ti permision par check box") */}
              {activeModalTab === 'permissions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Toolbar actions */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      padding: '10px 14px',
                      background: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: 12.5, color: '#334155' }}>
                      <b>Gestion fine des droits :</b> {formPermissions.includes('*') ? 'Accès Intégral (*)' : `${formPermissions.length} droits activés`}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={handleSyncPermissions}
                        style={{
                          background: '#0284c7',
                          color: '#fff',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <RefreshCw size={12} /> Sync rôles cochés
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectAllPermissions}
                        style={{
                          background: '#f1f5f9',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Tout cocher
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllPermissions}
                        style={{
                          background: '#f1f5f9',
                          color: '#ef4444',
                          border: '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ✗ Tout décocher
                      </button>
                    </div>
                  </div>

                  {/* Modules Accordion / List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {PERMISSION_MODULES.map((mod) => {
                      const allModuleSelected = mod.permissions.every(
                        (p) => formPermissions.includes('*') || formPermissions.includes(p.code)
                      );
                      const someModuleSelected = mod.permissions.some(
                        (p) => formPermissions.includes('*') || formPermissions.includes(p.code)
                      );

                      return (
                        <div
                          key={mod.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              padding: '10px 14px',
                              background: '#f8fafc',
                              borderBottom: '1px solid #e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                              {mod.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const codes = mod.permissions.map((p) => p.code);
                                if (allModuleSelected) {
                                  setFormPermissions((prev) => prev.filter((p) => !codes.includes(p)));
                                } else {
                                  setFormPermissions((prev) => Array.from(new Set([...prev, ...codes])));
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#0284c7',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {allModuleSelected ? 'Tout décocher' : 'Tout cocher ce module'}
                            </button>
                          </div>

                          <div
                            style={{
                              padding: '12px 14px',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                              gap: 8,
                              background: '#ffffff',
                            }}
                          >
                            {mod.permissions.map((perm) => {
                              const isChecked = formPermissions.includes('*') || formPermissions.includes(perm.code);
                              return (
                                <label
                                  key={perm.code}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 8,
                                    padding: '6px 8px',
                                    borderRadius: 6,
                                    border: isChecked ? '1px solid #bae6fd' : '1px solid #f1f5f9',
                                    background: isChecked ? '#f0f9ff' : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleTogglePermission(perm.code)}
                                    style={{
                                      marginTop: 2,
                                      accentColor: '#0284c7',
                                      cursor: 'pointer',
                                    }}
                                  />
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: isChecked ? '#0369a1' : '#1e293b' }}>
                                      {perm.label}
                                    </div>
                                    <small style={{ fontSize: 10.5, color: '#64748b', display: 'block', lineHeight: 1.2 }}>
                                      {perm.desc}
                                    </small>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div
              className="modal-actions"
              style={{
                padding: '12px 22px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                position: 'sticky',
                bottom: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: 0,
              }}
            >
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {formRoles.length} rôle(s) sélectionné(s) · {formPermissions.includes('*') ? 'Accès total (*)' : `${formPermissions.length} droits`}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
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
                  {editingUser ? 'Enregistrer les modifications' : 'Créer le collaborateur'}
                </button>
              </div>
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
