import { Request, Response } from 'express';
import { logger } from '../../../../config/logger';
import { vehicleDamageService } from './damage.service';

const getVehicleDamages = async (req: Request, res: Response) => {
  const { tenant } = req.context!;
  const { id } = req.params;

  try {
    const damages = await vehicleDamageService.getVehicleDamages(id, tenant);

    return res.status(200).json(damages);
  } catch (error) {
    logger.e(error, 'Failed to get vehicle damages', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vehicleId: id,
    });
    return res.status(500).json({ message: 'Failed to get vehicle damages' });
  }
};

const addVehicleDamage = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const data = req.body;

  if (!data) {
    logger.w('No data provided for adding vehicle damage', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(400).json({ message: 'No data provided' });
  }

  const damageData = vehicleDamageService.validateVehicleDamage(data);

  try {
    await vehicleDamageService.addVehicleDamage(damageData, tenant, user);

    const damages = await vehicleDamageService.getVehicleDamages(
      damageData.vehicleId,
      tenant,
    );

    return res
      .status(201)
      .json({ message: 'Vehicle damage added successfully', damages });
  } catch (error) {
    logger.e(error, 'Failed to add vehicle damage', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(500).json({ message: 'Failed to add vehicle damage' });
  }
};

const updateVehicleDamage = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const data = req.body;

  if (!data) {
    logger.w('No data provided for updating vehicle damage', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(400).json({ message: 'No data provided' });
  }

  const damageData = vehicleDamageService.validateVehicleDamage(data);

  try {
    await vehicleDamageService.updateVehicleDamage(damageData, tenant, user);

    const damages = await vehicleDamageService.getVehicleDamages(
      damageData.vehicleId,
      tenant,
    );

    return res
      .status(200)
      .json({ message: 'Vehicle damage updated successfully', damages });
  } catch (error) {
    logger.e(error, 'Failed to update vehicle damage', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(500).json({ message: 'Failed to update vehicle damage' });
  }
};

const deleteVehicleDamage = async (req: Request, res: Response) => {
  const { tenant, user } = req.context!;
  const { id } = req.params;

  if (!id) {
    logger.w('No ID provided for deleting vehicle damage', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(400).json({ message: 'No ID provided' });
  }

  try {
    const damage = await vehicleDamageService.deleteVehicleDamage(
      id,
      tenant,
      user,
    );
    const damages = await vehicleDamageService.getVehicleDamages(
      damage.vehicleId,
      tenant,
    );

    return res
      .status(200)
      .json({ message: 'Vehicle damage deleted successfully', damages });
  } catch (error) {
    logger.e(error, 'Failed to delete vehicle damage', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      damageId: id,
    });
    return res.status(500).json({ message: 'Failed to delete vehicle damage' });
  }
};

export default {
  getVehicleDamages,
  addVehicleDamage,
  updateVehicleDamage,
  deleteVehicleDamage,
};
