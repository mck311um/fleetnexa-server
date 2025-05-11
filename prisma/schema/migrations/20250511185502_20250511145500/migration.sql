/*
  Warnings:

  - Added the required column `paymentDate` to the `BookingPayments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookingPayments" ADD COLUMN     "paymentDate" TIMESTAMP(3) NOT NULL;
