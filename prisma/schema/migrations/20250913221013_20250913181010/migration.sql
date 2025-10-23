/*
  Warnings:

  - You are about to drop the column `description` on the `CustomerViolation` table. All the data in the column will be lost.
  - Added the required column `violationDate` to the `CustomerViolation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CustomerViolation" DROP COLUMN "description",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "violationDate" TIMESTAMP(3) NOT NULL;
