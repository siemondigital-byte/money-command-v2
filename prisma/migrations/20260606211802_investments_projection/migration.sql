-- Inversiones capa A: proyección de interés compuesto.
-- Migración NO destructiva:
--   1. Widening de passiveYield Decimal(5,2) -> Decimal(6,4): corrige la
--      precisión a futuro (1.5% ya no se redondea a 2%). No recupera las
--      filas viejas ya redondeadas, pero toda carga/edición nueva guarda
--      preciso. Es un cast por ampliación, sin pérdida.
--   2. monthlyContribution (aporte mensual): default 0, seguro en tabla con datos.
--   3. expectedReturn (retorno total anual): nullable -> backfill por categoría
--      (DEFAULT_EXPECTED_RETURN_BY_CATEGORY) -> NOT NULL.
-- NO toca el Plan B: passiveYield sigue siendo su propio campo y su unidad.

-- 1. Widening de passiveYield
ALTER TABLE "investments" ALTER COLUMN "passiveYield" SET DATA TYPE DECIMAL(6,4);

-- 2. Aporte mensual
ALTER TABLE "investments" ADD COLUMN "monthlyContribution" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- 3. Retorno esperado: nullable -> backfill por categoría -> NOT NULL
ALTER TABLE "investments" ADD COLUMN "expectedReturn" DECIMAL(6,4);

UPDATE "investments" SET "expectedReturn" = CASE "category"
  WHEN 'fixed_income' THEN 0.04
  WHEN 'equity'       THEN 0.08
  WHEN 'real_estate'  THEN 0.06
  WHEN 'speculative'  THEN 0.12
  WHEN 'other'        THEN 0.05
  ELSE 0.05
END
WHERE "expectedReturn" IS NULL;

ALTER TABLE "investments" ALTER COLUMN "expectedReturn" SET NOT NULL;
