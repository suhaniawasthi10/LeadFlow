import { Request, Response, NextFunction } from 'express';
import { createDiscussionSchema } from '../validators/discussionValidators';
import * as discussionsService from '../services/discussionsService';

type IdParams = { id: string };

export async function createDiscussion(
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id: leadId } = req.params;
    const input = createDiscussionSchema.parse(req.body);
    const result = await discussionsService.createDiscussion(leadId, input);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
