import { axiosClient } from './axios-client';

export interface RequestConfig {
  headers?: Record<string, string>;
}

export const apiClient = {
  get<T>(endpoint: string, params?: any, config?: RequestConfig): Promise<T> {
    return axiosClient.get(endpoint, { ...config, params });
  },

  post<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return axiosClient.post(endpoint, body, config);
  },

  put<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return axiosClient.put(endpoint, body, config);
  },

  patch<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    return axiosClient.patch(endpoint, body, config);
  },

  delete<T>(endpoint: string, params?: any, config?: RequestConfig): Promise<T> {
    return axiosClient.delete(endpoint, { ...config, params });
  },
};
