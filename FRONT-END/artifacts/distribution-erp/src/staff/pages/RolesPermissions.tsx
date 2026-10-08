import { useState } from 'react';
import {
  ShieldCheck, Check, X as LucideX, Lock, Shield, Eye, Settings,
  CheckCircle2, AlertCircle, Users,
} from 'lucide-react';

interface PermissionGroup {
  name: string;
  key: string;
  description: string;
  permissions: {
    code: string;
    label: string;
    description: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'Pilotage & Tableaux de bord',
    key: 'pilotage',
    description: 'Accès aux indicateurs d’activité, KPIs de chiffre d’affaires et rapports consolidés.',
    permissions: [
      { code: 'dashboard.view', label: 'Voir le tableau de bord', description: 'Accès au tableau de bord métier de l’espace attribué.' },
      { code: 'reports.view', label: 'Consulter les rapports', description: 'Génération et export des rapports d’activité, ventes et stocks.' },
    ],
  },
  {
    name: 'Ventes & CRM Clients',
    key: 'sales',
    description: 'Gestion des commandes clients, devis, encours et relances commerciales.',
    permissions: [
      { code: 'orders.view', label: 'Consulter les commandes', description: 'Affichage de la liste et du détail des commandes.' },
      { code: 'orders.create', label: 'Créer une commande', description: 'Saisie de nouvelles commandes pour les clients.' },
      { code: 'orders.validate', label: 'Valider / Refuser commande', description: 'Validation en 1-clic des commandes passées via le portail client.' },
      { code: 'quotes.create', label: 'Créer devis & proformas', description: 'Établissement de devis, offres chiffrées et conversion en facture.' },
      { code: 'visits.view', label: 'Visites commerciales terrain', description: 'Planification de tournées et saisie des comptes-rendus de visite.' },
      { code: 'customers.view', label: 'Consulter le CRM clients', description: 'Accès aux fiches clients, contacts et encours.' },
      { code: 'customers.create', label: 'Créer / Modifier client', description: 'Gestion des coordonnées, plafonds et grilles tarifaires.' },
    ],
  },
  {
    name: 'Référentiel & Catalogue',
    key: 'catalog',
    description: 'Articles, codes-barres, conditionnements et gestion des fournisseurs.',
    permissions: [
      { code: 'products.view', label: 'Consulter le catalogue', description: 'Recherche et consultation des fiches articles et tarifs.' },
      { code: 'products.create', label: 'Créer / Modifier produits', description: 'Ajout de nouveaux articles, TVA et grilles de prix.' },
      { code: 'suppliers.view', label: 'Gestion des fournisseurs', description: 'Annuaire des fournisseurs et conditions d’approvisionnement.' },
    ],
  },
  {
    name: 'Entrepôt, Stocks & Préparation',
    key: 'warehouse',
    description: 'Niveaux de stocks physiques/réservés/disponibles, transferts et scan préparation.',
    permissions: [
      { code: 'stock.view', label: 'Consulter l’état des stocks', description: 'Visualisation des quantités physiques, réservées et disponibles.' },
      { code: 'stock.transfer', label: 'Effectuer un transfert', description: 'Initiation et réception de transferts inter-dépôts en 2 étapes.' },
      { code: 'preparation.view', label: 'Bons de préparation groupés', description: 'Affichage des bons de préparation ordonnés par emplacement.' },
      { code: 'preparation.complete', label: 'Scan & validation préparation', description: 'Scanning code-barres et clôture de préparation avant expédition.' },
      { code: 'warehouses.view', label: 'Carte & fiches des dépôts', description: 'Visualisation cartographique et performance des dépôts.' },
    ],
  },
  {
    name: 'Distribution, Tournées & POD',
    key: 'delivery',
    description: 'Ordonnancement des tournées, arrêts livreurs et signatures électroniques.',
    permissions: [
      { code: 'deliveries.view', label: 'Consulter les tournées', description: 'Visualisation des tournées actives et feuilles de route.' },
      { code: 'deliveries.start', label: 'Démarrer & valider livraison', description: 'Mise à jour en temps réel des arrêts (En route, Arrivé).' },
      { code: 'deliveries.complete', label: 'Preuve POD & signature tactile', description: 'Enregistrement de la signature du réceptionnaire et horodatage.' },
      { code: 'cash_closings.create', label: 'Clôture de caisse livreur', description: 'Saisie des règlements perçus et calcul automatique de l’écart.' },
    ],
  },
  {
    name: 'Finance, Facturation & Effets',
    key: 'finance',
    description: 'Factures légales marocaines (ICE/IF), registre des chèques/traites et bordereaux.',
    permissions: [
      { code: 'invoices.view', label: 'Consulter les factures', description: 'Visualisation des factures émises et ventilation TVA.' },
      { code: 'invoices.create', label: 'Émettre / Imprimer facture', description: 'Génération de factures conformes avec mentions légales.' },
      { code: 'credit_notes.create', label: 'Émettre factures d’avoir', description: 'Gestion des avoirs clients suite à retour ou régularisation.' },
      { code: 'payments.create', label: 'Enregistrer des règlements', description: 'Affectation des encaissements (espèces, chèques, virements).' },
      { code: 'cheques.view', label: 'Registre des chèques & traites', description: 'Suivi du portefeuille, remises en banque et relances impayés.' },
      { code: 'cash_closings.validate', label: 'Valider clôtures de caisse', description: 'Contrôle et verrouillage comptable des clôtures quotidiennes.' },
    ],
  },
  {
    name: 'Administration, Sécurité & Audit',
    key: 'admin',
    description: 'Paramétrage global, attribution des rôles et traçabilité des opérations critiques.',
    permissions: [
      { code: 'users.view', label: 'Gestion des utilisateurs', description: 'Création de comptes, réinitialisation et activation.' },
      { code: 'roles.view', label: 'Configuration des rôles (RBAC)', description: 'Matrice des permissions et droits d’accès.' },
      { code: 'settings.view', label: 'Paramètres société & fiscaux', description: 'Configuration des taux de TVA, dépôts et mentions légales.' },
      { code: 'audit.view', label: 'Journal d’audit système', description: 'Historique des connexions et des modifications sensibles.' },
    ],
  },
];

const ROLES_DEFINITIONS = [
  {
    code: 'superadmin',
    name: 'Super Admin',
    badge: 'Accès Intégral (*)',
    color: '#0284c7',
    home: '/admin/dashboard',
    scope: 'Supervision multi-dépôts, gestion complète des utilisateurs, configuration système, audit et tous les modules ERP.',
    permissions: ['*'],
  },
  {
    code: 'admin',
    name: 'Administrateur',
    badge: 'Gestion Globale',
    color: '#0284c7',
    home: '/administrator/dashboard',
    scope: 'Gestion opérationnelle complète : dépôts, CRM clients, catalogue, approvisionnements, facturation et utilisateurs.',
    permissions: [
      'dashboard.view', 'reports.view', 'orders.view', 'orders.create', 'orders.validate',
      'customers.view', 'customers.create', 'products.view', 'products.create', 'suppliers.view',
      'stock.view', 'stock.transfer', 'preparation.view', 'warehouses.view',
      'deliveries.view', 'invoices.view', 'invoices.create', 'payments.create',
      'cheques.view', 'cash_closings.validate', 'users.view', 'roles.view', 'settings.view', 'audit.view',
    ],
  },
  {
    code: 'commercial',
    name: 'Commercial',
    badge: 'Ventes & CRM',
    color: '#0284c7',
    home: '/sales/dashboard',
    scope: 'Portefeuille clients attitré, validation des commandes de ses clients, visites terrain, consultation des grilles de prix, encaissements selon permissions et relances.',
    permissions: [
      'dashboard.view', 'reports.view', 'orders.view', 'orders.create', 'orders.validate',
      'visits.view', 'quotes.create', 'customers.view', 'customers.create', 'products.view',
      'invoices.view', 'payments.create',
    ],
  },
  {
    code: 'warehouse',
    name: 'Responsable Dépôt',
    badge: 'Stocks & Entrepôt',
    color: '#0284c7',
    home: '/warehouse/dashboard',
    scope: 'Gestion du stock physique/disponible de son dépôt, transferts inter-dépôts en 2 étapes, réceptions et clôture caisse comptoir.',
    permissions: [
      'dashboard.view', 'reports.view', 'orders.view', 'products.view', 'stock.view',
      'stock.transfer', 'preparation.view', 'preparation.complete', 'warehouses.view', 'deliveries.view',
      'cash_closings.create',
    ],
  },
  {
    code: 'preparation',
    name: 'Préparateur',
    badge: 'Préparation & Scan',
    color: '#0284c7',
    home: '/preparation/dashboard',
    scope: 'Bons de préparation groupés par tournée, scanning code-barres et déclaration des reliquats/articles manquants.',
    permissions: [
      'dashboard.view', 'products.view', 'orders.view', 'stock.view',
      'preparation.view', 'preparation.complete',
    ],
  },
  {
    code: 'delivery',
    name: 'Livreur',
    badge: 'Distribution & POD',
    color: '#0284c7',
    home: '/delivery/dashboard',
    scope: 'Application mobile de tournée ordonnée, signature électronique client, encaissement espèces/chèques et clôture de caisse.',
    permissions: [
      'dashboard.view', 'customers.view', 'orders.view', 'deliveries.view',
      'deliveries.start', 'deliveries.complete', 'payments.create', 'cash_closings.create',
    ],
  },
  {
    code: 'pre_seller',
    name: 'Livreur-pré-vendeur',
    badge: 'Van Sales / Proximité',
    color: '#0284c7',
    home: '/delivery/dashboard',
    scope: 'Distribution aux commerces de proximité & points de vente : prise de commande sur place, vente directe embarquée, encaissements et réapprovisionnement.',
    permissions: [
      'dashboard.view', 'customers.view', 'customers.create', 'orders.view', 'orders.create',
      'deliveries.view', 'deliveries.start', 'deliveries.complete', 'payments.create', 'cash_closings.create',
    ],
  },
  {
    code: 'accounting',
    name: 'Comptable',
    badge: 'Finance & Trésorerie',
    color: '#0284c7',
    home: '/accounting/dashboard',
    scope: 'Facturation légale marocaine, création de devis & proformas, registre des paiements, chèques et effets, balance âgée des créances, factures d’avoir et rapports financiers.',
    permissions: [
      'dashboard.view', 'reports.view', 'customers.view', 'suppliers.view',
      'orders.view', 'orders.create', 'quotes.create', 'credit_notes.create',
      'invoices.view', 'invoices.create', 'payments.create',
      'cheques.view', 'cash_closings.create', 'cash_closings.validate',
    ],
  },
];

export default function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState<string>('superadmin');
  const [toast, setToast] = useState<string | null>(null);

  const activeRoleDef = ROLES_DEFINITIONS.find((r) => r.code === selectedRole) || ROLES_DEFINITIONS[0];

  function hasRolePermission(roleCode: string, permCode: string): boolean {
    const r = ROLES_DEFINITIONS.find((item) => item.code === roleCode);
    if (!r) return false;
    if (r.permissions.includes('*')) return true;
    return r.permissions.includes(permCode);
  }

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="module-page roles-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">CONTRÔLE D'ACCÈS RBAC <span className="heading-slash">/</span> SÉCURITÉ & PERMISSIONS</div>
          <h1>Rôles & Droits d'Accès</h1>
          <p>Matrice des autorisations par rôle. Les restrictions sont strictement appliquées côté serveur et côté interface.</p>
        </div>
      </div>

      {/* Role selector pills */}
      <div className="table-tabs" style={{ marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
        {ROLES_DEFINITIONS.map((r) => (
          <button
            key={r.code}
            className={`table-tab ${selectedRole === r.code ? 'active-tab' : ''}`}
            onClick={() => setSelectedRole(r.code)}
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            <ShieldCheck size={14} />
            <b>{r.name}</b>
          </button>
        ))}
      </div>

      {/* Active Role Card Overview */}
      <section className="panel" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800 }}>{activeRoleDef.name}</span>
              <span className="status-pill status-blue">{activeRoleDef.badge}</span>
            </div>
            <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '12.5px', maxWidth: '80ch' }}>
              {activeRoleDef.scope}
            </p>
          </div>
          <div style={{ background: 'var(--navy-2)', padding: '8px 14px', borderRadius: '6px', fontSize: '11.5px', border: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--muted)' }}>Tableau de bord par défaut : </span>
            <code>{activeRoleDef.home}</code>
          </div>
        </div>
      </section>

      {/* Permissions Matrix by Group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {PERMISSION_GROUPS.map((group) => (
          <section className="panel" key={group.key} style={{ padding: '16px' }}>
            <div className="panel-heading" style={{ marginBottom: '12px' }}>
              <div>
                <span className="eyebrow">{group.name.toUpperCase()}</span>
                <h2>{group.name}</h2>
              </div>
              <small style={{ color: 'var(--muted)' }}>{group.description}</small>
            </div>

            <div className="table-container">
              <table className="data-table module-table">
                <thead>
                  <tr>
                    <th style={{ width: '220px' }}>CODE PERMISSION</th>
                    <th>LIBELLÉ & DESCRIPTION</th>
                    <th style={{ textAlign: 'center', width: '160px' }}>ACCÈS {activeRoleDef.name.toUpperCase()}</th>
                  </tr>
                </thead>
                <tbody>
                  {group.permissions.map((perm) => {
                    const isGranted = hasRolePermission(selectedRole, perm.code);
                    return (
                      <tr key={perm.code}>
                        <td>
                          <code style={{ fontSize: '11.5px', color: '#38bdf8' }}>{perm.code}</code>
                        </td>
                        <td>
                          <b>{perm.label}</b>
                          <small style={{ display: 'block', color: 'var(--muted)', marginTop: '2px' }}>
                            {perm.description}
                          </small>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isGranted ? (
                            <span
                              className="status-pill status-green"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Check size={12} strokeWidth={3} /> Autorisé
                            </span>
                          ) : (
                            <span
                              className="status-pill status-red"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <LucideX size={12} strokeWidth={3} /> Refusé
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {toast && (
        <div className="toast-note">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  );
}
