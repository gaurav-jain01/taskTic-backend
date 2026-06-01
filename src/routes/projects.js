const express = require('express');
const Project = require('../models/project.model');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    return res.json(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return res.status(500).json({ error: 'Unable to fetch projects' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, teamId } = req.body;
    if (!name || !teamId) {
      return res.status(400).json({ error: 'Project name and teamId are required' });
    }

    const project = new Project({ name, description, teamId });
    await project.save();
    return res.status(201).json(project);
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return res.status(500).json({ error: 'Unable to create project' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = (({ name, description, teamId }) => ({ name, description, teamId }))(req.body);

    const project = await Project.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  } catch (error) {
    console.error('PUT /api/projects/:id error:', error);
    return res.status(500).json({ error: 'Unable to update project' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/projects/:id error:', error);
    return res.status(500).json({ error: 'Unable to delete project' });
  }
});

module.exports = router;
