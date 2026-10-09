// Staff (internal ERP) API client.
// Talks to the Laravel backend under /api/v1 (proxied in dev), guard `staff`.
// The Sanctum bearer token is persisted in local/session storage.

const TOKEN_KEY = 'hercules.staff.token';
const USER_KEY = 'hercules.staff.user';

const BASE =
  (import.meta.env.VITE_STAFF_API_URL as string | undefined) ?? '/api/v1';

export interface StaffRole {
  code: string;
  name: string;
  home: string;
  is_primary: boolean;
}

export interface StaffWarehouse {
  id: number;
  code: string;
  name: string;
  city: string | null;
}

export interface StaffCompany {
  id: number;
  code: string;
  name: string;
  brand_name?: string | null;
  ice?: string | null;
  rc?: string | null;
  if_tax?: string | null;
  patente?: string | null;
  cnss?: string | null;
  city: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  subscription_plan: 'starter' | 'pro' | 'enterprise' | 'custom';
  subscription_status: 'active' | 'trial' | 'expired' | 'suspended';
  subscription_start_date?: string | null;
  subscription_end_date: string | null;
  subscription_price?: number;
  subscription_billing_cycle?: 'mensuel' | 'annuel';
  days_remaining: number;
  max_users: number;
  max_warehouses: number;
  users_count?: number;
  warehouses_count?: number;
}

export interface StaffUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  locale: string | null;
  warehouse: StaffWarehouse | null;
  company: StaffCompany | null;
  roles: StaffRole[];
  primary_role: string | null;
  permissions: string[];
  home: string;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// Token lives in localStorage when "remember me" is on, sessionStorage otherwise.
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}
export function getStoredUser(): StaffUser | null {
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as StaffUser) : null;
}
export function setSession(token: string, user: StaffUser, remember: boolean): void {
  const store = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  other.removeItem(TOKEN_KEY);
  other.removeItem(USER_KEY);
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
}
export function persistUser(user: StaffUser): void {
  const store = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
  store.setItem(USER_KEY, JSON.stringify(user));
}
export function clearSession(): void {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(TOKEN_KEY);
    store.removeItem(USER_KEY);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      data?.message ??
      (res.status === 429
        ? 'Trop de tentatives. Réessayez dans une minute.'
        : res.status === 401
          ? 'Session expirée.'
          : 'Erreur serveur.');
    throw new ApiError(res.status, message, data?.errors);
  }
  return data as T;
}

export const api = {
  login: (identifier: string, password: string) =>
    request<{ token: string; user: StaffUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  me: () => request<{ user: StaffUser }>('/auth/me'),
  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  switchRole: (role: string) =>
    request<{ user: StaffUser }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // SuperAdmin / Administrateur reporting.
  adminOverview: () => request<{ data: OverviewKpis }>('/admin/overview'),
  adminRevenue: () => request<{ data: RevenueData }>('/admin/revenue'),
  adminWarehouses: () => request<{ data: WarehouseNode[] }>('/admin/warehouses'),
  adminPerformance: () => request<{ data: PerformanceData }>('/admin/performance'),
  getCommercialsClients: () => request<{
    summary: {
      total_commercials: number;
      total_assigned_clients: number;
      total_unassigned_clients: number;
      total_turnover: number;
      total_commissions: number;
    };
    commercials: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      commercial_code: string;
      commission_rate: number;
      clients_count: number;
      total_orders: number;
      total_turnover: number;
      total_commission: number;
      clients: Array<{
        id: number;
        code: string;
        name: string;
        company: string;
        email: string;
        phone: string;
        city: string;
        ice: string;
        price_tier: string;
        status: string;
        credit_limit: number;
        current_balance: number;
        orders_count: number;
        turnover: number;
        commission_percentage: number;
        commission_earned: number;
        commercial_reference: string;
        created_at: string;
      }>;
    }>;
    unassigned_clients: Array<{
      id: number;
      code: string;
      name: string;
      company: string;
      email: string;
      phone: string;
      city: string;
      price_tier: string;
      status: string;
      orders_count: number;
      turnover: number;
      created_at: string;
    }>;
  }>('/admin/commercials-clients'),
  updateCommercialCommission: (id: number, data: { commission_rate: number; commercial_code?: string }) =>
    request<{ message: string; commercial: any }>(`/admin/commercials/${id}/commission-rate`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getCommercialCommissions: (params?: { commercial_id?: number; status?: string; customer_id?: number; period?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<{
      summary: {
        total_commissions: number;
        pending_commissions: number;
        validated_commissions: number;
        paid_commissions: number;
        count: number;
      };
      commissions: Array<{
        id: number;
        commercial_id: number;
        commercial_name: string;
        commercial_code: string;
        customer_id: number;
        customer_name: string;
        customer_company: string;
        customer_city?: string;
        order_id?: number;
        order_ref?: string;
        order_date?: string;
        order_status?: string;
        base_amount: number;
        commission_rate: number;
        commission_amount: number;
        status: 'pending' | 'validated' | 'paid' | 'cancelled';
        period?: string;
        paid_at?: string;
        notes?: string;
        created_at: string;
      }>;
    }>(`/admin/commercial-commissions${qry ? '?' + qry : ''}`);
  },
  updateCommercialCommissionStatus: (id: number, data: { status: string; notes?: string }) =>
    request<{ message: string; commission: any }>(`/admin/commercial-commissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  settleCommercialCommissions: (data: { commercial_id: number; period?: string }) =>
    request<{ message: string; settled_count: number; total_settled: number }>(`/admin/commercial-commissions/settle`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Customers CRM
  getCustomers: (params?: { q?: string; tier?: string; status?: string }) => {
    const qry = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/customers${qry ? '?' + qry : ''}`);
  },
  createCustomer: (data: any) =>
    request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: number, data: any) =>
    request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: number) =>
    request<any>(`/customers/${id}`, { method: 'DELETE' }),

  // Payments / Règlements Clients
  getPayments: (params?: { customer_id?: number; method?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any>(`/payments${qry ? '?' + qry : ''}`);
  },
  createPayment: (data: { customer_id: number; amount: number; method: string; bank?: string; doc_number?: string; due_date?: string; notes?: string }) =>
    request<any>('/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Products / Articles & Photos
  getProducts: (params?: { q?: string; category_id?: number }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/products${qry ? '?' + qry : ''}`);
  },
  createProduct: (data: any) =>
    request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) =>
    request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    request<any>(`/products/${id}`, { method: 'DELETE' }),

  // Drivers & Fleet Logistics
  getDrivers: (params?: { type?: string; status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/drivers${qry ? '?' + qry : ''}`);
  },
  createDriver: (data: any) =>
    request<any>('/drivers', { method: 'POST', body: JSON.stringify(data) }),
  updateDriverStatus: (id: number, status: string, mission?: string) =>
    request<any>(`/drivers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, current_mission: mission }) }),

  // Stocks & Dépôts
  getStocks: (params?: { warehouse_id?: number }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/stocks${qry ? '?' + qry : ''}`);
  },
  createStock: (data: any) =>
    request<any>('/stocks', { method: 'POST', body: JSON.stringify(data) }),
  transferStock: (data: { product_id: number; source_warehouse_id: number; dest_warehouse_id: number; quantity: number }) =>
    request<any>('/stocks/transfer', { method: 'POST', body: JSON.stringify(data) }),

  // Returns SAV (SuperAdmin validation)
  getReturns: (params?: { status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/returns${qry ? '?' + qry : ''}`);
  },
  createReturn: (data: any) =>
    request<any>('/returns', { method: 'POST', body: JSON.stringify(data) }),
  validateReturn: (id: number, data: { status: 'Validé' | 'Refusé'; restock_approved: boolean; superadmin_notes?: string }) =>
    request<any>(`/returns/${id}/validate`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Suppliers / Fournisseurs
  getSuppliers: (params?: { q?: string; status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/suppliers${qry ? '?' + qry : ''}`);
  },
  createSupplier: (data: any) =>
    request<any>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: number, data: any) =>
    request<any>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id: number) =>
    request<any>(`/suppliers/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (params?: { q?: string; status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/orders${qry ? '?' + qry : ''}`);
  },
  createOrder: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id: string | number, data: any) =>
    request<any>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOrder: (id: string | number) =>
    request<any>(`/orders/${id}`, { method: 'DELETE' }),
  updateOrderStatus: (ref: string, status: string) =>
    request<any>(`/orders/${ref}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Staff Users
  getUsers: (params?: { q?: string; role?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/users${qry ? '?' + qry : ''}`);
  },
  createUser: (data: any) =>
    request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) =>
    request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: number) =>
    request<any>(`/users/${id}`, { method: 'DELETE' }),

  // Purchase Orders / Bons d'Achat & Réception
  getPurchaseOrders: (params?: { q?: string; status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/purchase-orders${qry ? '?' + qry : ''}`);
  },
  createPurchaseOrder: (data: any) =>
    request<any>('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
  updatePurchaseOrderStatus: (id: number, status: string) =>
    request<any>(`/purchase-orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Inter-depot Transfers / Transferts Inter-Dépôts
  getTransfers: (params?: { status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/transfers${qry ? '?' + qry : ''}`);
  },
  createTransfer: (data: any) =>
    request<any>('/transfers', { method: 'POST', body: JSON.stringify(data) }),
  updateTransferStatus: (id: number, status: string) =>
    request<any>(`/transfers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Picking & Preparation
  getPickingLists: (params?: { status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/picking-lists${qry ? '?' + qry : ''}`);
  },
  scanPickingItem: (pickingId: number, barcode: string, quantity: number = 1) =>
    request<any>(`/picking-lists/${pickingId}/scan`, { method: 'POST', body: JSON.stringify({ barcode, quantity }) }),

  // Delivery Tours
  getDeliveryTours: (params?: { driver_id?: number; status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/delivery-tours${qry ? '?' + qry : ''}`);
  },
  updateDeliveryStop: (tourId: number, stopId: number, data: any) =>
    request<any>(`/delivery-tours/${tourId}/stops/${stopId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Invoices & Credit Notes
  getInvoices: (params?: { q?: string; status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/invoices${qry ? '?' + qry : ''}`);
  },
  getCreditNotes: (params?: { status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/credit-notes${qry ? '?' + qry : ''}`);
  },
  createCreditNote: (data: any) =>
    request<any>('/credit-notes', { method: 'POST', body: JSON.stringify(data) }),

  // Treasury, Cash Closings & Cheques
  getTreasuryClosings: (params?: { warehouse_id?: number }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/treasury/closings${qry ? '?' + qry : ''}`);
  },
  createTreasuryClosing: (data: any) =>
    request<any>('/treasury/closings', { method: 'POST', body: JSON.stringify(data) }),
  getTreasuryCheques: (params?: { status?: string; doc_type?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/treasury/cheques${qry ? '?' + qry : ''}`);
  },
  updateChequeStatus: (id: number, status: string, remittance_ref?: string) =>
    request<any>(`/treasury/cheques/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, remittance_ref }) }),

  // Vehicles & Movements
  getVehicles: (params?: { status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/vehicles${qry ? '?' + qry : ''}`);
  },
  createVehicle: (data: any) =>
    request<any>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  getStockMovements: (params?: { warehouse_id?: number; product_id?: number }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/stock-movements${qry ? '?' + qry : ''}`);
  },

  // Quotes / Devis & Proformas
  getQuotes: (params?: { customer_id?: number; status?: string; q?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/quotes${qry ? '?' + qry : ''}`);
  },
  getQuote: (id: number) => request<any>(`/quotes/${id}`),
  createQuote: (data: any) =>
    request<any>('/quotes', { method: 'POST', body: JSON.stringify(data) }),
  updateQuoteStatus: (id: number, status: string) =>
    request<any>(`/quotes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  convertQuoteToOrder: (id: number) =>
    request<any>(`/quotes/${id}/convert-to-order`, { method: 'POST' }),

  // Delivery Slips (BL)
  getDeliverySlips: (params?: { driver_id?: number; customer_id?: number; status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/delivery-slips${qry ? '?' + qry : ''}`);
  },
  getDeliverySlip: (id: number) => request<any>(`/delivery-slips/${id}`),
  createDeliverySlip: (data: any) =>
    request<any>('/delivery-slips', { method: 'POST', body: JSON.stringify(data) }),
  signDeliverySlip: (id: number, data: { receiver_name: string; signature: string }) =>
    request<any>(`/delivery-slips/${id}/sign`, { method: 'POST', body: JSON.stringify(data) }),

  // Purchase Receipts (BR)
  getPurchaseReceipts: (params?: { supplier_id?: number; warehouse_id?: number; status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/purchase-receipts${qry ? '?' + qry : ''}`);
  },
  createPurchaseReceipt: (data: any) =>
    request<any>('/purchase-receipts', { method: 'POST', body: JSON.stringify(data) }),

  // Inventory Audits
  getInventoryAudits: (params?: { warehouse_id?: number; status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/inventory-audits${qry ? '?' + qry : ''}`);
  },
  createInventoryAudit: (data: any) =>
    request<any>('/inventory-audits', { method: 'POST', body: JSON.stringify(data) }),
  adjustInventoryStock: (id: number) =>
    request<any>(`/inventory-audits/${id}/adjust-stock`, { method: 'POST' }),

  // Warehouses (Depots)
  getWarehouses: (params?: { city?: string; status?: string; q?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/warehouses${qry ? '?' + qry : ''}`);
  },
  createWarehouse: (data: any) =>
    request<any>('/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  updateWarehouse: (id: number, data: any) =>
    request<any>(`/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWarehouse: (id: number) =>
    request<any>(`/warehouses/${id}`, { method: 'DELETE' }),

  // Commercial Field Visits
  getVisits: (params?: { commercial_id?: number; customer_id?: number; status?: string; date?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/visits${qry ? '?' + qry : ''}`);
  },
  createVisit: (data: any) =>
    request<any>('/visits', { method: 'POST', body: JSON.stringify(data) }),
  checkinVisit: (id: number, coords: { latitude: number; longitude: number }) =>
    request<any>(`/visits/${id}/checkin`, { method: 'PATCH', body: JSON.stringify(coords) }),
  completeVisit: (id: number, data: any) =>
    request<any>(`/visits/${id}/complete`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: any[]; unread_count: number }>('/notifications'),
  markNotificationRead: (id: number) =>
    request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    request<any>('/notifications/mark-all-read', { method: 'POST' }),

  // Promotions
  getPromotions: (params?: { status?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any[]>(`/promotions${qry ? '?' + qry : ''}`);
  },
  createPromotion: (data: any) =>
    request<any>('/promotions', { method: 'POST', body: JSON.stringify(data) }),

  // Company Settings
  getCompanySettings: () => request<any>('/settings/company'),
  updateCompanySettings: (data: any) =>
    request<any>('/settings/company', { method: 'PUT', body: JSON.stringify(data) }),

  // Audit Logs
  getAuditLogs: (params?: { q?: string; user_id?: number; action?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<any>(`/audit-logs${qry ? '?' + qry : ''}`);
  },

  // Roles & Permissions Matrix
  getRolesManagement: () => request<any[]>('/roles/management'),
  updateRolePermissions: (roleId: number, permissions: string[]) =>
    request<any>(`/roles/${roleId}/permissions`, { method: 'PUT', body: JSON.stringify({ permissions }) }),

  // SaaS Multi-Company & Subscriptions
  getSaasCompanies: (params?: { q?: string; status?: string; plan?: string }) => {
    const qry = new URLSearchParams(params as any).toString();
    return request<{ status: string; data: SaasCompany[]; total: number }>(`/saas/companies${qry ? '?' + qry : ''}`);
  },
  createSaasCompany: (data: any) =>
    request<{ status: string; message: string; data: SaasCompany }>('/saas/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSaasCompany: (id: number) =>
    request<{ status: string; data: SaasCompany }>(`/saas/companies/${id}`),
  updateSaasCompany: (id: number, data: any) =>
    request<{ status: string; message: string; data: SaasCompany }>(`/saas/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateSaasSubscription: (id: number, data: any) =>
    request<{ status: string; message: string; data: SaasCompany }>(`/saas/companies/${id}/subscription`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getSaasOverview: () =>
    request<{ status: string; data: SaasOverview }>('/saas/overview'),
  getMyCompany: () =>
    request<{ status: string; data: SaasCompany }>('/saas/my-company'),
};

export interface SaasCompany {
  id: number;
  code: string;
  name: string;
  brand_name?: string | null;
  ice?: string | null;
  rc?: string | null;
  if_tax?: string | null;
  patente?: string | null;
  cnss?: string | null;
  email?: string | null;
  phone?: string | null;
  city: string;
  address?: string | null;
  logo_url?: string | null;
  admin_user_id?: number | null;
  admin_user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  } | null;
  subscription_plan: 'starter' | 'pro' | 'enterprise' | 'custom';
  subscription_status: 'active' | 'trial' | 'expired' | 'suspended';
  subscription_start_date?: string | null;
  subscription_end_date: string | null;
  subscription_price: number;
  subscription_billing_cycle: 'mensuel' | 'annuel';
  max_users: number;
  max_warehouses: number;
  users_count: number;
  warehouses_count: number;
  days_remaining: number;
  is_expired?: boolean;
  status: 'active' | 'suspended';
}

export interface SaasOverview {
  total_companies: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  expired_subscriptions: number;
  suspended_subscriptions: number;
  mrr_mad: number;
  arr_mad: number;
  total_users_across_saas: number;
  total_warehouses_across_saas: number;
  expiring_soon_count: number;
  expiring_soon: SaasCompany[];
}


export interface OverviewKpis {
  ca_today: number;
  ca_month: number;
  ca_prev_month: number;
  ca_month_delta: number | null;
  orders_total: number;
  orders_today: number;
  orders_to_validate: number;
  orders_in_delivery: number;
  deliveries_in_progress: number;
  deliveries_done: number;
  payments_total: number;
  payments_today: number;
  receivables: number;
  unpaid_invoices: number;
  returns: number;
  stock_ruptures: number;
  stock_low: number;
  customers_count: number;
  products_count: number;
  warehouses_count: number;
}

export interface SeriesPoint {
  label: string;
  value: number;
  count?: number;
  qty?: number;
}

export interface RevenueData {
  by_day: SeriesPoint[];
  by_month: SeriesPoint[];
  by_warehouse: SeriesPoint[];
  by_city: SeriesPoint[];
  by_commercial: SeriesPoint[];
  top_products: SeriesPoint[];
  orders_evolution: SeriesPoint[];
}

export interface WarehouseNode {
  id: number;
  code: string;
  name: string;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  manager_name: string | null;
  status: string;
  stock_on_hand: number;
  stock_available: number;
  products_count: number;
  revenue: number;
  orders_pending: number;
  orders_in_progress: number;
  orders_done: number;
}

export interface CommercialPerf {
  id: number;
  name: string;
  orders_count: number;
  revenue: number;
  customers_count: number;
}
export interface WarehousePerf {
  id: number;
  name: string;
  city: string | null;
  orders_count: number;
  revenue: number;
  stock_available: number;
}
export interface DriverPerf {
  name: string;
  deliveries_count: number;
  delivered: number;
  amount: number;
}
export interface PerformanceData {
  commercials: CommercialPerf[];
  warehouses: WarehousePerf[];
  drivers: DriverPerf[];
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value || 0);
}
