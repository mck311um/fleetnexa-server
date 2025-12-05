import { Injectable, Logger } from '@nestjs/common';
import { VehicleRepository } from './vehicle.repository.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(
    private readonly vehicleRepository: VehicleRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getStorefrontVehicles() {
    try {
      return await this.vehicleRepository.getVehiclesForStorefront();
    } catch (error) {
      this.logger.error('Failed to get storefront vehicles', error);
      throw error;
    }
  }

  async getVehicleForStorefrontById(id: string) {
    try {
      return await this.vehicleRepository.getVehicleForStorefrontById(id);
    } catch (error) {
      this.logger.error(`Failed to get storefront vehicle by id: ${id}`, error);
      throw error;
    }
  }
}
