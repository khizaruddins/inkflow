import { create } from 'zustand';

interface LoadingState {
  activeRequests: number;
  activeRouteTransitions: number;
  activeEndpoints: Record<string, number>;
  startRequest: (endpointKey?: string) => void;
  endRequest: (endpointKey?: string) => void;
  startRouteTransition: () => void;
  stopRouteTransition: () => void;
  isEndpointLoading: (prefix: string) => boolean;
}

export function normalizeEndpointKey(url?: string): string {
  if (!url) return 'api';
  const withoutOrigin = url.replace(/^https?:\/\/[^/]+/i, '');
  const withoutQuery = withoutOrigin.split('?')[0] || 'api';
  return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  activeRequests: 0,
  activeRouteTransitions: 0,
  activeEndpoints: {},

  startRequest: (endpointKey?: string) => {
    const key = normalizeEndpointKey(endpointKey);
    set((state) => ({
      activeRequests: state.activeRequests + 1,
      activeEndpoints: {
        ...state.activeEndpoints,
        [key]: (state.activeEndpoints[key] ?? 0) + 1,
      },
    }));
  },

  endRequest: (endpointKey?: string) => {
    const key = normalizeEndpointKey(endpointKey);
    set((state) => {
      const nextCount = Math.max(0, (state.activeEndpoints[key] ?? 1) - 1);
      const nextEndpoints = { ...state.activeEndpoints };
      if (nextCount === 0) {
        delete nextEndpoints[key];
      } else {
        nextEndpoints[key] = nextCount;
      }
      return {
        activeRequests: Math.max(0, state.activeRequests - 1),
        activeEndpoints: nextEndpoints,
      };
    });
  },

  startRouteTransition: () => {
    set((state) => ({
      activeRouteTransitions: state.activeRouteTransitions + 1,
    }));
  },

  stopRouteTransition: () => {
    set((state) => ({
      activeRouteTransitions: Math.max(0, state.activeRouteTransitions - 1),
    }));
  },

  isEndpointLoading: (prefix: string) => {
    const endpoints = get().activeEndpoints;
    return Object.keys(endpoints).some(
      (key) => (endpoints[key] ?? 0) > 0 && key.startsWith(prefix)
    );
  },
}));

/**
 * Convenience selector hook to know whether any matching API request is currently in flight.
 */
export function useApiLoading(prefix?: string): boolean {
  return useLoadingStore((state) => {
    if (!prefix) {
      return state.activeRequests > 0;
    }
    return Object.keys(state.activeEndpoints).some(
      (key) => (state.activeEndpoints[key] ?? 0) > 0 && key.startsWith(prefix)
    );
  });
}

