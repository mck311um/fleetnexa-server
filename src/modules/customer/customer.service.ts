import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPrimaryDriver(bookingId: string) {
    try {
      const driver = await this.prisma.rentalDriver.findFirst({
        where: {
          rentalId: bookingId,
          isPrimary: true,
        },
        include: {
          customer: {
            include: {
              license: true,
              address: {
                include: {
                  country: true,
                  state: true,
                  village: true,
                },
              },
            },
          },
        },
      });

      if (!driver) {
        throw new Error('Primary driver not found');
      }

      return driver;
    } catch (error) {
      this.logger.error(error, 'Error fetching primary driver', { bookingId });
      throw error;
    }
  }
}
