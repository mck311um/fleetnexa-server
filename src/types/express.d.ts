import { Request } from "express";

interface UserPayload {
	id: string;
	tenantId: string;
	tenantCode: string;
}

declare module "express-serve-static-core" {
	interface Request {
		user?: UserPayload;
		context?: {
			tenant?: any;
			user?: any;
			tenantCode?: string;
			storefrontUser?: any;
		};
	}
}
