/*
  Warnings:

  - You are about to drop the `_AppPermissionToUserRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AppPermissionToUserRole" DROP CONSTRAINT "_AppPermissionToUserRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_AppPermissionToUserRole" DROP CONSTRAINT "_AppPermissionToUserRole_B_fkey";

-- DropTable
DROP TABLE "_AppPermissionToUserRole";

-- CreateTable
CREATE TABLE "UserRolePermission" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRolePermission_roleId_permissionId_key" ON "UserRolePermission"("roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRolePermission" ADD CONSTRAINT "UserRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "AppPermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
