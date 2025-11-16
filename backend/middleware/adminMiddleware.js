import User from '../schemas/User.js';

export const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.userId).select('isAdmin');
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    req.isAdmin = true;
    return next();
  } catch (error) {
    console.error('❌ Admin middleware error:', error);
    return res.status(500).json({ error: 'Failed to verify admin permissions' });
  }
};
