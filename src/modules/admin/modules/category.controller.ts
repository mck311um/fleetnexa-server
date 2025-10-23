import { Request, Response } from 'express';
import prisma from '../../../config/prisma.config';
import { logger } from '../../../config/logger';
import * as XLSX from 'xlsx';
import { validateExcelColumns } from '../../../utils/validateExcelColumns';

type CategoryRow = {
  category: string;
  description?: string;
};

const formatName = (name: string) => {
  return name.trim().toUpperCase().replace(/\s+/g, '_');
};

const getPermissionCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.permissionCategory.findMany({
      include: { permissions: true, _count: true },
    });

    res.status(200).json(categories);
  } catch (error) {
    logger.e(error, 'Error fetching permission categories');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const bulkAddPermissionCategories = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      logger.w('No file uploaded for bulk category import');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json<CategoryRow>(sheet);

    const valid = validateExcelColumns(
      data,
      ['category', 'description'],
      res,
      logger,
    );
    if (!valid) return;

    for (const item of data) {
      const category = item.category;
      const description = item.description;

      if (!category || !description) {
        logger.w(`Skipping invalid row: ${JSON.stringify(item)}`);
        continue;
      }

      const formattedName = formatName(category);

      const existingCategory = await prisma.permissionCategory.findUnique({
        where: { name: formattedName },
      });

      if (existingCategory) {
        logger.w(
          `Category with name ${formattedName} already exists. Skipping.`,
        );
        continue;
      }

      await prisma.permissionCategory.create({
        data: {
          name: formattedName,
          description: description,
        },
      });
    }
    const categories = await prisma.permissionCategory.findMany({
      include: { permissions: true, _count: true },
    });

    res
      .status(201)
      .json({ message: 'Categories imported successfully', categories });
  } catch (error) {
    logger.e(error, 'Error during bulk category import');
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addPermissionCategory = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    logger.w('No data provided for new app permission');
    return res.status(400).json({ error: 'No data provided' });
  }

  try {
    const formattedName = data.name.trim().toUpperCase().replace(/\s+/g, '_');

    const existingCategory = await prisma.permissionCategory.findUnique({
      where: { name: formattedName },
    });

    if (existingCategory) {
      logger.w(`Category with name ${formattedName} already exists`);
      return res.status(409).json({ error: 'Category already exists' });
    }

    const newCategory = await prisma.permissionCategory.create({
      data: {
        name: formattedName,
        description: data.description,
      },
    });

    const categories = await prisma.permissionCategory.findMany({
      include: { permissions: true, _count: true },
    });

    res.status(201).json({ newCategory, categories });
  } catch (error) {
    logger.e(error, 'Error adding app permission');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const categoryController = {
  getPermissionCategories,
  addPermissionCategory,
  bulkAddPermissionCategories,
};
