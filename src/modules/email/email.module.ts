import { Module } from '@nestjs/common';
import { SesModule } from '../../ses/ses.module.js';
import { EmailService } from './email.service.js';

@Module({
  imports: [SesModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
