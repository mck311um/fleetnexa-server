import { Request } from 'express';
import { Tenant, User } from '../generated/prisma/client.js';

export interface UserPayload {
  id: string;
  tenantId: string;
  tenantCode: string;
}

export interface AuthenticatedRequest extends Request {
  user: UserPayload;
  context: {
    tenant: Tenant;
    user: User;
  };
}
