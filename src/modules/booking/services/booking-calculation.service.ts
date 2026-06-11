import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class BookingCalculationService {
  private readonly logger = new Logger(BookingCalculationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recalculateAmountDue(valuesId: string) {
    try {
      const values = await this.prisma.values.findUnique({
        where: { id: valuesId },
      });

      if (!values) {
        this.logger.error(`Values record not found for id: ${valuesId}`);
        throw new NotFoundException('Values record not found for the given id');
      }

      const charges = await this.prisma.rentalCharge.aggregate({
        where: { valueId: valuesId },
        _sum: {
          amount: true,
        },
      });

      const extras = await this.prisma.rentalExtra.aggregate({
        where: { valuesId: valuesId },
        _sum: {
          amount: true,
        },
      });

      const totalCharges = charges._sum.amount || 0;
      const totalExtras = extras._sum.amount || 0;
      const totalCost = values?.basePrice * values?.numberOfDays;
      const subTotal =
        totalCost +
        values.deliveryFee +
        values.collectionFee +
        totalCharges +
        totalExtras +
        values.additionalDriverFees +
        values.cancellationFee +
        values.lateFee;
      const netTotal = subTotal - values.discount;
      const amountDue = netTotal + values.deposit;

      await this.prisma.values.update({
        where: { id: valuesId },
        data: {
          totalCharges,
          totalExtras,
          totalCost,
          subTotal,
          netTotal,
          amountDue,
        },
      });
    } catch (error: any) {
      this.logger.error(
        `Error recalculating amount due for valuesId: ${valuesId}`,
        error,
      );
      throw error;
    }
  }
}
