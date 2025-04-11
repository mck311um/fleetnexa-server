/*
  Warnings:

  - You are about to drop the column `locationAddress` on the `PresetLocation` table. All the data in the column will be lost.
  - Added the required column `stateId` to the `PresetLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `PresetLocation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `villageId` to the `PresetLocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PresetLocation" DROP COLUMN "locationAddress",
ADD COLUMN     "stateId" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "villageId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PresetLocation" ADD CONSTRAINT "PresetLocation_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresetLocation" ADD CONSTRAINT "PresetLocation_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
