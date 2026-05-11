import { Request, Response, NextFunction } from 'express';
import { signupSchema, loginSchema } from '../validators/authValidators';
import * as authService from '../services/authService';
import { AppError } from '../middleware/errorHandler';

export async function signup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = signupSchema.parse(req.body);
    const result = await authService.signup(input);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) throw new AppError(401, 'Authentication required');
    const user = await authService.getCurrentUser(req.userId);
    if (!user) throw new AppError(401, 'User no longer exists');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
