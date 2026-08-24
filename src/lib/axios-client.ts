let rawBase = (
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BASE_API ||
  process.env.BASE_URL ||
  'http://localhost:4000/api'
)
  .trim()
  .replace(/\/+$/, '');

// Strip accidental /v1 or /api/v1 if carried over from another project
rawBase = rawBase.replace(/\/api\/v1$/, '/api').replace(/\/v1$/, '');

const baseURL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

type InterceptorHandler = {
  fulfilled?: (response: any) => any;
  rejected?: (error: any) => any;
};

const responseInterceptors: InterceptorHandler[] = [];

async function request(method: string, url: string, data?: any, config?: { params?: any; headers?: any }) {
  let fullUrl = url.startsWith('http') ? url : `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;

  if (config?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(config.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config?.headers || {}),
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (data !== undefined && method !== 'GET' && method !== 'HEAD') {
    options.body = typeof data === 'string' ? data : JSON.stringify(data);
  }

  try {
    const res = await fetch(fullUrl, options);
    let responseData: any = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
    } else {
      const text = await res.text();
      responseData = text ? { message: text } : null;
    }

    if (!res.ok) {
      const errorObj: any = new Error(
        responseData?.message || responseData?.error || `Request failed with status ${res.status}`
      );
      errorObj.response = {
        status: res.status,
        data: responseData,
      };
      errorObj.config = { method, url, data, config };
      throw errorObj;
    }

    let result: any = { data: responseData, status: res.status, headers: res.headers };

    for (const interceptor of responseInterceptors) {
      if (interceptor.fulfilled) {
        result = await interceptor.fulfilled(result);
      }
    }

    return result;
  } catch (err: any) {
    let handledError = err;
    for (const interceptor of responseInterceptors) {
      if (interceptor.rejected) {
        try {
          return await interceptor.rejected(handledError);
        } catch (rejErr) {
          handledError = rejErr;
        }
      }
    }
    throw handledError;
  }
}

export const axiosClient = {
  get: <T = any, R = T>(url: string, config?: any): Promise<R> => request('GET', url, undefined, config),
  post: <T = any, R = T>(url: string, data?: any, config?: any): Promise<R> => request('POST', url, data, config),
  put: <T = any, R = T>(url: string, data?: any, config?: any): Promise<R> => request('PUT', url, data, config),
  patch: <T = any, R = T>(url: string, data?: any, config?: any): Promise<R> => request('PATCH', url, data, config),
  delete: <T = any, R = T>(url: string, config?: any): Promise<R> => request('DELETE', url, undefined, config),
  interceptors: {
    response: {
      use: (onFulfilled?: (response: any) => any, onRejected?: (error: any) => any) => {
        responseInterceptors.push({ fulfilled: onFulfilled, rejected: onRejected });
      },
    },
  },
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Register default NestJS response unwrapping, 401 auto-refresh, and error handling interceptor
axiosClient.interceptors.response.use(
  (response) => {
    const payload = response?.data !== undefined ? response.data : response;
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data;
    }
    return payload;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.status || error.response?.status;
    const url = originalRequest?.url || '';

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return request(originalRequest.method, originalRequest.url, originalRequest.data, originalRequest.config);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await request('POST', '/auth/refresh');
        const refreshedUser = refreshRes?.data?.user || refreshRes?.user || refreshRes?.data;
        if (refreshedUser) {
          const { useAuthStore } = await import('@/store/use-auth-store');
          useAuthStore.getState().setUser(refreshedUser);
        }
        processQueue(null);
        return request(originalRequest.method, originalRequest.url, originalRequest.data, originalRequest.config);
      } catch (refreshErr) {
        processQueue(refreshErr);
        try {
          const { useAuthStore } = await import('@/store/use-auth-store');
          useAuthStore.getState().setUser(null);
        } catch (_) {}
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Session expired. Please log in again.';
        const errObj: any = new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        errObj.status = status;
        errObj.response = error.response;
        return Promise.reject(errObj);
      } finally {
        isRefreshing = false;
      }
    }

    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred.';
    const errObj: any = new Error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    errObj.status = status;
    errObj.response = error.response;
    return Promise.reject(errObj);
  }
);
