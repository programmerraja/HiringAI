import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidate extends Document {
  agentId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  resume: string;
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'Agent ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    resume: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries
candidateSchema.index({ agentId: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ email: 1 });

export const Candidate = mongoose.model<ICandidate>('Candidate', candidateSchema);
