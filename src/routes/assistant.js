import express from 'express';
import { verifyAuthToken } from '../middleware/auth.js';
import { processCommand } from '../controllers/assistant.controller.js';

const router = express.Router();

router.use(verifyAuthToken);

router.post('/command', processCommand);

export default router;
