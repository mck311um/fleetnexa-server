/*
  Warnings:

  - You are about to drop the column `images` on the `CustomerDocument` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CustomerDocument" DROP COLUMN "images",
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "documents" TEXT[],
ADD COLUMN     "updatedBy" TEXT;
