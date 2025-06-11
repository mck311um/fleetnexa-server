-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedBy" TEXT;
