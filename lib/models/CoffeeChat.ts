import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICoffeeChat extends Document {
  matchId?: Types.ObjectId;
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  scheduledAt: Date;
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const CoffeeChatSchema = new Schema<ICoffeeChat>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
    user1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    location: String,
    status: {
      type: String,
      default: 'scheduled',
      enum: ['scheduled', 'completed', 'cancelled'],
    },
  },
  { timestamps: true }
);

CoffeeChatSchema.index({ user1: 1, scheduledAt: 1 });
CoffeeChatSchema.index({ user2: 1, scheduledAt: 1 });

export default mongoose.models.CoffeeChat ||
  mongoose.model<ICoffeeChat>('CoffeeChat', CoffeeChatSchema);
