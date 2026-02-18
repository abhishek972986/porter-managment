import mongoose from 'mongoose';

const porterSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: [true, 'Porter UID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Porter name is required'],
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
      default: '',
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

porterSchema.index({ active: 1 });

const Porter = mongoose.model('Porter', porterSchema);

export default Porter;
