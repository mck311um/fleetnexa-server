import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SentDm from '@sentdm/sentdm';
import { SentDmDto } from './sentdm.dto.js';
import { BookingRequestTemplate } from './sent-dm-templates.js';

@Injectable()
export class SentDmService {
  private readonly client: SentDm;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENTDM_API_KEY');

    this.client = new SentDm({
      apiKey: apiKey,
      defaultHeaders: {},
    });
  }

  async sendBookingRequest(data: BookingRequestTemplate, dm: SentDmDto) {
    try {
      await this.client.messages.send({
        to: [dm.to],
        channel: ['whatsapp'],
        'x-profile-id': dm.profileId,
        template: {
          id: dm.templateId,
          parameters: {
            ...data,
          },
        },
      });
    } catch (error) {
      console.error('Error sending booking request to SentDM:', error);
      throw error;
    }
  }
}
