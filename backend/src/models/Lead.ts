import { Schema, model, Types } from 'mongoose';
import { LEAD_STATUSES, LeadStatus } from '../types/lead';

export interface LeadDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
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
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'New',
      required: true,
    },
    followUpAt: { type: Date },
    lastDiscussionNote: { type: String },
    lastDiscussionAt: { type: Date },
  },
  { timestamps: true },
);

// Compound indexes leading with userId — every query is tenant-scoped first.
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ userId: 1, followUpAt: 1 });
leadSchema.index({ userId: 1, updatedAt: -1 });

export const Lead = model<LeadDoc>('Lead', leadSchema);
