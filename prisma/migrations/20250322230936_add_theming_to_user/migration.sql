/*
  Warnings:

  - You are about to drop the column `color` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `Tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "color",
DROP COLUMN "theme";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#0000FF',
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'light';
