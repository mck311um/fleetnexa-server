import { Module } from '@nestjs/common';
import { SentDmService } from './sentdm.service.js';

@Module({
  providers: [SentDmService],
  exports: [SentDmService],
})
export class SentDmModule {}
