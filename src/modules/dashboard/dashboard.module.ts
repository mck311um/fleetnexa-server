import { Module } from '@nestjs/common';
import { CountryModule } from './country/country.module.js';
import { StateModule } from './state/state.module.js';
import { VillageModule } from './village/village.module.js';
import { TenantModule } from './tenant/tenant.module.js';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module.js';
import { PermissionModule } from './permission/permission.module.js';
import { PermissionCategoryModule } from './permission-category/permission-category.module.js';
import { VehicleModelModule } from './vehicle-model/vehicle-model.module';

@Module({
  imports: [
    CountryModule,
    StateModule,
    VillageModule,
    TenantModule,
    SubscriptionPlanModule,
    PermissionModule,
    PermissionCategoryModule,
    VehicleModelModule,
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
