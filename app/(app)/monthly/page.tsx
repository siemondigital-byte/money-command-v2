import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeMonthlyRecord } from "@/lib/serialize";
import { MonthlyForm } from "./MonthlyForm";

export const metadata = { title: "Mes · The Money Command" };

export default async function MonthlyEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { user } = await requireUser();
  const params = await searchParams;

  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;

  const existing = await prisma.monthlyRecord.findUnique({
    where: { userId_year_month: { userId: user.id, year, month } },
  });

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">Monthly Entry</div>
        <h1>{existing ? "Editar mes" : "Registrar mes"}</h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: "13px",
            marginTop: "8px",
          }}
        >
          Resumen consolidado del mes. Cada fila se calcula automáticamente
          desde sus componentes — los totales y patrimonio neto se derivan.
        </p>
      </header>

      <MonthlyForm
        initialYear={year}
        initialMonth={month}
        existing={existing ? serializeMonthlyRecord(existing) : null}
      />
    </div>
  );
}
