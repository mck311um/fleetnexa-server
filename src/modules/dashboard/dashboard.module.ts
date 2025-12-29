import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module.js';
import { StateModule } from './state/state.module.js';
import { VillageModule } from './village/village.module.js';

@Module({
  imports: [CountryModule, StateModule, VillageModule],
  exports: [CountryModule, StateModule, VillageModule],
})
export class DashboardModule {}
