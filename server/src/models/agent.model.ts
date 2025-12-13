import mongoose, { Document, Schema } from 'mongoose';

export interface IJobDetails {
  title: string;
  description: string;
}

export interface IAgent extends Document {
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  name: string;
  jobDetails: IJobDetails;
  pillars: string[];
  questions: string[];
  prompt: string;
  persona: 'formal' | 'casual';
  status: 'draft' | 'active' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const agentSchema = new Schema<IAgent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Agent name is required'],
      trim: true,
      maxlength: [100, 'Agent name cannot exceed 100 characters'],
    },
    jobDetails: {
      title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
      },
      description: {
        type: String,
        default: '',
      },
    },
    pillars: {
      type: [String],
      enum: ['experience', 'behavioral', 'role_specific', 'cultural_fit'],
      default: [],
    },
    questions: {
      type: [String],
      default: [],
    },
    prompt: {
      type: String,
      default: '',
    },
    persona: {
      type: String,
      enum: ['formal', 'casual'],
      default: 'formal',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries
agentSchema.index({ userId: 1 });
agentSchema.index({ companyId: 1 });
agentSchema.index({ status: 1 });

export const Agent = mongoose.model<IAgent>('Agent', agentSchema);
