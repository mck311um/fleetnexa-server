import { Request, Response } from 'express';
import prisma from '../../../config/prisma.config';
import { logger } from '../../../config/logger';
import * as XLSX from 'xlsx';
import { validateExcelColumns } from '../../../utils/validateExcelColumns';

type PermissionRow = {
  permission: string;
  category: string;
  description: string;
};

const formatName = (name: string) => {
  return name.trim().toUpperCase().replace(/\s+/g, '_');
};

const getAppPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.appPermission.findMany({
      include: { category: true },
    });

    res.status(200).json(permissions);
  } catch (error) {
    logger.e(error, 'Error fetching app permissions');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const bulkAddPermissions = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      logger.w('No file uploaded for bulk permission import');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json<PermissionRow>(sheet);

    const valid = validateExcelColumns(
      data,
      ['permission', 'category', 'description'],
      res,
      logger,
    );

    if (!valid) return;

    for (const item of data) {
      const permission = item.permission;
      const category = item.category;
      const description = item.description;

      if (!permission || !category || !description) {
        logger.w(`Skipping invalid row: ${JSON.stringify(item)}`);
        continue;
      }

      const formattedName = formatName(permission);
      const formattedCategory = formatName(category);

      const permissionCategory = await prisma.permissionCategory.findUnique({
        where: { name: formattedCategory },
      });

      if (!permissionCategory) {
        logger.w(
          `Permission category not found for permission: ${permission}, category: ${category}`,
        );
        continue;
      }

      await prisma.appPermission.upsert({
        where: { name: formattedName },
        update: {
          description,
          categoryId: permissionCategory.id,
        },
        create: {
          name: formattedName,
          description,
          categoryId: permissionCategory.id,
        },
      });
    }

    const permissions = await prisma.appPermission.findMany({
      include: { category: true },
    });

    res
      .status(201)
      .json({ message: 'Permissions imported successfully', permissions });
  } catch (error) {
    logger.e(error, 'Error during bulk permission import');
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addAppPermission = async (req: Request, res: Response) => {
  const data = req.body;

  if (!data) {
    logger.w('No data provided for new app permission');
    return res.status(400).json({ error: 'No data provided' });
  }

  try {
    const newPermission = await prisma.appPermission.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.category,
      },
    });

    const permissions = await prisma.appPermission.findMany({
      include: { category: true },
    });

    res.status(201).json({ newPermission, permissions });
  } catch (error) {
    logger.e(error, 'Error adding app permission');
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const permissionsController = {
  getAppPermissions,
  addAppPermission,
  bulkAddPermissions,
};
