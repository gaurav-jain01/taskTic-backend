import express from 'express';
const router = express.Router();
import * as teamController from '../controllers/team.controller.js';

router.post('/', teamController.createTeam);
router.get('/', teamController.getTeams);

export default router;
