import Notification from '../schemas/Notification.js';

/** Create a notification if a duplicate doesn't already exist.
 * dedupeFilter should identify duplicates for the event (e.g. { type, 'meta.warrantyId': 123 })
 */
export const createNotificationIfNotExists = async (doc = {}) => {
  const { userId, type, meta } = doc;
  if (!userId || !type) {
    throw new Error('userId and type are required to create a notification');
  }

  const dedupeFilter = { userId, type };
  if (meta && meta.warrantyId) {
    dedupeFilter['meta.warrantyId'] = meta.warrantyId;
  }

  const existing = await Notification.findOne(dedupeFilter).exec();
  if (existing) return existing;

  const n = new Notification(doc);
  await n.save();
  return n;
};

export const getNotificationsForUser = async (userId) =>
  Notification.find({ userId }).sort({ createdAt: -1 }).lean();

export const deleteNotificationForUser = async (userId, id) =>
  Notification.findOneAndDelete({ _id: id, userId });

export const clearNotificationsForUser = async (userId) =>
  Notification.deleteMany({ userId });

export const markNotificationRead = async (userId, id) =>
  Notification.findOneAndUpdate({ _id: id, userId }, { $set: { isRead: true } }, { new: true });
