import { Request, Response } from 'express';
import { logger } from '../../config/logger';
import { vehicleService } from './vehicle.service';
import { UpdateVehicleStatusSchema } from './vehicle.dto';

const getAllTenantVehicles = async (req: Request, res: Response) => {
  const { tenant } = req.context!;

  try {
    const vehicles = await vehicleService.getTenantVehicles(tenant);

    return res.status(200).json(vehicles);
  } catch (error) {
    logger.e(error, 'Failed to get vehicles', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(500).json({ message: 'Failed to get vehicles' });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  const { tenant } = req.context!;
  const { id } = req.params;

  try {
    const vehicle = await vehicleService.getVehicleById(id, tenant);

    return res.status(200).json(vehicle);
  } catch (error) {
    logger.e(error, 'Failed to get vehicle by ID', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vehicleId: id,
    });
    return res.status(500).json({ message: 'Failed to get vehicle by ID' });
  }
};

const getVehicleByLicensePlate = async (req: Request, res: Response) => {
  const { tenant } = req.context!;
  const { plate } = req.params;

  try {
    const vehicle = await vehicleService.getVehicleByLicensePlate(
      plate,
      tenant,
    );

    return res.status(200).json(vehicle);
  } catch (error) {
    logger.e(error, 'Failed to get vehicle by license plate', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      plate,
    });
    return res
      .status(500)
      .json({ message: 'Failed to get vehicle by license plate' });
  }
};

const updateVehicleStatus = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const data = req.body;

  if (!data) {
    logger.w('Status data is missing');
    return res.status(400).json({ message: 'Status data is required' });
  }

  const parseResult = UpdateVehicleStatusSchema.safeParse(data);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid status data',
      details: parseResult.error.issues,
    });
  }

  const statusDto = parseResult.data;

  try {
    await vehicleService.updateVehicleStatus(statusDto, tenant, user);

    const vehicles = await vehicleService.getTenantVehicles(tenant);

    return res
      .status(200)
      .json({ message: 'Vehicle status updated', vehicles });
  } catch (error) {
    logger.e(error, 'Failed to update vehicle status', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vehicleId: statusDto.vehicleId,
      status: statusDto.status,
    });
    return res.status(500).json({ message: 'Failed to update vehicle status' });
  }
};

export default {
  getAllTenantVehicles,
  getVehicleById,
  getVehicleByLicensePlate,
  updateVehicleStatus,
};
