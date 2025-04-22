/*
  Warnings:

  - You are about to drop the column `endDate` on the `TenantSubscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantSubscription" DROP COLUMN "endDate",
ADD COLUMN     "endDaodte" TIMESTAMP(3);
