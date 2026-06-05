-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "planBManualAmount" DECIMAL(12,2),
ADD COLUMN     "planBManualOverride" BOOLEAN NOT NULL DEFAULT false;
