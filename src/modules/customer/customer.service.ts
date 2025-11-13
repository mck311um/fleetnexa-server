import { Tenant, User } from '@prisma/client';
import { logger } from '../../config/logger';
import prisma, { TxClient } from '../../config/prisma.config';
import { customerRepo } from './customer.repository';
import {
  StorefrontCustomerDto,
  StorefrontGuestBookingDto,
} from '../booking/booking.dto';
import { CustomerDto, CustomerSchema } from './customer.dto';

class CustomerService {
  async validateCustomerData(data: any) {
    if (!data) {
      logger.e('Invalid customer data', 'Customer validation failed');
    }

    const safeParse = CustomerSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid customer data', {
        errors: safeParse.error.issues,
        input: data,
      });
      throw new Error('Invalid customer data');
    }

    return safeParse.data;
  }

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

  async getCustomerById(id: string, tenant: Tenant) {
    try {
      const customer = await customerRepo.getCustomerById(id, tenant.id);

      return customer;
    } catch (error) {
      logger.e(error, 'Failed to get customer by ID', {
        customerId: id,
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Failed to get customer by ID');
    }
  }

  async createCustomer(data: CustomerDto, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.customer.create({
          data: {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            gender: data.gender || 'UNSPECIFIED',
            dateOfBirth: data.dateOfBirth,
            email: data.email,
            phone: data.phone || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: user.username,
            profileImage: data.profileImage,
            tenantId: tenant.id,
            status: data.status,
          },
        });

        await tx.driverLicense.create({
          data: {
            customerId: data.id,
            licenseNumber: data.driversLicense.licenseNumber,
            licenseExpiry: data.driversLicense.licenseExpiry,
            licenseIssued: data.driversLicense.licenseIssued,
          },
        });

        await tx.customerAddress.create({
          data: {
            customer: { connect: { id: data.id } },
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

        return await tx.customer.findUnique({
          where: { id: data.id },
        });
      });

      const customer = await this.getCustomerById(data.id, tenant);
      return customer;
    } catch (error) {
      logger.e(error, 'Failed to create customer', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
    }
  }

  async updateCustomer(data: CustomerDto, tenant: Tenant, user: User) {
    try {
      await prisma.$transaction(async (tx) => {
        const existingCustomer = await tx.customer.findUnique({
          where: { id: data.id, tenantId: tenant.id },
        });

        if (!existingCustomer) {
          logger.w('Customer not found for update', {
            customerId: data.id,
            tenantId: tenant.id,
          });
          throw new Error('Customer not found');
        }

        await tx.customer.update({
          where: { id: data.id },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            gender: data.gender,
            dateOfBirth: data.dateOfBirth,
            email: data.email,
            phone: data.phone,
            updatedBy: user.username,
            updatedAt: new Date(),
            profileImage: data.profileImage,
            status: data.status,
          },
        });

        await tx.driverLicense.update({
          where: { customerId: data.id },
          data: {
            licenseNumber: data.driversLicense.licenseNumber,
            licenseIssued: data.driversLicense.licenseIssued,
            licenseExpiry: data.driversLicense.licenseExpiry,
            image: data.driversLicense.image,
          },
        });

        await tx.customerAddress.update({
          where: { customerId: data.id },
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
      });

      const updatedCustomer = await this.getCustomerById(data.id, tenant);
      return updatedCustomer;
    } catch (error) {
      logger.e(error, 'Failed to update customer', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        data,
      });
      throw error;
    }
  }

  async deleteCustomer(id: string, tenant: Tenant, user: User) {
    try {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id, tenantId: tenant.id },
      });

      if (!existingCustomer) {
        logger.w('Customer not found for deletion', {
          customerId: id,
          tenantId: tenant.id,
        });
        throw new Error('Customer not found');
      }

      await prisma.customer.update({
        where: { id },
        data: {
          isDeleted: true,
          updatedBy: user.username,
          updatedAt: new Date(),
        },
      });

      return { message: 'Customer deleted successfully' };
    } catch (error) {
      logger.e(error, 'Failed to delete customer', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        customerId: id,
      });
      throw error;
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

export default {
  getPrimaryDriver,
};
