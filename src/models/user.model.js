import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: false },
    role: { type: String, required: true, enum: ['admin', 'manager', 'member'], default: 'member' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: false },
    firebaseUid: { type: String, required: false, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
