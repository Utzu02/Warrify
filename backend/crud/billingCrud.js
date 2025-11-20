import User from '../schemas/User.js';
import stripeClient from '../utils/stripeClient.js';
import {
  billingPlans,
  resolvePriceId,
  stripeReturnUrls,
  getPlanFromPriceId,
  PLAN_MAX_WARRANTIES,
  BILLING_PERIODS
} from '../config/billingPlans.js';
import Warranty from '../schemas/Warranty.js';

const ensureBillingObject = (user) => {
  if (!user.billing) {
    user.billing = {};
  }
};

export const ensureStripeCustomer = async (user) => {
  ensureBillingObject(user);
  if (user.billing.stripeCustomerId) {
    return user.billing.stripeCustomerId;
  }

  const customer = await stripeClient.customers.create({
    email: user.email,
    name: user.username
  });

  user.billing.stripeCustomerId = customer.id;
  await user.save();

  return customer.id;
};

const normalizeStripeStatus = (status) => {
  if (['active', 'trialing', 'past_due', 'canceled', 'incomplete'].includes(status)) {
    return status;
  }

  if (status === 'unpaid') {
    return 'past_due';
  }
  if (status === 'incomplete_expired') {
    return 'canceled';
  }

  return 'incomplete';
};

const findUserByStripeRefs = async ({ userId, subscriptionId, customerId }) => {
  if (userId) {
    const user = await User.findById(userId);
    if (user) return user;
  }

  if (subscriptionId) {
    const user = await User.findOne({ 'billing.subscriptionId': subscriptionId });
    if (user) return user;
  }

  if (customerId) {
    return User.findOne({ 'billing.stripeCustomerId': customerId });
  }

  return null;
};

const updateUserBillingSnapshot = async ({ user, subscription, eventId }) => {
  if (!user) return;

  ensureBillingObject(user);

  if (user.billing.lastStripeEventId === eventId) {
    return;
  }

  const price = subscription.items?.data?.[0]?.price;
  const priceId = price?.id;
  const planInfo = priceId ? getPlanFromPriceId(priceId) : null;

  user.billing.subscriptionId = subscription.id;
  user.billing.stripeCustomerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;
  user.billing.priceId = priceId;

  if (planInfo) {
    user.billing.planKey = planInfo.planKey;
    user.billing.planName = planInfo.planName;
    user.billing.interval = planInfo.interval;
  }

  user.billing.status = normalizeStripeStatus(subscription.status);
  user.billing.currentPeriodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000)
    : undefined;
  user.billing.currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : undefined;
  user.billing.upcomingPeriodStart = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : undefined;
  user.billing.planStartedAt = subscription.start_date
    ? new Date(subscription.start_date * 1000)
    : user.billing.planStartedAt;
  user.billing.cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
  user.billing.lastStripeEventId = eventId;

  await user.save();
};

const handleCheckoutCompleted = async (event) => {
  const session = event.data.object;
  const userId = session.metadata?.userId || session.client_reference_id;
  if (!userId) return;

  const user = await User.findById(userId);
  if (!user) return;

  ensureBillingObject(user);

  if (user.billing.lastStripeEventId === event.id) {
    return;
  }

  if (session.subscription) {
    user.billing.subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;
  }

  if (session.metadata?.planKey && billingPlans[session.metadata.planKey]) {
    const selectedPlan = billingPlans[session.metadata.planKey];
    user.billing.planKey = selectedPlan.planKey;
    user.billing.planName = selectedPlan.name;
  }

  if (session.metadata?.billingPeriod && BILLING_PERIODS.includes(session.metadata.billingPeriod)) {
    user.billing.interval = session.metadata.billingPeriod;
  }

  user.billing.checkoutSessionId = session.id;
  if (!user.billing.status || user.billing.status === 'free') {
    user.billing.status = 'incomplete';
  }
  user.billing.lastStripeEventId = event.id;

  await user.save();
};

const syncSubscriptionEvent = async (subscriptionId, eventId) => {
  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price']
  });

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  const userIdFromMetadata = subscription.metadata?.userId;

  const user = await findUserByStripeRefs({
    userId: userIdFromMetadata,
    subscriptionId: subscription.id,
    customerId
  });

  await updateUserBillingSnapshot({ user, subscription, eventId });
};

const handleInvoicePaymentFailed = async (event) => {
  const invoice = event.data.object;
  const subscriptionId =
    typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id;

  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

  const user = await findUserByStripeRefs({
    subscriptionId,
    customerId
  });

  if (!user) return;

  ensureBillingObject(user);

  if (user.billing.lastStripeEventId === event.id) {
    return;
  }

  user.billing.status = 'past_due';
  user.billing.lastStripeEventId = event.id;

  await user.save();
};



export const createCheckoutSession = async (req, res) => {
  try {
    const { planKey, billingPeriod } = req.body || {};

    if (!planKey || !billingPlans[planKey] || planKey === 'free') {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    if (!billingPeriod || !BILLING_PERIODS.includes(billingPeriod)) {
      return res.status(400).json({ error: 'Invalid billing period' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const priceId = resolvePriceId(planKey, billingPeriod);
    if (!priceId) {
      return res.status(400).json({ error: 'Unable to resolve price for plan' });
    }

    const customerId = await ensureStripeCustomer(user);

    const session = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      allow_promotion_codes: true,
      success_url: stripeReturnUrls.success,
      cancel_url: stripeReturnUrls.cancel,
      client_reference_id: user._id.toString(),
      metadata: {
        userId: user._id.toString(),
        planKey,
        billingPeriod
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString()
        }
      }
    });

    ensureBillingObject(user);
    user.billing.checkoutSessionId = session.id;
    await user.save();

    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('❌ Stripe checkout session error:', error);
    return res.status(500).json({ error: 'Unable to start checkout session' });
  }
};

export const createBillingPortalSession = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.billing?.stripeCustomerId) {
      return res.status(400).json({ error: 'No billing profile found for this user' });
    }

    const session = await stripeClient.billingPortal.sessions.create({
      customer: user.billing.stripeCustomerId,
      return_url: stripeReturnUrls.portal
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe billing portal error:', error);
    return res.status(500).json({ error: 'Unable to open billing portal' });
  }
};

export const changeSubscriptionPlan = async (req, res) => {
  try {
    const { planKey, billingPeriod } = req.body || {};
    if (!planKey) {
      return res.status(400).json({ error: 'planKey is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.billing?.stripeCustomerId) {
      return res.status(400).json({ error: 'No billing profile found for this user' });
    }

    if (planKey === 'free') {
      if (user.billing.subscriptionId) {
        try {
          await stripeClient.subscriptions.cancel(user.billing.subscriptionId);
        } catch (error) {
          if (error?.raw?.code !== 'resource_missing') {
            throw error;
          }
          console.warn('Stripe subscription already missing during cancel.', error?.raw?.message);
        }
      }
      ensureBillingObject(user);
      user.billing.planKey = 'free';
      user.billing.planName = 'Free';
      user.billing.interval = 'none';
      user.billing.status = 'free';
      user.billing.subscriptionId = null;
      user.billing.priceId = null;
      user.billing.currentPeriodStart = null;
      user.billing.currentPeriodEnd = null;
      user.billing.planStartedAt = null;
      user.billing.cancelAtPeriodEnd = false;
      user.billing.checkoutSessionId = null;
      await user.save();
      return res.json({ success: true, billing: user.billing });
    }

    if (!billingPlans[planKey]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    if (!billingPeriod || !BILLING_PERIODS.includes(billingPeriod)) {
      return res.status(400).json({ error: 'Invalid billing period' });
    }

    if (!user.billing.subscriptionId) {
      return res.json({
        requiresCheckout: true,
        reason: 'missing_subscription',
        message: 'No active subscription to update'
      });
    }

    const priceId = resolvePriceId(planKey, billingPeriod);
    if (!priceId) {
      return res.status(400).json({ error: 'Unable to resolve price for plan' });
    }

    const subscription = await stripeClient.subscriptions.retrieve(user.billing.subscriptionId, {
      expand: ['items.data.price']
    });

    if (subscription.status === 'canceled') {
      return res.json({
        requiresCheckout: true,
        reason: 'canceled',
        message: 'Subscription already canceled'
      });
    }

    const subscriptionItem = subscription.items?.data?.[0];
    if (!subscriptionItem) {
      return res.status(400).json({ error: 'Subscription items not found' });
    }

    if (subscriptionItem.price?.id === priceId) {
      return res.json({ success: true, billing: user.billing });
    }

    const updatedSubscription = await stripeClient.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscriptionItem.id,
          price: priceId
        }
      ],
      proration_behavior: 'create_prorations'
    });

    await updateUserBillingSnapshot({
      user,
      subscription: updatedSubscription,
      eventId: `manual-change-${Date.now()}`
    });

    await user.save();

    return res.json({ success: true, billing: user.billing });
  } catch (error) {
    if (error?.raw?.code === 'resource_missing' || /No such subscription/i.test(error?.message || '')) {
      console.warn('Subscription missing when attempting change-plan, reverting to checkout flow.');
      return res.json({
        requiresCheckout: true,
        reason: 'missing_subscription',
        message: 'We could not find your previous subscription. Please restart the checkout flow.'
      });
    }
    console.error('❌ Change subscription plan error:', error);
    return res.status(500).json({ error: 'Unable to update subscription plan' });
  }
};

export const getSubscriptionLimits = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Use the plan mapping for the maximum warranties
    const maxWarranties = PLAN_MAX_WARRANTIES[user.billing?.planKey] ?? PLAN_MAX_WARRANTIES['free'] ?? null;

    // Count current warranties for the user
    const currentWarranties = await Warranty.countDocuments({ userId: req.userId });

  const remaining = typeof maxWarranties === 'number' ? Math.max(0, maxWarranties - currentWarranties) : null;
  const overLimit = typeof maxWarranties === 'number' ? currentWarranties > maxWarranties : false;
  const exceedsBy = overLimit ? currentWarranties - maxWarranties : 0;

  return res.json({ maxWarranties, currentWarranties, remaining, overLimit, exceedsBy });
  } catch (error) {
    console.error('❌ getSubscriptionLimits error:', error);
    return res.status(500).json({ error: 'Unable to fetch subscription limits' });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('❌ Stripe webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscriptionEvent(event.data.object.id, event.id);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`❌ Stripe webhook handling error (${event.type}):`, error);
  }

  return res.json({ received: true });
};
