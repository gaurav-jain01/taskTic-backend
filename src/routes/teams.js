import express from 'express';
import * as teamController from '../controllers/team.controller.js';
import { verifyAuthToken, allowRoles } from '../middleware/auth.js';

const router = express.Router();

router.get(
    '/',
    verifyAuthToken,
    teamController.getTeams
);

router.get(
    '/:id',
    verifyAuthToken,
    teamController.getTeamById
);

router.post(
    '/',
    verifyAuthToken,
    allowRoles('admin'),
    teamController.createTeam
);

router.put(
    '/:id',
    verifyAuthToken,
    allowRoles('admin'),
    teamController.updateTeam
);

router.delete(
    '/:id',
    verifyAuthToken,
    allowRoles('admin'),
    teamController.deleteTeam
);

export default router;