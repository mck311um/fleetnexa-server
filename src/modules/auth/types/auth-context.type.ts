import { Tenant, User } from '../../../generated/prisma/client.js';

export interface AuthContext {
  tenant: Tenant;
  user: User;
}
