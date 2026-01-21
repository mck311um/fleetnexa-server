import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module.js';
import { StateModule } from './state/state.module.js';
import { VillageModule } from './village/village.module.js';
import { TenantModule } from './tenant/tenant.module.js';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module.js';

@Module({
  imports: [
    CountryModule,
    StateModule,
    VillageModule,
    TenantModule,
    SubscriptionPlanModule,
  ],
  exports: [
    CountryModule,
    StateModule,
    VillageModule,
    TenantModule,
    SubscriptionPlanModule,
  ],
})
export class DashboardModule {}
