import User from '../schemas/User.js';
import { createNotificationIfNotExists } from './notificationCrud.js';

export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    console.error('❌ Create user error:', error);
    res.status(400).send({ 
      error: process.env.NODE_ENV === 'production' ? 'Failed to create user' : error.message 
    });
  }
};

export const listUsers = async (_req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    console.error('❌ List users error:', error);
    res.status(500).send({ 
      error: process.env.NODE_ENV === 'production' ? 'Failed to retrieve users' : error.message 
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -gmail.tokens');
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).send({ 
      error: process.env.NODE_ENV === 'production' ? 'Failed to retrieve user' : error.message 
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(400).send({ 
      error: process.env.NODE_ENV === 'production' ? 'Failed to update user' : error.message 
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).send(user);
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).send({ 
      error: process.env.NODE_ENV === 'production' ? 'Failed to delete user' : error.message 
    });
  }
};

export const findUserById = (id) => User.findById(id);

export const setLastScanAt = async (id, date = new Date()) =>
  User.findByIdAndUpdate(id, { lastScanAt: date }, { new: true, select: 'lastScanAt' });

const normalizeDate = (value) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const buildGmailTokenUpdates = (tokens = {}) => {
  const updates = {};
  if (tokens.accessToken) {
    updates['gmail.tokens.accessToken'] = tokens.accessToken;
  }
  if (tokens.refreshToken) {
    updates['gmail.tokens.refreshToken'] = tokens.refreshToken;
  }
  if (tokens.expiryDate) {
    const normalized = normalizeDate(tokens.expiryDate);
    if (normalized) {
      updates['gmail.tokens.expiryDate'] = normalized;
    }
  }
  return updates;
};

export const saveGmailTokens = (userId, tokens = {}, options = {}) => {
  const updates = buildGmailTokenUpdates(tokens);

  if (options.markConnected) {
    updates['gmail.isConnected'] = true;
    updates['gmail.connectedAt'] = options.connectedAt || new Date();
  }

  if (!Object.keys(updates).length) {
    return User.findById(userId).select('gmail');
  }

  return User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, select: 'gmail' }
  );
};

export const clearGmailTokens = (userId) =>
  User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        'gmail.tokens.accessToken': '',
        'gmail.tokens.refreshToken': '',
        'gmail.tokens.expiryDate': ''
      },
      $set: {
        'gmail.isConnected': false,
        'gmail.connectedAt': null
      }
    },
    { new: true, select: 'gmail' }
  );

const hasUsableGmailTokens = (gmail) => {
  const tokens = gmail?.tokens;
  if (!tokens) {
    return false;
  }

  if (tokens.refreshToken) {
    return true;
  }

  if (tokens.accessToken && tokens.expiryDate) {
    const expiry = new Date(tokens.expiryDate).getTime();
    return expiry > Date.now();
  }

  return false;
};

// Gmail settings management
export const updateGmailSettings = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware
    const { maxResults, startDate, endDate } = req.body;

    const updates = {};
    if (maxResults !== undefined) {
      updates['gmail.defaultSettings.maxResults'] = Math.max(1, Math.min(250, maxResults));
    }
    if (startDate !== undefined) {
      updates['gmail.defaultSettings.startDate'] = startDate;
    }
    if (endDate !== undefined) {
      updates['gmail.defaultSettings.endDate'] = endDate;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, select: 'gmail' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, settings: user.gmail.defaultSettings });
  } catch (error) {
    console.error('❌ Update Gmail settings error:', error);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' ? 'Failed to update settings' : error.message 
    });
  }
};

export const getGmailSettings = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware
    
    const user = await User.findById(userId).select('gmail');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const connected = hasUsableGmailTokens(user.gmail);

    // If not connected, create a single deduped GMAIL_DISCONNECTED notification for the user
    try {
      if (!connected) {
        await createNotificationIfNotExists({
          userId,
          type: 'GMAIL_DISCONNECTED',
          title: 'Gmail not connected',
          message: 'Connect your Gmail account to enable automatic scanning',
          meta: {}
        });
      }
    } catch (err) {
      // ignore failures to create notification
      console.error('Notification trigger (gmail) error:', err);
    }

    res.json({
      isConnected: connected,
      connectedAt: connected ? user.gmail?.connectedAt || null : null,
      defaultSettings: user.gmail?.defaultSettings || {
        maxResults: 10,
        startDate: null,
        endDate: null
      }
    });
  } catch (error) {
    console.error('❌ Get Gmail settings error:', error);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' ? 'Failed to retrieve settings' : error.message 
    });
  }
};

export const disconnectGmail = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware
    await clearGmailTokens(userId);

    // Clear the Google token cookie
    res.clearCookie('googleToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.json({ success: true, message: 'Gmail disconnected successfully' });
  } catch (error) {
    console.error('❌ Disconnect Gmail error:', error);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' ? 'Failed to disconnect Gmail' : error.message 
    });
  }
};
