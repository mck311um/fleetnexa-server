import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/binary';

@Injectable()
export class FormatterService {
  async formatDateToFriendlyDateShort(date: Date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  async formatDate(date: Date): Promise<string> {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  async formatCurrencyWithCode(
    code: string,
    amount: number | Decimal,
  ): Promise<string> {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount instanceof Decimal ? amount.toNumber() : amount);

    return `${code} ${formattedAmount}`;
  }

  formatDateToFriendly(date: Date | string | null | undefined): string {
    if (!date) return '';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return new Date(date).toLocaleString('en-US', options);
  }

  async formatMilage(mileage: number): Promise<string> {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(mileage);

    return `${formatted} km`;
  }
}
