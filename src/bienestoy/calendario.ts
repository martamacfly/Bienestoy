import type { IsoDate } from "./types";

export function parsearFecha(fecha: IsoDate): Date {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function formatearFecha(fecha: Date): IsoDate {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function hoyLocal(ahora = new Date()): IsoDate {
  return formatearFecha(ahora);
}

export function sumarDias(fecha: IsoDate, dias: number): IsoDate {
  const d = parsearFecha(fecha);
  d.setDate(d.getDate() + dias);
  return formatearFecha(d);
}

export function lunesDe(fecha: IsoDate): IsoDate {
  const d = parsearFecha(fecha);
  const diaSemana = d.getDay();
  const delta = diaSemana === 0 ? -6 : 1 - diaSemana;
  d.setDate(d.getDate() + delta);
  return formatearFecha(d);
}

export function fechasDeSemana(lunes: IsoDate): IsoDate[] {
  return [0, 1, 2, 3, 4, 5, 6].map((n) => sumarDias(lunes, n));
}

const DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function esFechaIso(valor: string): valor is IsoDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  return formatearFecha(parsearFecha(valor)) === valor;
}

export function nombreDia(fecha: IsoDate): string {
  const i = parsearFecha(fecha).getDay();
  return DIAS[i === 0 ? 6 : i - 1];
}

export function etiquetaFecha(fecha: IsoDate): string {
  const d = parsearFecha(fecha);
  return `${nombreDia(fecha)} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function etiquetaSemana(lunes: IsoDate): string {
  const dias = fechasDeSemana(lunesDe(lunes));
  const inicio = parsearFecha(dias[0]);
  const fin = parsearFecha(dias[6]);
  const diaInicio = inicio.getDate();
  const diaFin = fin.getDate();
  const mesInicio = MESES[inicio.getMonth()];
  const mesFin = MESES[fin.getMonth()];
  const anioInicio = inicio.getFullYear();
  const anioFin = fin.getFullYear();
  if (mesInicio === mesFin && anioInicio === anioFin) {
    return `${diaInicio}–${diaFin} ${mesFin} ${anioFin}`;
  }
  if (anioInicio === anioFin) {
    return `${diaInicio} ${mesInicio} – ${diaFin} ${mesFin} ${anioFin}`;
  }
  return `${diaInicio} ${mesInicio} ${anioInicio} – ${diaFin} ${mesFin} ${anioFin}`;
}
