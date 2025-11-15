import { Injectable, Logger } from '@nestjs/common';
import { AwsService } from 'src/common/aws/aws.service';
import { GeneratorService } from 'src/common/generator/generator.service';
import { SesService } from 'src/ses/ses.service';
import { WelcomeEmailDto } from './dto/welcome.dto';
import { Tenant } from 'prisma/generated/prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly ses: SesService) {}

  async sendWelcomeEmail(data: WelcomeEmailDto, tenant: Tenant) {
    try {
      const templateData = {
        tenantName: tenant.tenantName,
        username: data.username,
        name: data.name,
      };

      await this.ses.sendTemplatedEmail(
        [data.email],
        'WelcomeTemplate',
        templateData,
        'FleetNexa <no-reply@fleetnexa.com>',
      );
    } catch (error) {
      this.logger.error('Failed to send welcome email', error, {
        tenantId: tenant.id,
        email: data.email,
      });
      throw error;
    }
  }
}
