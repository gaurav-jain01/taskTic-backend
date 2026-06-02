import express from 'express';
const router = express.Router();
import * as usersController from '../controllers/users.controller.js';
import { verifyAuthToken, allowRoles } from '../middleware/auth.js';

router.get('/', usersController.getUsers);
router.put('/:id/role', verifyAuthToken, allowRoles('admin'), usersController.updateUserRole);
router.delete('/:id', verifyAuthToken, allowRoles('admin'), usersController.deleteUser);

export default router;
