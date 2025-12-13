import mongoose, { Document, Schema } from 'mongoose';

export interface ICall extends Document {
  candidateId: mongoose.Types.ObjectId;
  agentId: mongoose.Types.ObjectId;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  scheduledTime: Date;
  recordingUrl: string;
  dinodialCallId: number | null;
  analysis?: any;
  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new Schema<ICall>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate ID is required'],
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'Agent ID is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'in_progress', 'completed', 'failed'],
        message: 'Invalid status. Must be one of: scheduled, in_progress, completed, failed',
      },
      default: 'scheduled',
    },
    scheduledTime: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    recordingUrl: {
      type: String,
      default: '',
    },
    dinodialCallId: {
      type: Number,
      default: null,
    },
    analysis: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for faster queries
callSchema.index({ candidateId: 1 });
callSchema.index({ agentId: 1 });

export const Call = mongoose.model<ICall>('Call', callSchema);
