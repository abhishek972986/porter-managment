import mongoose from 'mongoose';

const documentTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['html', 'docx'],
        message: '{VALUE} is not a valid template type',
      },
      required: [true, 'Template type is required'],
    },
    placeholders: {
      type: [String],
      default: [],
    },
    s3Key: {
      type: String,
      default: '',
    },
    localPath: {
      type: String,
      default: '',
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

documentTemplateSchema.index({ orderIndex: 1 });
documentTemplateSchema.index({ active: 1 });

const DocumentTemplate = mongoose.model('DocumentTemplate', documentTemplateSchema);

export default DocumentTemplate;
