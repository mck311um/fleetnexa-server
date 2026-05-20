import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SentDm from '@sentdm/sentdm';

@Injectable()
export class SentdmService {
  private readonly client: SentDm;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENTDM_API_KEY');

    this.client = new SentDm({
      apiKey: apiKey,
      defaultHeaders: {},
    });
  }

  async sendBookingRequest() {
    try {
      await this.client.messages.send({
        channel: ['whatsapp'],
        template: {
          id: 'cbcd4b5c-2153-4b48-83ed-7f08aafec6d6',
        },
      });
    } catch (error) {
      console.error('Error sending booking request to SentDM:', error);
      throw error;
    }
  }
}
