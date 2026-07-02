/**
 * Mapas de meses español abreviados → número/mes ISO
 */
const MESES_NUM: Record<string, number> = {
  Ene: 0, Feb: 1, Mar: 2, Abr: 3, May: 4, Jun: 5,
  Jul: 6, Ago: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11,
};

const MESES_ISO: Record<string, string> = {
  Ene: "01", Feb: "02", Mar: "03", Abr: "04",
  May: "05", Jun: "06", Jul: "07", Ago: "08",
  Sep: "09", Oct: "10", Nov: "11", Dic: "12",
};

/**
 * Parsea fechas en formato "DD MMM YYYY" (ej: 17 Jun 2026)
 * o "DD/MM/YYYY" (ej: 17/06/2026) y devuelve timestamp UNIX.
 * También soporta prefijo opcional "Inicia:" (usado en startDate de cursos).
 */
export function parseDateToTimestamp(d: string): number {
  const limpio = d.replace(/^Inicia:\s*/i, "").trim();
  const partes = limpio.split(" ");

  if (partes.length === 3) {
    const [dia, mes, año] = partes;
    if (MESES_NUM[mes] !== undefined) {
      return new Date(+año, MESES_NUM[mes], +dia).getTime();
    }
  }

  // Fallback: DD/MM/YYYY
  if (limpio.includes("/")) {
    const [dia, mes, año] = limpio.split("/");
    return new Date(+año, +mes - 1, +dia).getTime();
  }

  return 0;
}

/**
 * Retorna true si la fecha (en formato "DD MMM YYYY" o "DD/MM/YYYY")
 * ya pasó (es anterior a hoy a las 00:00 local).
 */
export function isPastDate(d: string): boolean {
  const ts = parseDateToTimestamp(d);
  if (ts === 0) return false; // no se pudo parsear → no ocultar
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return ts < hoy.getTime();
}

/**
 * Parsea "DD MMM YYYY" a ISO 8601 (YYYY-MM-DD) para JSON-LD / OpenGraph.
 * También soporta prefijo opcional "Inicia:" (usado en startDate de cursos).
 * Fallback: si no reconoce el mes como abreviatura, intenta DD/MM/YYYY.
 */
export function parseDateToISO(d: string): string {
  const limpio = d.replace(/^Inicia:\s*/i, "").trim();
  const partes = limpio.split(" ");
  if (partes.length === 3) {
    const [dia, mes, año] = partes;
    const mesISO = MESES_ISO[mes];
    if (mesISO) {
      return `${año}-${mesISO}-${dia.padStart(2, "0")}`;
    }
  }

  // Fallback DD/MM/YYYY
  if (limpio.includes("/")) {
    const [dia, mes, año] = limpio.split("/");
    return `${año}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  return d;
}
