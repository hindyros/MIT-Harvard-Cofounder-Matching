import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  userId: Types.ObjectId;
  answers: {
    whyFounder: string;
    currentProject: string;
    commitment: string;
    previousExperience: string;
    whatLookingFor: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    answers: {
      whyFounder: { type: String, required: true },
      currentProject: { type: String, required: true },
      commitment: { type: String, required: true },
      previousExperience: { type: String, required: true },
      whatLookingFor: { type: String, required: true },
    },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewNote: String,
  },
  { timestamps: true }
);

ApplicationSchema.index({ status: 1, createdAt: 1 });

export default mongoose.models.Application ||
  mongoose.model<IApplication>('Application', ApplicationSchema);
