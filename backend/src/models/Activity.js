import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'attendance_created',
        'attendance_updated',
        'attendance_deleted',
        'porter_created',
        'porter_updated',
        'porter_deleted',
        'location_created',
        'location_updated',
        'location_deleted',
        'carrier_created',
        'carrier_updated',
        'carrier_deleted',
        'commute_cost_created',
        'commute_cost_updated',
        'commute_cost_deleted',
        'user_login',
        'report_generated',
        'payroll_paid',
        'payroll_unpaid',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
