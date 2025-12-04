import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTenantById(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: this.getTenantIncludeOptions(),
    });
  }

  private getTenantIncludeOptions(): Prisma.TenantInclude {
    return {
      address: { include: { village: true, state: true, country: true } },
      currency: true,
      invoiceSequence: true,
      paymentMethods: true,
      customers: true,
      subscription: true,
      services: { where: { isDeleted: false }, include: { service: true } },
      insurance: { where: { isDeleted: false } },
      equipment: { where: { isDeleted: false }, include: { equipment: true } },
      tenantLocations: {
        where: { isDeleted: false },
        include: { vehicles: true, _count: { select: { vehicles: true } } },
      },
      monthlyStats: true,
      monthlyRentalStats: true,
      yearlyStats: true,
      cancellationPolicy: true,
      latePolicy: true,
      transactions: {
        where: { isDeleted: false },
        include: {
          payment: {
            include: { customer: true, paymentMethod: true, paymentType: true },
          },
        },
      },
      rentalActivity: {
        include: {
          vehicle: { select: { brand: true, model: true } },
          customer: true,
        },
      },
      currencyRates: { include: { currency: true } },
    };
  }
}
