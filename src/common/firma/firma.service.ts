import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class FirmaService {
  private readonly logger = new Logger(FirmaService.name);
  private readonly api: AxiosInstance;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.api = axios.create({
      baseURL: this.config.get<string>('FIRMA_API_URL'),
      headers: {
        Authorization: this.config.get<string>('FIRMA_API_KEY'),
        'Content-Type': 'application/json',
      },
    });
  }

  async createTemplate(bookingId: string) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: bookingId },
        include: {
          vehicle: true,
          tenant: true,
          agreement: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      const document = await this.convertToBase64(
        booking?.agreement?.agreementUrl || '',
      );

      const body = {
        name: `Booking Agreement - ${booking?.bookingCode}`,
        description: `Booking agreement for ${booking?.tenant.tenantName}`,
        file: document,
      };

      return await this.api.post('/templates', body);
    } catch (error) {
      this.logger.error('Error creating firma template', error);
      throw error;
    }
  }

  async convertToBase64(url: string): Promise<string> {
    const response = await axios.get(url, {
      responseType: 'arraybuffer', // IMPORTANT
    });

    const buffer = Buffer.from(response.data, 'binary');
    return buffer.toString('base64');
  }
}
