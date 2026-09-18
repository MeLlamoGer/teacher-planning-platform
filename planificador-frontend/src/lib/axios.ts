import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((pending) => {
    if (error || !token) pending.reject(error ?? new Error('No refresh token available'));
    else pending.resolve(token);
  });
  failedQueue = [];
}

function isSessionEndpoint(url?: string) {
  return Boolean(url && (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh')
  ));
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isSessionEndpoint(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use the base axios client so a failed refresh cannot recursively enter
        // this interceptor.
        const { data } = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        useAuthStore.getState().setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();

        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
