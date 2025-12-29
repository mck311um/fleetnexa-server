import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TenantRepository } from "../../modules/tenant/tenant.repository.js";
import { TenantUserRepository } from "../../modules/user/tenant-user/tenant-user.repository.js";
import {
	AuthenticatedRequest,
	UserPayload,
} from "../../types/authenticated-request.js";

@Injectable()
export class AuthGuard implements CanActivate {
	private readonly logger = new Logger(AuthGuard.name);

	constructor(
		private readonly jwtService: JwtService,
		private readonly tenantRepo: TenantRepository,
		private readonly userRepo: TenantUserRepository,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

		const token = req.headers["x-auth-token"] as string;
		if (!token) {
			this.logger.warn("No auth token provided");
			throw new UnauthorizedException("No auth token, authorization denied");
		}

		try {
			const secret = process.env.JWT_SECRET;

			if (!secret) {
				this.logger.error("JWT secret is not defined in environment variables");
				throw new UnauthorizedException("Token is not valid");
			}

			const decoded = this.jwtService.verify(token, { secret }) as {
				user: UserPayload;
			};
			req.user = decoded.user;

			const tenant = await this.tenantRepo.getTenantById(req.user.tenantId);
			if (!tenant) {
				throw new NotFoundException("Tenant not found");
			}

			const user = await this.userRepo.getUserById(req.user.id);
			if (!user) {
				throw new NotFoundException("User not found");
			}

			req.context = {
				tenant,
				user,
			};

			return true;
		} catch (error) {
			this.logger.error("AuthGuard error:", error);
			throw new UnauthorizedException("Token is not valid");
		}
	}
}
