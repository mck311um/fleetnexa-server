import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantRepository } from 'src/modules/tenant/tenant.repository';
import { TenantUserRepository } from 'src/modules/user/tenant/tenant-user.repository';

interface UserPayload {
  id: string;
  tenantId: string;
  tenantCode: string;
}

interface AuthenticatedRequest extends Request {
  user: UserPayload;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tenantRepo: TenantRepository,
    private readonly userRepo: TenantUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = req.headers['x-auth-token'] as string;
    if (!token) {
      throw new UnauthorizedException('No auth token, authorization denied');
    }

    try {
      const decoded = this.jwtService.verify(token) as {
        user: UserPayload;
      };
      req.user = decoded.user;

      const tenant = await this.tenantRepo.getTenantById(req.user.tenantId);
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const user = await this.userRepo.getUserById(req.user.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token is not valid');
    }
  }
}
