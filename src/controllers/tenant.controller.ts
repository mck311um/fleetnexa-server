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
        vehicleGroups: {
          include: {
            discounts: true,
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

export default { getTenantById, createTenant, updateTenant, setupTenant };
