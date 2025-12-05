import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { StorefrontAuthDto } from './storefront-auth.dto.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { EmailLoginDto } from '../dto/email-login.dto.js';

@Injectable()
export class StorefrontAuthService {
  private readonly logger = new Logger(StorefrontAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async loginUser(data: EmailLoginDto) {
    try {
      const user = await this.prisma.storefrontUser.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        this.logger.warn('Invalid email or password', { email: data.email });
        throw new NotFoundException('Invalid email or password');
      }

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        this.logger.warn('Invalid email or password', { email: data.email });
        throw new UnauthorizedException('Invalid email or password');
      }

      const userData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        driverLicenseNumber: user.driverLicenseNumber,
        licenseExpiry: user.licenseExpiry,
        licenseIssued: user.licenseIssued,
        dateOfBirth: user.dateOfBirth,
      };

      const payload = {
        storefrontUser: { id: user.id },
      };
      const token = this.jwt.sign(payload, {
        expiresIn: data.rememberMe ? '30d' : '7d',
      });

      return { user: userData, token };
    } catch (error) {
      this.logger.error('Error logging in user', { error });
      throw error;
    }
  }

  async createUser(data: StorefrontAuthDto) {
    try {
      const existingUser = await this.prisma.storefrontUser.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        this.logger.warn('User with email already exists', {
          email: data.email,
        });
        throw new ConflictException(
          'An account with these credentials already exists.',
        );
      }

      const existingLicense = await this.prisma.storefrontUser.findFirst({
        where: { driverLicenseNumber: data.licenseNumber },
      });

      if (existingLicense) {
        this.logger.warn('User with driver license number already exists', {
          driverLicenseNumber: data.licenseNumber,
        });

        if (existingUser) {
          this.logger.warn('User with email already exists', {
            email: data.email,
          });
          throw new ConflictException(
            'An account with this email already exists.',
          );
        }

        const existingLicense = await this.prisma.storefrontUser.findFirst({
          where: { driverLicenseNumber: data.licenseNumber },
        });

        if (existingLicense) {
          this.logger.warn('User with driver license number already exists', {
            driverLicenseNumber: data.licenseNumber,
          });
          throw new ConflictException(
            'A user with this driver license number already exists.',
          );
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const user = await this.prisma.storefrontUser.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          gender: data.gender || 'male',
          phone: data.phone || '',
          password: hashedPassword,
          driverLicenseNumber: data.licenseNumber,
          licenseExpiry: new Date(data.licenseExpiry),
          licenseIssued: new Date(data.licenseIssued),
          license: data.license,
          dateOfBirth: new Date(data.dateOfBirth),
          street: data.street || '',
          countryId: data.countryId || null,
          stateId: data.stateId || null,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          email: true,
          profilePicture: true,
          driverLicenseNumber: true,
          licenseExpiry: true,
          licenseIssued: true,
          license: true,
          country: true,
          countryId: true,
          street: true,
          village: true,
          villageId: true,
          state: true,
          stateId: true,
          phone: true,
        },
      });

      const userData = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        initials: `${user.firstName[0]}${user.lastName[0]}`,
        fullName: `${user.firstName} ${user.lastName}`,
        createdAt: user.createdAt,
        email: user.email,
        profilePicture: user.profilePicture || null,
        driverLicenseNumber: user.driverLicenseNumber,
        licenseExpiry: user.licenseExpiry,
        licenseIssued: user.licenseIssued,
        license: user.license,
        country: user.country?.country,
        countryId: user.countryId,
        street: user.street,
        village: user.village?.village,
        villageId: user.villageId,
        state: user.state?.state,
        stateId: user.stateId,
        phone: user.phone,
      };

      const payload = {
        storefrontUser: { id: user.id },
      };
      const token = this.jwt.sign(payload, {
        expiresIn: '7d',
      });

      return { user: userData, token };
    } catch (error) {
      this.logger.error('Error creating user', { error });
      throw error;
    }
  }
}
