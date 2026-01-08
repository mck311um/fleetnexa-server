-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roleId" TEXT;

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppPermission" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AppPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AppPermissionToUserRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AppPermissionToUserRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_tenantId_key" ON "UserRole"("name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AppPermission_name_key" ON "AppPermission"("name");

-- CreateIndex
CREATE INDEX "_AppPermissionToUserRole_B_index" ON "_AppPermissionToUserRole"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppPermissionToUserRole" ADD CONSTRAINT "_AppPermissionToUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES "AppPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppPermissionToUserRole" ADD CONSTRAINT "_AppPermissionToUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES "UserRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
