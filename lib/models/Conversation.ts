import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage?: string;
  lastActivity: Date;
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: String,
    lastActivity: { type: Date, default: Date.now },
    unreadCount: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastActivity: -1 });

export default mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);
