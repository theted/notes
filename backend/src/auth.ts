import type { Request, Response, NextFunction } from 'express';

const PASSWORD = process.env.PASSWORD || 'changeme';

export const requirePassword = (req: Request, res: Response, next: NextFunction) => {
  const header = req.header('x-password') ?? '';
  if (header !== PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
};
