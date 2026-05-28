import { Global, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GeneratorService } from '../../../common/generator/generator.service.js';
import * as bcrypt from 'bcrypt';
import { OtpType, UserType } from '../../../generated/prisma/enums.js';
import { ResendOTPDto, VerifyOTPDto } from '../dto/otp.dto.js';
import { UserRepository } from '../../../modules/user/user.repository.js';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service.js';

@Global()
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: GeneratorService,
    private readonly userRepo: UserRepository,
  ) {}

  async verifyOTP(data: VerifyOTPDto) {
    try {
      const user = await this.userRepo.getAnyUserByEmail(
        data.email,
        data.userType,
      );

      const expired = await this.isExpired(
        user?.id || '',
        data.type,
        data.userType,
      );

      if (expired) {
        this.logger.warn(
          `OTP verification failed: No valid OTP found for email ${data.email}.`,
        );
        return {
          status: 'OTP_EXPIRED',
          message: 'OTP has expired. Please request a new one.',
        };
      }

      if (!user) {
        this.logger.warn(
          `Email verification failed: User with email ${data.email} not found.`,
        );
        throw new NotFoundException('User not found');
      }

      const validated = await this.verifyToken(
        user.id,
        data.verificationCode,
        data.type,
        data.userType,
      );

      return {
        status: validated ? 'OTP_VERIFIED' : 'OTP_INVALID',
        message: validated
          ? 'OTP verified successfully.'
          : 'Invalid OTP. Please check the code and try again.',
      };
    } catch (error: any) {
      this.logger.error(error, 'Error verifying OTP', {
        email: data.email,
      });
      throw error;
    }
  }

  async createOTP(userId: string, type: OtpType, userType: UserType) {
    try {
      await this.prisma.otp.updateMany({
        where: {
          userId,
          type,
          userType,
          expiresAt: { gt: new Date() },
        },
        data: { expiresAt: new Date() },
      });

      const token = await this.generator.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      const codeHash = await bcrypt.hash(token, 10);

      const created = await this.prisma.otp.create({
        data: { userId, codeHash, expiresAt, type, userType },
      });

      this.logger.debug(
        `Created OTP for user ${userId} with type ${type} and userType ${userType} it expires at ${expiresAt}. OTP ID: ${created.id}`,
      );

      return token;
    } catch (error: any) {
      this.logger.error(`Failed to create OTP for user ${userId}`, error.stack);
      throw error;
    }
  }

  async resendOTP(data: ResendOTPDto) {
    try {
      const user = await this.userRepo.getAnyUserByEmail(
        data.email,
        data.userType,
      );

      if (!user) {
        this.logger.warn(
          `Email verification failed: User with email ${data.email} not found.`,
        );
        throw new NotFoundException('User not found');
      }

      await this.prisma.otp.updateMany({
        where: {
          userId: user?.id || '',
          type: data.type,
          userType: data.userType,
          expiresAt: { gt: new Date() },
        },
        data: { expiresAt: new Date() },
      });

      await this.createOTP(user?.id || '', data.type, data.userType);

      return {
        status: 'OTP_SENT',
        message: 'A new OTP has been sent to your email address.',
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to resend OTP for email ${data.email}`,
        error.stack,
      );
      throw error;
    }
  }

  async isExpired(userId: string, type: OtpType, userType: UserType) {
    try {
      const otpRecord = await this.prisma.otp.findFirst({
        where: {
          userId,
          type,
          userType,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      return !otpRecord;
    } catch (error: any) {
      this.logger.error(
        `Failed to check OTP expiration for user ${userId}`,
        error.stack,
      );
      throw error;
    }
  }

  async verifyToken(
    userId: string,
    token: string,
    type: OtpType,
    userType: UserType,
  ) {
    try {
      const otpRecord = await this.prisma.otp.findFirst({
        where: {
          userId,
          type,
          userType,
          used: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) return false;

      const isValid = await bcrypt.compare(token, otpRecord.codeHash);

      if (!isValid) return false;

      await this.prisma.otp.update({
        where: { id: otpRecord.id },
        data: {
          used: true,
          expiresAt: new Date(),
        },
      });

      return true;
    } catch (error: any) {
      this.logger.error(`Failed to verify OTP for user ${userId}`, error.stack);
      throw error;
    }
  }
}
