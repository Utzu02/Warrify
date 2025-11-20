import { apiFetch, ApiOptions } from './client';
import type { Warranty } from '../types/dashboard';
import type { PlanKey, SubscriptionStatus, SubscriptionInterval } from '../types/billing';

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  terms?: boolean;
  createdAt?: string;
  account_created_at?: string;
  billing?: {
    planKey?: PlanKey;
    planName?: string;
    status?: SubscriptionStatus;
    interval?: SubscriptionInterval;
    planStartedAt?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    upcomingPeriodStart?: string;
    cancelAtPeriodEnd?: boolean;
  };
}

export const fetchUserProfile = (userId: string, options?: ApiOptions) =>
  apiFetch<UserProfile>(`/api/users/${userId}`, options);

export const fetchUserWarranties = (userId: string, options?: ApiOptions) =>
  apiFetch<{ total: number; items: Warranty[] }>(`/api/users/${userId}/warranties`, options);

export const fetchScanInfo = (userId: string, options?: ApiOptions) =>
  apiFetch<{ lastScanAt: string | null }>(`/api/users/${userId}/scan-info`, options);
