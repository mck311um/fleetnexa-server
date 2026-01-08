/*
  Warnings:

  - You are about to drop the column `numberOfLocations` on the `PlanDetails` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfUsers` on the `PlanDetails` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfVehicles` on the `PlanDetails` table. All the data in the column will be lost.
  - Added the required column `users` to the `PlanDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicles` to the `PlanDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlanDetails" DROP COLUMN "numberOfLocations",
DROP COLUMN "numberOfUsers",
DROP COLUMN "numberOfVehicles",
ADD COLUMN     "users" INTEGER NOT NULL,
ADD COLUMN     "vehicles" INTEGER NOT NULL;
