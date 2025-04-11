-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE';
