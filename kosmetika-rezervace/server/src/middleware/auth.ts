import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  role?: string;
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
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn(
        'JWT_SECRET není nastaven! Nastavte proměnnou prostředí JWT_SECRET pro produkci.',
      );
      return res.status(500).json({ message: 'Chybí JWT_SECRET na serveru.' });
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
