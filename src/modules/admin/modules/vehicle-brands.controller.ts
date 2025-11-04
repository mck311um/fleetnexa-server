import { Request, Response } from 'express';
import prisma from '../../../config/prisma.config';
import { logger } from '../../../config/logger';
import * as XLSX from 'xlsx';
import { validateExcelColumns } from '../../../utils/validateExcelColumns';

type VehicleBrandRow = {
  brand: string;
};

const getVehicleBrands = async (req: Request, res: Response) => {
  try {
    const vehicleBrands = await prisma.vehicleBrand.findMany({
      include: {
        _count: {
          select: { models: true },
        },
      },
    });

    res.status(200).json(vehicleBrands);
  } catch (error) {
    logger.e(error, 'Error fetching vehicle brands');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const bulkAddVehicleBrands = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      logger.w('No file uploaded for bulk vehicle brand import');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json<VehicleBrandRow>(sheet);

    const valid = validateExcelColumns(data, ['brand'], res, logger);

    if (!valid) return;

    for (const item of data) {
      const brand = item.brand;

      if (!brand) {
        logger.w(`Skipping invalid row: ${JSON.stringify(item)}`);
        continue;
      }
      const formattedBrand = brand.trim();

      const existingBrand = await prisma.vehicleBrand.findFirst({
        where: {
          brand: {
            equals: formattedBrand,
            mode: 'insensitive',
          },
        },
      });
      if (existingBrand) {
        logger.w(`Skipping duplicate brand: ${formattedBrand}`);
        continue;
      }

      try {
        await prisma.vehicleBrand.create({
          data: { brand: formattedBrand },
        });
        logger.i(`Added vehicle brand: ${formattedBrand}`);
      } catch (error) {
        logger.w(`Failed to add vehicle brand (${formattedBrand}): ${error}`);
      }
    }

    res.status(200).json({ message: 'Bulk vehicle brand import completed' });
  } catch (error) {
    logger.e(error, 'Error during bulk vehicle brand import');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const addVehicleBrand = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.brand) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    const brand = data.brand;

    const formattedBrand = brand.trim();

    const existingBrand = await prisma.vehicleBrand.findFirst({
      where: {
        brand: {
          equals: formattedBrand,
          mode: 'insensitive',
        },
      },
    });

    if (existingBrand) {
      return res.status(409).json({ message: 'Vehicle brand already exists' });
    }

    const vehicleBrands = await prisma.vehicleBrand.findMany({
      include: {
        _count: { select: { models: true } },
      },
    });

    res
      .status(201)
      .json({ message: 'Vehicle brand added successfully', vehicleBrands });
  } catch (error) {
    logger.e(error, 'Error adding vehicle brand');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateVehicleBrand = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const existingBrand = await prisma.vehicleBrand.findUnique({
      where: { id: data.id },
    });

    if (!existingBrand) {
      return res.status(404).json({ message: 'Vehicle brand not found' });
    }

    const duplicateBrand = await prisma.vehicleBrand.findFirst({
      where: {
        brand: {
          equals: data.brand,
          mode: 'insensitive',
        },
        id: { not: data.id },
      },
    });

    if (duplicateBrand) {
      return res.status(409).json({ message: 'Vehicle brand already exists' });
    }

    await prisma.vehicleBrand.update({
      where: { id: data.id },
      data: { brand: data.brand },
    });

    const vehicleBrands = await prisma.vehicleBrand.findMany({
      include: {
        _count: { select: { models: true } },
      },
    });

    res
      .status(200)
      .json({ message: 'Vehicle brand updated successfully', vehicleBrands });
  } catch (error) {
    logger.e(error, 'Error updating vehicle brand');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteVehicleBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingBrand = await prisma.vehicleBrand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      return res.status(404).json({ message: 'Vehicle brand not found' });
    }

    await prisma.vehicleBrand.delete({
      where: { id },
    });

    const vehicleBrands = await prisma.vehicleBrand.findMany({
      include: {
        _count: { select: { models: true } },
      },
    });

    res
      .status(200)
      .json({ message: 'Vehicle brand deleted successfully', vehicleBrands });
  } catch (error) {
    logger.e(error, 'Error deleting vehicle brand');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const vehicleBrandsController = {
  getVehicleBrands,
  bulkAddVehicleBrands,
  addVehicleBrand,
  updateVehicleBrand,
  deleteVehicleBrand,
};
