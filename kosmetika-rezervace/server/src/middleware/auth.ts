import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization;

  if (!auth?.startsWith('Bearer ')) {
    console.warn('Authorization header missing or malformed:', auth);
    return res
      .status(401)
      .json({ message: 'Chybí token v hlavičce Authorization' });
  }

  const token = auth.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'tajnyklic';
    if (!process.env.JWT_SECRET) {
      console.warn(
        'Používá se výchozí JWT_SECRET! Nastavte proměnnou prostředí JWT_SECRET pro produkci.',
      );
    }
    const decoded = jwt.verify(token, secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (err: any) {
    console.error('Chyba při ověřování tokenu:', err.message);
    return res
      .status(403)
      .json({ message: 'Neplatný token', error: err.message });
  }
};
