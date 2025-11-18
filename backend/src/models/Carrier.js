import mongoose from 'mongoose';

const carrierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Carrier name is required'],
      unique: true,
      trim: true,
      enum: {
        values: ['porter', 'small-donkey', 'pickup-truck'],
        message: '{VALUE} is not a valid carrier type',
      },
    },
    capacityKg: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0, 'Capacity cannot be negative'],
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

carrierSchema.index({ name: 1 });

const Carrier = mongoose.model('Carrier', carrierSchema);

export default Carrier;
