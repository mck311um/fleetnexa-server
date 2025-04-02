import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const upsertCustomer = async (req: Request, res: Response) => {
  const { customer } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        gender: customer.gender,
        dateOfBirth: customer.dateOfBirth,
        email: customer.email,
        phone: customer.phone,
        updatedBy: userId,
        updatedAt: new Date(),
        profileImage: customer.profileImage,
      },
      create: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        gender: customer.gender,
        dateOfBirth: customer.dateOfBirth,
        email: customer.email,
        phone: customer.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
        profileImage: customer.profileImage,
        tenantId: tenantId!,
      },
    });

    const address = await prisma.customerAddress.upsert({
      where: { customerId: customer.id },
      update: {
        street: customer.address.street,
        zipCode: customer.address.zipCode
          ? customer.address.zipCode.toString()
          : null,
        village: customer.address.villageId
          ? { connect: { id: customer.address.villageId } }
          : undefined,
        state: customer.address.stateId
          ? { connect: { id: customer.address.stateId } }
          : undefined,
        country: customer.address.countryId
          ? { connect: { id: customer.address.countryId } }
          : undefined,
      },
      create: {
        customer: { connect: { id: customer.id } },
        street: customer.address.street,
        zipCode: customer.address.zipCode
          ? customer.address.zipCode.toString()
          : null,
        village: customer.address.villageId
          ? { connect: { id: customer.address.villageId } }
          : undefined,
        state: customer.address.stateId
          ? { connect: { id: customer.address.stateId } }
          : undefined,
        country: customer.address.countryId
          ? { connect: { id: customer.address.countryId } }
          : undefined,
      },
    });

    const customers = await prisma.customer.findMany({
      where: {
        tenantId: tenantId,
      },
      include: {
        address: true,
        documents: true,
      },
    });

    res.status(200).json({ ...customers });
  } catch (error) {
    console.error("Error inserting/updating customer:", error);
    res.status(500).json({ error: "Failed to upsert customer" });
  }
};

const addCustomerDocument = async (req: Request, res: Response) => {
  const { customerDocument } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.customerDocument.create({
      data: {
        id: customerDocument.id,
        documentId: customerDocument.documentId,
        customerId: customerDocument.customerId,
        documentNumber: customerDocument.documentNumber,
        issuedDate: customerDocument.issuedDate,
        expiryDate: customerDocument.expiryDate,
        documents: customerDocument.documentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
        notes: customerDocument.notes,
      },
    });
  } catch (error) {}
};

export default {
  upsertCustomer,
  addCustomerDocument,
};
