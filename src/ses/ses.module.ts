import { Module } from '@nestjs/common';
import { SesService } from './ses.service';
import { AwsModule } from '../common/aws/aws.module';

@Module({
  imports: [AwsModule],
  providers: [SesService],
  exports: [SesService],
})
export class SesModule {}
