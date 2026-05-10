import { startOfDay, endOfDay, addDays } from 'date-fns';
import { SortOrder } from 'mongoose';
import { Lead, LeadDoc } from '../models/Lead';
import { Discussion, DiscussionDoc } from '../models/Discussion';
import {
  CreateLeadInput,
  UpdateLeadInput,
  ListLeadsQuery,
} from '../validators/leadValidators';

export async function createLead(input: CreateLeadInput): Promise<LeadDoc> {
  const lead = await Lead.create(input);
  return lead.toObject();
}

export async function updateLead(
  id: string,
  input: UpdateLeadInput,
): Promise<LeadDoc | null> {
  return Lead.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  }).lean<LeadDoc>();
}

export async function listLeads(query: ListLeadsQuery): Promise<LeadDoc[]> {
  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;
  if (query.search) filter.name = { $regex: query.search, $options: 'i' };

  const now = new Date();
  switch (query.filter) {
    case 'today':
      filter.followUpAt = { $gte: startOfDay(now), $lte: endOfDay(now) };
      break;
    case 'overdue':
      filter.followUpAt = { $lt: startOfDay(now) };
      // Don't override an explicit status filter; otherwise exclude closed leads.
      if (!query.status) filter.status = { $nin: ['Won', 'Lost'] };
      break;
    case 'thisWeek':
      filter.followUpAt = { $gte: startOfDay(now), $lte: endOfDay(addDays(now, 7)) };
      break;
    case 'noFollowUp':
      // null in mongo also matches missing fields.
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
): Promise<{ lead: LeadDoc; discussions: DiscussionDoc[] } | null> {
  const lead = await Lead.findById(id).lean<LeadDoc>();
  if (!lead) return null;
  const discussions = await Discussion.find({ leadId: id })
    .sort({ createdAt: -1 })
    .lean<DiscussionDoc[]>();
  return { lead, discussions };
}
