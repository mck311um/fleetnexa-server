-- DropForeignKey
ALTER TABLE "SecurityDeposit" DROP CONSTRAINT "SecurityDeposit_updatedBy_fkey";

-- AlterTable
ALTER TABLE "SecurityDeposit" ALTER COLUMN "updatedBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
