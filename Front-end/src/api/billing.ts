import { apiFetch } from './client';
import type { BillingPeriod, PaidPlanKey, PlanKey } from '../types/billing';

export type CheckoutPayload = {
  planKey: PaidPlanKey;
  billingPeriod: BillingPeriod;
};

export type CheckoutResponse = { sessionId: string; url?: string };

export const createCheckoutSession = (payload: CheckoutPayload) =>
  apiFetch<CheckoutResponse>('/api/billing/checkout', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const createBillingPortalSession = () =>
  apiFetch<{ url: string }>('/api/billing/portal', {
    method: 'POST'
  });

export type UpdatePlanPayload = {
  planKey: PlanKey;
  billingPeriod?: BillingPeriod;
};

export type UpdatePlanResponse = {
  success?: boolean;
  requiresCheckout?: boolean;
  reason?: string;
  message?: string;
};

export const updateSubscriptionPlan = (payload: UpdatePlanPayload) =>
  apiFetch<UpdatePlanResponse>('/api/billing/change-plan', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
