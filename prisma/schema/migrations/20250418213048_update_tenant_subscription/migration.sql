-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "features" TEXT[];

-- AlterTable
ALTER TABLE "TenantSubscription" ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL;
