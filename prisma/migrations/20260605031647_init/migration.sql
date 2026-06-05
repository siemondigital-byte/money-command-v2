-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT,
    "ageCurrent" INTEGER,
    "ageFreedomTarget" INTEGER,
    "country" TEXT,
    "compassWhat" VARCHAR(80),
    "compassYear" INTEGER,
    "compassContribution" VARCHAR(80),
    "thermostatTarget" DECIMAL(12,2),
    "inflationRate" DECIMAL(5,2) NOT NULL DEFAULT 3.0,
    "freedomMonthlySpend" DECIMAL(12,2),
    "salaryGrowthRate" DECIMAL(5,2) NOT NULL DEFAULT 2.5,
    "preferredMethod" TEXT NOT NULL DEFAULT '50/30/20',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "locale" TEXT NOT NULL DEFAULT 'es',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_records" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incomeActive" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "incomePassive" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "incomeSecondary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "incomeTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expenseNeeds" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expenseWants" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expenseInvestments" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expenseTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "liabilityCard" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "liabilityPersonal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "liabilityMortgage" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "liabilityOther" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "liabilityTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "assetCash" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "assetInvestments" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "assetRealEstate" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "assetOther" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "assetTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netWorth" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "savingsRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "weightedReturn" DECIMAL(5,2) NOT NULL DEFAULT 8.0,
    "potentialSavingsMissed" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "periodicity" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "isAntExpense" BOOLEAN NOT NULL DEFAULT false,
    "unitAmount" DECIMAL(12,2),
    "frequencyPerMonth" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "apr" DECIMAL(5,2) NOT NULL,
    "minPayment" DECIMAL(12,2) NOT NULL,
    "currentPayment" DECIMAL(12,2) NOT NULL,
    "termMonths" INTEGER,
    "originalAmount" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentValue" DECIMAL(12,2) NOT NULL,
    "monthlyContribution" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expectedReturn" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "currentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "monthlyContribution" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAchieved" BOOLEAN NOT NULL DEFAULT false,
    "achievedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_scenarios" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyContribution" DECIMAL(12,2) NOT NULL,
    "weightedReturn" DECIMAL(5,2) NOT NULL,
    "wantsReductionPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "incomeIncreasePct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "extraCapital" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "yearsToFreedom" DECIMAL(5,2) NOT NULL,
    "projectedNetWorth" DECIMAL(12,2) NOT NULL,
    "passiveIncomeMonthly" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "monthly_records_userId_year_month_idx" ON "monthly_records"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_records_userId_year_month_key" ON "monthly_records"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "incomes_userId_isActive_idx" ON "incomes"("userId", "isActive");

-- CreateIndex
CREATE INDEX "expenses_userId_isActive_idx" ON "expenses"("userId", "isActive");

-- CreateIndex
CREATE INDEX "expenses_userId_isAntExpense_idx" ON "expenses"("userId", "isAntExpense");

-- CreateIndex
CREATE INDEX "debts_userId_isActive_idx" ON "debts"("userId", "isActive");

-- CreateIndex
CREATE INDEX "investments_userId_isActive_idx" ON "investments"("userId", "isActive");

-- CreateIndex
CREATE INDEX "goals_userId_isActive_idx" ON "goals"("userId", "isActive");

-- CreateIndex
CREATE INDEX "goals_userId_targetDate_idx" ON "goals"("userId", "targetDate");

-- CreateIndex
CREATE INDEX "achievements_userId_idx" ON "achievements"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_userId_code_key" ON "achievements"("userId", "code");

-- CreateIndex
CREATE INDEX "saved_scenarios_userId_idx" ON "saved_scenarios"("userId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_records" ADD CONSTRAINT "monthly_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
