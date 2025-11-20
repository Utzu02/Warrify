export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionInterval = BillingPeriod | 'none';
export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';
export type PaidPlanKey = 'enterprise' | 'pro' | 'premium';
export type PlanKey = PaidPlanKey | 'free';
