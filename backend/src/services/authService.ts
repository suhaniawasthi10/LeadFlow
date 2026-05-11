import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserDoc } from '../models/User';
import type { SignupInput, LoginInput } from '../validators/authValidators';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRY = '7d';
const BCRYPT_COST = 10;

export interface AuthResult {
  user: { _id: string; email: string };
  token: string;
}

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

function toPublicUser(doc: UserDoc): { _id: string; email: string } {
  return { _id: doc._id.toString(), email: doc.email };
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const existing = await User.exists({ email: input.email });
  if (existing) throw new AppError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const user = await User.create({ email: input.email, passwordHash });
  return { user: toPublicUser(user), token: signToken(user._id.toString()) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email });
  if (!user) throw new AppError(401, 'Invalid email or password');

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new AppError(401, 'Invalid email or password');

  return { user: toPublicUser(user), token: signToken(user._id.toString()) };
}

export async function getCurrentUser(
  userId: string,
): Promise<{ _id: string; email: string } | null> {
  const user = await User.findById(userId).lean<UserDoc>();
  return user ? { _id: user._id.toString(), email: user.email } : null;
}

export function verifyToken(token: string): string {
  const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
  return payload.sub;
}
