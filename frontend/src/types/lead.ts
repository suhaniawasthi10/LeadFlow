export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Won',
  'Lost',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface Lead {
  _id: string;
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

export interface Discussion {
  _id: string;
  leadId: string;
  note: string;
  followUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
