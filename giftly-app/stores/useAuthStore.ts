import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/services/api';
import * as authService from '@/services/auth-service';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isHydrated: boolean;

  /** Chargement initial depuis le SecureStore — à appeler au démarrage de l'app */
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  /** Appelé après le callback OAuth2 avec les tokens reçus en deep link */
  loginWithTokens: (accessToken: string, refreshToken: string, userData: Omit<User, 'id'> & { id: number }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      set({ isHydrated: true });
      return;
    }
    // Le token existe — on reconstruit l'état depuis le SecureStore
    // (les données utilisateur sont stockées séparément)
    const rawUser = await SecureStore.getItemAsync('giftly_user');
    const user = rawUser ? (JSON.parse(rawUser) as User) : null;
    set({ user, isHydrated: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(email, password);
      await persistSession(data);
      set({ user: buildUser(data), isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.register(name, email, password);
      await persistSession(data);
      set({ user: buildUser(data), isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithTokens: async (accessToken, refreshToken, userData) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    const user: User = { ...userData };
    await SecureStore.setItemAsync('giftly_user', JSON.stringify(user));
    set({ user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync('giftly_user');
    set({ user: null });
  },
}));

// ── Utilitaires privés ──────────────────────────────────────────────────────

async function persistSession(data: authService.AuthResponse): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
  const user = buildUser(data);
  await SecureStore.setItemAsync('giftly_user', JSON.stringify(user));
}

function buildUser(data: authService.AuthResponse): User {
  return {
    id: data.userId,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatarUrl,
    plan: data.plan,
  };
}
