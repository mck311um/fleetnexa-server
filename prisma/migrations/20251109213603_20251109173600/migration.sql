/*
  Warnings:

  - You are about to drop the column `read` on the `TenantNotification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantNotification" DROP COLUMN "read";

-- CreateTable
CREATE TABLE "NotificationReadStatus" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationReadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationReadStatus_notificationId_userId_key" ON "NotificationReadStatus"("notificationId", "userId");

-- AddForeignKey
ALTER TABLE "NotificationReadStatus" ADD CONSTRAINT "NotificationReadStatus_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "TenantNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationReadStatus" ADD CONSTRAINT "NotificationReadStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
