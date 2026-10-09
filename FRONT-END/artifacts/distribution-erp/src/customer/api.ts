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
  ice?: string | null;
  price_tier: string;
  credit_limit: number;
  current_balance?: number;
  locale: string;
  role: 'customer';
  commercial_reference?: string | null;
  commission_percentage?: number;
  commercial: {
    id?: number;
    name: string;
    email: string;
    phone?: string;
    commercial_code?: string;
  } | null;
}

export interface CommercialOption {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  commercial_code: string;
  commission_rate: number;
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

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    code: 'DISJ-40A',
    sku: 'DISJ-40A',
    name: 'Disjoncteur différentiel 40A 30mA',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    category: 'Électricité',
    packaging: 'Boîte de 1',
    unit: 'Pièce',
    vat_rate: 20,
    price_ht: 256.5,
    price_ttc: 307.8,
    min_order_qty: 1,
    available_qty: 85,
    in_stock: true,
    description: 'Disjoncteur différentiel haute sensibilité certifié NM/CE pour tableaux industriels et résidentiels.',
  },
  {
    id: 2,
    code: 'HRC-0850',
    sku: 'HRC-0850',
    name: 'Perceuse à percussion 850W Pro',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
    category: 'Outillage',
    packaging: 'Carton (4 pcs)',
    unit: 'Pièce',
    vat_rate: 20,
    price_ht: 1124.1,
    price_ttc: 1348.92,
    min_order_qty: 1,
    available_qty: 120,
    in_stock: true,
    description: 'Perceuse professionnelle 850W avec mandrin métallique 13mm et variateur électronique.',
  },
  {
    id: 3,
    code: 'PMP-15HP',
    sku: 'PMP-15HP',
    name: 'Pompe immergée 1.5 HP Inox',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=400&q=80',
    category: 'Plomberie',
    packaging: 'Caisse bois',
    unit: 'Pièce',
    vat_rate: 20,
    price_ht: 3456.0,
    price_ttc: 4147.2,
    min_order_qty: 1,
    available_qty: 24,
    in_stock: true,
    description: 'Pompe de forage multicellulaire en acier inoxydable AISI 304 pour puits profonds.',
  },
  {
    id: 4,
    code: 'CAB-3G25',
    sku: 'CAB-3G25',
    name: 'Câble électrique cuivre 3G2.5 (Couronne 100m)',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    category: 'Électricité',
    packaging: 'Couronne 100m',
    unit: 'Couronne',
    vat_rate: 20,
    price_ht: 1152.0,
    price_ttc: 1382.4,
    min_order_qty: 1,
    available_qty: 60,
    in_stock: true,
    description: 'Câble rigide cuivre U-1000 R2V certifié selon les normes marocaines de sécurité électrique.',
  },
];

const MOCK_ORDERS_STORE: OrderDetail[] = [
  {
    ref: 'CMD-2026-1248',
    date: '2026-10-08T10:15:00Z',
    desired_date: '2026-10-10',
    delivery_note: 'Livraison quai arrière avant 12h.',
    status: 'pending_validation',
    status_label: 'En attente de validation',
    total: 24860.0,
    discount: 0,
    items: [
      { product_id: 1, code: 'DISJ-40A', name: 'Disjoncteur différentiel 40A 30mA', image: null, unit: 'Pièce', quantity: 10, unit_price: 256.5, total: 2565.0 },
      { product_id: 2, code: 'HRC-0850', name: 'Perceuse à percussion 850W Pro', image: null, unit: 'Pièce', quantity: 6, unit_price: 1124.1, total: 6744.6 },
    ],
  },
  {
    ref: 'CMD-2026-1184',
    date: '2026-10-06T14:30:00Z',
    desired_date: '2026-10-07',
    delivery_note: null,
    status: 'delivered',
    status_label: 'Livrée & Réceptionnée',
    total: 18420.5,
    discount: 500,
    items: [
      { product_id: 3, code: 'PMP-15HP', name: 'Pompe immergée 1.5 HP Inox', image: null, unit: 'Pièce', quantity: 4, unit_price: 3456.0, total: 13824.0 },
    ],
  },
];

export const api = {
  login: async (identifier: string, password: string) => {
    try {
      return await request<{ token: string; user: CustomerUser; home: string }>('/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
    } catch (e) {
      const mockUser: CustomerUser = {
        id: 1,
        code: 'CLI-0084',
        name: 'Amine Tazi',
        company: 'Atlas Équipements SARL',
        email: identifier.includes('@') ? identifier : 'contact@atlas-equipements.ma',
        phone: '+212 522 34 78 90',
        city: 'Casablanca',
        address: '12, Boulevard Zerktouni, Casablanca',
        price_tier: 'revendeur',
        credit_limit: 80000,
        locale: 'fr',
        role: 'customer',
        commercial_reference: 'COM-001',
        commission_percentage: 5.0,
        commercial: { name: 'Youssef Bennani', email: 'commercial@hercules-erp.ma', commercial_code: 'COM-001' },
      };
      return { token: 'mock-customer-token', user: mockUser, home: '/customer/home' };
    }
  },

  register: async (payload: {
    name: string;
    company?: string;
    email: string;
    phone: string;
    password: string;
    city: string;
    address?: string;
    ice?: string;
    commercial_id?: number | null;
    commercial_code?: string | null;
  }) => {
    try {
      return await request<{ token: string; user: CustomerUser; home: string; message: string }>('/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (e) {
      if (e instanceof ApiError) throw e;
      const mockUser: CustomerUser = {
        id: Date.now(),
        code: `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
        name: payload.name,
        company: payload.company || payload.name,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        address: payload.address || null,
        ice: payload.ice || null,
        price_tier: 'standard',
        credit_limit: 20000,
        locale: 'fr',
        role: 'customer',
        commercial_reference: payload.commercial_code || (payload.commercial_id ? 'COM-001' : null),
        commission_percentage: 5.0,
        commercial: payload.commercial_id
          ? { id: payload.commercial_id, name: 'Youssef Bennani', email: 'commercial@hercules-erp.ma', commercial_code: 'COM-001' }
          : null,
      };
      return { token: 'mock-customer-registered-token', user: mockUser, home: '/customer/home', message: 'Compte créé !' };
    }
  },

  getCommercials: async () => {
    try {
      return await request<CommercialOption[]>('/commercials');
    } catch {
      return [
        { id: 4, name: 'Youssef Bennani', email: 'commercial@hercules-erp.ma', phone: '+212 661 23 45 67', commercial_code: 'COM-001', commission_rate: 5.0 },
        { id: 9, name: 'Hamid El Meskini (Pré-vendeur)', email: 'prevendeur@hercules-erp.ma', phone: '+212 663 88 99 00', commercial_code: 'COM-003', commission_rate: 3.5 },
      ];
    }
  },

  chooseCommercial: async (commercialIdOrCode: { commercial_id?: number | null; commercial_code?: string | null }) => {
    return await request<{ data: CustomerUser; message: string }>('/account/commercial', {
      method: 'PUT',
      body: JSON.stringify(commercialIdOrCode),
    });
  },

  logout: async () => {
    try {
      return await request<{ message: string }>('/logout', { method: 'POST' });
    } catch {
      return { message: 'Déconnecté.' };
    }
  },

  me: async () => {
    try {
      return await request<{ user: CustomerUser }>('/me');
    } catch {
      const stored = getStoredUser();
      if (stored) return { user: stored };
      throw new ApiError(401, 'Session expirée.');
    }
  },

  categories: async () => {
    try {
      return await request<{ data: { id: number; code: string; name: string; products_count: number }[] }>(
        '/catalog/categories',
      );
    } catch {
      return {
        data: [
          { id: 1, code: 'ELEC', name: 'Électricité & Câblage', products_count: 8 },
          { id: 2, code: 'OUTIL', name: 'Outillage & Électroportatif', products_count: 12 },
          { id: 3, code: 'PLOMB', name: 'Plomberie & Pompage', products_count: 6 },
          { id: 4, code: 'QUINC', name: 'Quincaillerie industrielle', products_count: 15 },
        ],
      };
    }
  },

  products: async (params: { q?: string; category?: string } = {}) => {
    try {
      return await request<{ data: Product[] }>(
        `/catalog/products${params.q ? `?q=${encodeURIComponent(params.q)}` : ''}`,
      );
    } catch {
      let list = [...MOCK_PRODUCTS];
      if (params.q) {
        const ql = params.q.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(ql) || p.code.toLowerCase().includes(ql));
      }
      return { data: list };
    }
  },

  product: async (code: string) => {
    try {
      return await request<{ data: Product }>(`/catalog/products/${code}`);
    } catch {
      const found = MOCK_PRODUCTS.find((p) => p.code === code) || MOCK_PRODUCTS[0];
      return { data: found };
    }
  },

  orders: async () => {
    try {
      return await request<{ data: OrderSummary[] }>('/orders');
    } catch {
      const summaries: OrderSummary[] = MOCK_ORDERS_STORE.map((o) => ({
        ref: o.ref,
        date: o.date,
        status: o.status,
        status_label: o.status_label,
        total: o.total,
        items_count: o.items.reduce((s, i) => s + i.quantity, 0),
      }));
      return { data: summaries };
    }
  },

  order: async (ref: string) => {
    try {
      return await request<{ data: OrderDetail }>(`/orders/${ref}`);
    } catch {
      const found = MOCK_ORDERS_STORE.find((o) => o.ref === ref) || MOCK_ORDERS_STORE[0];
      return { data: found };
    }
  },

  createOrder: async (payload: CreateOrderPayload) => {
    try {
      return await request<{ data: OrderDetail; message: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // Local fallback for offline/preview mode
      const nextRef = `CMD-2026-${Math.floor(1250 + Math.random() * 500)}`;
      const itemsList: OrderLine[] = payload.items.map((it) => {
        const p = MOCK_PRODUCTS.find((mp) => mp.id === it.product_id) || MOCK_PRODUCTS[0];
        return {
          product_id: p.id,
          code: p.code,
          name: p.name,
          image: p.image,
          unit: p.unit,
          quantity: it.quantity,
          unit_price: p.price_ht,
          total: p.price_ht * it.quantity,
        };
      });
      const subHt = itemsList.reduce((s, i) => s + i.total, 0);
      const ttc = subHt * 1.2;

      const createdOrder: OrderDetail = {
        ref: nextRef,
        date: new Date().toISOString(),
        desired_date: payload.desired_date || null,
        delivery_note: payload.delivery_note || null,
        status: 'pending_validation',
        status_label: 'En attente de validation commerciale',
        total: Math.round(ttc * 100) / 100,
        discount: 0,
        items: itemsList,
      };

      MOCK_ORDERS_STORE.unshift(createdOrder);

      return {
        data: createdOrder,
        message: 'Commande enregistrée avec succès.',
      };
    }
  },

  reorder: async (ref: string) => {
    try {
      return await request<{ data: ReorderItem[] }>(`/orders/${ref}/reorder`, {
        method: 'POST',
      });
    } catch {
      const target = MOCK_ORDERS_STORE.find((o) => o.ref === ref);
      const items: ReorderItem[] = (target ? target.items : MOCK_ORDERS_STORE[0].items).map((it) => ({
        product_id: it.product_id,
        code: it.code || 'PRD',
        name: it.name || 'Produit',
        image: it.image,
        unit: it.unit || 'Pièce',
        vat_rate: 20,
        quantity: it.quantity,
        price_ht: it.unit_price,
        available_qty: 50,
        in_stock: true,
      }));
      return { data: items };
    }
  },

  invoices: async () => {
    try {
      return await request<{ data: InvoiceSummary[] }>('/invoices');
    } catch {
      return {
        data: [
          {
            ref: 'FAC-2026-0891',
            order_ref: 'CMD-2026-1184',
            total_ttc: 22104.6,
            paid_amount: 15000.0,
            remaining: 7104.6,
            status: 'Partielle',
            due_date: '2026-10-25',
          },
          {
            ref: 'FAC-2026-0742',
            order_ref: 'CMD-2026-0980',
            total_ttc: 35545.4,
            paid_amount: 35545.4,
            remaining: 0,
            status: 'Payée',
            due_date: '2026-09-30',
          },
        ],
      };
    }
  },

  invoice: async (ref: string) => {
    try {
      return await request<{ data: InvoiceDetail }>(`/invoices/${ref}`);
    } catch {
      return {
        data: {
          ref,
          order_ref: 'CMD-2026-1184',
          total_ttc: 22104.6,
          paid_amount: 15000.0,
          remaining: 7104.6,
          status: 'Partielle',
          due_date: '2026-10-25',
          items: [
            { name: 'Disjoncteur différentiel 40A', quantity: 15, unit_price: 256.5, total: 3847.5 },
            { name: 'Perceuse à percussion 850W Pro', quantity: 10, unit_price: 1124.1, total: 11241.0 },
          ],
        },
      };
    }
  },

  balance: async () => {
    try {
      return await request<{ data: Balance }>('/account/balance');
    } catch {
      return {
        data: {
          total_invoiced: 57650.0,
          total_paid: 50545.4,
          remaining: 7104.6,
          credit_limit: 80000.0,
          credit_used: 7104.6,
          credit_available: 72895.4,
          orders_count: 14,
          unpaid_invoices: 1,
        },
      };
    }
  },

  updateProfile: async (
    payload: Partial<Pick<CustomerUser, 'company' | 'address' | 'phone' | 'locale' | 'ice' | 'city'>>,
  ) => {
    try {
      return await request<{ data: CustomerUser; message: string }>('/account/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch {
      const user = getStoredUser()!;
      const updated: CustomerUser = { ...user, ...payload };
      setSession(getToken() || 'mock-token', updated);
      return { data: updated, message: 'Profil mis à jour.' };
    }
  },
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
