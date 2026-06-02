import User from '../models/user.model.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -firebaseUid').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};
