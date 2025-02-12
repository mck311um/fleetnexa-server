/*
  Warnings:

  - You are about to drop the column `description` on the `InvoiceSequence` table. All the data in the column will be lost.
  - Added the required column `example` to the `InvoiceSequence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InvoiceSequence" DROP COLUMN "description",
ADD COLUMN     "example" TEXT NOT NULL;
