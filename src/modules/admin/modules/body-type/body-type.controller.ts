import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { bodyTypeService } from './body-type.service';
import { logger } from '../../../../config/logger';
import { validateExcelColumns } from '../../../../utils/validateExcelColumns';

type BodyTypeRow = {
  bodyType: string;
};

const getVehicleBodyTypes = async (req: Request, res: Response) => {
  try {
    const vehicleBodyTypes = await bodyTypeService.getAllVehicleBodyTypes();

    res.status(200).json(vehicleBodyTypes);
  } catch (error) {
    logger.e(error, 'Error fetching vehicle body types');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const createVehicleBodyType = async (req: Request, res: Response) => {
  const data = req.body;

  const validatedBodyType = await bodyTypeService.validateBodyType(data);

  try {
    await bodyTypeService.createVehicleBodyType(validatedBodyType);
    const bodyTypes = await bodyTypeService.getAllVehicleBodyTypes();

    res
      .status(201)
      .json({ message: 'Vehicle body type created successfully', bodyTypes });
  } catch (error) {
    logger.e(error, 'Error creating vehicle body type');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateVehicleBodyType = async (req: Request, res: Response) => {
  const data = req.body;

  const validatedBodyType = await bodyTypeService.validateBodyType(data);

  try {
    await bodyTypeService.updateVehicleBodyType(validatedBodyType);
    const bodyTypes = await bodyTypeService.getAllVehicleBodyTypes();

    res
      .status(200)
      .json({ message: 'Vehicle body type updated successfully', bodyTypes });
  } catch (error) {
    logger.e(error, 'Error updating vehicle body type');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteVehicleBodyType = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Body type ID is required' });
  }
  try {
    await bodyTypeService.deleteVehicleBodyType(id);
    const vehicleBodyTypes = await bodyTypeService.getAllVehicleBodyTypes();

    res.status(200).json({
      message: 'Vehicle body type deleted successfully',
      vehicleBodyTypes,
    });
  } catch (error) {
    logger.e(error, 'Error deleting vehicle body type');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const bulkInsertVehicleBodyTypes = async (req: Request, res: Response) => {
  if (!req.file) {
    logger.w('No file');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json<BodyTypeRow>(sheet);

    const valid = validateExcelColumns(data, ['bodyType'], res, logger);

    if (!valid) return;

    await bodyTypeService.bulkCreateVehicleBodyTypes(data);
    const vehicleBodyTypes = await bodyTypeService.getAllVehicleBodyTypes();

    res.status(200).json({
      message: 'Bulk Import successful',
      vehicleBodyTypes,
    });
  } catch (error) {
    logger.e(error, 'Error during bulk vehicle body type import');
    res.status(500).json(error);
  }
};

export default {
  getVehicleBodyTypes,
  createVehicleBodyType,
  updateVehicleBodyType,
  deleteVehicleBodyType,
  bulkInsertVehicleBodyTypes,
};
