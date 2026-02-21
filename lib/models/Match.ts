import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  weekOf: Date;
  score: number;
  scoreBreakdown: {
    skillComplementarity: number;
    interestAlignment: number;
    schoolDiversity: number;
    stageAlignment: number;
  };
  status: 'sent' | 'viewed' | 'connected' | 'passed';
  emailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    user1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekOf: { type: Date, required: true },
    score: { type: Number, required: true },
    scoreBreakdown: {
      skillComplementarity: { type: Number, default: 0 },
      interestAlignment: { type: Number, default: 0 },
      schoolDiversity: { type: Number, default: 0 },
      stageAlignment: { type: Number, default: 0 },
    },
    status: { type: String, default: 'sent', enum: ['sent', 'viewed', 'connected', 'passed'] },
    emailSentAt: Date,
  },
  { timestamps: true }
);

MatchSchema.index({ user1: 1, weekOf: 1 });
MatchSchema.index({ user2: 1, weekOf: 1 });
MatchSchema.index({ user1: 1, user2: 1 });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
