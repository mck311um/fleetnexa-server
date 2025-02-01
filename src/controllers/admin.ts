import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getData = async (req: any, res: any) => {
  try {
    const vehicleParts = await prisma.vehiclePart.findMany();

    res.status(201).json({ vehicleParts });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

const addVehiclePart = async (req: any, res: any) => {
  try {
    const { partId, partName } = req.body;

    await prisma.vehiclePart.create({
      data: {
        partId,
        partName,
      },
    });

    res.status(201).end();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
    return;
  }
};

export const getVehicleParts = async () => {
  const vehicleParts = await prisma.vehiclePart.findMany();
  return vehicleParts;
};

export default {
  getData,
  addVehiclePart,
};
