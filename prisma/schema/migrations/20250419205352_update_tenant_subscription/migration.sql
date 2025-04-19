/*
  Warnings:

  - You are about to drop the column `endDaodte` on the `TenantSubscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantSubscription" DROP COLUMN "endDaodte",
ADD COLUMN     "endDate" TIMESTAMP(3);
