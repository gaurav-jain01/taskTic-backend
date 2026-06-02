import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export async function verifyAuthToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
    const decodedToken = jwt.verify(token, jwtSecret);
    
    const user = await User.findById(decodedToken.id).select('name email role teamId firebaseUid');

    if (!user) {
      return res.status(401).json({ error: 'User record not found' });
    }

    req.user = {
      id: user._id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    };

    next();
  } catch (error) {
    console.error('JWT token verification error:', error.message || error);
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

export function allowRoles(...allowedRoles) {
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

