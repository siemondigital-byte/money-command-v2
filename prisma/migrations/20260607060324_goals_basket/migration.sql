-- Metas capa A: canasta doctrinal (basket) + fecha objetivo opcional.
-- Migración NO destructiva: agrega basket nullable, backfillea desde la
-- categoría legacy (need/want/patrimony), y recién después lo vuelve NOT NULL.
-- targetDate pasa a opcional. La columna legacy `category` se mantiene y se
-- deriva del basket en las actions (limpieza futura, ver CONTEXT.md).

-- basket: nullable -> backfill -> NOT NULL
ALTER TABLE "goals" ADD COLUMN "basket" TEXT;

UPDATE "goals" SET "basket" = CASE "category"
  WHEN 'need'      THEN 'essentials'
  WHEN 'want'      THEN 'style'
  WHEN 'patrimony' THEN 'freedom'
  ELSE 'essentials'
END
WHERE "basket" IS NULL;

ALTER TABLE "goals" ALTER COLUMN "basket" SET NOT NULL;

-- targetDate pasa a opcional
ALTER TABLE "goals" ALTER COLUMN "targetDate" DROP NOT NULL;
