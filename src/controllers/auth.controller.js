import User from '../models/user.model.js';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function initFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: "tasktic-fe539", // Hardcoded based on frontend config since we only need to verify tokens
    });
  }
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'member',
    });
    await user.save();

    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
    const customToken = jwt.sign(
      { id: user._id, role: user.role, teamId: user.teamId },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ 
      message: 'User registered successfully', 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: customToken
    });
  } catch (error) {
    console.error('Error in auth register controller:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { idToken, email, password, name } = req.body;

    // Handle Firebase Auth Flow
    if (idToken) {
      initFirebaseAdmin();
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (err) {
        console.error('Firebase token verification error in login:', err);
        return res.status(401).json({ error: 'Invalid or expired Firebase token' });
      }

      const { uid: firebaseUid, email: fbEmail } = decodedToken;

      let user = await User.findOne({ 
        $or: [{ email: fbEmail.toLowerCase() }, { firebaseUid }] 
      });

      if (!user) {
        user = new User({
          name: name || fbEmail.split('@')[0],
          email: fbEmail.toLowerCase(),
          firebaseUid,
          role: 'member',
        });
        await user.save();
      } else if (!user.firebaseUid) {
        // If user exists without firebaseUid, attach it
        user.firebaseUid = firebaseUid;
        await user.save();
      }

      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
      const customToken = jwt.sign(
        { id: user._id, role: user.role, firebaseUid: user.firebaseUid },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return res.status(200).json({ 
        message: 'User logged in successfully via Firebase', 
        user,
        token: customToken
      });
    }

    // Handle Standard Email/Password Auth Flow
    if (email && password) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (!user.password) {
        return res.status(401).json({ error: 'Please login using Firebase (Google/Email) or reset your password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
      const customToken = jwt.sign(
        { id: user._id, role: user.role, name: user.name, teamId: user.teamId },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return res.status(200).json({ 
        message: 'User logged in successfully', 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: user.teamId
        },
        token: customToken
      });
    }

    return res.status(400).json({ error: 'Please provide either idToken or email and password.' });

  } catch (error) {
    console.error('Error in auth login controller:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};
