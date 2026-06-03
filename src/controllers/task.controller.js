import Task from '../models/task.model.js';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import ActivityLog from '../models/activityLog.model.js';

export const getTasks = async (req, res) => {
  try {
    const filter = {};

    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    // ADMIN -> all tasks
    if (req.user.role === 'admin') {
      // no filter
    }

    // MANAGER -> tasks from projects in their team
    else if (req.user.role === 'manager') {
      if (!req.user.teamId) {
        // Manager without a team shouldn't see any tasks
        return res.json([]);
      }

      const teamProjects = await Project.find({
        teamId: req.user.teamId
      }).select('_id');

      const teamProjectIds = teamProjects.map(p => p._id);

      filter.projectId = { $in: teamProjectIds };
    }

    // MEMBER -> only tasks assigned to him
    else {
      filter.assignedTo = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email role');

    return res.json(tasks);

  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return res.status(500).json({
      error: 'Unable to fetch tasks'
    });
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

    const project = await Project.findById(projectId);
    if (project) {
      let userName = req.user.name;
      if (!userName) {
        const userDoc = await User.findById(req.user.id);
        userName = userDoc ? userDoc.name : 'Unknown User';
      }

      await ActivityLog.create({
        type: 'Task Created',
        description: `"${task.title}" created by ${userName}`,
        user: userName,
        teamId: project.teamId
      });
    }

    return res.status(201).json(task);
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return res.status(500).json({ error: 'Unable to create task' });
  }
};
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = await Task.findById(id);

    if (!existingTask) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    let update = {};

    // Admin can update everything
    if (req.user.role === 'admin') {
      update = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        projectId: req.body.projectId,
        assignedTo: req.body.assignedTo,
      };
    }

    // Manager cannot change project
    else if (req.user.role === 'manager') {
      const project = await Project.findById(existingTask.projectId);
      if (project && project.teamId.toString() !== req.user.teamId.toString()) {
        return res.status(403).json({ error: 'You can only update tasks within your team' });
      }

      update = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        assignedTo: req.body.assignedTo,
      };
    }

    // Member can only change status
    else {
      update = {
        status: req.body.status,
      };

      // Optional security check:
      if (existingTask.assignedTo?.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          error: 'You can only update your own tasks'
        });
      }
    }

    const task = await Task.findByIdAndUpdate(
      id,
      update,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('projectId', 'name teamId')
      .populate('assignedTo', 'name email role');

    if (task && task.projectId) {
      let userName = req.user.name;
      if (!userName) {
        const userDoc = await User.findById(req.user.id);
        userName = userDoc ? userDoc.name : 'Unknown User';
      }

      if (existingTask.status !== task.status) {
        const formatStatus = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const oldStatus = formatStatus(existingTask.status);
        const newStatus = formatStatus(task.status);
        
        await ActivityLog.create({
          type: 'Task Updated',
          description: `${userName} moved ${task.title}\n${oldStatus} → ${newStatus}`,
          user: userName,
          teamId: task.projectId.teamId
        });
      }

      const oldAssignedTo = existingTask.assignedTo ? existingTask.assignedTo.toString() : null;
      const newAssignedTo = task.assignedTo ? task.assignedTo._id.toString() : null;

      if (oldAssignedTo !== newAssignedTo) {
        const assignedUserName = task.assignedTo ? task.assignedTo.name : 'Unassigned';
        await ActivityLog.create({
          type: 'Task Assigned',
          description: `"${task.title}" assigned to ${assignedUserName}`,
          user: userName,
          teamId: task.projectId.teamId
        });
      }
    }

    return res.json(task);

  } catch (error) {
    console.error('PUT /api/tasks/:id error:', error);
    return res.status(500).json({
      error: 'Unable to update task'
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (req.user.role === 'member') {
      return res.status(403).json({ error: 'Members are not allowed to delete tasks' });
    }

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
