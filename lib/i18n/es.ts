/**
 * Diccionario ES — FUENTE DE VERDAD de la capa i18n.
 *
 * El tipo `Dict` se deriva de este objeto (ver ./index.ts), así que TODA clave
 * nueva se agrega PRIMERO acá. `en.ts` arranca como copia de este objeto y se
 * va traduciendo sección por sección; las claves que falten en `en` caen a `es`
 * vía el merge de ./index.ts (nunca se muestra un blanco).
 *
 * Reglas:
 *  - Solo DATOS serializables (strings, arrays, objetos). NADA de funciones: el
 *    dict cruza el límite Server → Client (provider) y debe serializar limpio.
 *  - La moneda NO se traduce ni se convierte (es cosmética). El idioma solo
 *    cambia palabras + formato de número/fecha.
 */

import type { Basket } from "@/lib/expenses";
import type { DebtType, DebtPurpose } from "@/lib/debts";

// Etiquetas de canasta (doctrinales). Antes: BASKET_LABELS_ES en lib/expenses.
const baskets: Record<Basket, string> = {
  essentials: "Esenciales",
  style: "Estilo",
  freedom: "Libertad",
};

// Etiquetas de categoría de gasto. Antes: CATEGORY_LABELS_ES en lib/expenses.
// Record<string, string> a propósito: el escáner puede sugerir categorías libres.
const categories: Record<string, string> = {
  vivienda: "Vivienda",
  comida: "Comida",
  servicios: "Servicios",
  transporte: "Transporte",
  salud: "Salud",
  seguros: "Seguros",
  entretenimiento: "Entretenimiento",
  restaurantes: "Restaurantes",
  delivery: "Delivery",
  viajes: "Viajes",
  ropa: "Ropa",
  hobbies: "Hobbies",
  educacion: "Educación",
  suscripciones: "Suscripciones",
  "redes sociales": "Redes sociales",
  mixtos: "Mixtos",
  otros: "Otros",
};

// Tipos de deuda. Antes: DEBT_TYPE_LABELS_ES en lib/debts.
const debtTypes: Record<DebtType, string> = {
  card: "Tarjeta de crédito",
  auto_loan: "Préstamo auto",
  student_loan: "Deuda estudiantil",
  personal_loan: "Préstamo personal",
  mortgage: "Hipoteca",
  other: "Otro",
};

// Propósito de la deuda. Antes: PURPOSE_LABELS_ES en lib/debts.
const debtPurposes: Record<DebtPurpose, string> = {
  consumption: "Consumo",
  investment: "Inversión",
};

// Categorías de inversión (Dashboard). Record<string,string> a propósito: se
// indexa por category libre. Duplica el mapa local del módulo Inversiones.
const investmentCategories: Record<string, string> = {
  fixed_income: "Renta fija",
  equity: "Renta variable",
  real_estate: "Bienes raíces",
  speculative: "Cripto / Especulativo",
  other: "Otros",
};

// Meses (1-12). Antes: MONTH_LABELS_ES duplicado en 5 archivos.
const months: string[] = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Meses abreviados (1-12). Antes: SHORT_MONTHS local en history/page.tsx.
const monthsShort: string[] = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export const es = {
  nav: {
    dashboard: "Dashboard",
    income: "Ingresos",
    expenses: "Egresos",
    investments: "Inversiones",
    debts: "Deudas",
    goals: "Metas",
    coach: "Coach",
    history: "Historial",
    settings: "Settings",
    logout: "Salir",
  },
  metadata: {
    dashboard: "Dashboard · The Money Command",
    income: "Ingresos · The Money Command",
    expenses: "Egresos · The Money Command",
    investments: "Inversiones · The Money Command",
    debts: "Deudas · The Money Command",
    goals: "Metas · The Money Command",
    coach: "Coach · The Money Command",
    history: "Historial · The Money Command",
    settings: "Settings · The Money Command",
  },
  header: {
    period: "Período",
  },
  // La brújula se arma concatenando estos fragmentos con los datos del perfil.
  compass: {
    define: "Definí tu brújula",
    buildingTo: "Estoy construyendo este patrimonio para poder",
    forYear: "para el año",
    becauseContribute: "porque quiero contribuir",
  },
  settings: {
    pageLabel: "Settings",
    pageTitle: "Tu configuración",
    session: "Sesión",
    sectionProfile: "Perfil",
    sectionCompass: "Brújula",
    sectionThermostat: "Termostato",
    sectionAssumptions: "Supuestos",
    sectionMethod: "Método preferido",
    sectionLocale: "Moneda e idioma",
    name: "Nombre",
    country: "País (ISO, ej. AR, US)",
    ageCurrent: "Edad actual",
    ageFreedomTarget: "Edad objetivo libertad",
    compassHint:
      "Estoy construyendo este patrimonio para poder ___ / para el año ___ / porque quiero contribuir ___",
    compassWhat: "Para poder (máx 80 caracteres)",
    compassYear: "Para el año",
    compassContribution: "Contribuir (máx 80)",
    thermostatTarget: "Meta de ingreso a 2 años (mensual)",
    inflationRate: "Inflación anual %",
    salaryGrowthRate: "Aumento salarial anual %",
    freedomMonthlySpend: "Egreso mensual deseado en libertad (opcional)",
    preferredMethod: "Distribución Necesidades / Deseos / Inversiones",
    currency: "Moneda",
    language: "Idioma",
    localeHelp:
      "Ajusta el símbolo y los decimales en toda la app. No convierte montos entre monedas.",
    saved: "Guardado.",
    save: "Guardar cambios",
    saving: "Guardando…",
  },
  dashboard: {
    pageLabel: "Dashboard",
    title: "Tu situación financiera",
    intro:
      "Todo lo que cargás en los otros módulos, reflejado en una vista. Cambiá el período en el header para ver otro mes.",
    // Aviso "sin datos": prefijo + los dos links + sufijo. Se arma en el JSX.
    noDataPre: "Este período todavía no tiene datos. Cargá",
    noDataIncomeLink: "ingresos",
    noDataAnd: "y",
    noDataExpensesLink: "egresos",
    noDataSuf: "para verlo completo.",
    affirmationLabel: "Afirmación del día",
    // Etiquetas de categoría de inversión (duplican las del módulo Inversiones;
    // consolidar cuando se migre Inversiones a i18n).
    investmentCategories,
    capitalInvested: {
      label: "Capital invertido",
      weightedReturnPre: "rentabilidad ponderada · genera",
      perYear: "/año",
      sumNote: "Suma del capital de tus posiciones activas en Inversiones.",
      otherFallback: "Otros",
    },
    method: {
      title: "Asignación del mes",
      kpiIncome: "Ingreso del mes",
      kpiIncomeCtx: "Plan A + B + C",
      kpiSpent: "Gastado",
      kpiSpentCtx: "Esenciales + Estilo",
      kpiInvested: "Invertido",
      kpiInvestedCtx: "aporte mensual a inversión",
      kpiUnassigned: "Sin asignar",
      ofIncome: "% del ingreso",
      targetPrefix: "Target",
      ariaAdjust: "Ajustar",
      gapNoReal:
        "Todavía no hay egresos cargados para comparar. Estás viendo el preset de tu método preferido.",
      // "Hoy destinás {real}% a Libertad. Para llegar a {sim}% tendrías que
      //  redirigir {monto} al mes desde Esenciales y Estilo."
      gapMore1: "Hoy destinás",
      gapMore2: "a Libertad. Para llegar a",
      gapMore3: "tendrías que redirigir",
      gapMore4: "al mes desde Esenciales y Estilo.",
      // "En este escenario destinás {sim}% a Libertad, {abs}% menos que hoy ({real}%)."
      gapLess1: "En este escenario destinás",
      gapLess2: "a Libertad,",
      gapLess3: "menos que hoy",
      // "Este escenario coincide con tu distribución real ({real}% a Libertad)."
      gapEqual1: "Este escenario coincide con tu distribución real",
      gapEqualFreedom: "a Libertad",
    },
    thermostat: {
      label: "Termostato",
      noTargetPre: "Configurá tu meta de ingreso a 2 años en",
      settingsLink: "Settings",
      noTargetSuf: "para medir tu temperatura.",
      target2y: "Meta 2 años",
      todayAvg: "Hoy (prom.)",
      stateReached: "Estado",
      stateGap: "Te falta",
      reachedValue: "Alcanzada",
      overCurrentSuffix: "% sobre tu actual",
    },
    freedom: {
      label: "Calculadora de libertad",
      incomeMonthly: "Ingreso mensual",
      editable: "editable",
      savingMonthly: "Ahorro mensual",
      ofIncome: "% del ingreso",
      compoundInterest: "Interés compuesto",
      rate: "tasa",
      ariaRate: "Tasa de interés compuesto",
      ageTargetLabel: "Edad objetivo de libertad",
      years: "años",
      today: "Hoy",
      setAge: "Configurá tu edad",
      horizon: "Horizonte",
      yourFreedomNumber: "Tu número de libertad",
      perYearRate: "% anual",
      nlfCtx:
        "El capital que necesitás invertido para que su retorno cubra tus egresos. El capital queda intacto: vivís de los flujos.",
      noExpenseCtx:
        "Cargá tus egresos del mes para calcular tu Número de Libertad.",
      currentState: "Estado actual",
      projection: "Proyección ·",
      notConverge: "no converge",
      achieved: "logrado",
      passivePerMonth: "Renta pasiva / mes",
    },
    patrimony: {
      titlePre: "Patrimonio · proyección a",
      years: "años",
      noAssetsPre: "Cargá posiciones en",
      investmentsLink: "Inversiones",
      noAssetsSuf: "para ver crecer tu capital por interés compuesto.",
      balanceAccruedPre: "Balance acumulado ·",
      yearAbbrev: "A",
      capitalPlusReturn: "Capital + retorno",
      capitalContributed: "Capital aportado",
      depositPlusContrib: "depósito + aportes",
      returnGenerated: "Retorno generado",
      compoundGrowth: "crecimiento compuesto",
      legendCapital: "Capital",
      legendReturn: "Retorno",
      legendHint: "pasá el cursor o tocá una barra",
      year: "Año",
      tooltipCapitalInvested: "Capital invertido",
      tooltipReturn: "Retorno",
      tooltipTotal: "Total",
      ariaCapitalInvested: "capital invertido",
      ariaReturn: "retorno",
    },
  },
  history: {
    label: "Historial",
    title: "Tus meses registrados",
    empty: "Todavía no registraste ningún mes.",
    // Contador: "{n} mes(es) en tu historial." Se arma en el JSX.
    monthSingular: "mes",
    monthPlural: "meses",
    countSuffix: "en tu historial.",
    firstMonthPre: "Empezá registrando tu primer mes en",
    colMonth: "Mes",
    colIncome: "Ingresos",
    colExpenses: "Egresos",
    colSavingsRate: "Tasa ahorro",
    colNetWorth: "Patrimonio",
    colAction: "Acción",
    edit: "Editar",
    addMonth: "+ Agregar mes",
    addMonthPre: "Para registrar un mes nuevo, elegilo arriba en",
    addMonthPeriod: "PERÍODO",
    addMonthSuf:
      "(mes y año), en la parte superior de la pantalla. El mes se crea solo al seleccionarlo, y después podés cargar sus ingresos, egresos e inversiones.",
    // DeleteRecordButton
    delete: "Borrar",
    confirmDeletePre: "¿Borrar",
    yes: "Sí",
    no: "No",
    // GoToPeriodButton
    goToMonth: "Ir al mes",
    // HistoryEditForm
    fieldYear: "Año",
    formHelp:
      "La tasa de ahorro se recalcula sola a partir de Ingresos y Egresos. Si cambiás el mes/año a uno que ya tiene registro, no se sobrescribe.",
    save: "Guardar",
    cancel: "Cancelar",
    savedPre: "Cambios guardados.",
    backToHistory: "Volver al historial",
  },
  income: {
    // Header: "Ingresos · {Mes} {Año}". El mes/año se arma en el JSX con dict.labels.months.
    headerLabel: "Ingresos",
    title: "Plan A · B · C",
    intro:
      "Plan A y Plan C son manuales. Plan B se consume desde Inversiones como suma de yields ÷ 12 — con override manual opcional. Lo que cargás acá se consolida automáticamente en el período activo.",
    // Nota de consolidación: "Consolidado al MonthlyRecord {periodo} · incomeTotal = {monto}"
    consolidatedPre: "Consolidado al MonthlyRecord",
    consolidatedTotal: "incomeTotal =",
    // KPIs
    kpiTotal: "Total ingresos/mes",
    kpiPassivePct: "% pasivo",
    passiveShareNote: "Plan B sobre el total",
    noPassiveYet: "Sin ingreso pasivo aún",
    // Etiquetas de plan (name + helper).
    plans: {
      A: {
        name: "Plan A · Salario / Activos",
        helper: "Tu ingreso principal recurrente.",
      },
      B: {
        name: "Plan B · Ingreso pasivo",
        helper:
          "Ingreso pasivo de tus inversiones. Se calcula solo desde tu portafolio.",
      },
      C: {
        name: "Plan C · Secundario / Freelance",
        helper: "Ingresos variables: proyectos, segundo trabajo, comisiones.",
      },
    },
    // Plan B badge
    badgeManual: "Manual",
    badgeAuto: "Auto",
    planBMonthly: "Plan B mensual",
    autoFromInvestments: "Auto desde Inversiones",
    yieldsTotal: "Yields totales",
    addPositionsLink: "Agrega tus posiciones",
    // Plan B override form
    useManualPlanB: "Usar valor manual de Plan B",
    manualMonthlyAmount: "Monto mensual manual",
    // Placeholder "auto: {monto}" y nota "El valor automático sigue siendo {monto} desde Inversiones. Tu valor manual va a sobrescribirlo."
    autoPlaceholderPre: "auto:",
    autoNotePre: "El valor automático sigue siendo",
    autoNoteSuf: "desde Inversiones. Tu valor manual va a sobrescribirlo.",
    apply: "Aplicar",
    applying: "Guardando…",
    saved: "Guardado.",
    // Secciones Plan A/C
    subtotal: "Subtotal/mes",
    colName: "Nombre",
    colAmount: "Monto",
    colAction: "Acción",
    edit: "Editar",
    delete: "Eliminar",
    // "Editar fila {plan}"
    editRowPre: "Editar fila",
    // IncomeRowForm
    add: "Agregar",
    save: "Guardar",
    cancel: "Cancelar",
    fieldName: "Nombre",
    fieldMonthlyAmount: "Monto mensual",
    placeholderNameA: "Salario principal",
    placeholderNameC: "Freelance / proyecto",
  },
  expenses: {
    // Panel de fugas (suscripciones + gastos hormiga), alimentado por isLeak.
    leaks: {
      title: "Suscripciones y egresos hormiga",
      intro:
        "Reúne tus gastos hormiga del período (suscripciones, entretenimiento, delivery y otros). Mirá lo que pesan al mes, al año y a futuro. Cada gasto tiene un checkbox “Es gasto hormiga” para incluirlo o sacarlo, más allá de su categoría.",
      perMonth: "Por mes",
      perYear: "Por año",
      inFiveYears: "En 5 años",
      freedomCapital: "Capital de libertad",
      freedomCapitalNote:
        "El capital que tendrías que tener invertido para cubrir esto con rendimientos al 8% (ejemplo ajustable).",
      // Checkbox del ExpenseForm: define si el gasto es hormiga (entra al panel).
      hormigaCheckbox: "Es gasto hormiga",
    },
  },
  labels: {
    baskets,
    categories,
    debtTypes,
    debtPurposes,
    months,
    monthsShort,
    // Categoría con gastos en más de una canasta (vista Variables agrupada).
    mixed: "Mixta",
  },
};
