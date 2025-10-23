"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantVendorService = void 0;
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
const logger_1 = require("../../../../config/logger");
const tenant_vendor_dto_1 = require("./tenant-vendor.dto");
class TenantVendorService {
    constructor() {
        this.getTenantVendors = async (tenant) => {
            try {
                const vendors = await prisma_config_1.default.tenantVendor.findMany({
                    where: { tenantId: tenant.id },
                });
                return vendors;
            }
            catch (error) {
                logger_1.logger.e(error, 'Error fetching tenant vendors:', {
                    tenantId: tenant.id,
                    tenantCode: tenant.tenantCode,
                });
                throw new Error('Could not fetch tenant vendors');
            }
        };
        this.addTenantVendor = async (data, tenant) => {
            try {
                const existingVendor = await prisma_config_1.default.tenantVendor.findFirst({
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
                const newVendor = await prisma_config_1.default.tenantVendor.create({
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
            }
            catch (error) {
                logger_1.logger.e(error, 'Error adding tenant vendor:', {
                    tenantId: tenant.id,
                    tenantCode: tenant.tenantCode,
                    vendorData: data,
                });
                throw new Error('Could not add tenant vendor');
            }
        };
        this.updateTenantVendor = async (data, tenant, user) => {
            try {
                const existingVendor = await prisma_config_1.default.tenantVendor.findFirst({
                    where: {
                        id: data.id,
                        tenantId: tenant.id,
                    },
                });
                if (!existingVendor) {
                    throw new Error('Vendor not found');
                }
                const updatedVendor = await prisma_config_1.default.tenantVendor.update({
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
            }
            catch (error) {
                logger_1.logger.e(error, 'Error updating tenant vendor:', {
                    tenantId: tenant.id,
                    tenantCode: tenant.tenantCode,
                    vendorData: data,
                });
                throw new Error('Could not update tenant vendor');
            }
        };
        this.deleteTenantVendor = async (vendorId, tenant, user) => {
            try {
                const existingVendor = await prisma_config_1.default.tenantVendor.findFirst({
                    where: {
                        id: vendorId,
                        tenantId: tenant.id,
                    },
                });
                if (!existingVendor) {
                    throw new Error('Vendor not found');
                }
                await prisma_config_1.default.tenantVendor.update({
                    where: { id: vendorId },
                    data: {
                        isDeleted: true,
                        updatedBy: user.username,
                        updatedAt: new Date(),
                    },
                });
            }
            catch (error) {
                logger_1.logger.e(error, 'Error deleting tenant vendor:', {
                    tenantId: tenant.id,
                    tenantCode: tenant.tenantCode,
                    vendorId,
                });
                throw new Error('Could not delete tenant vendor');
            }
        };
    }
    async validateVendorData(data) {
        if (!data) {
            throw new Error('No data provided');
        }
        const safeParse = tenant_vendor_dto_1.TenantVendorSchema.safeParse(data);
        if (!safeParse.success) {
            logger_1.logger.w('Invalid vehicle data', {
                errors: safeParse.error.issues,
                data,
            });
            throw new Error('Invalid vehicle data');
        }
        return safeParse.data;
    }
}
exports.tenantVendorService = new TenantVendorService();
