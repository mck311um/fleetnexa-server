import { Injectable, Logger } from '@nestjs/common';
import { SesService } from '../../ses/ses.service.js';
import { WelcomeEmailDto } from './dto/welcome.dto.js';
import { Tenant } from '../../generated/prisma/client.js';

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
