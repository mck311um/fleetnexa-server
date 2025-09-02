import { logger } from "../../config/logger";
import { TxClient } from "../../config/prisma.config";
import { repo } from "./tenant.repository";

const getTenantById = async (tenantId: string, tx: TxClient) => {
  try {
    return await repo.getTenantById(tenantId, tx);
  } catch (error) {
    logger.e(error, "Failed to get tenant by ID", {
      tenantId,
    });
    throw new Error("Failed to get tenant by ID");
  }
};

const getTenantExtras = async (tenantId: string, tx: TxClient) => {
  try {
    const [tenantServices, tenantEquipments, tenantInsurances] =
      await Promise.all([
        tx.tenantService.findMany({
          where: { tenantId: tenantId, isDeleted: false },
          include: { service: true },
        }),
        tx.tenantEquipment.findMany({
          where: { tenantId: tenantId, isDeleted: false },
          include: { equipment: true },
        }),
        tx.tenantInsurance.findMany({
          where: { tenantId: tenantId, isDeleted: false },
        }),
      ]);

    const combined: any[] = [
      ...tenantServices.map((item) => ({
        ...item,
        type: "Service",
        name: item.service.service,
        icon: item.service.icon,
        description: item.service.description,
      })),
      ...tenantInsurances.map((item) => ({
        ...item,
        type: "Insurance",
        name: item.insurance,
        icon: "FaShieldAlt",
        description: item.description,
      })),
      ...tenantEquipments.map((item) => ({
        ...item,
        type: "Equipment",
        name: item.equipment.equipment,
        icon: item.equipment.icon,
        description: item.equipment.description,
      })),
    ];

    return combined;
  } catch (error) {
    logger.e(error, "Failed to get tenant extras", {
      tenantId,
    });
    throw new Error("Failed to get tenant extras");
  }
};

export default {
  getTenantById,
  getTenantExtras,
};
