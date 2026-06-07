import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeGoal, type SerializedGoal } from "@/lib/serialize";
import { BASKETS, BASKET_LABELS_ES, BASKET_COLORS, type Basket } from "@/lib/expenses";
import {
  progress,
  monthsToGoal,
  goalTiming,
  averageProgress,
  nextGoal,
  totalMonthlyContribution,
} from "@/lib/goals";
import { GoalForm } from "./GoalForm";
import { deleteGoalAction } from "./actions";

export const metadata = { title: "Metas · The Money Command" };

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { user, profile } = await requireUser();
  const params = await searchParams;

  const goalsRaw = await prisma.goal.findMany({
    where: { userId: user.id, isActive: true },
    orderBy: [{ createdAt: "asc" }],
  });
  const goals = goalsRaw.map(serializeGoal);

  const editing = params.edit
    ? (goals.find((g) => g.id === params.edit) ?? null)
    : null;

  const now = new Date();

  // KPIs
  const avg = averageProgress(goals);
  const next = nextGoal(goals);
  const totalContribution = totalMonthlyContribution(goals);

  // Formato — decimales según moneda (default ISO 4217)
  const locale = profile.locale === "es" ? "es-AR" : "en-US";
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: profile.currency,
  });
  const pct = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  });
  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
  });

  const hasGoals = goals.length > 0;

  return (
    <div className="fade-up flex flex-col gap-6">
      <header>
        <div className="label mb-1">Metas</div>
        <h1>Tus objetivos</h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginTop: "8px" }}>
          Definí cuánto destinás por mes a cada meta y seguí su progreso. Cada
          meta vive en una canasta: Esenciales, Estilo o Libertad.
        </p>
      </header>

      {/* KPIs */}
      <section
        className="card"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
        }}
      >
        <Kpi label="Metas activas" value={String(goals.length)} />
        <Kpi label="Progreso promedio" value={pct.format(avg)} />
        <Kpi
          label="Próxima meta"
          value={next ? next.goal.name : "—"}
          sub={
            next
              ? `en ${next.months} ${next.months === 1 ? "mes" : "meses"}`
              : "definí un aporte"
          }
        />
        <Kpi
          label="Aporte/mes"
          value={money.format(totalContribution)}
          sub="a todas tus metas"
          valueColor="var(--accent)"
        />
      </section>

      {/* Secciones por canasta */}
      {!hasGoals ? (
        <div className="card">
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Todavía no tenés metas. Agregá la primera más abajo.
          </p>
        </div>
      ) : (
        BASKETS.map((basket) => {
          const inBasket = goals.filter((g) => g.basket === basket);
          if (inBasket.length === 0) return null;
          return (
            <BasketSection
              key={basket}
              basket={basket}
              goals={inBasket}
              money={money}
              pct={pct}
              dateFmt={dateFmt}
              now={now}
              editingId={editing?.id}
            />
          );
        })
      )}

      {/* Form crear / editar */}
      <GoalForm editing={editing} />
    </div>
  );
}

function BasketSection({
  basket,
  goals,
  money,
  pct,
  dateFmt,
  now,
  editingId,
}: {
  basket: Basket;
  goals: SerializedGoal[];
  money: Intl.NumberFormat;
  pct: Intl.NumberFormat;
  dateFmt: Intl.DateTimeFormat;
  now: Date;
  editingId?: string | null;
}) {
  return (
    <section className="card flex flex-col gap-4">
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: 2,
            background: BASKET_COLORS[basket],
          }}
        />
        <div className="label" style={{ color: "var(--text)" }}>
          {BASKET_LABELS_ES[basket]}
        </div>
        <span style={{ fontSize: "11px", color: "var(--muted)" }}>
          {goals.length} meta{goals.length === 1 ? "" : "s"}
        </span>
      </div>

      {goals.map((g) => (
        <GoalRow
          key={g.id}
          goal={g}
          color={BASKET_COLORS[basket]}
          money={money}
          pct={pct}
          dateFmt={dateFmt}
          now={now}
          isEditing={editingId === g.id}
        />
      ))}
    </section>
  );
}

function GoalRow({
  goal,
  color,
  money,
  pct,
  dateFmt,
  now,
  isEditing,
}: {
  goal: SerializedGoal;
  color: string;
  money: Intl.NumberFormat;
  pct: Intl.NumberFormat;
  dateFmt: Intl.DateTimeFormat;
  now: Date;
  isEditing: boolean;
}) {
  const p = progress(goal);
  const months = monthsToGoal(goal);
  const timing = goalTiming(goal, now);

  const estimate =
    months === null ? "sin aporte no se alcanza" : months === 0 ? "completa" : `~${months} ${months === 1 ? "mes" : "meses"}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        borderTop: "1px solid var(--border)",
        paddingTop: "12px",
        background: isEditing ? "rgba(127, 255, 178, 0.04)" : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "14px", color: "var(--text)" }}>{goal.name}</span>
        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
          {money.format(goal.targetAmount)} · {money.format(goal.currentAmount)} ·{" "}
          <span style={{ color: "var(--accent)" }}>
            +{money.format(goal.monthlyContribution)}/m
          </span>
        </span>
      </div>

      {/* Barra de progreso */}
      <div
        style={{
          height: 8,
          background: "var(--surface)",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${p * 100}%`, height: "100%", background: color }} />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          fontSize: "11px",
          color: "var(--muted)",
          flexWrap: "wrap",
        }}
      >
        <span>
          {pct.format(p)} · {estimate}
          {goal.targetDate && (
            <>
              {" · "}
              <span>meta {dateFmt.format(new Date(goal.targetDate))}</span>{" "}
              <TimingBadge timing={timing} />
            </>
          )}
        </span>
        <span style={{ display: "inline-flex", gap: "12px", alignItems: "center" }}>
          <Link
            href={`/goals?edit=${goal.id}#form`}
            style={{ color: "var(--accent-2)", fontSize: "12px" }}
          >
            Editar
          </Link>
          <form action={deleteGoalAction} style={{ display: "inline" }}>
            <input type="hidden" name="id" value={goal.id} />
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--danger)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "DM Mono, monospace",
                padding: 0,
              }}
            >
              Borrar
            </button>
          </form>
        </span>
      </div>
    </div>
  );
}

function TimingBadge({
  timing,
}: {
  timing: ReturnType<typeof goalTiming>;
}) {
  if (timing.status === "on_track") {
    return <span style={{ color: "var(--accent)" }}>a tiempo</span>;
  }
  if (timing.status === "behind") {
    return (
      <span style={{ color: "var(--gold)" }}>
        atrasado {timing.monthsLate} {timing.monthsLate === 1 ? "mes" : "meses"}
      </span>
    );
  }
  if (timing.status === "unreachable") {
    return <span style={{ color: "var(--danger)" }}>no se alcanza</span>;
  }
  return null;
}

function Kpi({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div>
      <div className="label">{label}</div>
      <div
        className="kpi-medium"
        style={{
          marginTop: "4px",
          color: valueColor,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
      {sub && (
        <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: 2 }}>
          {sub}
        </p>
      )}
    </div>
  );
}
