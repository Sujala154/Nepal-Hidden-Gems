const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Creates and saves a notification.
 * @param {Object} params - { recipientId, senderId, type, title, message, relatedId }
 */
const createNotification = async ({ recipientId, senderId, type, title, message, relatedId }) => {
  try {
    console.log(`[NOTIFICATION_INFO] Creating ${type} for recipient: ${recipientId} from sender: ${senderId}`);
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      relatedId,
      isRead: false
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw - notifications should be non-blocking if possible
    return null;
  }
};

/**
 * Notify all admins
 */
const notifyAdmins = async ({ senderId, type, title, message, relatedId }) => {
  try {
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      sender: senderId,
      type,
      title,
      message,
      relatedId
    }));

    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
};

module.exports = {
  createNotification,
  notifyAdmins
};
