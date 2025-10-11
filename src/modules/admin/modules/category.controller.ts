import { Request, Response } from 'express';
import prisma from '../../../config/prisma.config';
import { logger } from '../../../config/logger';

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
};
