import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProfile {
  headline?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  lookingFor: string[];
  linkedIn?: string;
  website?: string;
  avatarUrl?: string;
  yearOfStudy?: string;
  program?: string;
}

export interface IUser extends Document {
  clerkUserId?: string;
  email: string;
  passwordHash?: string;
  name: string;
  school: 'MIT' | 'Harvard';
  isApproved: boolean;
  role: 'user' | 'admin';
  profile: IUserProfile;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkUserId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: false },
    name: { type: String, required: true },
    school: { type: String, required: true, enum: ['MIT', 'Harvard'] },
    isApproved: { type: Boolean, default: false },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    profile: {
      headline: String,
      bio: String,
      skills: { type: [String], default: [] },
      interests: { type: [String], default: [] },
      lookingFor: { type: [String], default: [] },
      linkedIn: String,
      website: String,
      avatarUrl: String,
      yearOfStudy: String,
      program: String,
    },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.index({ 'profile.skills': 1 });
UserSchema.index({ 'profile.interests': 1 });
UserSchema.index({ school: 1, isApproved: 1 });
UserSchema.index({ name: 'text', 'profile.headline': 'text', 'profile.bio': 'text' });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
