"use strict";
// import { PrismaClient } from "@prisma/client";
// import cron from "node-cron";
// import loggerConfig from "../config/logger.config";
// const prisma = new PrismaClient();
// cron.schedule("* * * * *", async () => {
//   console.log("Running maintenance cron job...");
//   try {
//     const vehicleGroups = await prisma.vehicleGroup.findMany({
//       where: { maintenanceEnabled: true, isDeleted: false },
//       include: {
//         maintenanceServices: {
//           include: {
//             maintenanceService: true,
//           },
//         },
//         vehicles: {
//           where: { isDeleted: false },
//         },
//       },
//     });
//     for (const group of vehicleGroups) {
//       for (const vehicle of group.vehicles) {
//         for (const maintenanceService of group.maintenanceServices) {
//           await scheduleVehicleMaintenance(
//             vehicle,
//             group,
//             maintenanceService.period,
//             maintenanceService.id,
//             maintenanceService.maintenanceService
//           );
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error running maintenance cron job:", error);
//   } finally {
//     console.log("Maintenance cron job completed.");
//   }
// });
// const scheduleVehicleMaintenance = async (
//   vehicle: any,
//   group: any,
//   period: number,
//   groupMaintenanceId: string,
//   maintenanceService: any
// ) => {
//   await prisma.$transaction(async (tx) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const cutoffDate = new Date();
//     cutoffDate.setDate(today.getDate() + 180);
//     cutoffDate.setHours(23, 59, 59, 999);
//     await tx.vehicleServiceSchedule.deleteMany({
//       where: {
//         vehicleId: vehicle.id,
//         serviceId: maintenanceService.id,
//         isCompleted: false,
//         isManual: false,
//         scheduledDate: {
//           gte: today,
//         },
//       },
//     });
//     const lastCompleted = await tx.vehicleServiceSchedule.findFirst({
//       where: {
//         vehicleId: vehicle.id,
//         serviceId: maintenanceService.id,
//         isCompleted: true,
//       },
//       orderBy: { scheduledDate: "desc" },
//     });
//     const baseDate = lastCompleted
//       ? new Date(lastCompleted.scheduledDate)
//       : new Date(vehicle.createdAt);
//     const nextDueDate = new Date(baseDate);
//     nextDueDate.setDate(nextDueDate.getDate() + period);
//     nextDueDate.setHours(10, 0, 0, 0);
//     if (nextDueDate <= cutoffDate) {
//       await tx.vehicleServiceSchedule.create({
//         data: {
//           vehicleId: vehicle.id,
//           serviceId: maintenanceService.id,
//           scheduledDate: nextDueDate,
//           isCompleted: false,
//           groupMaintenanceId,
//           isManual: false,
//         },
//       });
//     }
//   });
// };
