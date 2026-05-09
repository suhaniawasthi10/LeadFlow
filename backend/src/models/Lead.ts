import { Schema, model, Types } from 'mongoose';
import { LEAD_STATUSES, LeadStatus } from '../types/lead';

export interface LeadDoc {
  _id: Types.ObjectId;
  name: string;
  company?: string;
  phone?: string;
  status: LeadStatus;
  followUpAt?: Date;
  lastDiscussionNote?: string;
  lastDiscussionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<LeadDoc>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'New',
      required: true,
      index: true,
    },
    followUpAt: { type: Date, index: true },
    lastDiscussionNote: { type: String },
    lastDiscussionAt: { type: Date },
  },
  { timestamps: true },
);

export const Lead = model<LeadDoc>('Lead', leadSchema);
