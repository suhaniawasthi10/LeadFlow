import { z } from 'zod';

export const createDiscussionSchema = z.object({
  note: z.string().trim().min(1, 'Note is required'),
  followUpAt: z.coerce.date().optional(),
});
export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;
