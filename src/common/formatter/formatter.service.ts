import { Injectable } from '@nestjs/common';

@Injectable()
export class FormatterService {
  async formatDateToFriendlyDateShort(date: Date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
