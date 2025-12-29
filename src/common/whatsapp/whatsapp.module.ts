import { Global, Module } from '@nestjs/common';
import { NotifyModule } from '../notify/notify.module.js';
import { CustomerModule } from '../../modules/customer/customer.module.js';
import { WhatsappService } from './whatsapp.service.js';

@Global()
@Module({
  imports: [NotifyModule, CustomerModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
