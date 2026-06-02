import express from 'express';
const router = express.Router();
import * as usersController from '../controllers/users.controller.js';

router.get('/', usersController.getUsers);

export default router;
