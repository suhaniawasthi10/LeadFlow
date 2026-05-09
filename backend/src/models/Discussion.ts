import { Schema, model, Types } from 'mongoose';

export interface DiscussionDoc {
  _id: Types.ObjectId;
  leadId: Types.ObjectId;
  note: string;
  followUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const discussionSchema = new Schema<DiscussionDoc>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    note: { type: String, required: true, trim: true },
    followUpAt: { type: Date },
  },
  { timestamps: true },
);

discussionSchema.index({ leadId: 1, createdAt: -1 });

export const Discussion = model<DiscussionDoc>('Discussion', discussionSchema);
