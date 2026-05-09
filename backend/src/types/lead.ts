export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal Sent',
  'Won',
  'Lost',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
