/*
  Warnings:

  - Made the column `tenantId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `roleId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedBy" TEXT,
ALTER COLUMN "tenantId" SET NOT NULL,
ALTER COLUMN "roleId" SET NOT NULL;
