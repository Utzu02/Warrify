import { apiFetch } from './client';

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const loginUser = (payload: { emailOrUsername: string; password: string }) =>
  apiFetch<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true
  });

export const registerUser = (payload: { username: string; email: string; password: string; terms: boolean }) =>
  apiFetch<LoginResponse>('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true
  });

export const logoutUser = () =>
  apiFetch('/api/logout', {
    method: 'POST'
  });
