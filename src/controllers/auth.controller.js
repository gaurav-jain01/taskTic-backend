import User from '../models/user.model.js';

export const login = async (req, res) => {
  try {
    const { email, name, firebaseUid } = req.body;

    if (!email || !name || !firebaseUid) {
      return res.status(400).json({ error: 'Email, name, and firebaseUid are required.' });
    }

    let user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { firebaseUid }] 
    });

    if (user) {
      return res.status(200).json({ message: 'User logged in successfully', user });
    }

    user = new User({
      name,
      email: email.toLowerCase(),
      firebaseUid,
      role: 'member',
    });

    await user.save();

    return res.status(201).json({ message: 'User registered and logged in successfully', user });
  } catch (error) {
    console.error('Error in auth login controller:', error);
    res.status(500).json({ error: 'Server error during login/registration.' });
  }
};
