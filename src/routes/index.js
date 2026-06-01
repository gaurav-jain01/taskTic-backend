const express = require('express');
const router = express.Router();

const projectRoutes = require('./projects');
const taskRoutes = require('./tasks');
const messageRoutes = require('./messages');

router.get('/', (req, res) => {
  res.json({ message: 'TaskTic API root' });
});

router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
