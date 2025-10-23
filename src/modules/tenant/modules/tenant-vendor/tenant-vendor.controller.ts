import { Request, Response } from 'express';
import { tenantVendorService } from './tenant-vendor.service';
import { logger } from '../../../../config/logger';

const getTenantVendors = async (req: Request, res: Response) => {
  const { tenant } = req.context!;

  try {
    const vendors = await tenantVendorService.getTenantVendors(tenant);

    return res.status(200).json(vendors);
  } catch (error) {
    logger.e(error, 'Failed to get tenant vendors', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
    });
    return res.status(500).json({ message: 'Failed to get tenant vendors' });
  }
};

const addTenantVendor = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant } = req.context!;

  const vendorDto = await tenantVendorService.validateVendorData(data);

  try {
    const newVendor = await tenantVendorService.addTenantVendor(
      vendorDto,
      tenant,
    );

    const vendors = await tenantVendorService.getTenantVendors(tenant);

    return res
      .status(201)
      .json({ message: 'Vendor added successfully', vendors });
  } catch (error) {
    logger.e(error, 'Failed to add tenant vendor', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vendorData: data,
    });
    return res.status(500).json({ message: 'Failed to add tenant vendor' });
  }
};

const updateTenantVendor = async (req: Request, res: Response) => {
  const data = req.body;
  const { tenant, user } = req.context!;

  const vendorDto = await tenantVendorService.validateVendorData(data);

  try {
    await tenantVendorService.updateTenantVendor(vendorDto, tenant, user);

    const vendors = await tenantVendorService.getTenantVendors(tenant);

    return res
      .status(200)
      .json({ message: 'Vendor updated successfully', vendors });
  } catch (error) {
    logger.e(error, 'Failed to update tenant vendor', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vendorData: data,
    });
    return res.status(500).json({ message: 'Failed to update tenant vendor' });
  }
};

const deleteTenantVendor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tenant, user } = req.context!;

  try {
    await tenantVendorService.deleteTenantVendor(id, tenant, user);

    const vendors = await tenantVendorService.getTenantVendors(tenant);

    return res
      .status(200)
      .json({ message: 'Vendor deleted successfully', vendors });
  } catch (error) {
    logger.e(error, 'Failed to delete tenant vendor', {
      tenantId: tenant.id,
      tenantCode: tenant.tenantCode,
      vendorId: id,
    });
    return res.status(500).json({ message: 'Failed to delete tenant vendor' });
  }
};

export default {
  getTenantVendors,
  addTenantVendor,
  updateTenantVendor,
  deleteTenantVendor,
};
