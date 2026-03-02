import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  rolesNeeded: string[];
  tags: string[];
  status: 'seeking' | 'in_progress' | 'closed';
  createdBy: Types.ObjectId;
  interestedUsers: Types.ObjectId[];
  school: 'MIT' | 'Harvard' | 'Both';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    rolesNeeded: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    status: { type: String, default: 'seeking', enum: ['seeking', 'in_progress', 'closed'] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    interestedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    school: { type: String, required: true, enum: ['MIT', 'Harvard', 'Both'] },
  },
  { timestamps: true }
);

ProjectSchema.index({ status: 1, createdAt: -1 });
ProjectSchema.index({ school: 1, status: 1 });
ProjectSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
