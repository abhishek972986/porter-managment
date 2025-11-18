import Activity from '../models/Activity.js';

export const logActivity = async (type, description, userId = null, metadata = {}) => {
  try {
    await Activity.create({
      type,
      description,
      user: userId,
      metadata,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const getRecentActivities = async (limit = 20) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    return activities;
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return [];
  }
};
