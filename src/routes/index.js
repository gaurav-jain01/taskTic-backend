import express from 'express';
import projectRoutes from './projects.js';
import taskRoutes from './tasks.js';
import messageRoutes from './messages.js';
import authRoutes from './auth.js';
import usersRoutes from './users.js';
import teamRoutes from './teams.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'TaskTic API root' });
});

router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/messages', messageRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/teams', teamRoutes);

export default router;
