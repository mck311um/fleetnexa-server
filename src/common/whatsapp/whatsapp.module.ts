import { Global, Module } from '@nestjs/common';
import { NotifyModule } from '../notify/notify.module.js';
import { CustomerModule } from '../../modules/customer/customer.module.js';
import { WhatsappService } from './whatsapp.service.js';
import { SentDmModule } from '../sentdm/sentdm.module.js';

@Global()
@Module({
  imports: [NotifyModule, CustomerModule, SentDmModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
