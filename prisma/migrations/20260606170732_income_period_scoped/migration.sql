-- Period-scoping de Income (ARQUITECTURA §3: Income es flujo del mes).
-- Migración NO destructiva: agrega year/month como nullable, backfillea
-- las filas existentes con el período activo de su dueño (fallback al mes
-- calendario actual) y recién después las vuelve NOT NULL.

-- AlterTable: agregar columnas nullable
ALTER TABLE "incomes" ADD COLUMN "year" INTEGER;
ALTER TABLE "incomes" ADD COLUMN "month" INTEGER;

-- Backfill: estampar cada income con el período activo de su Profile,
-- con fallback al mes/año actual si el Profile no lo tiene seteado.
UPDATE "incomes" i
SET "year"  = COALESCE(p."activeYear",  EXTRACT(YEAR  FROM CURRENT_DATE)::int),
    "month" = COALESCE(p."activeMonth", EXTRACT(MONTH FROM CURRENT_DATE)::int)
FROM "profiles" p
WHERE p."userId" = i."userId";

-- Salvaguarda: filas sin Profile asociado (no debería ocurrir)
UPDATE "incomes" SET "year"  = EXTRACT(YEAR  FROM CURRENT_DATE)::int WHERE "year"  IS NULL;
UPDATE "incomes" SET "month" = EXTRACT(MONTH FROM CURRENT_DATE)::int WHERE "month" IS NULL;

-- Ahora sí, NOT NULL
ALTER TABLE "incomes" ALTER COLUMN "year"  SET NOT NULL;
ALTER TABLE "incomes" ALTER COLUMN "month" SET NOT NULL;

-- CreateIndex
CREATE INDEX "incomes_userId_year_month_idx" ON "incomes"("userId", "year", "month");
