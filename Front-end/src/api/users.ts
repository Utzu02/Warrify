import { apiFetch, ApiOptions } from './client';
import type { Warranty } from '../types/dashboard';

export const fetchUserProfile = (userId: string, options?: ApiOptions) => apiFetch(`/api/users/${userId}`, options);

export const fetchUserWarranties = (userId: string, options?: ApiOptions) =>
  apiFetch<{ total: number; items: Warranty[] }>(`/api/users/${userId}/warranties`, options);

export const fetchScanInfo = (userId: string, options?: ApiOptions) =>
  apiFetch<{ lastScanAt: string | null }>(`/api/users/${userId}/scan-info`, options);
