import User from '../schemas/User.js';

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
    const user = await User.findById(req.params.id);
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

// Gmail settings management
export const updateGmailSettings = async (req, res) => {
  try {
    const userId = req.userId; // From JWT middleware
    const { maxResults, startDate, endDate } = req.body;

    const updates = {};
    if (maxResults !== undefined) {
      updates['gmail.defaultSettings.maxResults'] = Math.max(1, Math.min(100, maxResults));
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

    res.json({
      isConnected: user.gmail?.isConnected || false,
      connectedAt: user.gmail?.connectedAt || null,
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
    
    await User.findByIdAndUpdate(userId, {
      'gmail.isConnected': false,
      'gmail.connectedAt': null
    });

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
