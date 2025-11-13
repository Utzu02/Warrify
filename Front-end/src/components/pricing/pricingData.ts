/* ============================================
   PRICING DATA
   Centralized pricing plans configuration
   ============================================ */

export interface Feature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  icon: string;
  title: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: Feature[];
  ctaText: string;
  ctaVariant?: 'primary' | 'secondary';
  isPopular?: boolean;
}

// Standard Plans (shown in main grid)
export const standardPlans: PricingPlan[] = [
  {
    icon: '🏢',
    title: 'Enterprise',
    description: 'For individuals who need robust tracking.',
    monthlyPrice: 20,
    yearlyPrice: 16, // 20% discount
    features: [
      { text: 'Management offers 120 yearly guarantees', included: true },
      { text: 'Grouping guarantees into categories', included: true },
      { text: 'Guarantees collected from mail periodically', included: true },
      { text: 'Basic warranty reports', included: true },
      { text: 'Email support', included: true }
    ],
    ctaText: 'Get Enterprise',
    ctaVariant: 'primary',
    isPopular: false
  },
  {
    icon: '🎁',
    title: 'Pro',
    description: 'Ideal for small to medium enterprises.',
    monthlyPrice: 30,
    yearlyPrice: 24, // 20% discount
    features: [
      { text: 'Management offers 250 yearly guarantees', included: true },
      { text: 'Extra push notifications for expiry', included: true },
      { text: 'Basic report on warranties', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Dedicated account manager', included: false }
    ],
    ctaText: 'Choose Pro',
    ctaVariant: 'primary',
    isPopular: true
  },
  {
    icon: '�',
    title: 'Premium',
    description: 'Built for larger enterprises.',
    monthlyPrice: 50,
    yearlyPrice: 40, // 20% discount
    features: [
      { text: 'Management offers 500+ yearly guarantees', included: true },
      { text: 'Advanced warranty reports & analytics', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations available', included: true }
    ],
    ctaText: 'Go Premium',
    ctaVariant: 'primary',
    isPopular: false
  }
];

// Free Tier Plan (shown separately)
export const freeTierPlan = {
  icon: '🎁',
  title: 'Free Subscription',
  description: 'Experience the core benefits of Warrify without any commitment. Perfect for personal use.',
  price: 0,
  features: [
    { text: 'Management offers 20 monthly guarantees', included: true },
    { text: 'Manually import guarantees from email', included: true }
  ],
  ctaText: 'Try for Free',
  ctaVariant: 'primary' as const
};

// FlexiPro Plan (shown with calculator)
export const flexiProPlan = {
  icon: '�',
  title: 'FlexiPro',
  description: 'Dynamic plan for growing needs, pay as you expand.',
  basePrice: 50,
  pricePerWarranty: 0.30,
  features: [
    { text: 'Management offers 300 monthly guarantees', included: true },
    { text: 'Additional guarantees charged at 0.30 RON* per warranty', included: true },
    { text: 'Advanced warranty reports', included: true },
    { text: 'Priority email support', included: true }
  ],
  ctaText: 'Get FlexiPro',
  ctaVariant: 'primary' as const
};

// Helper to get price based on billing period
export const getPrice = (plan: PricingPlan, isYearly: boolean): number => {
  return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
};

// Helper to calculate FlexiPro price
export const calculateFlexiProPrice = (warrantyCount: number): number => {
  return flexiProPlan.basePrice + (warrantyCount * flexiProPlan.pricePerWarranty);
};
