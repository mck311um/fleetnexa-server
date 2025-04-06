/*
  Warnings:

  - You are about to drop the column `locationName` on the `PresetLocation` table. All the data in the column will be lost.
  - Added the required column `location` to the `PresetLocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PresetLocation" DROP COLUMN "locationName",
ADD COLUMN     "location" TEXT NOT NULL;
