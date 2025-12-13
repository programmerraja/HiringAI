import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  website: string;
  context: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    website: {
      type: String,
      required: [true, 'Website URL is required'],
      trim: true,
    },
    context: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries by userId
companySchema.index({ userId: 1 });

export const Company = mongoose.model<ICompany>('Company', companySchema);
