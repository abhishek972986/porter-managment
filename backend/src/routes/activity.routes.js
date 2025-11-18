import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import { getRecentActivities } from '../utils/activityLogger.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const activities = await getRecentActivities(parseInt(limit));

    res.json({
      success: true,
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
