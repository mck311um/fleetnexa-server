/*
  Warnings:

  - You are about to drop the column `color` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `requiredPasswordChange` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `User` table. All the data in the column will be lost.
  - Made the column `profilePicture` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `show` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "color",
DROP COLUMN "requiredPasswordChange",
DROP COLUMN "theme",
ADD COLUMN     "requirePasswordChange" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "profilePicture" SET NOT NULL,
ALTER COLUMN "show" SET NOT NULL,
ALTER COLUMN "show" SET DEFAULT true;
