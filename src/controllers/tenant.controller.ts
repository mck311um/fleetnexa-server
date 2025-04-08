import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getTenantById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        address: true,
        currency: true,
        invoiceSequence: true,
        paymentMethods: true,
        customers: true,
        tenantServices: true,
        tenantLocations: {
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
        paymentMethods: {
          set: data.paymentMethods.map((method: any) => ({ id: method.id })),
        },
      },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        address: true,
        currency: true,
        invoiceSequence: true,
        paymentMethods: true,
        vehicleGroups: {
          include: {
            discounts: true,
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
      where: { tenantId },
      include: {
        vehicles: true,
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
    });

    res.status(200).json({ ...tenantLocations });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Error deleting tenant location" });
  }
};
// #endregion

// #region Tenant Services
const getTenantServices = async (req: Request, res: Response) => {
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
const createTenantService = async (req: Request, res: Response) => {
  const { service } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;
  try {
    const tenantService = await prisma.tenantService.create({
      data: {
        id: service.id,
        serviceId: service.serviceId,
        tenantId: tenantId ?? "",
        amount: service.amount,
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
const updateTenantService = async (req: Request, res: Response) => {
  const { service } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    const tenantService = await prisma.tenantService.update({
      where: { id: service.id },
      data: {
        amount: service.amount,
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
const deleteTenantService = async (req: Request, res: Response) => {
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

export default {
  getTenantById,
  createTenant,
  updateTenant,
  setupTenant,
  getTenantLocations,
  createTenantLocation,
  updateTenantLocation,
  deleteTenantLocation,
  getTenantServices,
  createTenantService,
  updateTenantService,
  deleteTenantService,
};
