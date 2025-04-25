import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { customerService } from "../service/customer.service";

const prisma = new PrismaClient();

const getCustomers = async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  try {
    const customers = await customerService.getCustomers(tenantId!);
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};
const getCustomerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const customer = await customerService.getCustomerById(
      id,
      req.user?.tenantId!
    );

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};
const addCustomer = async (req: Request, res: Response) => {
  const { customer } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.customer.create({
        data: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          gender: customer.gender,
          dateOfBirth: customer.dateOfBirth,
          email: customer.email,
          phone: customer.phone,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: userId,
          profileImage: customer.profileImage,
          tenantId: tenantId!,
          status: customer.status,
        },
      });

      await tx.driverLicense.create({
        data: {
          id: customer.license.id,
          classId: customer.license.classId,
          countryId: customer.license.countryId,
          customerId: customer.id,
          licenseNumber: customer.license.licenseNumber,
          licenseIssued: customer.license.licenseIssued,
          licenseExpiry: customer.license.licenseExpiry,
          image: customer.license.image,
        },
      });

      await tx.customerAddress.create({
        data: {
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

      if (customer.apps && customer.apps.length > 0) {
        await tx.customerMessengerApp.createMany({
          data: customer.apps.map((app: any) => ({
            id: app.id,
            customerId: customer.id,
            appId: app.appId,
            account: app.account,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        });
      }
    });

    const customers = await customerService.getCustomers(tenantId!);
    res.status(201).json(customers);
  } catch (error) {
    console.error("Error inserting customer:", error);
    res.status(500).json({ error: "Failed to add customer" });
  }
};
const updateCustomer = async (req: Request, res: Response) => {
  const { customer } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customer.id },
        data: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          gender: customer.gender,
          dateOfBirth: customer.dateOfBirth,
          email: customer.email,
          phone: customer.phone,
          updatedBy: userId,
          updatedAt: new Date(),
          profileImage: customer.profileImage,
          status: customer.status,
        },
      });

      await tx.driverLicense.update({
        where: { customerId: customer.id },
        data: {
          classId: customer.license.classId,
          countryId: customer.license.countryId,
          licenseNumber: customer.license.licenseNumber,
          licenseIssued: customer.license.licenseIssued,
          licenseExpiry: customer.license.licenseExpiry,
          image: customer.license.image,
        },
      });

      await tx.customerAddress.update({
        where: { customerId: customer.id },
        data: {
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

      if (customer.apps && customer.apps.length > 0) {
        await tx.customerMessengerApp.deleteMany({
          where: { customerId: customer.id },
        });

        await tx.customerMessengerApp.createMany({
          data: customer.apps.map((app: any) => ({
            id: app.id,
            customerId: customer.id,
            appId: app.appId,
            account: app.account,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        });
      }
    });

    const customers = await customerService.getCustomers(tenantId!);
    res.status(201).json(customers);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
};
const deleteCustomer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.customer.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });

    const customers = await customerService.getCustomers(tenantId!);
    res.status(201).json(customers);
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Failed to delete customer" });
  }
};

// #region Customer Document
const addCustomerDocument = async (req: Request, res: Response) => {
  const { document } = req.body;
  const userId = req.user?.id;
  const tenantId = req.user?.tenantId;

  try {
    await prisma.customerDocument.create({
      data: {
        id: document.id,
        documentId: document.documentId,
        customerId: document.customerId,
        documentNumber: document.documentNumber,
        issuedDate: document.issuedDate,
        expiryDate: document.expiryDate,
        documents: document.documents,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
        notes: document.notes,
      },
    });

    const documents = await prisma.customerDocument.findMany({
      where: {
        customerId: document.customerId,
      },
    });

    res.status(201).json(documents);
  } catch (error) {
    console.error("Error inserting customer document:", error);
    res.status(500).json({ error: "Failed to add customer document" });
  }
};

export default {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerDocument,
};
