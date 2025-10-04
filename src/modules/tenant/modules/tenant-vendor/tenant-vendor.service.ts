import { Tenant, User } from '@prisma/client';
import prisma from '../../../../config/prisma.config';
import { logger } from '../../../../config/logger';
import { TenantVendorDto, TenantVendorSchema } from './tenant-vendor.dto';

class TenantVendorService {
  async validateVendorData(data: any) {
    if (!data) {
      throw new Error('No data provided');
    }

    const safeParse = TenantVendorSchema.safeParse(data);
    if (!safeParse.success) {
      logger.w('Invalid vehicle data', {
        errors: safeParse.error.issues,
        data,
      });
      throw new Error('Invalid vehicle data');
    }

    return safeParse.data;
  }

  getTenantVendors = async (tenant: Tenant) => {
    try {
      const vendors = await prisma.tenantVendor.findMany({
        where: { tenantId: tenant.id },
      });
      return vendors;
    } catch (error) {
      logger.e(error, 'Error fetching tenant vendors:', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
      });
      throw new Error('Could not fetch tenant vendors');
    }
  };

  addTenantVendor = async (data: TenantVendorDto, tenant: Tenant) => {
    try {
      const existingVendor = await prisma.tenantVendor.findFirst({
        where: {
          tenantId: tenant.id,
          vendor: {
            equals: data.vendor,
            mode: 'insensitive',
          },
        },
      });

      if (existingVendor) {
        throw new Error('Vendor with this name already exists');
      }

      const newVendor = await prisma.tenantVendor.create({
        data: {
          vendor: data.vendor,
          contactName: data.contactName,
          phone: data.phone,
          email: data.email,
          tenantId: tenant.id,
          createdAt: new Date(),
        },
      });
      return newVendor;
    } catch (error) {
      logger.e(error, 'Error adding tenant vendor:', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        vendorData: data,
      });
      throw new Error('Could not add tenant vendor');
    }
  };

  updateTenantVendor = async (
    data: TenantVendorDto,
    tenant: Tenant,
    user: User,
  ) => {
    try {
      const existingVendor = await prisma.tenantVendor.findFirst({
        where: {
          id: data.id,
          tenantId: tenant.id,
        },
      });

      if (!existingVendor) {
        throw new Error('Vendor not found');
      }

      const updatedVendor = await prisma.tenantVendor.update({
        where: { id: data.id },
        data: {
          vendor: data.vendor,
          contactName: data.contactName,
          phone: data.phone,
          email: data.email,
          updatedAt: new Date(),
          updatedBy: user.username,
        },
      });
      return updatedVendor;
    } catch (error) {
      logger.e(error, 'Error updating tenant vendor:', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        vendorData: data,
      });
      throw new Error('Could not update tenant vendor');
    }
  };

  deleteTenantVendor = async (vendorId: string, tenant: Tenant, user: User) => {
    try {
      const existingVendor = await prisma.tenantVendor.findFirst({
        where: {
          id: vendorId,
          tenantId: tenant.id,
        },
      });

      if (!existingVendor) {
        throw new Error('Vendor not found');
      }

      await prisma.tenantVendor.update({
        where: { id: vendorId },
        data: {
          isDeleted: true,
          updatedBy: user.username,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.e(error, 'Error deleting tenant vendor:', {
        tenantId: tenant.id,
        tenantCode: tenant.tenantCode,
        vendorId,
      });
      throw new Error('Could not delete tenant vendor');
    }
  };
}

export const tenantVendorService = new TenantVendorService();
