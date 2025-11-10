import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';
import { tenantRepo } from '../repository/tenant.repository';
import { userRepo } from '../modules/user/user.repository';
import prisma from '../config/prisma.config';

interface UserPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      storefrontUser?: UserPayload;
      context?: {
        tenant: any;
        user: any;
        tenantCode: string;
        storefrontUser?: any;
      };
    }
  }
}

export const storefrontAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return res
      .status(401)
      .json({ message: 'No auth token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      storefrontUser: UserPayload;
    };
    req.storefrontUser = decoded.storefrontUser;

    const storefrontUser = await prisma.storefrontUser.findUnique({
      where: { id: req.storefrontUser.id },
    });
    if (!storefrontUser) {
      return res.status(404).json({ message: 'Storefront user not found' });
    }

    req.context = {
      tenant: null,
      user: null,
      tenantCode: '',
      storefrontUser,
    };

    next();
  } catch (error) {
    logger.e(error, 'Token verification failed');
    res.status(401).json({ message: 'Token is not valid' });
  }
};
