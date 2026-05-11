import { startOfDay, endOfDay, addDays } from 'date-fns';
import mongoose, { SortOrder } from 'mongoose';
import { Lead, LeadDoc } from '../models/Lead';
import { Discussion, DiscussionDoc } from '../models/Discussion';
import {
  CreateLeadInput,
  UpdateLeadInput,
  ListLeadsQuery,
} from '../validators/leadValidators';

export async function createLead(
  input: CreateLeadInput,
  userId: string,
): Promise<LeadDoc> {
  const lead = await Lead.create({ ...input, userId });
  return lead.toObject();
}

export async function updateLead(
  id: string,
  input: UpdateLeadInput,
  userId: string,
): Promise<LeadDoc | null> {
  // Scoped update — returns null if id doesn't exist OR isn't owned by this user.
  return Lead.findOneAndUpdate({ _id: id, userId }, input, {
    new: true,
    runValidators: true,
  }).lean<LeadDoc>();
}

export async function listLeads(
  query: ListLeadsQuery,
  userId: string,
): Promise<LeadDoc[]> {
  // userId leads the filter so the compound index { userId, status/followUpAt }
  // can serve every shape of query without a separate tenant-check step.
  const filter: Record<string, unknown> = { userId };

  if (query.status) filter.status = query.status;
  if (query.search) filter.name = { $regex: query.search, $options: 'i' };

  const now = new Date();
  switch (query.filter) {
    case 'today':
      filter.followUpAt = { $gte: startOfDay(now), $lte: endOfDay(now) };
      break;
    case 'overdue':
      filter.followUpAt = { $lt: startOfDay(now) };
      if (!query.status) filter.status = { $nin: ['Won', 'Lost'] };
      break;
    case 'thisWeek':
      filter.followUpAt = { $gte: startOfDay(now), $lte: endOfDay(addDays(now, 7)) };
      break;
    case 'noFollowUp':
      filter.followUpAt = null;
      break;
  }

  let sort: Record<string, SortOrder> = { updatedAt: -1 };
  if (query.sort === 'name') sort = { name: 1 };
  if (query.sort === 'followUp') sort = { followUpAt: 1 };

  return Lead.find(filter).sort(sort).lean<LeadDoc[]>();
}

export async function getLeadWithDiscussions(
  id: string,
  userId: string,
): Promise<{ lead: LeadDoc; discussions: DiscussionDoc[] } | null> {
  const lead = await Lead.findOne({ _id: id, userId }).lean<LeadDoc>();
  if (!lead) return null;
  const discussions = await Discussion.find({ leadId: id })
    .sort({ createdAt: -1 })
    .lean<DiscussionDoc[]>();
  return { lead, discussions };
}

// Children first, then parent. Same single-node-mongo no-transaction trade-off
// as the discussion-create cascade.
export async function deleteLead(id: string, userId: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const exists = await Lead.exists({ _id: id, userId });
  if (!exists) return false;
  await Discussion.deleteMany({ leadId: id });
  await Lead.findByIdAndDelete(id);
  return true;
}
