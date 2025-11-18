import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    carrier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Carrier',
      required: [true, 'Carrier is required'],
    },
    porter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Porter',
      required: [true, 'Porter is required'],
    },
    locationFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'From location is required'],
    },
    locationTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'To location is required'],
    },
    task: {
      type: String,
      trim: true,
      default: '',
    },
    commuteCostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommuteCost',
    },
    computedCost: {
      type: Number,
      required: [true, 'Computed cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

attendanceSchema.index({ date: 1, porter: 1 });
attendanceSchema.index({ porter: 1, date: 1 });
attendanceSchema.index({ date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
