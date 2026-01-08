/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import type { Request } from 'express';
import type { Tenant, User } from '../generated/prisma/client.js';

export interface UserPayload {
  id: string;
  tenantId: string;
  tenantCode: string;
}

export interface StorefrontUserPayload {
  id: string;
}

export interface AdminUserPayload {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  [x: string]: any;
  user: UserPayload;
  storefrontUser?: StorefrontUserPayload;
  adminUser?: AdminUserPayload;
  context: {
    tenant: Tenant;
    user: User;
  };
}
