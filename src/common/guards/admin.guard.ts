import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminUserPayload } from 'src/types/authenticated-request.js';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const adminToken = req.headers['x-admin-token'];

    if (!adminToken) {
      throw new UnauthorizedException('Missing admin token');
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      this.logger.error('JWT secret is not defined in environment variables');
      throw new UnauthorizedException('Token is not valid');
    }

    try {
      const decoded = this.jwtService.verify(adminToken, { secret }) as {
        adminUser: AdminUserPayload;
      };
      req.adminUser = decoded.adminUser;

      return true;
    } catch (error) {
      this.logger.error('Error in AdminGuard', error);
      throw error;
    }
  }
}
