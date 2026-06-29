-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "goalId" UUID;

-- CreateIndex
CREATE INDEX "expenses_userId_goalId_idx" ON "expenses"("userId", "goalId");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
