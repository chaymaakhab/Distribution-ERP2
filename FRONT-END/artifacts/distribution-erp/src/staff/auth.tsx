import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import {
  api, clearSession, getStoredUser, getToken, persistUser, setSession,
  type StaffUser,
} from './api';

interface StaffAuthValue {
  user: StaffUser | null;
  loading: boolean;
  login: (identifier: string, password: string, remember: boolean) => Promise<StaffUser>;
  logout: () => Promise<void>;
  switchRole: (code: string) => Promise<StaffUser>;
  hasPermission: (permission: string) => boolean;
  canAny: (...permissions: string[]) => boolean;
  workspace: string;
  home: string;
}

const StaffAuthContext = createContext<StaffAuthValue | null>(null);

// Mirrors the backend check: '*' grants everything, an exact match grants the
// permission, and a module wildcard ('products.*') grants the whole module.
function permissionMatches(granted: string[], permission: string): boolean {
  if (granted.includes('*') || granted.includes(permission)) return true;
  const module = permission.split('.')[0];
  return granted.includes(`${module}.*`);
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(getStoredUser());
  const [loading, setLoading] = useState<boolean>(!!getToken());

  // Validate the stored token on first mount.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((res) => {
        setUser(res.user);
        persistUser(res.user);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (identifier: string, password: string, remember: boolean) => {
      const res = await api.login(identifier, password);
      setSession(res.token, res.user, remember);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* token may already be gone */
    }
    clearSession();
    setUser(null);
  }, []);

  const switchRole = useCallback(async (code: string) => {
    const res = await api.switchRole(code);
    setUser(res.user);
    persistUser(res.user);
    return res.user;
  }, []);

  const hasPermission = useCallback(
    (permission: string) => !!user && permissionMatches(user.permissions, permission),
    [user],
  );

  const canAny = useCallback(
    (...permissions: string[]) => !!user && permissions.some((p) => permissionMatches(user.permissions, p)),
    [user],
  );

  const home = user?.home || '/login';
  const workspace = useMemo(() => home.split('/')[1] || 'admin', [home]);

  const value = useMemo<StaffAuthValue>(
    () => ({ user, loading, login, logout, switchRole, hasPermission, canAny, workspace, home }),
    [user, loading, login, logout, switchRole, hasPermission, canAny, workspace, home],
  );

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
}

export function useStaffAuth(): StaffAuthValue {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error('useStaffAuth must be used inside <StaffAuthProvider>.');
  return ctx;
}
