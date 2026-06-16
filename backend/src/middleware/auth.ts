import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../auth';

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing token' });
  }
  try {
    const payload = verifyToken(header.slice(7));
    req.userId = payload.uid;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}
