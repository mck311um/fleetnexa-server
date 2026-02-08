import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { TenantCustomerRepository } from './tenant-customer.repository.js';
import { Tenant, User } from '../../../generated/prisma/client.js';
import { TenantCustomerDto } from './tenant-customer.dto.js';

@Injectable()
export class TenantCustomerService {
  private readonly logger = new Logger(TenantCustomerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly customerRepo: TenantCustomerRepository,
  ) {}

  async getCustomers(tenant: Tenant) {
    try {
      return this.customerRepo.getCustomers(tenant.id);
    } catch (error) {
      this.logger.error(error, 'Error fetching customers', {
        tenantId: tenant.id,
      });
      throw error;
    }
  }

  async getCustomerById(id: string, tenant: Tenant) {
    try {
      return this.customerRepo.getCustomerById(id, tenant.id);
    } catch (error) {
      this.logger.error(error, 'Error fetching customer by ID', {
        tenantId: tenant.id,
        customerId: id,
      });
      throw error;
    }
  }

  async createCustomer(data: TenantCustomerDto, tenant: Tenant, user: User) {
    try {
      await this.prisma.$transaction(async (tx) => {
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
            licenseNumber: data.license.licenseNumber,
            licenseExpiry: data.license.licenseExpiry,
            licenseIssued: data.license.licenseIssued,
            image: data.license.image,
          },
        });

        if (data.address) {
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
        }
      });

      const customer = await this.getCustomerById(data.id, tenant);
      const customers = await this.getCustomers(tenant);

      return {
        message: 'Customer created successfully',
        customer,
        customers,
      };
    } catch (error) {
      this.logger.error(error, 'Error creating customer', {
        tenantId: tenant.id,
        userId: user.id,
        customerData: data,
      });
      throw error;
    }
  }

  async updateCustomer(data: TenantCustomerDto, tenant: Tenant, user: User) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const existingRecord = await tx.customer.findUnique({
          where: { id: data.id, tenantId: tenant.id },
        });

        if (!existingRecord) {
          this.logger.warn('Customer not found for update', {
            customerId: data.id,
            tenantId: tenant.id,
          });
          throw new NotFoundException('Customer not found');
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
            licenseNumber: data.license.licenseNumber,
            licenseIssued: data.license.licenseIssued,
            licenseExpiry: data.license.licenseExpiry,
            image: data.license.image,
          },
        });

        if (data.address) {
          await tx.customerAddress.upsert({
            where: { customerId: data.id },
            update: {
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
            create: {
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
        }
      });

      const customer = await this.getCustomerById(data.id, tenant);
      const customers = await this.getCustomers(tenant);

      return {
        message: 'Customer updated successfully',
        customer,
        customers,
      };
    } catch (error) {
      this.logger.error(error, 'Error updating customer', {
        tenantId: tenant.id,
        userId: user.id,
        customerData: data,
      });
      throw error;
    }
  }

  async deleteCustomer(id: string, tenant: Tenant, user: User) {
    try {
      const existingRecord = await this.prisma.customer.findUnique({
        where: { id, tenantId: tenant.id },
      });

      if (!existingRecord) {
        this.logger.warn('Customer not found for deletion', {
          customerId: id,
          tenantId: tenant.id,
        });
        throw new NotFoundException('Customer not found');
      }

      await this.prisma.customer.update({
        where: { id },
        data: {
          isDeleted: true,
          updatedBy: user.username,
          updatedAt: new Date(),
        },
      });

      const customers = await this.getCustomers(tenant);

      return {
        message: 'Customer deleted successfully',
        customers,
      };
    } catch (error) {
      this.logger.error(error, 'Error deleting customer', {
        tenantId: tenant.id,
        userId: user.id,
        customerId: id,
      });
      throw error;
    }
  }
}
