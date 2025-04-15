-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "islandWideDelivery" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "storefrontEnabled" BOOLEAN NOT NULL DEFAULT true;
