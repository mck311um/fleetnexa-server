/*
  Warnings:

  - You are about to drop the column `geoNameId` on the `State` table. All the data in the column will be lost.
  - You are about to drop the column `geoNameId` on the `Village` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "State_geoNameId_key";

-- DropIndex
DROP INDEX "Village_geoNameId_key";

-- AlterTable
ALTER TABLE "State" DROP COLUMN "geoNameId",
ADD COLUMN     "cscId" TEXT,
ADD COLUMN     "iso2" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "Village" DROP COLUMN "geoNameId",
ADD COLUMN     "cscId" TEXT;
