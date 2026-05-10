import { z } from 'zod';
import { LEAD_STATUSES } from '../types/lead';

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  company: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  followUpAt: z.coerce.date().optional(),
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema.partial();
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const LEAD_FILTERS = ['today', 'overdue', 'thisWeek', 'noFollowUp'] as const;
export const LEAD_SORTS = ['recent', 'name', 'followUp'] as const;

export const listLeadsQuerySchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  search: z.string().trim().min(1).optional(),
  filter: z.enum(LEAD_FILTERS).optional(),
  sort: z.enum(LEAD_SORTS).optional(),
});
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
