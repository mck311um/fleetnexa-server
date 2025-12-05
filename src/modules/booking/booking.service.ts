import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RentalStatus, Tenant, User } from '../../generated/prisma/client.js';
import { BookingRepository } from './booking.repository.js';
import { NotFoundError } from 'rxjs';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingRepo: BookingRepository,
  ) {}

  async getTenantBookings(tenant: Tenant) {
    try {
      return await this.bookingRepo.getBookings(tenant.id);
    } catch (error) {
      this.logger.error(error, 'Failed to get bookings', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to get bookings');
    }
  }

  async getBookingById(bookingId: string, tenant: Tenant) {
    try {
      const booking = await this.bookingRepo.getBookingById(
        bookingId,
        tenant.id,
      );
      if (!booking) {
        throw new Error('Booking not found');
      }
      return booking;
    } catch (error) {
      this.logger.error(error, 'Failed to get booking by ID', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingId,
      });
      throw new Error('Failed to get booking by ID');
    }
  }

  async getStorefrontUserBookings(id: string) {
    try {
      const user = await this.prisma.storefrontUser.findUnique({
        where: { id },
      });

      if (!user) {
        this.logger.warn(`Storefront user with ID ${id} not found`);
        throw new NotFoundException('Storefront user not found');
      }

      const customers = await this.prisma.customer.findMany({
        where: {
          storefrontId: user.id,
          isDeleted: false,
          drivers: {
            some: {
              rental: {
                is: {
                  agent: 'STOREFRONT',
                },
              },
            },
          },
        },
        select: {
          drivers: {
            select: {
              rental: {
                select: {
                  id: true,
                  rentalNumber: true,
                  bookingCode: true,
                  startDate: true,
                  endDate: true,
                  status: true,
                  vehicle: {
                    select: {
                      year: true,
                      brand: true,
                      model: true,
                      tenant: {
                        select: {
                          tenantName: true,
                          address: {
                            select: {
                              street: true,
                              village: true,
                              state: true,
                              country: true,
                            },
                          },
                          currency: true,
                          currencyRates: {
                            include: {
                              currency: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  values: {
                    select: {
                      netTotal: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const bookingData = customers.map((customer) => {
        return customer.drivers.map((driver) => {
          const rental = driver.rental;
          return {
            startDate: rental.startDate,
            endDate: rental.endDate,
            status: rental.status,
            netTotal: rental.values?.netTotal,
            id: rental.id,
            rentalNumber: rental.rentalNumber,
            bookingCode: rental.bookingCode,
            vehicle: {
              year: rental.vehicle.year,
              brand: rental.vehicle.brand.brand,
              model: rental.vehicle.model.model,
            },
            tenant: rental.vehicle.tenant
              ? {
                  tenantName: rental.vehicle.tenant.tenantName,
                  street: rental.vehicle.tenant.address?.street,
                  village: rental.vehicle.tenant.address?.village?.village,
                  state: rental.vehicle.tenant.address?.state?.state,
                  country: rental.vehicle.tenant.address?.country?.country,
                  address: rental.vehicle.tenant.address,
                  currency: rental.vehicle.tenant.currency,
                  currencyRates: rental.vehicle.tenant.currencyRates,
                }
              : null,
          };
        });
      });

      return bookingData.flat();
    } catch (error) {
      this.logger.error(error, 'Failed to get storefront user bookings', {
        userId: id,
      });
      throw new Error('Failed to get storefront user bookings');
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: RentalStatus,
    tenant: Tenant,
    user: User,
  ) {
    try {
      const booking = await this.prisma.rental.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      await this.prisma.rental.update({
        where: { id: bookingId },
        data: {
          status,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });

      return;
    } catch (error) {
      this.logger.error(error, 'Failed to update booking status', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        bookingId,
        status,
      });
      throw new Error('Failed to update booking status');
    }
  }
}
