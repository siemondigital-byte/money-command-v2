-- CreateIndex
CREATE UNIQUE INDEX "expenses_goalId_year_month_key" ON "expenses"("goalId", "year", "month");
