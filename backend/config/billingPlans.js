import dotenv from 'dotenv';

dotenv.config();

const planEnvKeys = {
  enterprise: {
    monthly: 'STRIPE_PRICE_ENTERPRISE_MONTHLY',
    yearly: 'STRIPE_PRICE_ENTERPRISE_YEARLY'
  },
  pro: {
    monthly: 'STRIPE_PRICE_PRO_MONTHLY',
    yearly: 'STRIPE_PRICE_PRO_YEARLY'
  },
  premium: {
    monthly: 'STRIPE_PRICE_PREMIUM_MONTHLY',
    yearly: 'STRIPE_PRICE_PREMIUM_YEARLY'
  }
};

const requiredEnvVars = new Set([
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'FRONTEND_URL'
]);

Object.values(planEnvKeys).forEach((envMap) => {
  Object.values(envMap).forEach((key) => requiredEnvVars.add(key));
});

const missing = Array.from(requiredEnvVars).filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(
    `Missing Stripe environment variables: ${missing.join(', ')}. Please add them to backend/.env`
  );
}

const placeholderPriceTokens = new Set([
  'price_enterprise_monthly',
  'price_enterprise_yearly',
  'price_pro_monthly',
  'price_pro_yearly',
  'price_premium_monthly',
  'price_premium_yearly'
]);

const placeholderVars = [];
Object.values(planEnvKeys).forEach((envMap) => {
  Object.values(envMap).forEach((envKey) => {
    const value = process.env[envKey];
    if (value && placeholderPriceTokens.has(value)) {
      placeholderVars.push(envKey);
    }
  });
});

if (placeholderVars.length) {
  throw new Error(
    `Stripe price IDs (${placeholderVars.join(
      ', '
    )}) still use placeholder values. Replace them with real price_ IDs from your Stripe dashboard.`
  );
}

const frontendBaseUrl = process.env.FRONTEND_URL;

export const billingPlans = {
  free: {
    planKey: 'free',
    name: 'Free',
    interval: 'none'
  },
  enterprise: {
    planKey: 'enterprise',
    name: 'Enterprise',
    monthlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    yearlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
  },
  pro: {
    planKey: 'pro',
    name: 'Pro',
    monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY
  },
  premium: {
    planKey: 'premium',
    name: 'Premium',
    monthlyPriceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    yearlyPriceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY
  }
};

// Map plan keys to the maximum allowed warranties for that plan
export const PLAN_MAX_WARRANTIES = {
  free: 5,
  enterprise: 120,
  pro: 250,
  premium: 500
};

export const BILLING_PERIODS = ['monthly', 'yearly'];

const priceIdToPlan = {};

Object.values(billingPlans).forEach((plan) => {
  if (plan.monthlyPriceId) {
    priceIdToPlan[plan.monthlyPriceId] = { planKey: plan.planKey, interval: 'monthly', planName: plan.name };
  }
  if (plan.yearlyPriceId) {
    priceIdToPlan[plan.yearlyPriceId] = { planKey: plan.planKey, interval: 'yearly', planName: plan.name };
  }
});

export const resolvePriceId = (planKey, billingPeriod) => {
  const plan = billingPlans[planKey];
  if (!plan || planKey === 'free') {
    return null;
  }

  if (!BILLING_PERIODS.includes(billingPeriod)) {
    throw new Error(`Unsupported billing period "${billingPeriod}"`);
  }

  return billingPeriod === 'monthly' ? plan.monthlyPriceId : plan.yearlyPriceId;
};

export const stripeReturnUrls = {
  success: `${frontendBaseUrl}/profile?checkout=success`,
  cancel: `${frontendBaseUrl}/pricing?checkout=cancel`,
  portal: process.env.STRIPE_BILLING_PORTAL_RETURN_URL || `${frontendBaseUrl}/profile`
};

export const getPlanFromPriceId = (priceId) => priceIdToPlan[priceId] || null;
