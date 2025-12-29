import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module.js';
import { StateModule } from './state/state.module.js';

@Module({
  imports: [CountryModule, StateModule],
  exports: [CountryModule, StateModule],
})
export class DashboardModule {}
