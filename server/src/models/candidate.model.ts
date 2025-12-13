import mongoose, { Document, Schema } from 'mongoose';

export interface IExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface IEducationEntry {
  institution: string;
  degree: string;
  field: string;
  graduationDate?: string;
}

export interface IResume {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: IExperienceEntry[];
  education: IEducationEntry[];
  rawText: string;
}

export interface ICandidate extends Document {
  agentId: mongoose.Types.ObjectId | null;
  name: string;
  email: string;
  phone: string;
  resume: IResume | null;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<IExperienceEntry>(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const educationSchema = new Schema<IEducationEntry>(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    graduationDate: { type: String },
  },
  { _id: false }
);

const resumeSchema = new Schema<IResume>(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    rawText: { type: String, required: true },
  },
  { _id: false }
);

const candidateSchema = new Schema<ICandidate>(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      required: false,
      default: null,
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
      type: resumeSchema,
      default: null,
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
