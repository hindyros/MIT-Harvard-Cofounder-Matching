import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  school: 'MIT' | 'Harvard' | 'Both';
  createdBy: Types.ObjectId;
  attendees: Types.ObjectId[];
  category: 'networking' | 'workshop' | 'social' | 'talk' | 'hackathon' | 'other';
  maxAttendees?: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: Date,
    location: { type: String, required: true },
    school: { type: String, required: true, enum: ['MIT', 'Harvard', 'Both'] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    category: {
      type: String,
      required: true,
      enum: ['networking', 'workshop', 'social', 'talk', 'hackathon', 'other'],
    },
    maxAttendees: Number,
  },
  { timestamps: true }
);

EventSchema.index({ date: 1 });
EventSchema.index({ school: 1, date: 1 });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
