import express from 'express';
import { getActivityLogs } from '../controllers/activityLog.controller.js';
import { verifyAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyAuthToken); // Require authentication

router.get('/', getActivityLogs);

export default router;
