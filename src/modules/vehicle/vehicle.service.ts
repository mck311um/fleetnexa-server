import { Tenant } from '@prisma/client';
import { logger } from '../../config/logger';
import { TxClient } from '../../config/prisma.config';

const updateVehicleStatus = async (
  vehicleId: string,
  status: string,
  tenant: Tenant,
  tx: TxClient,
  userId: string,
) => {
  try {
    const vehicle = await tx.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      logger.w('Vehicle not found', { vehicleId, userId });
      throw new Error('Vehicle not found');
    }

    const foundStatus = await tx.vehicleStatus.findUnique({
      where: { status: status },
    });

    if (!foundStatus) {
      logger.w('Vehicle status not found', { status, userId });
      throw new Error('Vehicle status not found');
    }

    await tx.vehicle.update({
      where: { id: vehicleId },
      data: { vehicleStatusId: foundStatus.id, updatedBy: userId },
    });
  } catch (error) {
    logger.e(error, 'Failed to update vehicle status', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vehicleId,
      userId,
    });
    throw new Error('Failed to update vehicle status');
  }
};

export default {
  updateVehicleStatus,
};
