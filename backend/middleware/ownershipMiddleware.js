import mongoose from 'mongoose';
import User from '../schemas/User.js';

const isValidObjectId = (value = '') => mongoose.Types.ObjectId.isValid(value);

export const ensureSelfOrAdmin = async (req, res, next) => {
  try {
    const requesterId = req.userId;
    const targetId = req.params?.id;

    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!isValidObjectId(targetId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (String(requesterId) === String(targetId)) {
      return next();
    }

    if (req.isAdmin === true) {
      return next();
    }

    // Fallback: fetch and cache admin status if not already known
    const user = await User.findById(requesterId).select('isAdmin');
    if (user?.isAdmin) {
      req.isAdmin = true;
      return next();
    }

    return res.status(403).json({ error: 'Admin privileges required' });
  } catch (error) {
    console.error('❌ Ownership middleware error:', error);
    return res.status(500).json({ error: 'Failed to verify permissions' });
  }
};
