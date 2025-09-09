import { User, Tenant } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: User & {
    tenant: Tenant;
  };
  tenant?: Tenant;
  rawBody?: Buffer;
}
