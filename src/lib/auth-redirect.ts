'use client';

/**
 * Returns the relative current path + query string and builds `/login?redirect=...`.
 */
export function getCurrentPathWithSearch(): string {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}` || '/';
}

export function getLoginRedirectUrl(customReturnUrl?: string): string {
  const target = customReturnUrl ?? getCurrentPathWithSearch();
  if (!target || target === '/login' || target.startsWith('/login?')) {
    return '/login';
  }
  return `/login?redirect=${encodeURIComponent(target)}`;
}

export const getCurrentRelativeUrl = getCurrentPathWithSearch;
export const buildLoginRedirectUrl = getLoginRedirectUrl;

export function redirectToLogin(
  routerOrReturnUrl?: { push?: (url: string) => void } | string,
  customReturnUrl?: string
): void {
  if (typeof window === 'undefined') return;
  const targetUrl =
    typeof routerOrReturnUrl === 'string'
      ? getLoginRedirectUrl(routerOrReturnUrl)
      : getLoginRedirectUrl(customReturnUrl);

  if (routerOrReturnUrl && typeof routerOrReturnUrl === 'object' && typeof routerOrReturnUrl.push === 'function') {
    routerOrReturnUrl.push(targetUrl);
    return;
  }
  window.location.href = targetUrl;
}

/**
 * Validates an incoming `?redirect=` parameter to prevent open redirects.
 */
export function getSafeRedirectTarget(rawRedirect: string | null | undefined, fallback = '/'): string {
  if (!rawRedirect) return fallback;
  const trimmed = rawRedirect.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }
  return trimmed;
}

export const sanitizeRedirectPath = getSafeRedirectTarget;

export function isUnauthorizedError(error: any): boolean {
  const status = error?.status ?? error?.response?.status;
  const code = error?.code ?? error?.response?.data?.code;
  return status === 401 || code === 'LOGIN_REQUIRED' || code === 'UNAUTHORIZED';
}

export function extractApiError(error: any, fallback = 'Something went wrong'): {
  status?: number;
  code?: string;
  message: string;
  data?: any;
  meta?: any;
  payload?: any;
} {
  const status = error?.status ?? error?.response?.status;
  const payload = error?.response?.data;
  const code = error?.code ?? payload?.code;
  const rawMsg =
    payload?.message ||
    (Array.isArray(payload?.errors) && payload.errors[0]) ||
    error?.message ||
    fallback;
  const message = Array.isArray(rawMsg) ? rawMsg[0] || fallback : String(rawMsg || fallback);
  return {
    status,
    code,
    message,
    data: error?.data ?? payload?.data,
    meta: error?.meta ?? payload?.meta,
    payload,
  };
}
