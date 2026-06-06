-- Debts capa 1: etiqueta educativa (purpose) + fecha de corte del snapshot
-- (balanceAsOf). Migración NO destructiva: agrega columnas nullable,
-- backfillea (purpose='consumption'; as-of desde el período activo del
-- Profile con fallback al mes actual) y recién después las vuelve NOT NULL.
-- Mismo patrón que Income/Expenses.

-- AlterTable: columnas nullable
ALTER TABLE "debts" ADD COLUMN "purpose" TEXT;
ALTER TABLE "debts" ADD COLUMN "balanceAsOfYear"  INTEGER;
ALTER TABLE "debts" ADD COLUMN "balanceAsOfMonth" INTEGER;

-- Backfill purpose
UPDATE "debts" SET "purpose" = 'consumption' WHERE "purpose" IS NULL;

-- Backfill as-of desde el Profile activo (fallback al mes/año actual)
UPDATE "debts" d
SET "balanceAsOfYear"  = COALESCE(p."activeYear",  EXTRACT(YEAR  FROM CURRENT_DATE)::int),
    "balanceAsOfMonth" = COALESCE(p."activeMonth", EXTRACT(MONTH FROM CURRENT_DATE)::int)
FROM "profiles" p
WHERE p."userId" = d."userId";

-- Salvaguarda: filas sin Profile asociado (no debería ocurrir)
UPDATE "debts" SET "balanceAsOfYear"  = EXTRACT(YEAR  FROM CURRENT_DATE)::int WHERE "balanceAsOfYear"  IS NULL;
UPDATE "debts" SET "balanceAsOfMonth" = EXTRACT(MONTH FROM CURRENT_DATE)::int WHERE "balanceAsOfMonth" IS NULL;

-- Ahora sí, NOT NULL
ALTER TABLE "debts" ALTER COLUMN "purpose" SET NOT NULL;
ALTER TABLE "debts" ALTER COLUMN "balanceAsOfYear"  SET NOT NULL;
ALTER TABLE "debts" ALTER COLUMN "balanceAsOfMonth" SET NOT NULL;
