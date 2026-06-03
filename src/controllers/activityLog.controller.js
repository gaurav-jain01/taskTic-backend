import ActivityLog from '../models/activityLog.model.js';

export const getActivityLogs = async (req, res) => {
  try {
    let filter = {};
    
    // Admin sees all activity logs (or can filter by teamId)
    if (req.user.role === 'admin') {
      if (req.query.teamId) {
        filter.teamId = req.query.teamId;
      }
    } 
    // Managers and Members only see their team's activity logs
    else {
      if (!req.user.teamId) {
        return res.json([]);
      }
      filter.teamId = req.user.teamId;
    }

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(50); // Fetch latest 50 logs

    // Format logs to match frontend expectations
    const formattedLogs = logs.map(log => ({
      id: log._id,
      type: log.type,
      description: log.description,
      user: log.user,
      timestamp: log.createdAt
    }));

    return res.json(formattedLogs);
  } catch (error) {
    console.error('GET /api/activity-logs error:', error);
    return res.status(500).json({ error: 'Unable to fetch activity logs' });
  }
};
