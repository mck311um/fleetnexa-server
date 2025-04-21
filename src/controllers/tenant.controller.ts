import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import paddle from "../config/paddle";

const prisma = new PrismaClient();

const getTenantById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        address: {
          include: {
            village: true,
            state: true,
            country: true,
          },
        },
        currency: true,
        invoiceSequence: true,
        paymentMethods: true,
        customers: true,
        subscription: true,
        services: {
          where: { isDeleted: false },
          include: {
            service: true,
          },
        },
        insurance: {
          where: { isDeleted: false },
        },
        equipment: {
          where: { isDeleted: false },
          include: {
            equipment: true,
          },
        },
        tenantLocations: {
          where: { isDeleted: false },
          include: {
            vehicles: true,
            address: true,
            _count: {
              select: { vehicles: true },
            },
          },
        },
        vehicleGroups: {
          include: {
            discounts: true,
            maintenanceServices: true,
          },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json(tenant);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const createTenant = async (req: Request, res: Response) => {
  const { tenantCode, tenantName, email, number, logo } = req.body;

  try {
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ tenantCode }, { email }],
      },
    });

    if (existingTenant) {
      return res
        .status(400)
        .json({ message: "Tenant with this code or email already exists" });
    }

    const tenant = await prisma.tenant.create({
      data: {
        tenantCode,
        tenantName,
        email,
        number,
        logo,
      },
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const updateTenant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenantName, email, number, logo, setupCompleted, invoiceFootNotes } =
    req.body;

  try {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        tenantName,
        email,
        number,
        logo,
        setupCompleted,
      },
    });

    res.json(tenant);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const setupTenant = async (req: Request, res: Response) => {
  const { data } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    let addressId: string | null = null;

    if (data.address) {
      const address = await prisma.address.upsert({
        where: { tenantId: data.id },
        update: {
          street: data.address.street,
          zipCode: data.address.zipCode.toString(),
          village: { connect: { id: data.address.villageId } },
          state: { connect: { id: data.address.stateId } },
          country: { connect: { id: data.address.countryId } },
        },
        create: {
          tenant: { connect: { id: data.id } },
          street: data.address.street,
          zipCode: data.address.zipCode.toString(),
          village: { connect: { id: data.address.villageId } },
          state: { connect: { id: data.address.stateId } },
          country: { connect: { id: data.address.countryId } },
        },
      });

      addressId = address.id;
    }

    await prisma.tenant.update({
      where: { id: data.id },
      data: {
        currencyId: data.currencyId,
        email: data.email,
        invoiceFootNotes: data.invoiceFootNotes,
        invoiceSequenceId: data.invoiceSequenceId,
        logo: data.logo,
        number: data.number,
        tenantName: data.tenantName,
        financialYearStart: data.financialYearStart,
        setupCompleted: true,
        securityDeposit: data.securityDeposit,
        paymentMethods: {
          set: data.paymentMethods.map((method: any) => ({ id: method.id })),
        },
      },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        address: {
          include: {
            village: true,
            state: true,
            country: true,
          },
        },
        currency: true,
        invoiceSequence: true,
        paymentMethods: true,
        customers: true,
        subscription: true,
        services: {
          where: { isDeleted: false },
          include: {
            service: true,
          },
        },
        insurance: {
          where: { isDeleted: false },
        },
        equipment: {
          where: { isDeleted: false },
          include: {
            equipment: true,
          },
        },
        tenantLocations: {
          where: { isDeleted: false },
          include: {
            vehicles: true,
            address: true,
            _count: {
              select: { vehicles: true },
            },
          },
        },
        vehicleGroups: {
          include: {
            discounts: true,
            maintenanceServices: true,
          },
        },
      },
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// #region Tenant Location
const getTenantLocations = async (req: Request, res: Response) => {
  const { tenantId } = req.params;

  try {
    const tenantLocations = await prisma.tenantLocation.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        vehicles: true,
        address: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    res.json(tenantLocations);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
const createTenantLocation = async (req: Request, res: Response) => {
  const { location } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    if (location.address) {
      await prisma.tenantLocationAddress.create({
        data: {
          id: location.address.id,
          street: location.address.street,
          villageId: location.address.villageId,
          stateId: location.address.stateId,
          countryId: location.address.countryId,
        },
      });
    }

    await prisma.tenantLocation.create({
      data: {
        id: location.id,
        location: location.location,
        addressId: location.address.id,
        tenantId: tenantId ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
        pickupEnabled: location.pickupEnabled ?? false,
        returnEnabled: location.returnEnabled ?? false,
        deliveryFee: location.deliveryFee ?? 0,
        collectionFee: location.collectionFee ?? 0,
        locationTypeId: location.locationTypeId ?? "",
        isActive: location.isActive ?? true,
      },
    });

    const tenantLocations = await prisma.tenantLocation.findMany({
      where: { tenantId: tenantId, isDeleted: false },
      include: {
        address: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    res.status(201).json({ ...tenantLocations });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error Adding Location" });
  }
};
const updateTenantLocation = async (req: Request, res: Response) => {
  const { location } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    if (location.address) {
      await prisma.tenantLocationAddress.update({
        where: { id: location.address.id },
        data: {
          street: location.address.street,
          villageId: location.address.villageId,
          stateId: location.address.stateId,
          countryId: location.address.countryId,
        },
      });
    }

    await prisma.tenantLocation.update({
      where: { id: location.id },
      data: {
        location: location.location,
        addressId: location.address.id,
        tenantId: tenantId ?? "",
        updatedAt: new Date(),
        updatedBy: userId,
        pickupEnabled: location.pickupEnabled ?? false,
        returnEnabled: location.returnEnabled ?? false,
        deliveryFee: location.deliveryFee ?? 0,
        collectionFee: location.collectionFee ?? 0,
        isActive: location.isActive ?? true,
      },
    });

    const tenantLocations = await prisma.tenantLocation.findMany({
      where: { tenantId: tenantId, isDeleted: false },
      include: {
        address: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    res.status(201).json({ ...tenantLocations });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error Updating Location" });
  }
};
const deleteTenantLocation = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantLocation.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantLocations = await prisma.tenantLocation.findMany({
      where: { tenantId: tenantId, isDeleted: false },
      include: {
        address: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    res.status(200).json({ ...tenantLocations });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error deleting tenant location" });
  }
};
// #endregion

// #region Tenant Services
const getServices = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;
  try {
    const tenantServices = await prisma.tenantService.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        service: true,
      },
    });

    res.status(200).json(tenantServices);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tenant services" });
  }
};
const addService = async (req: Request, res: Response) => {
  const { service } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.tenantService.create({
      data: {
        id: service.id,
        serviceId: service.serviceId,
        tenantId: tenantId!,
        pricePolicy: service.pricePolicy,
        price: service.price,
        isActive: service.isActive ?? true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantServices = await prisma.tenantService.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json({ ...tenantServices });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error Adding Service" });
  }
};
const updateService = async (req: Request, res: Response) => {
  const { service } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantService.update({
      where: { id: service.id },
      data: {
        price: service.price,
        pricePolicy: service.pricePolicy,
        isActive: service.isActive ?? true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantServices = await prisma.tenantService.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json({ ...tenantServices });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error Updating Service" });
  }
};
const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.tenantService.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantServices = await prisma.tenantService.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json({ ...tenantServices });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error deleting tenant service" });
  }
};
// #endregion

// #region Tenant Equipment
const getEquipment = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const tenantEquipments = await prisma.tenantEquipment.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        equipment: true,
      },
    });

    res.status(200).json(tenantEquipments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tenant equipments" });
  }
};
const addEquipment = async (req: Request, res: Response) => {
  const { equipment } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantEquipment.create({
      data: {
        id: equipment.id,
        equipmentId: equipment.equipmentId,
        tenantId: tenantId!,
        pricePolicy: equipment.pricePolicy,
        isActive: equipment.isActive ?? true,
        price: equipment.price,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantEquipments = await prisma.tenantEquipment.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        equipment: true,
      },
    });

    res.status(201).json({ ...tenantEquipments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding equipment" });
  }
};
const updateEquipment = async (req: Request, res: Response) => {
  const { equipment } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    const existingEquipment = await prisma.tenantEquipment.findUnique({
      where: { id: equipment.id },
    });

    if (!existingEquipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    await prisma.tenantEquipment.update({
      where: { id: equipment.id },
      data: {
        pricePolicy: equipment.pricePolicy,
        isActive: equipment.isActive ?? true,
        price: equipment.price,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantEquipments = await prisma.tenantEquipment.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        equipment: true,
      },
    });

    res.status(200).json({ ...tenantEquipments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating equipment" });
  }
};
const deleteEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    await prisma.tenantEquipment.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantEquipments = await prisma.tenantEquipment.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        equipment: true,
      },
    });

    res.status(200).json({ ...tenantEquipments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting tenant equipment" });
  }
};
// #endregion

// #region Tenant Insurance
const getInsurance = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const tenantInsurances = await prisma.tenantInsurance.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json(tenantInsurances);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tenant insurances" });
  }
};
const addInsurance = async (req: Request, res: Response) => {
  const { insurance } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantInsurance.create({
      data: {
        id: insurance.id,
        insurance: insurance.insurance,
        description: insurance.description,
        tenantId: tenantId!,
        pricePolicy: insurance.pricePolicy,
        isActive: insurance.isActive ?? true,
        price: insurance.price,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantInsurances = await prisma.tenantInsurance.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(201).json({ ...tenantInsurances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding insurance" });
  }
};
const updateInsurance = async (req: Request, res: Response) => {
  const { insurance } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantInsurance.update({
      where: { id: insurance.id },
      data: {
        pricePolicy: insurance.pricePolicy,
        isActive: insurance.isActive ?? true,
        price: insurance.price,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantInsurances = await prisma.tenantInsurance.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json({ ...tenantInsurances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating insurance" });
  }
};
const deleteInsurance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.tenantInsurance.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    const tenantInsurances = await prisma.tenantInsurance.findMany({
      where: { tenantId, isDeleted: false },
    });

    res.status(200).json({ ...tenantInsurances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting tenant insurance" });
  }
};
// #endregion

export default {
  getTenantById,
  createTenant,
  updateTenant,
  setupTenant,
  getTenantLocations,
  createTenantLocation,
  updateTenantLocation,
  deleteTenantLocation,
  getServices,
  addService,
  updateService,
  deleteService,
  getInsurance,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipment,
  addInsurance,
  updateInsurance,
  deleteInsurance,
};
