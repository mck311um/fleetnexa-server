import {
  SendTemplatedEmailCommand,
  TestRenderTemplateCommand,
} from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';
import { AwsService } from 'src/common/aws/aws.service';

@Injectable()
export class SesService {
  private readonly logger = new Logger(SesService.name);

  constructor(private readonly aws: AwsService) {}

  async sendTemplatedEmail(
    to: string[],
    template: string,
    templateData: any,
    from?: string,
  ) {
    try {
      await this.aws.sesClient.send(
        new TestRenderTemplateCommand({
          TemplateName: template,
          TemplateData: JSON.stringify(templateData),
        }),
      );

      const command = new SendTemplatedEmailCommand({
        Destination: {
          ToAddresses: to,
        },
        Source: from || process.env.SES_DEFAULT_FROM_EMAIL || '',
        Template: template,
        TemplateData: JSON.stringify(templateData),
      });
      await this.aws.sesClient.send(command);
    } catch (error) {
      this.logger.error(`Failed to send SES email: ${template}`, error, { to });
      throw error;
    }
  }
}
