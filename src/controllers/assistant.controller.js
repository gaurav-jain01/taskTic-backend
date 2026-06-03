import Task from '../models/task.model.js';
import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import ActivityLog from '../models/activityLog.model.js';

export const processCommand = async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const text = command.trim();
    const teamId = req.user.teamId;
    const isAdmin = req.user.role === 'admin';
    
    if (!teamId && !isAdmin) {
      return res.status(403).json({ error: 'You must be assigned to a team to use the assistant.' });
    }

    const lowerText = text.toLowerCase();
    
    const isCreate = lowerText.includes('create');
    const isAssign = lowerText.includes('assign') || lowerText.includes('asign');
    const isMove = lowerText.includes('move');

    // 1. COMBINED: Create & Assign
    if (isCreate && isAssign) {
      let titleMatch = text.match(/create.*?(?:task\s+of\s+|task\s+)(.*?)(?:assign|asign)/i) 
                    || text.match(/create\s+(.*?)(?:assign|asign)/i);
      let title = titleMatch && titleMatch[1].trim() ? titleMatch[1].trim() : "New Task";
      
      let userMatch = text.match(/(?:assign|asign).*?to\s+(.*)/i);
      let userName = userMatch ? userMatch[1].trim() : "";

      let projectFilter = {};
      if (teamId) projectFilter.teamId = teamId;
      const project = await Project.findOne(projectFilter);
      
      if (!project) {
        return res.status(404).json({ error: "No projects found." });
      }

      let userQuery = userName ? { name: { $regex: new RegExp(userName.split(' ').join('.*'), 'i') } } : null;
      if (userQuery && teamId) userQuery.teamId = teamId;
      const assignedUser = userQuery ? await User.findOne(userQuery) : null;

      const task = new Task({
        title,
        status: 'todo',
        projectId: project._id,
        assignedTo: assignedUser ? assignedUser._id : null
      });
      await task.save();

      let msg = `Task "${title}" created.`;
      if (assignedUser) {
        msg += ` Assigned to ${assignedUser.name}.`;
      } else if (userName) {
        msg += ` (Could not find user "${userName}" to assign)`;
      }

      return res.json({ message: msg, task });
    }

    // 2. Create only
    if (isCreate && !isAssign && !isMove) {
      let titleMatch = text.match(/create.*?(?:task\s+of\s+|task\s+)(.*)/i) || text.match(/create\s+(.*)/i);
      let title = titleMatch && titleMatch[1].trim() ? titleMatch[1].trim() : "New Task";

      let projectFilter = {};
      if (teamId) projectFilter.teamId = teamId;
      const project = await Project.findOne(projectFilter);
      
      if (!project) return res.status(404).json({ error: "No projects found." });

      const task = new Task({ title, status: 'todo', projectId: project._id });
      await task.save();
      
      return res.json({ message: `Task "${title}" created successfully.`, task });
    }

    // 3. Assign only
    if (isAssign && !isCreate) {
      let assignMatch = text.match(/(?:assign|asign)\s+(.*?)\s+to\s+(.*)/i);
      let taskTitle = "";
      let userName = "";

      if (assignMatch && assignMatch[1].trim() !== "") {
         taskTitle = assignMatch[1].trim();
         userName = assignMatch[2].trim();
      } else {
         let toMatch = text.match(/to\s+(.*)/i);
         userName = toMatch ? toMatch[1].trim() : "";
      }

      let userQuery = { name: { $regex: new RegExp(userName.split(' ').join('.*'), 'i') } };
      if (teamId) userQuery.teamId = teamId;
      const user = await User.findOne(userQuery);
      if (!user) return res.status(404).json({ error: `Could not find user "${userName}".` });

      let projectFilter = teamId ? { teamId } : {};
      const teamProjects = await Project.find(projectFilter).select('_id');
      const teamProjectIds = teamProjects.map(p => p._id);

      let task;
      if (taskTitle) {
        task = await Task.findOne({ 
          title: { $regex: new RegExp(taskTitle, 'i') },
          projectId: { $in: teamProjectIds }
        });
      } else {
        task = await Task.findOne({ projectId: { $in: teamProjectIds } }).sort({ createdAt: -1 });
      }

      if (!task) return res.status(404).json({ error: `Could not find the task.` });

      task.assignedTo = user._id;
      await task.save();

      return res.json({ message: `Task "${task.title}" has been assigned to ${user.name}.`, task });
    }

    // 4. Move task
    if (isMove) {
      let moveMatch = text.match(/move\s+(.*?)\s+to\s+(.*)/i);
      let taskTitle = moveMatch ? moveMatch[1].trim() : "";
      let targetStatusStr = moveMatch ? moveMatch[2].trim().toLowerCase() : "";

      if (!targetStatusStr) {
         let toMatch = text.match(/to\s+(.*)/i);
         targetStatusStr = toMatch ? toMatch[1].trim().toLowerCase() : "";
      }

      let targetStatus = targetStatusStr;
      if (targetStatusStr.includes('progress')) targetStatus = 'in-progress';
      else if (targetStatusStr.includes('todo') || targetStatusStr.includes('to do')) targetStatus = 'todo';
      else if (targetStatusStr.includes('review')) targetStatus = 'review';
      else if (targetStatusStr.includes('done')) targetStatus = 'done';

      const validStatuses = ['todo', 'in-progress', 'review', 'done'];
      if (!validStatuses.includes(targetStatus)) {
        return res.status(400).json({ error: `Invalid status "${targetStatusStr}". Allowed statuses are: Todo, In Progress, Review, Done.` });
      }

      let projectFilter = teamId ? { teamId } : {};
      const teamProjects = await Project.find(projectFilter).select('_id');
      const teamProjectIds = teamProjects.map(p => p._id);

      let task;
      if (taskTitle) {
        task = await Task.findOne({ 
          title: { $regex: new RegExp(taskTitle, 'i') },
          projectId: { $in: teamProjectIds }
        });
      } else {
        task = await Task.findOne({ projectId: { $in: teamProjectIds } }).sort({ createdAt: -1 });
      }

      if (!task) return res.status(404).json({ error: `Could not find the task.` });

      task.status = targetStatus;
      await task.save();

      const formatStatus = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return res.json({ message: `Task "${task.title}" has been moved to ${formatStatus(task.status)}.`, task });
    }

    // Default response if no pattern matched
    return res.status(400).json({ 
      error: "I'm sorry, I didn't understand that command. Try 'Create task [name]', 'Assign [task] to [user]', or 'Move [task] to [status]'." 
    });

  } catch (error) {
    console.error('Assistant error:', error);
    return res.status(500).json({ error: 'Internal server error while processing command.' });
  }
};
