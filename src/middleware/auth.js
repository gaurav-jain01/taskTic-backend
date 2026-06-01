const admin = require('firebase-admin');
const User = require('../models/user.model');

function initFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

async function verifyFirebaseToken(req, res, next) {
  initFirebaseAdmin();

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decodedToken.uid }).select('name email role teamId');

    if (!user) {
      return res.status(401).json({ error: 'User record not found for authenticated Firebase user' });
    }

    req.user = {
      id: user._id,
      firebaseUid: decodedToken.uid,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    };

    next();
  } catch (error) {
    console.error('Firebase token verification error:', error.message || error);
    return res.status(401).json({ error: 'Invalid or expired Firebase token' });
  }
}

function allowRoles(...allowedRoles) {
  const normalizedAllowed = allowedRoles.map((role) => String(role).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = String(req.user.role || '').toLowerCase();
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }

    next();
  };
}

module.exports = {
  verifyFirebaseToken,
  allowRoles,
};
