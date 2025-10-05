import { Request, Response } from 'express';
import { logger } from '../../../../config/logger';
import { vehicleMaintenanceService } from './vehicle-maintenance.service';
import { vehicleRepo } from '../../vehicle.repository';

const getScheduledMaintenances = async (req: Request, res: Response) => {
  const { tenant } = req.context!;

  try {
    const maintenances =
      await vehicleMaintenanceService.getTenantMaintenanceServices(tenant);

    return res.status(200).json(maintenances);
  } catch (error) {
    logger.e(error, 'Failed to get scheduled maintenances', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res
      .status(500)
      .json({ message: 'Failed to get scheduled maintenances' });
  }
};

const getVehicleMaintenances = async (req: Request, res: Response) => {
  const { tenant } = req.context!;
  const { id } = req.params;

  try {
    const maintenances =
      await vehicleMaintenanceService.getVehicleMaintenances(id);

    return res.status(200).json(maintenances);
  } catch (error) {
    logger.e(error, 'Failed to get vehicle maintenances', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vehicleId: id,
    });
    return res
      .status(500)
      .json({ message: 'Failed to get vehicle maintenances' });
  }
};

const addVehicleMaintenance = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  const maintenanceDto =
    await vehicleMaintenanceService.validateMaintenanceData(data);

  try {
    await vehicleMaintenanceService.addVehicleMaintenance(
      maintenanceDto,
      tenant,
      user,
    );

    const vehicle = await vehicleRepo.getVehicleById(data.vehicleId, tenant.id);
    const vehicles = await vehicleRepo.getVehicles(tenant.id);
    res.status(201).json({
      message: 'Vehicle maintenance added successfully',
      vehicle,
      vehicles,
    });
  } catch (error) {
    logger.e(error, 'Failed to add vehicle maintenance', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Failed to add vehicle maintenance' });
  }
};

const updateVehicleMaintenance = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  const maintenanceDto =
    await vehicleMaintenanceService.validateMaintenanceData(data);

  try {
    await vehicleMaintenanceService.updateVehicleMaintenance(
      maintenanceDto,
      tenant,
      user,
    );

    const vehicle = await vehicleRepo.getVehicleById(data.vehicleId, tenant.id);
    const vehicles = await vehicleRepo.getVehicles(tenant.id);

    res.status(200).json({
      message: 'Vehicle maintenance updated successfully',
      vehicles,
      vehicle,
    });
  } catch (error) {
    logger.e(error, 'Failed to update vehicle maintenance', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Failed to update vehicle maintenance' });
  }
};

const deleteVehicleMaintenance = async (req: Request, res: Response) => {
  const { maintenanceId, vehicleId } = req.params;
  const { tenant, user } = req.context!;

  if (!maintenanceId || !vehicleId) {
    logger.w('No ID provided for deleting vehicle maintenance', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(400).json({ message: 'No ID provided' });
  }

  try {
    await vehicleMaintenanceService.deleteVehicleMaintenance(
      maintenanceId,
      tenant,
      user,
    );

    const vehicle = await vehicleRepo.getVehicleById(vehicleId, tenant.id);
    const vehicles = await vehicleRepo.getVehicles(tenant.id);

    res.status(200).json({
      message: 'Vehicle maintenance deleted successfully',
      vehicles,
      vehicle,
    });
  } catch (error) {
    logger.e(error, 'Failed to delete vehicle maintenance', {
      maintenanceId: maintenanceId,
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    res.status(500).json({ error: 'Failed to delete vehicle maintenance' });
  }
};

export default {
  getScheduledMaintenances,
  getVehicleMaintenances,
  addVehicleMaintenance,
  updateVehicleMaintenance,
  deleteVehicleMaintenance,
};
