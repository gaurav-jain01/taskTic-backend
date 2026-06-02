import Team from '../models/team.model.js';
import User from '../models/user.model.js';

export const createTeam = async (req, res) => {
  try {
    const { name, description, adminId, memberIds } = req.body;

    if (!name || !adminId) {
      return res.status(400).json({ error: 'Team name and adminId are required' });
    }

    const team = new Team({
      name,
      description,
      adminId
    });

    await team.save();

    if (memberIds && Array.isArray(memberIds) && memberIds.length > 0) {
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $set: { teamId: team._id } }
      );
    }

    await User.findByIdAndUpdate(adminId, { $set: { teamId: team._id } });

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Server error while creating team' });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().lean();
    const users = await User.find().lean();
    
    const teamsWithMembers = teams.map(team => {
      const members = users.filter(u => u.teamId?.toString() === team._id.toString());
      return { ...team, members };
    });

    res.json(teamsWithMembers);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Server error while fetching teams' });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, memberIds } = req.body;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;

    await team.save();

    if (memberIds && Array.isArray(memberIds)) {
      // First, remove this teamId from all users who currently have it
      await User.updateMany(
        { teamId: team._id },
        { $unset: { teamId: "" } }
      );

      // Then, set this teamId for the new memberIds
      if (memberIds.length > 0) {
        await User.updateMany(
          { _id: { $in: memberIds } },
          { $set: { teamId: team._id } }
        );
      }
      
      // Ensure admin always stays in the team
      await User.findByIdAndUpdate(team.adminId, { $set: { teamId: team._id } });
    }

    res.json({ message: 'Team updated successfully', team });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Server error while updating team' });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Remove teamId from all members
    await User.updateMany(
      { teamId: team._id },
      { $unset: { teamId: "" } }
    );

    await Team.findByIdAndDelete(id);

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Server error while deleting team' });
  }
};
