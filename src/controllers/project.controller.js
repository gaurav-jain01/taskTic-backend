import Project from '../models/project.model.js';
import ActivityLog from '../models/activityLog.model.js';

export const getProjects = async (req, res) => {
  try {
    let projects;

    // Admin -> All projects
    if (req.user.role === "admin") {
      projects = await Project.find()
        .populate("teamId", "name");
    }

    // Manager & Member -> Only projects of their team
    else {
      if (!req.user.teamId) {
        return res.json([]);
      }
      projects = await Project.find({
        teamId: req.user.teamId,
      }).populate("teamId", "name");
    }

    return res.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return res.status(500).json({
      error: "Unable to fetch projects",
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, teamId } = req.body;
    if (!name || !teamId) {
      return res.status(400).json({ error: 'Project name and teamId are required' });
    }

    const project = new Project({ name, description, teamId });
    await project.save();

    await ActivityLog.create({
      type: 'Project Created',
      description: `"${project.name}" created by ${req.user.name}`,
      user: req.user.name,
      teamId: project.teamId
    });

    return res.status(201).json(project);
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return res.status(500).json({ error: 'Unable to create project' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const update = (({ name, description, teamId }) => ({ name, description, teamId }))(req.body);

    const project = await Project.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await ActivityLog.create({
      type: 'Project Updated',
      description: `"${project.name}" was updated by ${req.user.name}`,
      user: req.user.name,
      teamId: project.teamId
    });

    return res.json(project);
  } catch (error) {
    console.error('PUT /api/projects/:id error:', error);
    return res.status(500).json({ error: 'Unable to update project' });
  }
};

export const deleteProject = async (req, res) => {
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
};
