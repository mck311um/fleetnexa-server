import prisma from "../config/prisma.config";
import { Request, Response, NextFunction } from "express";
import logUtil from "../config/logger.config";

const addAppPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permissions = req.body;

    if (!Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ message: "Input should be an array of permissions" });
    }

    for (const permission of permissions) {
      if (!permission.name || !permission.description || !permission.category) {
        return res.status(400).json({
          message: "All permissions must have name, description, and category",
          invalidPermission: permission,
        });
      }
    }

    const result = await prisma.appPermission.createMany({
      data: permissions,
      skipDuplicates: true,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  addAppPermission,
};
