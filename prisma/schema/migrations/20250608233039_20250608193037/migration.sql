/*
  Warnings:

  - Added the required column `category` to the `AppPermission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppPermission" ADD COLUMN     "category" TEXT NOT NULL;
