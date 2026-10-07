// Permission-gated navigation for the staff workspaces.
// Each module maps a URL segment to the granular permission required to see
// and open it. The sidebar, the route guard and the workspace shortcuts all
// read from this single source of truth, so a user can never reach a page they
// lack the permission for — even by typing the URL.

import {
  LayoutDashboard, ClipboardList, Package, Boxes, Users, Building2, ShoppingCart,
  PackageCheck, Truck, BadgeDollarSign, HandCoins, Undo2, BarChart3, Warehouse,
  UserCheck, ShieldCheck, Settings, ScrollText, Database, type LucideIcon,
} from 'lucide-react';

export interface NavModule {
  segment: string;
  label: string;
  icon: LucideIcon;
  permission: string;
  group: string;
}

export const NAV_GROUPS = [
  'Pilotage',
  'Ventes',
  'Référentiel',
  'Entrepôt',
  'Distribution',
  'Finance',
  'Administration',
] as const;

export const MODULES: NavModule[] = [
  { segment: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, permission: 'dashboard.view', group: 'Pilotage' },
  { segment: 'reports', label: 'Rapports', icon: BarChart3, permission: 'reports.view', group: 'Pilotage' },

  { segment: 'orders', label: 'Commandes', icon: ClipboardList, permission: 'orders.view', group: 'Ventes' },
  { segment: 'customers', label: 'Clients', icon: Users, permission: 'customers.view', group: 'Ventes' },

  { segment: 'products', label: 'Catalogue', icon: Package, permission: 'products.view', group: 'Référentiel' },
  { segment: 'suppliers', label: 'Fournisseurs', icon: Building2, permission: 'suppliers.view', group: 'Référentiel' },

  { segment: 'inventory', label: 'Stocks', icon: Boxes, permission: 'stock.view', group: 'Entrepôt' },
  { segment: 'warehouses', label: 'Dépôts', icon: Warehouse, permission: 'warehouses.view', group: 'Entrepôt' },
  { segment: 'fleet', label: 'Flotte & Livreurs', icon: Truck, permission: 'stock.view', group: 'Entrepôt' },
  { segment: 'purchasing', label: 'Achats', icon: ShoppingCart, permission: 'purchases.view', group: 'Entrepôt' },
  { segment: 'preparation', label: 'Préparation', icon: PackageCheck, permission: 'preparation.view', group: 'Entrepôt' },

  { segment: 'deliveries', label: 'Livraisons', icon: Truck, permission: 'deliveries.view', group: 'Distribution' },
  { segment: 'returns', label: 'Retours', icon: Undo2, permission: 'returns.view', group: 'Distribution' },

  { segment: 'finance', label: 'Facturation', icon: BadgeDollarSign, permission: 'invoices.view', group: 'Finance' },
  { segment: 'payments', label: 'Paiements', icon: HandCoins, permission: 'payments.view', group: 'Finance' },

  { segment: 'users', label: 'Utilisateurs', icon: UserCheck, permission: 'users.view', group: 'Administration' },
  { segment: 'roles', label: 'Rôles & droits', icon: ShieldCheck, permission: 'roles.view', group: 'Administration' },
  { segment: 'settings', label: 'Paramètres', icon: Settings, permission: 'settings.view', group: 'Administration' },
  { segment: 'audit', label: 'Journal d’audit', icon: ScrollText, permission: 'audit.view', group: 'Administration' },
  { segment: 'maintenance', label: 'Maintenance & BD', icon: Database, permission: 'settings.manage', group: 'Administration' },
];

export function findModule(segment: string): NavModule | undefined {
  return MODULES.find((m) => m.segment === segment);
}
