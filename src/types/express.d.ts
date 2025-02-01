import { User, Tenant } from "@prisma/client";
import { Request } from "express";

export interface AuthRequest extends Request {
  user?: User;
  tenant?: Tenant;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
      tenant?: Tenant;
    }
  }
}
