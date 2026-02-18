import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Location code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
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

locationSchema.index({ active: 1 });

const Location = mongoose.model('Location', locationSchema);

export default Location;
