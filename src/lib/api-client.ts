import { axiosClient } from './axios-client';

export const apiClient = {
  get<T>(endpoint: string, params?: any): Promise<T> {
    return axiosClient.get(endpoint, { params });
  },

  post<T>(endpoint: string, body?: any): Promise<T> {
    return axiosClient.post(endpoint, body);
  },

  put<T>(endpoint: string, body?: any): Promise<T> {
    return axiosClient.put(endpoint, body);
  },

  patch<T>(endpoint: string, body?: any): Promise<T> {
    return axiosClient.patch(endpoint, body);
  },

  delete<T>(endpoint: string, params?: any): Promise<T> {
    return axiosClient.delete(endpoint, { params });
  },
};
