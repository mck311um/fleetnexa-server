/*
  Warnings:

  - Added the required column `profileImage` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "profileImage" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CustomerAddress" ALTER COLUMN "zipCode" DROP NOT NULL;
