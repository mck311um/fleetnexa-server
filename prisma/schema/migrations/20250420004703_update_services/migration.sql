/*
  Warnings:

  - You are about to drop the column `endDte` on the `TenantSubscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantSubscription" DROP COLUMN "endDte",
ADD COLUMN     "endDate" TIMESTAMP(3);
