"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantActivityService = void 0;
const prisma_config_1 = __importDefault(require("../../../../config/prisma.config"));
class TenantActivityService {
    async getTenantActivities(tenant) {
        try {
            const activities = await prisma_config_1.default.rentalActivity.findMany({
                where: { tenantId: tenant.id },
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    vehicle: {
                        select: {
                            brand: true,
                            model: true,
                        },
                    },
                    customer: true,
                },
            });
            return activities;
        }
        catch (error) {
            console.error('Error fetching tenant activities:', error);
            throw new Error('Failed to fetch tenant activities');
        }
    }
}
exports.tenantActivityService = new TenantActivityService();
