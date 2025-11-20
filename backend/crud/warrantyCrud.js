import Warranty from '../schemas/Warranty.js';
import { createNotificationIfNotExists } from './notificationCrud.js';
import User from '../schemas/User.js';
import { PLAN_MAX_WARRANTIES } from '../config/billingPlans.js';

export const createWarranty = async (req, res) => {
  try {
    // Enforce plan limits
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

  // Determine allowed max from plan mapping (authoritative)
  const maxForUser = PLAN_MAX_WARRANTIES[user.billing?.planKey] ?? PLAN_MAX_WARRANTIES['free'] ?? null;
    if (typeof maxForUser === 'number') {
      const currentCount = await Warranty.countDocuments({ userId: req.userId });
      if (currentCount >= maxForUser) {
        return res.status(400).json({ error: 'PLAN_LIMIT_REACHED' });
      }
    }

    const warranty = new Warranty({ ...req.body, userId: req.userId });
    await warranty.save();
    res.status(201).send(warranty);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

export const listWarranties = async (req, res) => {
  try {
    const { fiscalCode, companyName, sortBy } = req.query;
    const filter = {};
    if (fiscalCode) filter.fiscalCode = fiscalCode;
    if (companyName) filter.companyName = { $regex: companyName, $options: 'i' };

    const sort = {};
    if (sortBy) {
      const sortFields = sortBy.split(',');
      sortFields.forEach((field) => {
        if (field.startsWith('-')) {
          sort[field.slice(1)] = -1;
        } else {
          sort[field] = 1;
        }
      });
    }

    const warranties = await Warranty.find(filter).sort(sort);

    // Trigger: create WARRANTY_EXPIRED notifications for this user (idempotent)
    try {
      const userId = req.userId;
      if (userId) {
        const now = new Date();
        // For each warranty that belongs to the user and is expired, create a deduped notification
        warranties.forEach((w) => {
          try {
            if ((w.userId === userId || String(w.userId) === String(userId)) && w.scadentDate && new Date(w.scadentDate) <= now) {
              createNotificationIfNotExists({
                userId,
                type: 'WARRANTY_EXPIRED',
                title: 'Warranty expired',
                message: `${w.productName || 'A product'} warranty expired`,
                meta: { warrantyId: w.guaranteeId }
              }).catch(() => {});
            }
          } catch (err) {
            // swallow per-item errors
          }
        });
      }
    } catch (err) {
      // don't fail the request if notification creation fails
      console.error('Notification trigger error:', err);
    }

    res.status(200).send(warranties);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const getWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id);
    if (!warranty) {
      return res.status(404).send();
    }
    res.status(200).send(warranty);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const updateWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warranty) {
      return res.status(404).send();
    }
    res.status(200).send(warranty);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

export const deleteWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByIdAndDelete(req.params.id);
    if (!warranty) {
      return res.status(404).send();
    }
    res.status(200).send(warranty);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
