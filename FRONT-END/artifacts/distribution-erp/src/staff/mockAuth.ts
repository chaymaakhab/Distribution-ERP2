import type { StaffUser } from './api';

export const ROLE_PERMISSIONS: Record<string, string[]> = {
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
    'visits.view', 'visits.create', 'visits.update',
    'quotes.view', 'quotes.create',
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
  pre_seller: [
    'dashboard.view',
    'customers.view', 'customers.create',
    'orders.view', 'orders.create',
    'deliveries.view', 'deliveries.start', 'deliveries.complete',
    'payments.view', 'payments.create',
    'returns.view', 'returns.create',
    'cash_closings.view', 'cash_closings.create',
  ],
  accounting: [
    'dashboard.view',
    'customers.view', 'customer_accounts.manage',
    'suppliers.view', 'orders.view', 'orders.create',
    'quotes.view', 'quotes.create', 'quotes.update', 'quotes.convert',
    'invoices.view', 'invoices.create', 'invoices.cancel',
    'credit_notes.view', 'credit_notes.create',
    'payments.view', 'payments.create',
    'cheques.view', 'cheques.manage',
    'cash_closings.view', 'cash_closings.create', 'cash_closings.validate',
    'returns.view', 'returns.confirm',
    'reports.view',
  ],
};

export const ROLE_HOMES: Record<string, string> = {
  superadmin: '/superadmin',
  admin: '/administrator/dashboard',
  commercial: '/sales/dashboard',
  warehouse: '/warehouse/dashboard',
  depot: '/warehouse/dashboard',
  preparation: '/preparation/dashboard',
  delivery: '/delivery/dashboard',
  livreur: '/delivery/dashboard',
  pre_seller: '/delivery/dashboard',
  accounting: '/accounting/dashboard',
  compta: '/accounting/dashboard',
};

export const ROLE_NAMES: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Amine El Fassi',
  commercial: 'Youssef Bennani',
  warehouse: 'Nadia El Amrani',
  depot: 'Nadia El Amrani',
  preparation: 'Karim Ouazzani',
  delivery: 'Mehdi Lahlou',
  livreur: 'Mehdi Lahlou',
  pre_seller: 'Hamid El Meskini (Pré-vendeur)',
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
    pre_seller: 'pre_seller',
    prevendeur: 'pre_seller',
    'pré-vendeur': 'pre_seller',
    'pre-vendeur': 'pre_seller',
    'livreur-pré-vendeur': 'pre_seller',
    'livreur-pre-vendeur': 'pre_seller',
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

export interface StaffUserRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  primary_role: string;
  role_label: string;
  role_labels?: string[];
  custom_permissions: string[];
  warehouse_name: string;
  is_active: boolean;
  last_login: string;
}

export const STAFF_USERS_STORAGE_KEY = 'hercules.staff.users_db';

export const DEFAULT_STAFF_USERS: StaffUserRecord[] = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'superadmin@hercules-erp.ma',
    phone: '+212 522 00 00 00',
    roles: ['superadmin'],
    primary_role: 'superadmin',
    role_label: 'Super Admin',
    role_labels: ['Super Admin'],
    custom_permissions: ['*'],
    warehouse_name: 'Tous les dépôts',
    is_active: true,
    last_login: 'Aujourd’hui 17:30',
  },
  {
    id: 2,
    name: 'Amine El Fassi',
    email: 'admin@hercules-erp.ma',
    phone: '+212 661 11 22 33',
    roles: ['admin'],
    primary_role: 'admin',
    role_label: 'Administrateur',
    role_labels: ['Administrateur'],
    custom_permissions: ROLE_PERMISSIONS.admin,
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 16:45',
  },
  {
    id: 3,
    name: 'Nadia El Amrani',
    email: 'depot@hercules-erp.ma',
    phone: '+212 662 33 44 55',
    roles: ['warehouse', 'preparation', 'delivery'],
    primary_role: 'warehouse',
    role_label: 'Responsable Dépôt + Multi-rôles',
    role_labels: ['Responsable Dépôt', 'Préparateur', 'Livreur'],
    custom_permissions: Array.from(
      new Set([
        ...ROLE_PERMISSIONS.warehouse,
        ...ROLE_PERMISSIONS.preparation,
        ...ROLE_PERMISSIONS.delivery,
      ])
    ),
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 15:20',
  },
  {
    id: 4,
    name: 'Youssef Bennani',
    email: 'commercial@hercules-erp.ma',
    phone: '+212 663 55 66 77',
    roles: ['commercial'],
    primary_role: 'commercial',
    role_label: 'Commercial',
    role_labels: ['Commercial'],
    custom_permissions: ROLE_PERMISSIONS.commercial,
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 14:10',
  },
  {
    id: 5,
    name: 'Karim Ouazzani',
    email: 'preparation@hercules-erp.ma',
    phone: '+212 664 77 88 99',
    roles: ['preparation', 'warehouse'],
    primary_role: 'preparation',
    role_label: 'Préparateur & Dépôt',
    role_labels: ['Préparateur', 'Responsable Dépôt'],
    custom_permissions: Array.from(
      new Set([...ROLE_PERMISSIONS.preparation, ...ROLE_PERMISSIONS.warehouse])
    ),
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 11:30',
  },
  {
    id: 6,
    name: 'Mehdi Lahlou',
    email: 'livreur@hercules-erp.ma',
    phone: '+212 665 99 00 11',
    roles: ['delivery'],
    primary_role: 'delivery',
    role_label: 'Livreur Dépôt',
    role_labels: ['Livreur Dépôt'],
    custom_permissions: ROLE_PERMISSIONS.delivery,
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 12:00',
  },
  {
    id: 7,
    name: 'Hamid El Meskini',
    email: 'prevendeur@hercules-erp.ma',
    phone: '+212 661 88 77 66',
    roles: ['pre_seller', 'delivery'],
    primary_role: 'pre_seller',
    role_label: 'Livreur-pré-vendeur (Van Sales)',
    role_labels: ['Livreur-pré-vendeur', 'Livreur Dépôt'],
    custom_permissions: Array.from(
      new Set([...ROLE_PERMISSIONS.pre_seller, ...ROLE_PERMISSIONS.delivery])
    ),
    warehouse_name: 'Casablanca (DEP-01)',
    is_active: true,
    last_login: 'Aujourd’hui 09:15',
  },
  {
    id: 8,
    name: 'Sofia Cherkaoui',
    email: 'compta@hercules-erp.ma',
    phone: '+212 666 12 34 56',
    roles: ['accounting'],
    primary_role: 'accounting',
    role_label: 'Comptable',
    role_labels: ['Comptable'],
    custom_permissions: ROLE_PERMISSIONS.accounting,
    warehouse_name: 'Siège Casablanca',
    is_active: true,
    last_login: 'Aujourd’hui 16:00',
  },
  {
    id: 9,
    name: 'Salma Idrissi',
    email: 'salma@hercules-erp.ma',
    phone: '+212 667 23 45 67',
    roles: ['commercial'],
    primary_role: 'commercial',
    role_label: 'Commercial',
    role_labels: ['Commercial'],
    custom_permissions: ROLE_PERMISSIONS.commercial,
    warehouse_name: 'Rabat (DEP-02)',
    is_active: true,
    last_login: 'Hier 18:00',
  },
];

export function getStoredStaffUsers(): StaffUserRecord[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STAFF_USERS_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erreur lecture users_db local:', e);
  }
  // Initialize with DEFAULT_STAFF_USERS
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STAFF_USERS_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF_USERS));
    }
  } catch {}
  return DEFAULT_STAFF_USERS;
}

export function saveStoredStaffUsers(users: StaffUserRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STAFF_USERS_STORAGE_KEY, JSON.stringify(users));
    }
  } catch (e) {
    console.error('Erreur sauvegarde users_db local:', e);
  }
}

export function findStaffUserByEmail(emailOrIdentifier: string): StaffUserRecord | undefined {
  const users = getStoredStaffUsers();
  const clean = (emailOrIdentifier || '').trim().toLowerCase();
  if (!clean) return undefined;

  // 1. Exact match email
  let found = users.find((u) => u.email.toLowerCase() === clean);
  if (found) return found;

  // 2. Match username before @ (e.g. "admin" for "admin@hercules-erp.ma")
  found = users.find((u) => u.email.toLowerCase().split('@')[0] === clean);
  if (found) return found;

  // 3. Match primary role or any assigned role
  found = users.find((u) => u.primary_role.toLowerCase() === clean || (u.roles && u.roles.some((r) => r.toLowerCase() === clean)));
  if (found) return found;

  // 4. Match exact name
  found = users.find((u) => u.name.toLowerCase() === clean);
  return found;
}

export function staffItemToSessionUser(item: StaffUserRecord): StaffUser {
  const primaryRoleCode = item.primary_role || (item.roles && item.roles[0]) || 'commercial';
  const normPrimary = normalizeRoleCode(primaryRoleCode);
  const home = ROLE_HOMES[normPrimary] || ROLE_HOMES[primaryRoleCode] || '/admin/dashboard';

  // Aggregate permissions: prioritize custom_permissions, fallback to union of roles
  let permissions: string[] = [];
  if (item.custom_permissions && item.custom_permissions.length > 0) {
    permissions = [...item.custom_permissions];
  } else {
    const permSet = new Set<string>();
    (item.roles || [primaryRoleCode]).forEach((r) => {
      const perms = ROLE_PERMISSIONS[normalizeRoleCode(r)] || [];
      perms.forEach((p) => permSet.add(p));
    });
    permissions = Array.from(permSet);
  }

  // Ensure dashboard.view is present if not superadmin wildcard
  if (!permissions.includes('*') && !permissions.includes('dashboard.view')) {
    permissions.unshift('dashboard.view');
  }

  const assignedRoles = item.roles && item.roles.length > 0 ? item.roles : [primaryRoleCode];
  const roles = assignedRoles.map((rCode) => {
    const code = normalizeRoleCode(rCode);
    return {
      code,
      name: ROLE_NAMES[code] || (code.charAt(0).toUpperCase() + code.slice(1)),
      home: ROLE_HOMES[code] || home,
      is_primary: code === normPrimary,
    };
  });

  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone || '+212 661 00 22 44',
    avatar: null,
    locale: 'fr',
    warehouse:
      normPrimary === 'superadmin' || normPrimary === 'admin'
        ? null
        : {
            id: 1,
            code: 'DEP-01',
            name: item.warehouse_name || 'Dépôt Casablanca Central',
            city: 'Casablanca',
          },
    roles,
    primary_role: normPrimary,
    permissions,
    home,
    company: {
      id: 1,
      code: 'SOC-001',
      name: 'Hercules Distribution Maroc S.A.R.L.',
      brand_name: normPrimary === 'superadmin' ? 'Groupe Hercules Distribution' : 'Hercules Distribution',
      ice: '002345678000045',
      rc: '458920 Casablanca',
      city: 'Casablanca',
      subscription_plan: 'enterprise',
      subscription_status: 'active',
      subscription_end_date: '2027-08-31',
      days_remaining: 326,
      max_users: 50,
      max_warehouses: 10,
      users_count: 14,
      warehouses_count: 7,
    },
  };
}

export function createMockStaffUser(roleCode: string, email?: string): StaffUser {
  // Check if a stored user exists with this email or identifier
  if (email) {
    const stored = findStaffUserByEmail(email);
    if (stored) return staffItemToSessionUser(stored);
  }
  const storedByRole = findStaffUserByEmail(roleCode);
  if (storedByRole) return staffItemToSessionUser(storedByRole);

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
    company: {
      id: 1,
      code: 'SOC-001',
      name: 'Hercules Distribution Maroc S.A.R.L.',
      brand_name: code === 'superadmin' ? 'Groupe Hercules Distribution' : 'Hercules Distribution',
      ice: '002345678000045',
      rc: '458920 Casablanca',
      city: 'Casablanca',
      subscription_plan: 'enterprise',
      subscription_status: 'active',
      subscription_end_date: '2027-08-31',
      days_remaining: 326,
      max_users: 50,
      max_warehouses: 10,
      users_count: 14,
      warehouses_count: 7,
    },
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
