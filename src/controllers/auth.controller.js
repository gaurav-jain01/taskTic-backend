import User from '../models/user.model.js';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

function initFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: "tasktic-fe539", // Hardcoded based on frontend config since we only need to verify tokens
    });
  }
}

export const login = async (req, res) => {
  try {
    initFirebaseAdmin();
    
    const { idToken, name } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Firebase idToken is required.' });
    }

    // Verify Firebase token (Firebase answers: Who is logged in?)
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      console.error('Firebase token verification error in login:', err);
      return res.status(401).json({ error: 'Invalid or expired Firebase token' });
    }

    const { uid: firebaseUid, email } = decodedToken;

    // MongoDB answers: What can they do?
    let user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { firebaseUid }] 
    });

    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        firebaseUid,
        role: 'member',
      });
      await user.save();
    }

    // Generate custom long-lived backend JWT (e.g., 7 days)
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
    const customToken = jwt.sign(
      { id: user._id, role: user.role, firebaseUid: user.firebaseUid },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ 
      message: 'User logged in successfully', 
      user,
      token: customToken
    });
  } catch (error) {
    console.error('Error in auth login controller:', error);
    res.status(500).json({ error: 'Server error during login/registration.' });
  }
};
