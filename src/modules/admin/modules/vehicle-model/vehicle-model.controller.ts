import { Request, Response } from 'express';
import { vehicleModelService } from './vehicle-model.service';
import { logger } from '../../../../config/logger';
import * as XLSX from 'xlsx';
import { validateExcelColumns } from '../../../../utils/validateExcelColumns';

type VehicleModelRow = {
  model: string;
  brand: string;
  bodyType: string;
};

const getVehicleModels = async (req: Request, res: Response) => {
  try {
    const vehicleModels = await vehicleModelService.getAllVehicleModels();
    res.status(200).json(vehicleModels);
  } catch (error) {
    logger.e(error, 'Error fetching vehicle models');
    res.status(500).json({ error });
  }
};

const createVehicleModel = async (req: Request, res: Response) => {
  const data = req.body;

  const validatedData = await vehicleModelService.validateVehicleModel(data);

  try {
    await vehicleModelService.createVehicleModel(validatedData);

    const vehicleModels = await vehicleModelService.getAllVehicleModels();
    res
      .status(201)
      .json({ message: 'Vehicle model created successfully', vehicleModels });
  } catch (error) {
    logger.e(error, 'Error creating vehicle model');
    res.status(500).json({ error });
  }
};

const updateVehicleModel = async (req: Request, res: Response) => {
  const data = req.body;

  const validatedData = await vehicleModelService.validateVehicleModel(data);

  try {
    await vehicleModelService.updateVehicleModel(validatedData);

    const vehicleModels = await vehicleModelService.getAllVehicleModels();
    res
      .status(200)
      .json({ message: 'Vehicle model updated successfully', vehicleModels });
  } catch (error) {
    logger.e(error, 'Error updating vehicle model');
    res.status(500).json({ error });
  }
};

const deleteVehicleModel = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Model ID is required' });
  }
  try {
    await vehicleModelService.deleteVehicleModel(id);

    const vehicleModels = await vehicleModelService.getAllVehicleModels();
    res
      .status(200)
      .json({ message: 'Vehicle model deleted successfully', vehicleModels });
  } catch (error: any) {
    logger.e(error, 'Error deleting vehicle model');
    res.status(500).json({ message: error.message });
  }
};

const bulkInsertVehicleModels = async (req: Request, res: Response) => {
  if (!req.file) {
    logger.w('No file uploaded for bulk vehicle model import');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json<VehicleModelRow>(sheet);

    const valid = validateExcelColumns(
      data,
      ['model', 'bodyType', 'brand'],
      res,
      logger,
    );

    if (!valid) return;

    await vehicleModelService.bulkCreateVehicleModels(data);
    const vehicleModels = await vehicleModelService.getAllVehicleModels();

    res.status(200).json({
      message: 'Bulk vehicle model import successful',
      vehicleModels,
    });
  } catch (error) {
    logger.e(error, `Error occurred during bulk vehicle model import`);
    return res.status(500).json({ error });
  }
};

export default {
  getVehicleModels,
  createVehicleModel,
  updateVehicleModel,
  deleteVehicleModel,
  bulkInsertVehicleModels,
};
