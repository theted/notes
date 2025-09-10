import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { User } from './orm';

// Middleware: derive or create user from password hash and attach userId to req
export const requirePassword = (req: Request, res: Response, next: NextFunction) => {
  const pwd = req.header('x-password') ?? '';
  if (!pwd) return res.status(401).json({ error: 'Unauthorized' });

  const hash = crypto.createHash('sha256').update(pwd).digest('hex');
  (async () => {
    const [user] = await User.findOrCreate({ where: { password_hash: hash }, defaults: {} });
    (req as any).userId = user.id;
    return next();
  })().catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Auth error:', e);
    return res.status(500).json({ error: 'Auth failed' });
  });
};
