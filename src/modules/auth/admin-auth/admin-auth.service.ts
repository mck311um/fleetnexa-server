import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { AdminAuthDto } from './admin-auth.dto.js';
import bcrypt from 'bcrypt';
import { EmailLoginDto, UsernameLoginDto } from '../dto/email-login.dto.js';
import { AdminUser } from '../../../generated/prisma/client.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(data: EmailLoginDto | UsernameLoginDto) {
    try {
      let user: AdminUser | null = null;

      this.logger.log('Attempting admin user login', data);

      if ('email' in data) {
        user = await this.prisma.adminUser.findUnique({
          where: { email: data.email },
        });
      } else if ('username' in data) {
        user = await this.prisma.adminUser.findUnique({
          where: { username: data.username },
        });
      }

      if (!user) {
        this.logger.warn('Invalid login credentials', { data });
        throw new NotFoundException('Invalid login credentials');
      }

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        this.logger.warn('Invalid login credentials', { data });
        throw new UnauthorizedException('Invalid login credentials');
      }

      const userData = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
      };
      const payload = { adminUser: { id: user.id, username: user.username } };
      const token = this.jwt.sign(payload, {
        expiresIn: data.rememberMe ? '30d' : '7d',
      });

      return {
        message: 'Login successful',
        user: userData,
        token,
      };
    } catch (error) {
      this.logger.error('Error logging in admin user', error);
      throw error;
    }
  }

  async createUser(data: AdminAuthDto) {
    try {
      const existingUser = await this.prisma.adminUser.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        this.logger.warn('Admin user already exists', { email: data.email });
        throw new ConflictException(
          'User with these credentials already exists',
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const user = await this.prisma.adminUser.create({
        data: {
          username: data.username,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        },
      });

      const userData = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
        fullName: `${user.firstName} ${user.lastName}`,
      };

      return {
        message: 'Admin user created successfully',
        user: userData,
      };
    } catch (error) {
      this.logger.error('Error creating admin user', error);
      throw error;
    }
  }
}
