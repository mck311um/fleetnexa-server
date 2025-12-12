import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { NotifyModule } from '../notify/notify.module.js';
import { CustomerModule } from '../../modules/customer/customer.module.js';
import { WhatsappService } from './whatsapp.service.js';

@Module({
  imports: [PrismaModule, NotifyModule, CustomerModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
