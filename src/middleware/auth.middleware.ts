import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';

interface UserPayload {
  id: string;
  tenantId: string;
  tenantCode: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      user: UserPayload;
    };
    req.user = decoded.user;
    next();
  } catch (error) {
    logger.e(error, 'Token verification failed');
    res.status(401).json({ message: 'Token is not valid' });
  }
};
