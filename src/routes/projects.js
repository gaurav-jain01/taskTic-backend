import express from 'express';
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject
} from '../controllers/project.controller.js';

import {
    verifyAuthToken,
    allowRoles
} from '../middleware/auth.js';

const router = express.Router();

router.get(
    '/',
    verifyAuthToken,
    allowRoles('admin', 'manager', 'member'),
    getProjects
);

router.post(
    '/',
    verifyAuthToken,
    allowRoles('admin'),
    createProject
);

router.put(
    '/:id',
    verifyAuthToken,
    allowRoles('admin'),
    updateProject
);

router.delete(
    '/:id',
    verifyAuthToken,
    allowRoles('admin'),
    deleteProject
);
export default router;