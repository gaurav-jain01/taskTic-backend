import Task from '../models/task.model.js';
import Project from '../models/project.model.js';

export const getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    if (req.user && req.user.role !== 'admin') {
      const userTeamId = req.user.teamId;
      if (!userTeamId) {
        return res.json([]); // User has no team, returns empty tasks
      }

      const teamProjects = await Project.find({ teamId: userTeamId }).select('_id');
      const teamProjectIds = teamProjects.map(p => p._id);

      if (filter.projectId) {
        if (!teamProjectIds.some(id => id.toString() === filter.projectId.toString())) {
          return res.status(403).json({ error: 'Access denied to this project\'s tasks' });
        }
      } else {
        filter.projectId = { $in: teamProjectIds };
      }
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email role');
    return res.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return res.status(500).json({ error: 'Unable to fetch tasks' });
  }
};

export const createTask = async (req, res) => {
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
};

export const updateTask = async (req, res) => {
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
};

export const deleteTask = async (req, res) => {
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
};
