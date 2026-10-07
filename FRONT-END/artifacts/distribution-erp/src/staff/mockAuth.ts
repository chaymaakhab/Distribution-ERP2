import type { StaffUser } from './api';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: ['*'],
  admin: [
    'dashboard.view',
    'products.view', 'products.create', 'products.update',
    'categories.view', 'categories.manage', 'brands.view', 'brands.manage',
    'customers.view', 'customers.create', 'customers.update', 'customer_accounts.manage',
    'suppliers.view', 'suppliers.create', 'suppliers.update',
    'orders.view', 'orders.create', 'orders.update', 'orders.validate', 'orders.confirm', 'orders.cancel', 'orders.assign',
    'stock.view', 'stock.transfer', 'stock.adjust', 'stock.inventory',
    'warehouses.view', 'warehouses.manage',
    'purchases.view', 'purchases.create', 'purchases.receive',
    'preparation.view', 'deliveries.view', 'deliveries.assign',
    'invoices.view', 'invoices.create', 'payments.view', 'payments.create',
    'cheques.view', 'returns.view', 'returns.create', 'returns.confirm',
    'cash_closings.view', 'cash_closings.create', 'cash_closings.validate',
    'reports.view',
    'users.view', 'users.create', 'users.update',
    'roles.view', 'settings.view', 'settings.manage', 'audit.view',
  ],
  commercial: [
    'dashboard.view',
    'products.view', 'categories.view',
    'customers.view', 'customers.create', 'customers.update', 'customer_accounts.manage',
    'orders.view', 'orders.create', 'orders.update', 'orders.validate', 'orders.confirm', 'orders.cancel',
    'invoices.view', 'payments.view', 'payments.create',
    'returns.view', 'returns.create',
    'reports.view',
  ],
  warehouse: [
    'dashboard.view',
    'products.view', 'categories.view',
    'orders.view', 'orders.assign',
    'stock.view', 'stock.transfer', 'stock.adjust', 'stock.inventory',
    'warehouses.view',
    'purchases.view', 'purchases.receive',
    'preparation.view', 'preparation.start', 'preparation.complete',
    'deliveries.view', 'deliveries.assign',
    'returns.view', 'returns.create', 'returns.confirm',
    'cash_closings.view', 'cash_closings.create',
    'reports.view',
  ],
  preparation: [
    'dashboard.view',
    'products.view', 'orders.view', 'stock.view',
    'preparation.view', 'preparation.start', 'preparation.complete',
  ],
  delivery: [
    'dashboard.view',
    'customers.view', 'orders.view',
    'deliveries.view', 'deliveries.start', 'deliveries.complete',
    'payments.view', 'payments.create',
    'returns.view', 'returns.create',
    'cash_closings.view', 'cash_closings.create',
  ],
  accounting: [
    'dashboard.view',
    'customers.view', 'customer_accounts.manage',
    'suppliers.view', 'orders.view',
    'invoices.view', 'invoices.create', 'invoices.cancel',
    'payments.view', 'payments.create',
    'cheques.view', 'cheques.manage',
    'cash_closings.view', 'cash_closings.create', 'cash_closings.validate',
    'returns.view', 'returns.confirm',
    'reports.view',
  ],
};

const ROLE_HOMES: Record<string, string> = {
  superadmin: '/admin/dashboard',
  admin: '/administrator/dashboard',
  commercial: '/sales/dashboard',
  warehouse: '/warehouse/dashboard',
  depot: '/warehouse/dashboard',
  preparation: '/preparation/dashboard',
  delivery: '/delivery/dashboard',
  livreur: '/delivery/dashboard',
  accounting: '/accounting/dashboard',
  compta: '/accounting/dashboard',
};

const ROLE_NAMES: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Amine El Fassi',
  commercial: 'Youssef Bennani',
  warehouse: 'Nadia El Amrani',
  depot: 'Nadia El Amrani',
  preparation: 'Karim Ouazzani',
  delivery: 'Mehdi Lahlou',
  livreur: 'Mehdi Lahlou',
  accounting: 'Sofia Cherkaoui',
  compta: 'Sofia Cherkaoui',
};

export function normalizeRoleCode(rawCode?: string | null): string {
  const code = (rawCode || '').trim().toLowerCase();
  const map: Record<string, string> = {
    depot: 'warehouse',
    entrepôt: 'warehouse',
    entrepot: 'warehouse',
    stock: 'warehouse',
    stocks: 'warehouse',
    warehouse: 'warehouse',
    livreur: 'delivery',
    livraison: 'delivery',
    deliveries: 'delivery',
    delivery: 'delivery',
    compta: 'accounting',
    comptable: 'accounting',
    comptabilite: 'accounting',
    finance: 'accounting',
    accounting: 'accounting',
    commercial: 'commercial',
    vente: 'commercial',
    ventes: 'commercial',
    sales: 'commercial',
    preparation: 'preparation',
    preparateur: 'preparation',
    prep: 'preparation',
    superadmin: 'superadmin',
    admin: 'admin',
    administrator: 'admin',
  };
  return map[code] || code;
}

export function createMockStaffUser(roleCode: string, email?: string): StaffUser {
  const code = normalizeRoleCode(roleCode);
  const permissions = ROLE_PERMISSIONS[code] || ROLE_PERMISSIONS[roleCode.toLowerCase()] || ['dashboard.view'];
  const home = ROLE_HOMES[code] || '/admin/dashboard';
  const name = ROLE_NAMES[code] || 'Utilisateur ERP';

  return {
    id: Math.floor(Math.random() * 1000) + 1,
    name,
    email: email || `${code}@hercules-erp.ma`,
    phone: '+212 661 00 22 44',
    avatar: null,
    locale: 'fr',
    warehouse:
      code === 'superadmin' || code === 'admin'
        ? null
        : { id: 1, code: 'DEP-01', name: 'Dépôt Casablanca Central', city: 'Casablanca' },
    roles: [
      {
        code,
        name: code === 'warehouse' ? 'Responsable Dépôt' : code.charAt(0).toUpperCase() + code.slice(1),
        home,
        is_primary: true,
      },
    ],
    primary_role: code,
    permissions,
    home,
  };
}
