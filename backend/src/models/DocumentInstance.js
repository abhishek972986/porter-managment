import mongoose from 'mongoose';

const documentInstanceSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DocumentTemplate',
      required: [true, 'Template ID is required'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
    fileS3Key: {
      type: String,
      default: '',
    },
    localPath: {
      type: String,
      default: '',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

documentInstanceSchema.index({ month: 1 });
documentInstanceSchema.index({ templateId: 1, month: 1 });

const DocumentInstance = mongoose.model('DocumentInstance', documentInstanceSchema);

export default DocumentInstance;
