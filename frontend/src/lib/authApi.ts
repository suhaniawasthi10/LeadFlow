import { api } from './api';

export interface AuthUser {
  _id: string;
  email: string;
}

interface AuthResult {
  user: AuthUser;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const { data } = await api.post<AuthResult>('/auth/login', { email, password });
  return data;
}

export async function signup(email: string, password: string): Promise<AuthResult> {
  const { data } = await api.post<AuthResult>('/auth/signup', { email, password });
  return data;
}

export async function me(): Promise<{ user: AuthUser }> {
  const { data } = await api.get<{ user: AuthUser }>('/auth/me');
  return data;
}
