import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    role: { type: String, required: true, enum: ['admin', 'manager', 'member', 'viewer'], default: 'member' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: false },
    firebaseUid: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
