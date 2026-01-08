import { Module } from '@nestjs/common';
import { CountryController } from './country.controller.js';
import { CountryService } from './country.service.js';

@Module({
  imports: [],
  controllers: [CountryController],
  providers: [CountryService],
  exports: [CountryService],
})
export class CountryModule {}
