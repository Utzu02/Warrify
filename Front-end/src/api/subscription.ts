import { apiFetch } from './client';

export type SubscriptionLimits = {
  maxWarranties: number | null;
  currentWarranties: number;
  remaining?: number | null;
  overLimit?: boolean;
  exceedsBy?: number;
};

export const fetchSubscriptionLimits = () =>
  apiFetch<SubscriptionLimits>('/api/subscription/limits');

export default fetchSubscriptionLimits;
