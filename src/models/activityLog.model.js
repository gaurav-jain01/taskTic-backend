import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      required: true,
      enum: [
        'Project Created', 
        'Project Updated', 
        'Task Created', 
        'Task Updated', 
        'Task Assigned', 
        'User Added', 
        'User Removed'
      ] 
    },
    description: { type: String, required: true },
    user: { type: String, required: true }, // Store the name directly for easy fetching, or reference User
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', activityLogSchema);
