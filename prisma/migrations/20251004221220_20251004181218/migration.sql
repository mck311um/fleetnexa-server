-- AlterTable
ALTER TABLE "public"."TenantVendor" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT;
