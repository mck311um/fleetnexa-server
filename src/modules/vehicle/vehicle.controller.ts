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

const addVehicle = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const data = req.body;

  if (!data) {
    logger.w('Vehicle data is missing');
    return res.status(400).json({ message: 'Vehicle data is required' });
  }

  try {
    const vehicleDto = vehicleService.validateVehicleData(data);
    await vehicleService.addVehicle(vehicleDto, tenant, user);

    const vehicles = await vehicleService.getTenantVehicles(tenant);

    return res
      .status(201)
      .json({ message: 'Vehicle added successfully', vehicles });
  } catch (error: any) {
    logger.e(error, 'Failed to add vehicle', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res
      .status(500)
      .json({ message: error?.message || 'Failed to add vehicle' });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const data = req.body;

  if (!data) {
    return res.status(400).json({ message: 'Vehicle data is required' });
  }

  try {
    const vehicleDto = vehicleService.validateVehicleData(data);

    await vehicleService.updateVehicle(vehicleDto, tenant, user);

    const vehicles = await vehicleService.getTenantVehicles(tenant);
    const vehicle = await vehicleService.getVehicleById(vehicleDto.id, tenant);

    return res
      .status(200)
      .json({ message: 'Vehicle updated successfully', vehicle, vehicles });
  } catch (error: any) {
    logger.e(error, 'Failed to update vehicle', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res
      .status(500)
      .json({ message: error?.message || 'Failed to update vehicle' });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Vehicle ID is required' });
  }

  try {
    await vehicleService.deleteVehicle(id, tenant, user);

    const vehicles = await vehicleService.getTenantVehicles(tenant);

    return res
      .status(200)
      .json({ message: 'Vehicle deleted successfully', vehicles });
  } catch (error) {
    logger.e(error, 'Failed to delete vehicle', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vehicleId: id,
    });
    return res.status(500).json({ message: 'Failed to delete vehicle' });
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

const updateVehicleStorefrontStatus = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const { id } = req.params;

  if (!id) {
    logger.w('Vehicle ID is missing');
    return res.status(400).json({ message: 'Vehicle ID is required' });
  }

  try {
    await vehicleService.updateVehicleStorefrontStatus(id, tenant, user);

    const vehicle = await vehicleService.getVehicleById(id, tenant);
    const vehicles = await vehicleService.getTenantVehicles(tenant);

    return res.status(200).json({
      message: 'Vehicle storefront status updated',
      vehicle,
      vehicles,
    });
  } catch (error) {
    logger.e(error, 'Failed to update vehicle storefront status', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vehicleId: id,
    });
    return res
      .status(500)
      .json({ message: 'Failed to update vehicle storefront status' });
  }
};

export default {
  getAllTenantVehicles,
  getVehicleById,
  getVehicleByLicensePlate,
  updateVehicleStatus,
  updateVehicleStorefrontStatus,
  addVehicle,
  updateVehicle,
  deleteVehicle,
};
