import { Module } from '@nestjs/common';
import { AwsModule } from '../common/aws/aws.module.js';
import { SesService } from './ses.service.js';

@Module({
  imports: [AwsModule],
  providers: [SesService],
  exports: [SesService],
})
export class SesModule {}
