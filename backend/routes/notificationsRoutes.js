import express from 'express';
import {
  getNotificationsForUser,
  deleteNotificationForUser,
  clearNotificationsForUser,
  markNotificationRead
} from '../crud/notificationCrud.js';
import { userMiddleware } from '../middleware/userMiddleware.js';

const router = express.Router();

// GET /api/notifications
router.get('/notifications', userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const items = await getNotificationsForUser(userId);
    res.json(items);
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// DELETE /api/notifications/:id
router.delete('/notifications/:id', userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const deleted = await deleteNotificationForUser(userId, id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// DELETE /api/notifications (clear all)
router.delete('/notifications', userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    await clearNotificationsForUser(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Clear notifications error:', error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

// POST /api/notifications/:id/read
router.post('/notifications/:id/read', userMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const id = req.params.id;
    const updated = await markNotificationRead(userId, id);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

export default router;
