import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import { AppError } from './errorHandler';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.header('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const userId = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
}
