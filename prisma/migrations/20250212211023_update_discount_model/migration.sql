/*
  Warnings:

  - You are about to drop the column `percentage` on the `VehicleDiscount` table. All the data in the column will be lost.
  - You are about to drop the column `threshold` on the `VehicleDiscount` table. All the data in the column will be lost.
  - You are about to drop the `_VehicleDiscountToVehicleGroup` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `VehicleDiscount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountPolicy` to the `VehicleDiscount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodMax` to the `VehicleDiscount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodMin` to the `VehicleDiscount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleGroupId` to the `VehicleDiscount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_VehicleDiscountToVehicleGroup" DROP CONSTRAINT "_VehicleDiscountToVehicleGroup_A_fkey";

-- DropForeignKey
ALTER TABLE "_VehicleDiscountToVehicleGroup" DROP CONSTRAINT "_VehicleDiscountToVehicleGroup_B_fkey";

-- AlterTable
ALTER TABLE "VehicleDiscount" DROP COLUMN "percentage",
DROP COLUMN "threshold",
ADD COLUMN     "amount" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "discountPolicy" TEXT NOT NULL,
ADD COLUMN     "periodMax" INTEGER NOT NULL,
ADD COLUMN     "periodMin" INTEGER NOT NULL,
ADD COLUMN     "vehicleGroupId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_VehicleDiscountToVehicleGroup";

-- AddForeignKey
ALTER TABLE "VehicleDiscount" ADD CONSTRAINT "VehicleDiscount_vehicleGroupId_fkey" FOREIGN KEY ("vehicleGroupId") REFERENCES "VehicleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
