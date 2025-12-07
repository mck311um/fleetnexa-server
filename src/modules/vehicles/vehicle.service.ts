import { Injectable, Logger } from '@nestjs/common';
import { VehicleRepository } from './vehicle.repository.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TenantExtraService } from '../tenant/tenant-extra/tenant-extra.service.js';
import { Vehicle } from '../../generated/prisma/client.js';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly prisma: PrismaService,
    private readonly extrasService: TenantExtraService,
  ) {}

  async getStorefrontVehicles() {
    try {
      const vehicles = await this.vehicleRepository.getVehiclesForStorefront();
      return await this.attachExtrasToVehicles(vehicles);
    } catch (error) {
      this.logger.error('Failed to get storefront vehicles', error);
      throw error;
    }
  }

  async getVehicleForStorefrontById(id: string) {
    try {
      const vehicle =
        await this.vehicleRepository.getVehicleForStorefrontById(id);
      return await this.attachTenantExtras(vehicle);
    } catch (error) {
      this.logger.error(`Failed to get storefront vehicle by id: ${id}`, error);
      throw error;
    }
  }

  private async attachTenantExtras(vehicle: any) {
    this.logger.debug(
      `Attaching tenant extras to vehicle with tenantId: ${vehicle?.tenantId}`,
    );
    if (!vehicle?.tenantId) return vehicle;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: vehicle.tenantId },
    });

    if (!tenant) return vehicle;

    const extras = await this.extrasService.getTenantExtras(tenant);

    this.logger.debug(
      `Attached ${extras.length} extras to vehicle ID: ${vehicle.id}`,
    );

    return {
      ...vehicle,
      tenant: {
        ...vehicle.tenant,
        extras,
      },
    };
  }

  private async attachExtrasToVehicles(vehicles: any[]) {
    return Promise.all(
      vehicles.map((vehicle) => this.attachTenantExtras(vehicle)),
    );
  }
}
