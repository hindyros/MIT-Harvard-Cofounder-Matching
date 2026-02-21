import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  description: string;
  apiKey: string;
  claimToken: string;
  claimStatus: 'pending_claim' | 'claimed';
  linkedUserId?: Types.ObjectId;
  ownerEmail?: string;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    apiKey: { type: String, required: true, unique: true },
    claimToken: { type: String, required: true, unique: true },
    claimStatus: { type: String, default: 'pending_claim', enum: ['pending_claim', 'claimed'] },
    linkedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    ownerEmail: String,
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);
