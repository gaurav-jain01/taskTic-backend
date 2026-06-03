import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import { verifyAuthToken, allowRoles } from '../middleware/auth.js';

const router = express.Router();

// Admin -> all users
// Manager -> only users from their team
// Member -> only users from their team
router.get(
    '/',
    verifyAuthToken,
    usersController.getUsers
);

router.put(
    '/:id/role',
    verifyAuthToken,
    allowRoles('admin'),
    usersController.updateUserRole
);

router.delete(
    '/:id',
    verifyAuthToken,
    allowRoles('admin'),
    usersController.deleteUser
);

export default router;