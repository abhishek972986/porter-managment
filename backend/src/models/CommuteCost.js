import mongoose from 'mongoose';

const commuteCostSchema = new mongoose.Schema(
  {
    fromLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'From location is required'],
    },
    toLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'To location is required'],
    },
    carrier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Carrier',
      required: [true, 'Carrier is required'],
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    active: {
      type: Boolean,
      default: true,
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

// Unique index to prevent duplicate routes for same carrier
commuteCostSchema.index(
  { fromLocation: 1, toLocation: 1, carrier: 1 },
  { unique: true }
);

commuteCostSchema.index({ carrier: 1 });
commuteCostSchema.index({ fromLocation: 1, toLocation: 1 });

const CommuteCost = mongoose.model('CommuteCost', commuteCostSchema);

export default CommuteCost;
