"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tenant_vendor_service_1 = require("./tenant-vendor.service");
const logger_1 = require("../../../../config/logger");
const getTenantVendors = async (req, res) => {
    const { tenant } = req.context;
    try {
        const vendors = await tenant_vendor_service_1.tenantVendorService.getTenantVendors(tenant);
        return res.status(200).json(vendors);
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to get tenant vendors', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
        });
        return res.status(500).json({ message: 'Failed to get tenant vendors' });
    }
};
const addTenantVendor = async (req, res) => {
    const data = req.body;
    const { tenant } = req.context;
    const vendorDto = await tenant_vendor_service_1.tenantVendorService.validateVendorData(data);
    try {
        const newVendor = await tenant_vendor_service_1.tenantVendorService.addTenantVendor(vendorDto, tenant);
        const vendors = await tenant_vendor_service_1.tenantVendorService.getTenantVendors(tenant);
        return res
            .status(201)
            .json({ message: 'Vendor added successfully', vendors });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to add tenant vendor', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            vendorData: data,
        });
        return res.status(500).json({ message: 'Failed to add tenant vendor' });
    }
};
const updateTenantVendor = async (req, res) => {
    const data = req.body;
    const { tenant, user } = req.context;
    const vendorDto = await tenant_vendor_service_1.tenantVendorService.validateVendorData(data);
    try {
        await tenant_vendor_service_1.tenantVendorService.updateTenantVendor(vendorDto, tenant, user);
        const vendors = await tenant_vendor_service_1.tenantVendorService.getTenantVendors(tenant);
        return res
            .status(200)
            .json({ message: 'Vendor updated successfully', vendors });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to update tenant vendor', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            vendorData: data,
        });
        return res.status(500).json({ message: 'Failed to update tenant vendor' });
    }
};
const deleteTenantVendor = async (req, res) => {
    const { id } = req.params;
    const { tenant, user } = req.context;
    try {
        await tenant_vendor_service_1.tenantVendorService.deleteTenantVendor(id, tenant, user);
        const vendors = await tenant_vendor_service_1.tenantVendorService.getTenantVendors(tenant);
        return res
            .status(200)
            .json({ message: 'Vendor deleted successfully', vendors });
    }
    catch (error) {
        logger_1.logger.e(error, 'Failed to delete tenant vendor', {
            tenantId: tenant.id,
            tenantCode: tenant.tenantCode,
            vendorId: id,
        });
        return res.status(500).json({ message: 'Failed to delete tenant vendor' });
    }
};
exports.default = {
    getTenantVendors,
    addTenantVendor,
    updateTenantVendor,
    deleteTenantVendor,
};
