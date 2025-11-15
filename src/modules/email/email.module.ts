import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailService } from './email.service';
import { AwsModule } from 'src/common/aws/aws.module';
import { SesModule } from 'src/ses/ses.module';

@Module({
  imports: [SesModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
