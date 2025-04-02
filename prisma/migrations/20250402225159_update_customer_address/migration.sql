-- DropIndex
DROP INDEX "Customer_email_key";

-- DropIndex
DROP INDEX "Customer_phone_key";

-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "email" DROP NOT NULL;
