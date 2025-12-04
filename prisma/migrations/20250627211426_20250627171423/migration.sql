-- AlterTable
ALTER TABLE "RentalExtra" ADD COLUMN     "customAmount" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Values" ADD COLUMN     "customBasePrice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customCollectionFee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customDeliveryFee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customDeposit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customDiscount" BOOLEAN NOT NULL DEFAULT false;
