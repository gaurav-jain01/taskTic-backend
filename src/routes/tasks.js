const express = require('express');
const Task = require('../models/task.model');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    const tasks = await Task.find(filter);
    return res.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return res.status(500).json({ error: 'Unable to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status, projectId, assignedTo } = req.body;
    if (!title || !projectId) {
      return res.status(400).json({ error: 'Task title and projectId are required' });
    }

    const task = new Task({ title, description, status, projectId, assignedTo });
    await task.save();
    return res.status(201).json(task);
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return res.status(500).json({ error: 'Unable to create task' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = (({ title, description, status, projectId, assignedTo }) => ({ title, description, status, projectId, assignedTo }))(req.body);

    const task = await Task.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    console.error('PUT /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Unable to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Unable to delete task' });
  }
});

module.exports = router;
