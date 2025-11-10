import { Request, Response } from 'express';
import { vehicleBrandService } from './vehicle-brand.service';
import { logger } from '../../../../config/logger';
import * as XLSX from 'xlsx';
import { validateExcelColumns } from '../../../../utils/validateExcelColumns';

type VehicleBrandRow = {
  brand: string;
};

const getVehicleBrands = async (req: Request, res: Response) => {
  try {
    const vehicleBrands = await vehicleBrandService.getAllVehicleBrands();

    res.status(200).json(vehicleBrands);
  } catch (error: any) {
    logger.e(error, 'Error fetching vehicle brands');
    res.status(500).json({ error: error.message });
  }
};

const createVehicleBrand = async (req: Request, res: Response) => {
  const data = req.body;

  const validatedBrand = await vehicleBrandService.validateVehicleBrand(data);

  try {
    await vehicleBrandService.createVehicleBrand(validatedBrand);
    const vehicleBrands = await vehicleBrandService.getAllVehicleBrands();

    res
      .status(201)
      .json({ message: 'Vehicle brand created successfully', vehicleBrands });
  } catch (error: any) {
    logger.e(error, 'Error creating vehicle brand');
    res.status(500).json({ error: error.message });
  }
};

const updateVehicleBrand = async (req: Request, res: Response) => {
  const data = req.body;

  const validatedBrand = await vehicleBrandService.validateVehicleBrand(data);

  try {
    await vehicleBrandService.updateVehicleBrand(validatedBrand);
    const vehicleBrands = await vehicleBrandService.getAllVehicleBrands();

    res
      .status(200)
      .json({ message: 'Vehicle brand updated successfully', vehicleBrands });
  } catch (error: any) {
    logger.e(error, 'Error updating vehicle brand');
    res.status(500).json({ error: error.message });
  }
};

const deleteVehicleBrand = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Vehicle brand ID is required' });
  }

  try {
    await vehicleBrandService.deleteVehicleBrand(id);
    const vehicleBrands = await vehicleBrandService.getAllVehicleBrands();

    res
      .status(200)
      .json({ message: 'Vehicle brand deleted successfully', vehicleBrands });
  } catch (error: any) {
    logger.e(error, 'Error deleting vehicle brand');
    res.status(500).json({ error: error.message });
  }
};

const bulkAddVehicleBrands = async (req: Request, res: Response) => {
  if (!req.file) {
    logger.w('No file uploaded for bulk vehicle brand import');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json<VehicleBrandRow>(sheet);

    const valid = validateExcelColumns(data, ['brand'], res, logger);

    if (!valid) return;

    await vehicleBrandService.bulkCreateVehicleBrands(data);
    const vehicleBrands = await vehicleBrandService.getAllVehicleBrands();

    res.status(200).json({
      message: 'Bulk Import successful',
      vehicleBrands,
    });
  } catch (error: any) {
    logger.e(error, 'Error during bulk vehicle brand import');
    res.status(500).json({ error: error.message });
  }
};

export default {
  getVehicleBrands,
  createVehicleBrand,
  updateVehicleBrand,
  deleteVehicleBrand,
  bulkAddVehicleBrands,
};
