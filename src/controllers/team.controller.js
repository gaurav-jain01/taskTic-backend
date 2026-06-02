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
