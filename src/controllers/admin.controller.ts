import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const getData = async (req: Request, res: Response) => {
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
    const vehicleModels = await prisma.vehicleModel.findMany();
    const vehicleBrands = await prisma.vehicleBrand.findMany();
    const vehicleBodyTypes = await prisma.vehicleBodyType.findMany();
    const maintenanceServices = await prisma.maintenanceService.findMany();
    const documentTypes = await prisma.documentType.findMany();
    const presetLocations = await prisma.presetLocation.findMany();
    const locationTypes = await prisma.locationType.findMany();
    const services = await prisma.service.findMany();
    const licenseClasses = await prisma.licenseClass.findMany();
    const messengerApps = await prisma.messengerApp.findMany();
    const equipments = await prisma.equipment.findMany();
    const subscriptionPlans = await prisma.subscriptionPlan.findMany();
    const contactTypes = await prisma.contactType.findMany();
    const paymentTypes = await prisma.paymentType.findMany();

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
      vehicleModels,
      vehicleBrands,
      vehicleBodyTypes,
      maintenanceServices,
      documentTypes,
      presetLocations,
      locationTypes,
      services,
      licenseClasses,
      messengerApps,
      equipments,
      subscriptionPlans,
      contactTypes,
      paymentTypes,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};
const formsGetData = async (req: Request, res: Response) => {
  try {
    const countries = await prisma.country.findMany();
    const states = await prisma.state.findMany();
    const villages = await prisma.village.findMany();
    const licenseClasses = await prisma.licenseClass.findMany();
    const messengerApps = await prisma.messengerApp.findMany();

    res.status(201).json({
      countries,
      states,
      villages,
      licenseClasses,
      messengerApps,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

const addVehicleMake = async (req: any, res: any) => {
  const { brand } = req.body;

  try {
    const existingMake = await prisma.vehicleBrand.findFirst({
      where: {
        brand: {
          equals: brand.toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (existingMake) {
      return res.status(409).json({ message: "Vehicle make already exists" });
    }

    await prisma.vehicleBrand.create({
      data: {
        brand,
      },
    });

    const vehicleMakes = await prisma.vehicleBrand.findMany();

    res.status(201).json({ ...vehicleMakes });
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

const addVehicleType = async (req: any, res: any) => {
  const { bodyType } = req.body;

  try {
    const existingType = await prisma.vehicleBodyType.findFirst({
      where: {
        bodyType: {
          equals: bodyType.toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (existingType) {
      return res.status(409).json({ message: "Vehicle type already exists" });
    }

    await prisma.vehicleBodyType.create({
      data: {
        bodyType,
      },
    });

    const vehicleTypes = await prisma.vehicleBodyType.findMany();

    res.status(201).json({ ...vehicleTypes });
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

const addVehicleModel = async (req: any, res: any) => {
  const { brandId, model, bodyTypeId } = req.body;

  try {
    const vehicleMake = await prisma.vehicleBrand.findUnique({
      where: { id: brandId },
    });

    if (!vehicleMake) {
      return res.status(404).json({ message: "Vehicle make not found" });
    }

    await prisma.vehicleModel.create({
      data: {
        brand: { connect: { id: brandId } },
        bodyType: { connect: { id: bodyTypeId } },
        model: model,
      },
    });

    const vehicleModels = await prisma.vehicleModel.findMany();

    res.status(201).json({ ...vehicleModels });
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

const addVehicleFeature = async (req: any, res: any) => {
  const { feature } = req.body;
  try {
    const existingFeature = await prisma.vehicleFeature.findFirst({
      where: {
        feature: {
          equals: feature.toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (existingFeature) {
      return res
        .status(409)
        .json({ message: "Vehicle feature already exists" });
    }

    await prisma.vehicleFeature.create({
      data: {
        feature,
      },
    });

    const vehicleFeatures = await prisma.vehicleFeature.findMany();

    res.status(201).json({ ...vehicleFeatures });
  } catch (error: any) {
    console.error(error.message);
    res.status(400).json({ message: error.message });
  }
};

export default {
  getData,
  formsGetData,
  addVehicleMake,
  addVehicleType,
  addVehicleModel,
  addVehicleFeature,
};
