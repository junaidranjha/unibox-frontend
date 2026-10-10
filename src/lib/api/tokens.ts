import type { AuthTokens, SessionUser } from '@/types/api';

const ACCESS = 'unibox.access';
const REFRESH = 'unibox.refresh';
const USER = 'unibox.user';

export const tokenStore = {
  get(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    const accessToken = localStorage.getItem(ACCESS);
    const refreshToken = localStorage.getItem(REFRESH);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },
  set(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS, tokens.accessToken);
    localStorage.setItem(REFRESH, tokens.refreshToken);
  },
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(USER);
  },
  getUser(): SessionUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  },
  setUser(user: SessionUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER, JSON.stringify(user));
  },
};
