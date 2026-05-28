import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VehicleEventDto } from '../../dto/vehicle-event.dto.js';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service.js';

@Injectable()
export class VehicleEventService {
  private readonly logger = new Logger(VehicleEventService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createEvent(data: VehicleEventDto) {
    try {
      const existingVehicle = await this.prisma.vehicle.findUnique({
        where: { id: data.vehicleId },
      });

      if (!existingVehicle) {
        this.logger.warn(`Vehicle with ID ${data.vehicleId} not found`);
        throw new NotFoundException('Vehicle not found');
      }

      await this.prisma.vehicleEvent.create({
        data: {
          vehicleId: data.vehicleId,
          event: data.event,
          type: data.type,
          date: new Date(data.date),
          notes: data.notes,
        },
      });
    } catch (error: any) {
      this.logger.error(error, 'Error logging vehicle event', { data });
      throw error;
    }
  }
}
