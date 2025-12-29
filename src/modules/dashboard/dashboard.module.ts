import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module.js';
import { StateModule } from './state/state.module.js';
import { VillageModule } from './village/village.module.js';
import { TenantModule } from './tenant/tenant.module.js';

@Module({
  imports: [CountryModule, StateModule, VillageModule, TenantModule],
  exports: [CountryModule, StateModule, VillageModule, TenantModule],
})
export class DashboardModule {}
