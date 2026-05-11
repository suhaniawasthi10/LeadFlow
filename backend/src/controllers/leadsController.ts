import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  createLeadSchema,
  updateLeadSchema,
  listLeadsQuerySchema,
} from '../validators/leadValidators';
import * as leadsService from '../services/leadsService';
import { AppError } from '../middleware/errorHandler';

type IdParams = { id: string };

function getUserId(req: Request): string {
  if (!req.userId) throw new AppError(401, 'Authentication required');
  return req.userId;
}

export async function createLead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getUserId(req);
    const input = createLeadSchema.parse(req.body);
    const lead = await leadsService.createLead(input, userId);
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
}

export async function listLeads(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getUserId(req);
    const query = listLeadsQuerySchema.parse(req.query);
    const leads = await leadsService.listLeads(query, userId);
    res.json(leads);
  } catch (err) {
    next(err);
  }
}

export async function getLead(
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(404, 'Lead not found');
    }
    const result = await leadsService.getLeadWithDiscussions(id, userId);
    if (!result) throw new AppError(404, 'Lead not found');
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateLead(
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(404, 'Lead not found');
    }
    const input = updateLeadSchema.parse(req.body);
    const lead = await leadsService.updateLead(id, input, userId);
    if (!lead) throw new AppError(404, 'Lead not found');
    res.json(lead);
  } catch (err) {
    next(err);
  }
}

export async function deleteLead(
  req: Request<IdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const deleted = await leadsService.deleteLead(id, userId);
    if (!deleted) throw new AppError(404, 'Lead not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
