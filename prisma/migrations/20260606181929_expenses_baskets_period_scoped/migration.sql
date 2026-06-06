-- Expenses: canasta doctrinal + presupuesto + period-scoping + flag suscripción.
-- Migración NO destructiva: agrega columnas nullable, backfillea las filas
-- existentes (basket desde classification legacy; year/month desde el período
-- activo del Profile con fallback al mes actual) y recién después las vuelve
-- NOT NULL. Mismo patrón que la migración de Income.

-- AlterTable: columnas nullable + las que ya tienen default
ALTER TABLE "expenses" ADD COLUMN "basket" TEXT;
ALTER TABLE "expenses" ADD COLUMN "budget" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "expenses" ADD COLUMN "year"  INTEGER;
ALTER TABLE "expenses" ADD COLUMN "month" INTEGER;
ALTER TABLE "expenses" ADD COLUMN "isSubscription" BOOLEAN NOT NULL DEFAULT false;

-- Backfill basket desde classification legacy
UPDATE "expenses" SET "basket" =
  CASE "classification"
    WHEN 'need'       THEN 'essentials'
    WHEN 'want'       THEN 'style'
    WHEN 'investment' THEN 'freedom'
    ELSE 'essentials'
  END
WHERE "basket" IS NULL;

-- Backfill período desde el Profile activo (fallback al mes/año actual)
UPDATE "expenses" e
SET "year"  = COALESCE(p."activeYear",  EXTRACT(YEAR  FROM CURRENT_DATE)::int),
    "month" = COALESCE(p."activeMonth", EXTRACT(MONTH FROM CURRENT_DATE)::int)
FROM "profiles" p
WHERE p."userId" = e."userId";

-- Salvaguarda: filas sin Profile asociado (no debería ocurrir)
UPDATE "expenses" SET "year"  = EXTRACT(YEAR  FROM CURRENT_DATE)::int WHERE "year"  IS NULL;
UPDATE "expenses" SET "month" = EXTRACT(MONTH FROM CURRENT_DATE)::int WHERE "month" IS NULL;

-- Ahora sí, NOT NULL
ALTER TABLE "expenses" ALTER COLUMN "basket" SET NOT NULL;
ALTER TABLE "expenses" ALTER COLUMN "year"  SET NOT NULL;
ALTER TABLE "expenses" ALTER COLUMN "month" SET NOT NULL;

-- CreateIndex
CREATE INDEX "expenses_userId_year_month_idx" ON "expenses"("userId", "year", "month");
