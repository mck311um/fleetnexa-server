import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module.js';

@Module({
  imports: [CountryModule],
  exports: [CountryModule],
})
export class DashboardModule {}
