import { Global, Module } from '@nestjs/common';
import { FormatterService } from './formatter.service.js';

@Global()
@Module({
  imports: [],
  providers: [FormatterService],
  exports: [FormatterService],
})
export class FormatterModule {}
