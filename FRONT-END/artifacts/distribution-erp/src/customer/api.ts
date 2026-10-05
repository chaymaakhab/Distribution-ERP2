// Customer portal API client.
// Talks to the Laravel backend under /api/v1/customer (proxied in dev).
// The Sanctum bearer token is persisted in localStorage.

const TOKEN_KEY = 'hercules.customer.token';
const USER_KEY = 'hercules.customer.user';

const BASE =
  (import.meta.env.VITE_CUSTOMER_API_URL as string | undefined) ??
  '/api/v1/customer';

export interface CustomerUser {
  id: number;
  code: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  price_tier: string;
  credit_limit: number;
  locale: string;
  role: 'customer';
  commercial: { name: string; email: string } | null;
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

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function getStoredUser(): CustomerUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as CustomerUser) : null;
}
export function setSession(token: string, user: CustomerUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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
      data?.message ?? (res.status === 401 ? 'Session expirée.' : 'Erreur serveur.');
    throw new ApiError(res.status, message, data?.errors);
  }
  return data as T;
}

export const api = {
  login: (identifier: string, password: string) =>
    request<{ token: string; user: CustomerUser; home: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),
  logout: () => request<{ message: string }>('/logout', { method: 'POST' }),
  me: () => request<{ user: CustomerUser }>('/me'),

  categories: () =>
    request<{ data: { id: number; code: string; name: string; products_count: number }[] }>(
      '/catalog/categories',
    ),
  products: (params: { q?: string; category?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.category) qs.set('category', params.category);
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<{ data: Product[] }>(`/catalog/products${suffix}`);
  },
  product: (code: string) => request<{ data: Product }>(`/catalog/products/${code}`),

  orders: () => request<{ data: OrderSummary[] }>('/orders'),
  order: (ref: string) => request<{ data: OrderDetail }>(`/orders/${ref}`),
  createOrder: (payload: CreateOrderPayload) =>
    request<{ data: OrderDetail; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  reorder: (ref: string) => request<{ data: ReorderItem[] }>(`/orders/${ref}/reorder`, {
    method: 'POST',
  }),

  invoices: () => request<{ data: InvoiceSummary[] }>('/invoices'),
  invoice: (ref: string) => request<{ data: InvoiceDetail }>(`/invoices/${ref}`),

  balance: () => request<{ data: Balance }>('/account/balance'),
  updateProfile: (payload: Partial<Pick<CustomerUser, 'company' | 'address' | 'phone' | 'locale'>>) =>
    request<{ data: CustomerUser; message: string }>('/account/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

export interface Product {
  id: number;
  code: string;
  sku: string;
  name: string;
  image: string | null;
  category: string | null;
  packaging: string;
  unit: string;
  vat_rate: number;
  price_ht: number;
  price_ttc: number;
  min_order_qty: number;
  available_qty: number;
  in_stock: boolean;
  description?: string;
}

export interface OrderSummary {
  ref: string;
  date: string;
  status: string;
  status_label: string;
  total: number;
  items_count: number;
}

export interface OrderLine {
  product_id: number;
  code: string | null;
  name: string | null;
  image: string | null;
  unit: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface OrderDetail {
  ref: string;
  date: string;
  desired_date: string | null;
  delivery_note: string | null;
  status: string;
  status_label: string;
  total: number;
  discount: number;
  items: OrderLine[];
}

export interface ReorderItem {
  product_id: number;
  code: string;
  name: string;
  image: string | null;
  unit: string;
  vat_rate: number;
  quantity: number;
  price_ht: number;
  available_qty: number;
  in_stock: boolean;
}

export interface InvoiceSummary {
  ref: string;
  order_ref: string | null;
  total_ttc: number;
  paid_amount: number;
  remaining: number;
  status: string;
  due_date: string;
}

export interface InvoiceDetail extends InvoiceSummary {
  items: { name: string | null; quantity: number; unit_price: number; total: number }[];
}

export interface Balance {
  total_invoiced: number;
  total_paid: number;
  remaining: number;
  credit_limit: number;
  credit_used: number;
  credit_available: number;
  orders_count: number;
  unpaid_invoices: number;
}

export interface CreateOrderPayload {
  items: { product_id: number; quantity: number }[];
  desired_date?: string | null;
  delivery_note?: string | null;
  client_generated_uuid?: string;
}
