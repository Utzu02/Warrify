import { apiFetch } from './client';

export const loginUser = (payload: { email: string; password: string }) =>
  apiFetch<{ userId: string }>('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true
  });

export const registerUser = (payload: { username: string; email: string; password: string; terms: boolean }) =>
  apiFetch('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true
  });
