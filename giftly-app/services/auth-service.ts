import api from './api';
import { Endpoints } from '@/constants/api';
import type { User } from '@/types';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: User['plan'];
}

/** Connexion email / mot de passe */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(Endpoints.auth.login, { email, password });
  return data;
}

/** Inscription */
export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(Endpoints.auth.register, { name, email, password });
  return data;
}
