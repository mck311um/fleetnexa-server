import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getData = async (req: any, res: any) => {
  try {
    const vehicleParts = await prisma.vehiclePart.findMany();
    const currencies = await prisma.currency.findMany();
    const fuelTypes = await prisma.fuelType.findMany();
    const paymentMethods = await prisma.paymentMethod.findMany();
    const chargeTypes = await prisma.chargeType.findMany();
    const transmissions = await prisma.transmission.findMany();
    const vehicleFeatures = await prisma.vehicleFeature.findMany();
    const vehicleStatuses = await prisma.vehicleStatus.findMany();
    const wheelDrives = await prisma.wheelDrive.findMany();
    const fuelPolicies = await prisma.fuelPolicy.findMany();
    const countries = await prisma.country.findMany();
    const states = await prisma.state.findMany();
    const villages = await prisma.village.findMany();
    const invoiceSequences = await prisma.invoiceSequence.findMany();

    res.status(201).json({
      vehicleParts,
      currencies,
      fuelTypes,
      paymentMethods,
      chargeTypes,
      transmissions,
      vehicleFeatures,
      vehicleStatuses,
      wheelDrives,
      fuelPolicies,
      countries,
      states,
      villages,
      invoiceSequences,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// const addVehiclePart = async (req: any, res: any) => {
//   try {
//     const { partId, partName } = req.body;

//     await prisma.vehiclePart.create({
//       data: {
//         partId,
//         partName,
//       },
//     });

//     res.status(201).end();
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//     return;
//   }
// };

export const getVehicleParts = async () => {
  const vehicleParts = await prisma.vehiclePart.findMany();
  return vehicleParts;
};

export default {
  getData,
};
