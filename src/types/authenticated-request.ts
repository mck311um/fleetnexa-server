import { Request } from 'express';
import { Tenant, User } from '../generated/prisma/client.js';

export interface UserPayload {
  id: string;
  tenantId: string;
  tenantCode: string;
}

export interface AuthenticatedRequest extends Request {
  [x: string]: any;
  user: UserPayload;
  context: {
    tenant: Tenant;
    user: User;
  };
}
