import { Tenant } from '@prisma/client';
import { logger } from '../../config/logger';
import prisma, { TxClient } from '../../config/prisma.config';
import { CustomerViolationDto } from './customer.dto';
import { customerRepo } from './customer.repository';
import {
  StorefrontCustomerDto,
  StorefrontGuestBookingDto,
} from '../booking/booking.dto';

class CustomerService {
  async getTenantCustomers(tenant: Tenant) {
    try {
      const customers = customerRepo.getCustomers(tenant.id);

      return customers;
    } catch (error) {
      logger.e(error, 'Failed to get customers', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to get customers');
    }
  }

  async getStorefrontCustomer(
    data: StorefrontCustomerDto,
    tenant: Tenant,
    tx: TxClient,
  ) {
    try {
      const existingCustomer = await tx.customer.findFirst({
        where: {
          tenantId: tenant.id,
          license: {
            licenseNumber: data.driverLicenseNumber,
          },
        },
      });

      if (existingCustomer) {
        // await tx.customer.update({
        //   where: { id: existingCustomer.id },
        //   data: {
        //     firstName: data.firstName,
        //     lastName: data.lastName,
        //     gender: data.gender,
        //     dateOfBirth: data.dateOfBirth,
        //     email: data.email,
        //     phone: data.phone,
        //     createdAt: new Date(),
        //     updatedAt: new Date(),
        //     tenantId: tenant.id,
        //   },
        // });

        await tx.driverLicense.update({
          where: { customerId: existingCustomer.id },
          data: {
            licenseExpiry: data.licenseExpiry,
            licenseIssued: data.licenseIssued,
          },
        });

        await tx.customerAddress.update({
          where: { customerId: existingCustomer.id },
          data: {
            street: data.address.street,
            village: data.address.villageId
              ? { connect: { id: data.address.villageId } }
              : undefined,
            state: data.address.stateId
              ? { connect: { id: data.address.stateId } }
              : undefined,
            country: data.address.countryId
              ? { connect: { id: data.address.countryId } }
              : undefined,
          },
        });

        return existingCustomer;
      } else {
        const customer = await tx.customer.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            gender: data.gender || 'UNSPECIFIED',
            dateOfBirth: data.dateOfBirth,
            email: data.email,
            phone: data.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
            tenantId: tenant.id,
            status: 'ACTIVE',
          },
        });

        await tx.driverLicense.create({
          data: {
            customerId: customer.id,
            licenseNumber: data.driverLicenseNumber,
            licenseExpiry: data.licenseExpiry,
            licenseIssued: data.licenseIssued,
          },
        });

        await tx.customerAddress.create({
          data: {
            customer: { connect: { id: customer.id } },
            street: data.address.street,
            village: data.address.villageId
              ? { connect: { id: data.address.villageId } }
              : undefined,
            state: data.address.stateId
              ? { connect: { id: data.address.stateId } }
              : undefined,
            country: data.address.countryId
              ? { connect: { id: data.address.countryId } }
              : undefined,
          },
        });

        return customer;
      }
    } catch (error) {
      logger.e(error, 'Failed to get storefront customer', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to get storefront customer');
    }
  }

  async getPrimaryDriver(bookingId: string) {
    try {
      const driver = await prisma.rentalDriver.findFirst({
        where: {
          rentalId: bookingId,
          isPrimary: true,
        },
        include: {
          customer: {
            include: {
              address: {
                include: {
                  country: true,
                  state: true,
                  village: true,
                },
              },
            },
          },
        },
      });

      if (!driver) {
        throw new Error('Primary driver not found');
      }

      return driver;
    } catch (error) {
      logger.e(error, 'Error fetching primary driver', { bookingId });
      throw error;
    }
  }
}

export const customerService = new CustomerService();

const getPrimaryDriver = async (bookingId: string) => {
  try {
    const driver = await prisma.rentalDriver.findFirst({
      where: {
        rentalId: bookingId,
        isPrimary: true,
      },
      include: {
        customer: {
          include: {
            address: {
              include: {
                country: true,
                state: true,
                village: true,
              },
            },
          },
        },
      },
    });

    if (!driver) {
      throw new Error('Primary driver not found');
    }

    return driver;
  } catch (error) {
    logger.e(error, 'Error fetching primary driver', { bookingId });
    throw error;
  }
};

const addCustomerViolation = async (
  data: CustomerViolationDto,
  tenant: Tenant,
) => {
  try {
    const violations = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: data.customerId, tenantId: tenant.id },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      await tx.customerViolation.create({
        data: {
          id: data.id,
          customerId: data.customerId,
          tenantId: tenant.id,
          violationId: data.violationId,
          violationDate: data.violationDate,
          notes: data.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return await tx.customerViolation.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
        include: {
          violation: true,
          customer: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });

    return violations;
  } catch (error) {
    logger.e(error, 'Error adding customer violation', {
      data,
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
  }
};
const updateCustomerViolation = async (
  data: CustomerViolationDto,
  tenant: Tenant,
) => {
  try {
    const violations = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: data.customerId, tenantId: tenant.id },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const existingViolation = await tx.customerViolation.findUnique({
        where: { id: data.id, tenantId: tenant.id },
      });

      if (!existingViolation) {
        throw new Error('Customer violation not found');
      }

      await tx.customerViolation.update({
        where: { id: data.id, tenantId: tenant.id },
        data: {
          violationId: data.violationId,
          violationDate: data.violationDate,
          notes: data.notes,
          updatedAt: new Date(),
        },
      });

      return await tx.customerViolation.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
        include: {
          violation: true,
          customer: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });

    return violations;
  } catch (error) {
    logger.e(error, 'Error updating customer violation', {
      data,
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
  }
};
const deleteCustomerViolation = async (violationId: string, tenant: Tenant) => {
  try {
    const violations = await prisma.$transaction(async (tx) => {
      const existingViolation = await tx.customerViolation.findUnique({
        where: { id: violationId, tenantId: tenant.id },
      });

      if (!existingViolation) {
        throw new Error('Customer violation not found');
      }

      await tx.customerViolation.update({
        where: { id: violationId, tenantId: tenant.id },
        data: { isDeleted: true, updatedAt: new Date() },
      });

      return await tx.customerViolation.findMany({
        where: { tenantId: tenant.id, isDeleted: false },
        include: {
          violation: true,
          customer: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });

    return violations;
  } catch (error) {
    logger.e(error, 'Error deleting customer violation', {
      violationId,
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
  }
};

export default {
  getPrimaryDriver,
  addCustomerViolation,
  updateCustomerViolation,
  deleteCustomerViolation,
};
