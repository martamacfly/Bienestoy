import { fechasDeSemana, lunesDe, sumarDias } from "./calendario";
import type {
  DeporteDelDia,
  Dia,
  Estado,
  IsoDate,
} from "./types";

export function diaDe(estado: Estado, fecha: IsoDate): Dia {
  return estado.dias[fecha] ?? { extras: [] };
}

export function puedeReplanificar(fecha: IsoDate, hoy: IsoDate): boolean {
  return fecha >= hoy;
}

export function deporteDelDia(estado: Estado, fecha: IsoDate): DeporteDelDia {
  const dia = diaDe(estado, fecha);
  if (dia.sesion) {
    if (dia.sesion.estado === "hecha") return "si";
    if (dia.sesion.estado === "saltada") return "no";
    return "sin_marcar";
  }
  if (dia.extras.length > 0) return "si";
  if (dia.deporteManual === true) return "si";
  if (dia.deporteManual === false) return "no";
  return "sin_marcar";
}

export function cumplimientoSemana(
  estado: Estado,
  lunes: IsoDate,
): { hechas: number; planificadas: number } {
  let hechas = 0;
  let planificadas = 0;
  for (const fecha of fechasDeSemana(lunesDe(lunes))) {
    const sesion = diaDe(estado, fecha).sesion;
    if (!sesion) continue;
    planificadas += 1;
    if (sesion.estado === "hecha") hechas += 1;
  }
  return { hechas, planificadas };
}

export type SemanaEnHistorial = {
  lunes: IsoDate;
  hechas: number;
  planificadas: number;
};

export function historialSemanas(
  estado: Estado,
  lunesActual: IsoDate,
  cuantas = 8,
): SemanaEnHistorial[] {
  const origen = lunesDe(lunesActual);
  const filas: SemanaEnHistorial[] = [];
  for (let i = cuantas - 1; i >= 0; i -= 1) {
    const lunes = sumarDias(origen, -7 * i);
    filas.push({ lunes, ...cumplimientoSemana(estado, lunes) });
  }
  return filas;
}

export type ActividadEnResumen = {
  nombre: string;
  hechas: number;
  saltadas: number;
  pendientes: number;
  extras: number;
};

export function resumenActividades(estado: Estado): ActividadEnResumen[] {
  const mapa = new Map<string, ActividadEnResumen>();

  function fila(nombre: string): ActividadEnResumen {
    const existente = mapa.get(nombre);
    if (existente) return existente;
    const nueva: ActividadEnResumen = {
      nombre,
      hechas: 0,
      saltadas: 0,
      pendientes: 0,
      extras: 0,
    };
    mapa.set(nombre, nueva);
    return nueva;
  }

  for (const dia of Object.values(estado.dias)) {
    if (dia.sesion) {
      const item = fila(dia.sesion.actividadNombre);
      if (dia.sesion.estado === "hecha") item.hechas += 1;
      else if (dia.sesion.estado === "saltada") item.saltadas += 1;
      else item.pendientes += 1;
    }
    for (const extra of dia.extras) {
      fila(extra.actividadNombre).extras += 1;
    }
  }

  return [...mapa.values()].sort(
    (a, b) => b.hechas + b.extras - (a.hechas + a.extras),
  );
}

export function resumenDeporte(
  estado: Estado,
  desde: IsoDate,
  hasta: IsoDate,
): { si: number; no: number; sinMarcar: number } {
  let si = 0;
  let no = 0;
  let sinMarcar = 0;
  for (let fecha = desde; fecha <= hasta; fecha = sumarDias(fecha, 1)) {
    const valor = deporteDelDia(estado, fecha);
    if (valor === "si") si += 1;
    else if (valor === "no") no += 1;
    else sinMarcar += 1;
  }
  return { si, no, sinMarcar };
}

export function seriePesajes(
  estado: Estado,
): { fecha: IsoDate; kg: number }[] {
  return Object.entries(estado.pesajes)
    .map(([fecha, kg]) => ({ fecha, kg }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function serieMedida(
  estado: Estado,
  medidaId: string,
): { fecha: IsoDate; valor: number }[] {
  const puntos: { fecha: IsoDate; valor: number }[] = [];
  for (const [fecha, valores] of Object.entries(estado.valoresMedida)) {
    const valor = valores[medidaId];
    if (valor !== undefined) puntos.push({ fecha, valor });
  }
  return puntos.sort((a, b) => a.fecha.localeCompare(b.fecha));
}
