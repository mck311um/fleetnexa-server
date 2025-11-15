import { Request } from 'express';
import { Tenant, User } from 'prisma/generated/prisma/client';

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
