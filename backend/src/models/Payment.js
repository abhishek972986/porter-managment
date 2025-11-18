import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    porter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Porter',
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

paymentSchema.index({ porter: 1, year: 1, month: 1 }, { unique: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
