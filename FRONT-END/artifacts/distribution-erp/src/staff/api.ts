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

export interface StaffUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  locale: string | null;
  warehouse: StaffWarehouse | null;
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
};
