import mongoose from 'mongoose';
import { Lead, LeadDoc } from '../models/Lead';
import { Discussion, DiscussionDoc } from '../models/Discussion';
import { CreateDiscussionInput } from '../validators/discussionValidators';
import { AppError } from '../middleware/errorHandler';

export async function listDiscussionsForLead(
  leadId: string,
): Promise<DiscussionDoc[]> {
  return Discussion.find({ leadId }).sort({ createdAt: -1 }).lean<DiscussionDoc[]>();
}

// Sequential writes (no transaction): single-node mongo doesn't support
// transactions without a replica set. If the lead update fails after the
// discussion insert, we accept a brief denormalization drift over the
// operational cost of running a replica set for a take-home.
export async function createDiscussion(
  leadId: string,
  input: CreateDiscussionInput,
  userId: string,
): Promise<{ discussion: DiscussionDoc; lead: LeadDoc }> {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new AppError(404, 'Lead not found');
  }
  // Ownership check — 404 (not 403) so we don't leak whether the lead exists for another user.
  const exists = await Lead.exists({ _id: leadId, userId });
  if (!exists) throw new AppError(404, 'Lead not found');

  const discussion = await Discussion.create({ leadId, ...input });

  const update: Partial<LeadDoc> = {
    lastDiscussionNote: input.note,
    lastDiscussionAt: discussion.createdAt,
  };
  if (input.followUpAt) update.followUpAt = input.followUpAt;

  const lead = await Lead.findOneAndUpdate({ _id: leadId, userId }, update, {
    new: true,
  }).lean<LeadDoc>();
  if (!lead) throw new AppError(500, 'Lead disappeared during discussion write');

  return { discussion: discussion.toObject(), lead };
}
