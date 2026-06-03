import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller.js';
import { verifyAuthToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyAuthToken);

router.get(
    '/',
    verifyAuthToken,
    getTasks
);
router.post('/', createTask);
router.put(
    '/:id',
    verifyAuthToken,
    updateTask
);
router.delete('/:id', deleteTask);

export default router;
