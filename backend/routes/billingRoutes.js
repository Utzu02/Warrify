import express from 'express';
import { createCheckoutSession, createBillingPortalSession, changeSubscriptionPlan } from '../crud/billingCrud.js';
import { getSubscriptionLimits } from '../crud/billingCrud.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const router = express.Router();

router.post('/billing/checkout', userMiddleware, createCheckoutSession);
router.post('/billing/portal', userMiddleware, createBillingPortalSession);
router.post('/billing/change-plan', userMiddleware, changeSubscriptionPlan);
router.get('/subscription/limits', userMiddleware, getSubscriptionLimits);

export default router;
