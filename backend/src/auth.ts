import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { db } from './db';

// Middleware: derive or create user from password hash and attach userId to req
export const requirePassword = (req: Request, res: Response, next: NextFunction) => {
  const pwd = req.header('x-password') ?? '';
  if (!pwd) return res.status(401).json({ error: 'Unauthorized' });

  const hash = crypto.createHash('sha256').update(pwd).digest('hex');
  let user = db.prepare('SELECT id FROM users WHERE password_hash = ?').get(hash) as
    | { id: number }
    | undefined;
  if (!user) {
    const info = db.prepare('INSERT INTO users (password_hash) VALUES (?)').run(hash);
    user = { id: Number(info.lastInsertRowid) };
  }
  (req as any).userId = user.id;
  return next();
};
