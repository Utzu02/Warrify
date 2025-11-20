import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Pricing.css';
import PricingLayout from '../components/pricing/PricingLayout';
import PricingHero from '../components/pricing/PricingHero';
import BillingToggle from '../components/pricing/BillingToggle';
import PricingGrid from '../components/pricing/PricingGrid';
import FreeTierSection from '../components/pricing/FreeTierSection';
import FlexiProSection from '../components/pricing/FlexiProSection';
import Footer from "../components/footer/Footer";
import { standardPlans, getPrice } from '../components/pricing/pricingData';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createCheckoutSession, updateSubscriptionPlan } from '../api/billing';
import { fetchUserProfile, type UserProfile } from '../api/users';
import type { BillingPeriod, PaidPlanKey, PlanKey } from '../types/billing';
import BaseModal from '../components/modal/BaseModal';

const PLAN_PRIORITY: Record<PaidPlanKey, number> = {
  enterprise: 1,
  pro: 2,
  premium: 3
};

const PLAN_TITLE_MAP: Record<PlanKey, string> = standardPlans.reduce(
  (acc, plan) => {
    acc[plan.planKey] = plan.title;
    return acc;
  },
  { free: 'Free plan' } as Record<PlanKey, string>
);

const clearQueryParam = (param: string) => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.delete(param);
  const nextQuery = params.toString();
  const nextUrl = nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname;
  window.history.replaceState({}, document.title, nextUrl);
};

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [planChangePrompt, setPlanChangePrompt] = useState<{ planKey: PlanKey; billingPeriod?: BillingPeriod } | null>(null);
  const [planChangeLoading, setPlanChangeLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const isYearly = billingPeriod === 'yearly';
  const billingPeriodKey: BillingPeriod = isYearly ? 'yearly' : 'monthly';

  useEffect(() => {
    const checkoutState = searchParams.get('checkout');
    if (!checkoutState) {
      return;
    }

    if (checkoutState === 'cancel') {
      showToast({
        variant: 'info',
        title: 'Checkout canceled',
        message: 'No problem—pick up where you left off anytime.'
      });
    }

    clearQueryParam('checkout');
  }, [searchParams, showToast]);

  const refreshUserProfile = async () => {
    if (!user?.id) return;
    try {
      const data = await fetchUserProfile(user.id);
      setUserProfile(data);
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setUserProfile(null);
      return;
    }

    const controller = new AbortController();

    fetchUserProfile(user.id, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setUserProfile(data);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setUserProfile(null);
        }
      });

    return () => controller.abort();
  }, [isAuthenticated, user]);

  const currentPlanKey: PaidPlanKey | null =
    userProfile?.billing?.planKey && userProfile.billing.planKey !== 'free'
      ? (userProfile.billing.planKey as PaidPlanKey)
      : null;
  const currentInterval = userProfile?.billing?.interval || null;

  const beginCheckout = async (planKey: PaidPlanKey, period: BillingPeriod) => {
    const identifier = `${planKey}-${period}`;
    setCheckoutPlan(identifier);
    try {
      const { url } = await createCheckoutSession({ planKey, billingPeriod: period });
      if (!url) {
        throw new Error('Stripe did not return a checkout URL. Please try again.');
      }

      window.location.href = url;
      return true;
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Checkout failed',
        message: error instanceof Error ? error.message : 'Unable to start Stripe Checkout right now.'
      });
      return false;
    } finally {
      setCheckoutPlan((current) => (current === identifier ? null : current));
    }
  };

  const handlePaidPlanClick = async (planKey: PaidPlanKey, period: BillingPeriod) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/pricing&plan=${planKey}-${period}`);
      return;
    }

    if (!currentPlanKey) {
      await beginCheckout(planKey, period);
      return;
    }

    if (currentPlanKey === planKey) {
      if (currentInterval === period) {
        showToast({
          variant: 'info',
          title: 'Already active',
          message: 'You are already on this plan and billing cadence.'
        });
        return;
      }
      setPlanChangePrompt({ planKey, billingPeriod: period });
      return;
    }

    setPlanChangePrompt({ planKey, billingPeriod: period });
  };

  const transformedPlans = standardPlans.map((plan) => {
    const planIdentifier = `${plan.planKey}-${billingPeriodKey}`;
    const isCurrentPlan = currentPlanKey === plan.planKey;
    const isCurrentCadence = isCurrentPlan && currentInterval === billingPeriodKey;
    return {
      ...plan,
      price: getPrice(plan, isYearly),
      period: isYearly ? 'per year' : 'per month',
      onCtaClick: () => handlePaidPlanClick(plan.planKey, billingPeriodKey),
      ctaLoading: checkoutPlan === planIdentifier,
      isCurrent: isCurrentPlan,
      disabled: Boolean(isCurrentCadence)
    };
  });

  const isFreePlanActive = isAuthenticated && !currentPlanKey;

  const planChangeMeta: PlanChangeMeta | null = (() => {
    if (!planChangePrompt) return null;
    const targetPlan = planChangePrompt.planKey;
    const targetTitle = PLAN_TITLE_MAP[targetPlan] || 'Selected plan';
    const currentTitle =
      userProfile?.billing?.planName || (currentPlanKey ? PLAN_TITLE_MAP[currentPlanKey] : 'your current plan');
    const currentPriority = currentPlanKey ? PLAN_PRIORITY[currentPlanKey] : -1;
    const targetPriority = targetPlan === 'free' ? -1 : PLAN_PRIORITY[targetPlan as PaidPlanKey];
    const isCancel = targetPlan === 'free';
    const isCadenceChange = currentPlanKey === targetPlan;
    const isDowngrade = !isCancel && !isCadenceChange && targetPriority < currentPriority;
    const periodLabel =
      planChangePrompt.billingPeriod === 'yearly' ? 'yearly' : 'monthly';

    const title = isCancel
      ? 'Switch to Free plan'
      : isCadenceChange
        ? 'Change billing cycle'
        : isDowngrade
          ? 'Confirm downgrade'
          : 'Confirm upgrade';

    const description = isCancel
      ? 'We will cancel your paid subscription and stop future charges.'
      : isCadenceChange
        ? 'Update your existing subscription without re-entering your card.'
        : isDowngrade
          ? 'You are about to switch to a lower plan.'
          : 'Upgrade instantly without re-entering your payment details.';

    const body = isCancel
      ? `Do you really want to cancel ${currentTitle} and move back to the Free plan?`
      : isCadenceChange
        ? `Switch ${currentTitle} to be billed ${periodLabel}?`
        : isDowngrade
          ? `Do you really want to move from ${currentTitle} to ${targetTitle}?`
          : `Upgrade from ${currentTitle} to ${targetTitle}?`;

    const note = isCancel
      ? 'You will lose paid features immediately. You can always upgrade again later.'
      : isCadenceChange
        ? 'Stripe will adjust your billing cycle automatically and settle any prorations.'
        : isDowngrade
          ? 'Stripe will handle prorations and the change takes effect immediately.'
          : 'Stripe will handle any prorations automatically.';

    const primaryLabelBase = isCancel
      ? 'Yes, switch to Free'
      : isCadenceChange
        ? 'Confirm change'
        : isDowngrade
          ? 'Yes, downgrade'
          : 'Upgrade now';

    const primaryVariant: PlanChangeMeta['primaryVariant'] = isCancel || isDowngrade ? 'danger' : 'primary';

    return {
      title,
      description,
      body,
      note,
      primaryLabelBase,
      primaryVariant
    };
  })();

  const handleConfirmPlanChange = async () => {
    if (!planChangePrompt) return;
    setPlanChangeLoading(true);
    try {
      const response = await updateSubscriptionPlan({
        planKey: planChangePrompt.planKey,
        billingPeriod: planChangePrompt.planKey === 'free' ? undefined : planChangePrompt.billingPeriod
      });

      if (response.requiresCheckout && planChangePrompt.planKey !== 'free') {
        setPlanChangeLoading(false);
        setPlanChangePrompt(null);
        showToast({
          variant: 'info',
          title: 'Confirm payment',
          message: response.message || 'Please confirm your payment method to restart the subscription.'
        });
        await beginCheckout(
          planChangePrompt.planKey as PaidPlanKey,
          planChangePrompt.billingPeriod || billingPeriodKey
        );
        return;
      }
      await refreshUserProfile();
      const target = planChangePrompt.planKey;
      const currentPriority = currentPlanKey ? PLAN_PRIORITY[currentPlanKey] : -1;
      const targetPriority = target === 'free' ? -1 : PLAN_PRIORITY[target as PaidPlanKey];
      let message: string;
      if (target === 'free') {
        message = 'Your subscription has been canceled and you are now on the Free plan.';
      } else if (targetPriority < currentPriority) {
        message = 'Your plan downgrade is scheduled. Stripe handled the update automatically.';
      } else if (targetPriority > currentPriority) {
        message = 'Your plan upgrade is live. Stripe handled the proration automatically.';
      } else {
        message = 'Your billing cycle has been updated.';
      }

      showToast({
        variant: 'success',
        title: 'Plan updated',
        message
      });
      setPlanChangePrompt(null);
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Update failed',
        message: error instanceof Error ? error.message : 'Could not update your plan.'
      });
    } finally {
      setPlanChangeLoading(false);
    }
  };

  const handleFreeTierClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing&plan=free');
      return;
    }

    if (!currentPlanKey) {
      showToast({
        variant: 'info',
        title: 'Already on Free',
        message: 'You are currently enjoying the Free plan.'
      });
      return;
    }

    setPlanChangePrompt({ planKey: 'free' });
  };

  const handleFlexiProClick = (warrantyCount: number) => {
    showToast({
      variant: 'info',
      title: 'FlexiPro interest saved',
      message: `Our team will reach out about ${warrantyCount} warranties soon.`
    });
  };

  return (
    <>
      <div className="main-pricing">
        <PricingLayout>
          <PricingHero />

          <BillingToggle 
            billingPeriod={billingPeriod}
            onToggle={setBillingPeriod}
          />

          <PricingGrid 
            plans={transformedPlans}
          />

          <FreeTierSection 
            onCtaClick={handleFreeTierClick}
            isCurrent={isFreePlanActive}
            disabled={isFreePlanActive}
          />

          <FlexiProSection 
            onCtaClick={handleFlexiProClick}
          />
        </PricingLayout>
      </div>
      <Footer />

      <BaseModal
        isOpen={Boolean(planChangePrompt)}
        onClose={() => {
          if (!planChangeLoading) {
            setPlanChangePrompt(null);
          }
        }}
        title={planChangeMeta?.title}
        description={planChangeMeta?.description}
        primaryAction={{
          label: planChangeLoading ? 'Updating...' : planChangeMeta?.primaryLabelBase || 'Confirm',
          onClick: handleConfirmPlanChange,
          loading: planChangeLoading,
          disabled: planChangeLoading,
          variant: planChangeMeta?.primaryVariant || 'primary'
        }}
        secondaryAction={{
          label: 'Keep current plan',
          onClick: () => setPlanChangePrompt(null),
          disabled: planChangeLoading
        }}
      >
        {planChangeMeta && (
          <>
            <p>{planChangeMeta.body}</p>
            <p className="pricing-downgrade-warning">{planChangeMeta.note}</p>
          </>
        )}
      </BaseModal>

    </>
  );
};
export default Pricing;
type PlanChangeMeta = {
  title: string;
  description: string;
  body: string;
  note: string;
  primaryLabelBase: string;
  primaryVariant: 'primary' | 'secondary' | 'ghost' | 'danger';
};
