import { Discussion, DiscussionDoc } from '../models/Discussion';

export async function listDiscussionsForLead(leadId: string): Promise<DiscussionDoc[]> {
  return Discussion.find({ leadId }).sort({ createdAt: -1 }).lean<DiscussionDoc[]>();
}
