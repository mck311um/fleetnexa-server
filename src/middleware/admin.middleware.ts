import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';

interface AdminUserPayload {
  id: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUserPayload;
    }
  }
}

export const admin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res
      .status(401)
      .json({ message: 'No admin token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      adminUser: AdminUserPayload;
    };
    req.adminUser = decoded.adminUser;
    next();
  } catch (error) {
    logger.e(error, 'Token verification failed');
    res.status(401).json({ message: 'Token is not valid' });
  }
};
