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
  viajes: "Viajes",
  ropa: "Ropa",
  educacion: "Educación",
  suscripciones: "Suscripciones",
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
  labels: {
    baskets,
    categories,
    debtTypes,
    debtPurposes,
    months,
    // Categoría con gastos en más de una canasta (vista Variables agrupada).
    mixed: "Mixta",
  },
};
