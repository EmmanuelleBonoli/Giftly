import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/api';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'giftly_access_token',
  REFRESH_TOKEN: 'giftly_refresh_token',
} as const;

/** Instance axios partagée dans toute l'application */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/** Injecte le Bearer token sur chaque requête */
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Sur 401 : tente un refresh automatique.
 * Si le refresh échoue, on vide les tokens (l'app redirigera vers le login).
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error('Pas de refresh token');

      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);

    } catch {
      // Refresh échoué — nettoyage des tokens, l'authStore détectera l'état vide
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      return Promise.reject(error);
    }
  }
);

export default api;
