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

// Categorías de inversión. Record<string,string> a propósito: se indexa por
// category libre. Fuente única: lo consumen Dashboard e Inversiones vía
// labels.investmentCategories.
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
    define: "Define tu brújula",
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
      "Todo lo que cargas en los otros módulos, reflejado en una vista. Cambia el período en el header para ver otro mes.",
    // Aviso "sin datos": prefijo + los dos links + sufijo. Se arma en el JSX.
    noDataPre: "Este período todavía no tiene datos. Carga",
    noDataIncomeLink: "ingresos",
    noDataAnd: "y",
    noDataExpensesLink: "egresos",
    noDataSuf: "para verlo completo.",
    affirmationLabel: "Afirmación del día",
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
      // "Hoy destinas {real}% a Libertad. Para llegar a {sim}% tendrías que
      //  redirigir {monto} al mes desde Esenciales y Estilo."
      gapMore1: "Hoy destinas",
      gapMore2: "a Libertad. Para llegar a",
      gapMore3: "tendrías que redirigir",
      gapMore4: "al mes desde Esenciales y Estilo.",
      // "En este escenario destinas {sim}% a Libertad, {abs}% menos que hoy ({real}%)."
      gapLess1: "En este escenario destinas",
      gapLess2: "a Libertad,",
      gapLess3: "menos que hoy",
      // "Este escenario coincide con tu distribución real ({real}% a Libertad)."
      gapEqual1: "Este escenario coincide con tu distribución real",
      gapEqualFreedom: "a Libertad",
    },
    thermostat: {
      label: "Termostato",
      noTargetPre: "Configura tu meta de ingreso a 2 años en",
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
      setAge: "Configura tu edad",
      horizon: "Horizonte",
      yourFreedomNumber: "Tu número de libertad",
      perYearRate: "% anual",
      nlfCtx:
        "El capital que necesitas invertido para que su retorno cubra tus egresos. El capital queda intacto: vives de los flujos.",
      noExpenseCtx:
        "Carga tus egresos del mes para calcular tu Número de Libertad.",
      currentState: "Estado actual",
      projection: "Proyección ·",
      notConverge: "no converge",
      achieved: "logrado",
      passivePerMonth: "Renta pasiva / mes",
    },
    patrimony: {
      titlePre: "Patrimonio · proyección a",
      years: "años",
      noAssetsPre: "Carga posiciones en",
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
      legendHint: "pasa el cursor o toca una barra",
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
    firstMonthPre: "Empieza registrando tu primer mes en",
    colMonth: "Mes",
    colIncome: "Ingresos",
    colExpenses: "Egresos",
    colSavingsRate: "Tasa ahorro",
    colNetWorth: "Patrimonio",
    colAction: "Acción",
    edit: "Editar",
    addMonth: "+ Agregar mes",
    addMonthPre: "Para registrar un mes nuevo, elígelo arriba en",
    addMonthPeriod: "PERÍODO",
    addMonthSuf:
      "(mes y año), en la parte superior de la pantalla. El mes se crea solo al seleccionarlo, y después puedes cargar sus ingresos, egresos e inversiones.",
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
      "La tasa de ahorro se recalcula sola a partir de Ingresos y Egresos. Si cambias el mes/año a uno que ya tiene registro, no se sobrescribe.",
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
      "Plan A y Plan C son manuales. Plan B se consume desde Inversiones como suma de yields ÷ 12 — con override manual opcional. Lo que cargas acá se consolida automáticamente en el período activo.",
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
  investments: {
    // Header
    headerLabel: "Inversiones",
    title: "Tu portafolio",
    intro:
      "Cada activo con su tasa y su aporte mensual. Proyectamos su crecimiento por interés compuesto, y tu renta pasiva de hoy es el Plan B (suma de capital por su yield, dividido 12).",
    // KPIs (capa A)
    kpiPortfolioTotal: "Portafolio Total",
    // Contador de posiciones: "{n} posición" / "{n} posiciones"
    positionSingular: "posición",
    positionPlural: "posiciones",
    kpiWeightedReturn: "Rendimiento Ponderado",
    weightedReturnSub: "prom. ponderado por capital",
    kpiPassiveToday: "Renta Pasiva Hoy",
    passiveTodaySub: "Plan B mensual (yields)",
    kpiProjection10: "Proyección 10A",
    projection10Sub: "valor estimado",
    kpiRent10: "Renta 10A",
    rent10Sub: "renta pasiva/mes a 10 años",
    // Proyección por horizonte
    projectionByHorizon: "Proyección por horizonte",
    projectionEmpty:
      "Cuando cargues posiciones, acá vas a ver tu valor y tu renta proyectados a 5, 10 y 20 años.",
    colHorizon: "Horizonte",
    colProjectedValue: "Valor proyectado",
    colRentPerMonth: "Renta/mes",
    // "{n} años"
    yearsSuffix: "años",
    // Donut
    noDataToChart: "Sin datos para graficar",
    // Crecimiento por interés compuesto
    growthTitle: "Crecimiento por interés compuesto — 30 años",
    growthEmpty:
      "Acá vas a ver cómo crece cada activo, apilado, año a año hasta los 30.",
    // Labels del GrowthChart (eje X y fallback de serie)
    chartToday: "Hoy",
    chartAssetFallback: "Activo",
    // Tabla de activos
    assetsTitle: "Tus activos",
    assetsEmpty: "Sin posiciones todavía. Agrega la primera más abajo.",
    colAsset: "Activo",
    colType: "Tipo",
    colValue: "Valor",
    colContributionPerMonth: "Aporte/mes",
    colReturn: "Rendimiento",
    col5y: "5A",
    col10y: "10A",
    colRent10y: "Renta 10A",
    col20y: "20A",
    colAction: "Acción",
    edit: "Editar",
    delete: "Eliminar",
    // Form crear / editar
    addPosition: "Agregar posición",
    editPosition: "Editar posición",
    fieldCategory: "Categoría",
    fieldLabel: "Etiqueta (opcional)",
    placeholderLabel: "ej. S&P 500 ETF",
    fieldCapital: "Capital actual",
    fieldYield: "Yield / Rendimiento anual (%)",
    placeholderYield: "ej. 4 para 4%",
    fieldMonthlyContribution: "Aporte mensual",
    placeholderMonthlyContribution: "0.00",
    yieldHelp:
      "La tasa anual de la posición. Se usa para tu renta pasiva y para proyectar su crecimiento.",
    cancel: "Cancelar",
    saving: "Guardando…",
    saveChanges: "Guardar cambios",
  },
  debts: {
    // Header
    headerLabel: "Deudas y créditos",
    title: "Sal de la deuda",
    intro:
      "Registra tus deudas para ver su peso real y dirigir el dinero a liberarlas. Pagar deuda es ordenar tus finanzas hacia la libertad.",
    // Nota de consolidación: "Consolidado al MonthlyRecord {periodo} · debtTotal = {monto}"
    consolidatedPre: "Consolidado al MonthlyRecord",
    consolidatedTotal: "debtTotal =",
    // Confirmación de pago del mes: "¿Confirmas tus pagos de deuda de {mes}?"
    confirmPre: "¿Confirmas tus pagos de deuda de",
    confirmSuf: "?",
    confirmNote:
      "Si pagaste lo registrado, actualizamos el saldo. Si pagaste distinto, edita la deuda abajo.",
    confirmButton: "Sí, pagué lo registrado",
    // KPIs
    kpiTotalDebt: "Deuda Total",
    // Contador de deudas: "{n} deuda" / "{n} deudas"
    debtSingular: "deuda",
    debtPlural: "deudas",
    kpiMonthlyPayment: "Pago Mensual",
    // "{pct} de tus ingresos" / fallback
    ofYourIncome: "de tus ingresos",
    registerIncome: "registra tus ingresos",
    kpiWeightedApr: "APR Ponderado",
    weightedAprSub: "prom. ponderado",
    kpiDebtToIncome: "Ratio Deuda/Ingreso",
    debtToIncomeSub: "saludable < 36%",
    kpiDebtFree: "Libre de Deudas",
    // "{n} mes" / "{n} meses"
    monthSingular: "mes",
    monthPlural: "meses",
    notConverge: "no converge",
    noDebts: "sin deudas",
    avalancheStrategyShort: "estrategia Avalancha",
    paymentNotCoverInterest: "el pago no cubre el interés",
    // Desglose consumo vs inversión
    consumptionDebt: "Deuda de consumo",
    consumptionDebtNote: "De la que conviene salir y no repetir.",
    investmentDebt: "Deuda de inversión",
    investmentDebtNote: "Justificada solo si genera retorno.",
    // Tabla
    colName: "Nombre",
    colType: "Tipo",
    colLabel: "Etiqueta",
    colBalance: "Saldo",
    colApr: "APR",
    colMinPayment: "Pago mín.",
    colRealPayment: "Pago real",
    colInstallments: "Cuotas",
    colAction: "Acción",
    edit: "Editar",
    delete: "Eliminar",
    // Estrategia de pago
    strategyTitle: "Estrategia de pago: ¿cuál te conviene?",
    strategyIntro:
      "Mismo presupuesto mensual, distinto orden de ataque. Cuando una deuda se salda, su pago acelera la siguiente.",
    strategyEmpty:
      "Cuando registres deudas, acá vas a ver tu plan para liberarte.",
    avalanche: "Avalancha",
    avalancheDesc:
      "Paga primero la deuda con mayor interés. Ahorra más a largo plazo.",
    snowball: "Bola de Nieve",
    snowballDesc:
      "Paga primero la deuda más pequeña. Más victorias rápidas.",
    recommended: "Recomendada",
    // StrategyCard stats
    freeIn: "Libre en",
    totalInterest: "Interés total",
    startsWith: "Empieza por",
    // "La estrategia Avalancha te ahorra {monto} en intereses vs Bola de Nieve."
    savesPre: "La estrategia Avalancha te ahorra",
    savesSuf: "en intereses vs Bola de Nieve.",
    // Proyección de reducción de deuda
    projectionTitle: "Proyección de reducción de deuda",
    projectionEmpty:
      "Acá vas a ver cómo baja tu saldo mes a mes hasta llegar a cero.",
    projectionNotConverge:
      "Con el pago actual la deuda no se salda: el pago no alcanza a cubrir el interés. Sube el pago mensual real de tus deudas para ver la proyección.",
    // "Estrategia Avalancha, libre de deudas en {n} {mes(es)}."
    projectionCaptionPre: "Estrategia Avalancha, libre de deudas en",
    projectionCaptionSuf: ".",
    // Label del eje X del chart (M0)
    chartToday: "Hoy",
    // Form crear / editar (DebtForm)
    addDebt: "Agregar deuda o crédito",
    editDebt: "Editar deuda",
    fieldName: "Nombre",
    placeholderName: "ej. Tarjeta Visa",
    fieldType: "Tipo",
    fieldPurpose: "Consumo o inversión",
    fieldBalance: "Saldo",
    fieldApr: "APR (%)",
    fieldMinPayment: "Pago mínimo",
    fieldCurrentPayment: "Pago mensual real",
    fieldTermMonths: "Cuotas restantes (opcional)",
    placeholderMonths: "meses",
    termMonthsHelp:
      "Si sabes cuántas cuotas te quedan, ingrésalas. Si no, déjalo vacío.",
    placeholderAmount: "0.00",
    saving: "Guardando…",
    saveChanges: "Guardar cambios",
    add: "Agregar",
    cancel: "Cancelar",
  },
  goals: {
    // Header
    headerLabel: "Metas",
    title: "Tus objetivos",
    intro:
      "Define cuánto destinas por mes a cada meta y sigue su progreso. Cada meta vive en una canasta: Esenciales, Estilo o Libertad.",
    // KPIs
    kpiActiveGoals: "Metas activas",
    kpiAvgProgress: "Progreso promedio",
    kpiNextGoal: "Próxima meta",
    kpiNoValue: "—",
    // "en {n} {mes(es)}"
    inPre: "en",
    defineContribution: "define un aporte",
    kpiMonthlyContribution: "Aporte/mes",
    toAllYourGoals: "a todas tus metas",
    // "{n} mes" / "{n} meses"
    monthSingular: "mes",
    monthPlural: "meses",
    // Empty state
    noGoals: "Todavía no tienes metas. Agrega la primera más abajo.",
    // Contador de metas por canasta: "{n} meta" / "{n} metas"
    goalSingular: "meta",
    goalPlural: "metas",
    // Bloques de visualización
    allGoalsProgress: "Progreso de todas las metas",
    timelineTitle: "Timeline — cuándo alcanzarás cada meta",
    // GoalRow — estimaciones
    noContributionNotReached: "sin aporte no se alcanza",
    complete: "completa",
    // "~{n} {mes(es)}"
    approx: "~",
    // "meta {fecha}"
    goalDatePrefix: "meta",
    // TimingBadge
    onTrack: "a tiempo",
    behind: "atrasado",
    unreachable: "no se alcanza",
    // whenLabel (timeline)
    alreadyReached: "ya alcanzada",
    // Acciones
    edit: "Editar",
    delete: "Borrar",
    // Form crear / editar (GoalForm)
    addGoal: "Agregar meta",
    editGoal: "Editar meta",
    fieldName: "Nombre",
    placeholderName: "ej. Fondo de emergencia",
    fieldBasket: "Canasta",
    fieldTargetAmount: "Monto objetivo",
    fieldCurrentAmount: "Ahorro actual",
    fieldMonthlyContribution: "Aporte mensual",
    placeholderAmount: "0.00",
    fieldTargetDate: "Fecha objetivo (opcional)",
    targetDateHelp: "Pon una fecha para medir si vas atrasado o a tiempo.",
    saving: "Guardando…",
    saveChanges: "Guardar cambios",
    add: "Agregar",
    cancel: "Cancelar",
  },
  expenses: {
    // Panel de fugas (suscripciones + gastos hormiga), alimentado por isLeak.
    leaks: {
      title: "Suscripciones y egresos hormiga",
      intro:
        "Reúne tus gastos hormiga del período (suscripciones, entretenimiento, delivery y otros). Mira lo que pesan al mes, al año y a futuro. Cada gasto tiene un checkbox “Es gasto hormiga” para incluirlo o sacarlo, más allá de su categoría.",
      perMonth: "Por mes",
      perYear: "Por año",
      inFiveYears: "En 5 años",
      freedomCapital: "Capital de libertad",
      freedomCapitalNote:
        "El capital que tendrías que tener invertido para cubrir esto con rendimientos al 8% (ejemplo ajustable).",
      // Checkbox del ExpenseForm: define si el gasto es hormiga (entra al panel).
      hormigaCheckbox: "Es gasto hormiga",
    },
    // Página de lista (server): header, KPIs, tabs, tablas, vista Por Canasta.
    list: {
      // Header: "Egresos · {Mes} {Año}". El mes/año se arma en el JSX.
      headerLabel: "Egresos",
      title: "Dirige tu dinero",
      intro:
        "Registra tus egresos del período y asigna cada uno a una canasta: Esenciales, Estilo o Libertad. El total real y el desglose por canasta se consolidan en el período activo.",
      // Nota de consolidación: "Consolidado al MonthlyRecord {periodo} · expensesTotal = {monto}"
      consolidatedPre: "Consolidado al MonthlyRecord",
      consolidatedTotal: "expensesTotal =",
      // KPIs
      kpiTotalFixed: "Total Fijos",
      kpiTotalVariable: "Total Variables",
      kpiTotalBudget: "Total Presupuesto",
      kpiTotalReal: "Total Real",
      // Tabs
      tabFixed: "Fijos",
      tabVariable: "Variables",
      tabBasket: "Por canasta",
      // ExpenseTypeSection: títulos + helpers por tipo
      fixedTitle: "Egresos fijos",
      fixedHelper: "Recurrentes: renta, seguro, servicios.",
      variableTitle: "Egresos variables",
      variableHelper: "Cambian mes a mes: súper, salidas, transporte.",
      subtotalReal: "Subtotal real",
      // Columnas de la tabla
      colName: "Nombre",
      colCategory: "Categoría",
      colBasket: "Canasta",
      colBudget: "Presupuesto",
      colReal: "Real",
      colAction: "Acción",
      // Acciones
      edit: "Editar",
      delete: "Eliminar",
      editExpense: "Editar egreso",
      // Vista Por Canasta
      noDataToChart: "Sin egresos para graficar",
      basketBreakdownTitle: "Reparto del egreso real por canasta",
      fixedGroup: "Fijos",
      variableGroup: "Variables",
      topThreeCategories: "Las 3 categorías con más impacto",
      topCategories: "Categorías con más impacto",
      pctOfBasket: "% de la canasta",
      pctOfTotal: "% del total",
      // "+{n} categoría(s) más"
      moreCategoriesPre: "+",
      moreCategorySingular: "categoría más",
      moreCategoryPlural: "categorías más",
    },
    // ExpenseForm (client): campos, placeholders, botones.
    form: {
      fieldName: "Nombre",
      fieldCategory: "Categoría",
      fieldBasket: "Canasta",
      fieldBudget: "Presupuesto",
      fieldRealPaid: "Real pagado",
      placeholderNameFixed: "Renta, seguro…",
      placeholderNameVariable: "Súper, salidas…",
      placeholderAmount: "0.00",
      add: "Agregar",
      save: "Guardar",
      cancel: "Cancelar",
    },
    // StatementScanner (client): escáner de resumen de tarjeta.
    scanner: {
      title: "Escanear factura o resumen de tarjeta",
      close: "Cerrar",
      uploadButton: "Subir PDF o foto",
      // Segunda vía de entrada: abre la cámara en móvil, selector de archivo en escritorio.
      takePhotoButton: "Tomar foto",
      uploadHelp:
        "Sube o toma una foto de una factura, recibo o resumen de tarjeta (PDF o imagen). El texto del PDF se lee en tu navegador y las imágenes se comprimen ahí mismo. Podrás revisar y ajustar la lista antes de crear los gastos.",
      // Fase contraseña
      passwordIntro:
        "El PDF está protegido con contraseña. Ingrésala para desbloquearlo en tu navegador (la contraseña no se envía a ningún servidor), o sube una foto del documento.",
      passwordPlaceholder: "Contraseña del PDF",
      passwordAriaLabel: "Contraseña del PDF",
      unlockAndRead: "Desbloquear y leer",
      uploadPhotoInstead: "Subir una foto en su lugar",
      // Estados de carga
      preparing: "Preparando el archivo…",
      reading: "Leyendo resumen…",
      creating: "Creando los gastos…",
      // Listo: "Se crearon {n} gasto(s) en {mes}. Ya aparecen en tu lista de Egresos."
      donePre: "Se crearon",
      doneMid: "gasto(s) en",
      doneSuf: ". Ya aparecen en tu lista de Egresos.",
      scanAnother: "Escanear otro documento",
      // Advertencias
      // "{n} renglón(es) con confianza baja: revísalos."
      lowConfSuf: "renglón(es) con confianza baja: revísalos.",
      // "{n} posible(s) duplicado(s) de gastos ya cargados este período."
      dupSuf: "posible(s) duplicado(s) de gastos ya cargados este período.",
      // Resumen: "{n} de {total} compras seleccionadas · total {monto}"
      summaryMid: "de",
      summarySuf: "compras seleccionadas · total",
      // Fila de revisión
      include: "Incluir",
      // "confianza {alta/media/baja}"
      confidencePre: "confianza",
      possibleDuplicate: "posible duplicado",
      fieldMerchant: "Comercio",
      fieldAmount: "Monto",
      fieldDate: "Fecha",
      fieldCategory: "Categoría",
      fieldBasket: "Canasta",
      // Nota informativa: "Las compras se registran en el mes activo ({mes}), el mes en que pagás este resumen. Se guarda la fecha original de cada compra."
      monthNotePre: "Las compras se registran en el mes activo (",
      monthNoteSuf:
        "), el mes en que registras este comprobante. Se guarda la fecha original de cada compra.",
      // "Confirmar y crear {n} gasto(s)"
      confirmCreatePre: "Confirmar y crear",
      confirmCreateSuf: "gasto(s)",
      // Errores
      errRead: "No pude leer el documento. Prueba con otra foto o archivo.",
      errUnsupported: "Formato no soportado. Sube un PDF o una imagen.",
      errPrepare: "No pude preparar el archivo. Prueba con otro.",
      errWrongPassword: "Contraseña incorrecta. Prueba de nuevo.",
      errUnlock: "No pude desbloquear el PDF. Prueba subir una foto.",
      errNoValid: "No hay compras válidas para crear.",
      errCreate: "No pude crear los gastos. Prueba de nuevo.",
    },
  },
  labels: {
    baskets,
    categories,
    debtTypes,
    debtPurposes,
    investmentCategories,
    months,
    monthsShort,
    // Categoría con gastos en más de una canasta (vista Variables agrupada).
    mixed: "Mixta",
  },
};
