import express from 'express';
const router = express.Router();
import * as teamController from '../controllers/team.controller.js';
import { verifyAuthToken, allowRoles } from '../middleware/auth.js';

router.post('/', teamController.createTeam);
router.get('/', teamController.getTeams);
router.put('/:id', verifyAuthToken, allowRoles('admin', 'manager'), teamController.updateTeam);
router.delete('/:id', verifyAuthToken, allowRoles('admin'), teamController.deleteTeam);

export default router;
