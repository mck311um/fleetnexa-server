/*
  Warnings:

  - You are about to drop the column `countryName` on the `Country` table. All the data in the column will be lost.
  - You are about to drop the column `stateName` on the `State` table. All the data in the column will be lost.
  - You are about to drop the column `villageName` on the `Village` table. All the data in the column will be lost.
  - Added the required column `country` to the `Country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `State` table without a default value. This is not possible if the table is not empty.
  - Added the required column `village` to the `Village` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Country" DROP COLUMN "countryName",
ADD COLUMN     "country" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "State" DROP COLUMN "stateName",
ADD COLUMN     "state" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Village" DROP COLUMN "villageName",
ADD COLUMN     "village" TEXT NOT NULL;
