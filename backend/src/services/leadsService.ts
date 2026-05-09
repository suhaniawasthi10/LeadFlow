import { Lead, LeadDoc } from '../models/Lead';
import { Discussion, DiscussionDoc } from '../models/Discussion';

export async function listLeads(): Promise<LeadDoc[]> {
  return Lead.find().sort({ updatedAt: -1 }).lean<LeadDoc[]>();
}

export async function getLeadWithDiscussions(
  id: string,
): Promise<{ lead: LeadDoc; discussions: DiscussionDoc[] } | null> {
  const lead = await Lead.findById(id).lean<LeadDoc>();
  if (!lead) return null;
  const discussions = await Discussion.find({ leadId: id })
    .sort({ createdAt: -1 })
    .lean<DiscussionDoc[]>();
  return { lead, discussions };
}
