import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';
import { tenantRepo } from '../repository/tenant.repository';
import { userRepo } from '../modules/user/user.repository';

interface UserPayload {
  id: string;
  tenantId: string;
  tenantCode: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      context?: {
        tenant: any;
        user: any;
        tenantCode: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res
      .status(401)
      .json({ message: 'No auth token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      user: UserPayload;
    };
    req.user = decoded.user;

    const tenant = await tenantRepo.getTenantById(req.user.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const user = await userRepo.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.context = {
      tenant,
      user,
      tenantCode: req.user.tenantCode,
    };

    next();
  } catch (error) {
    logger.e(error, 'Token verification failed');
    res.status(401).json({ message: 'Token is not valid' });
  }
};
