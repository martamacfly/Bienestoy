import { fechasDeSemana, lunesDe, sumarDias } from "./calendario";
import { sumarCuanto, totalesVacios } from "./lineas";
import type {
  CuantoEjercicio,
  DeporteDelDia,
  Dia,
  Estado,
  IsoDate,
} from "./types";

export function diaDe(estado: Estado, fecha: IsoDate): Dia {
  return estado.dias[fecha] ?? { extras: [] };
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

function cuentaDia(estado: Estado, fecha: IsoDate): "hecha" | "sin_cumplir" | null {
  const dia = diaDe(estado, fecha);
  if (
    dia.sesion?.estado === "hecha" ||
    dia.extras.length > 0 ||
    dia.deporteManual === true
  ) {
    return "hecha";
  }
  if (dia.sesion || dia.deporteManual === false) return "sin_cumplir";
  return null;
}

export function diasSemana(
  estado: Estado,
  lunes: IsoDate,
  hasta?: IsoDate,
): { hechas: number; total: number } {
  let hechas = 0;
  let total = 0;
  const tope = hasta ?? sumarDias(lunesDe(lunes), 6);
  for (const fecha of fechasDeSemana(lunesDe(lunes))) {
    if (fecha > tope) break;
    const cuenta = cuentaDia(estado, fecha);
    if (!cuenta) continue;
    total += 1;
    if (cuenta === "hecha") hechas += 1;
  }
  return { hechas, total };
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

export type SemanaEnResumen = {
  lunes: IsoDate;
  hechas: number;
  total: number;
};

export function historialDias(
  estado: Estado,
  hoy: IsoDate,
  cuantas = 8,
): SemanaEnResumen[] {
  const origen = lunesDe(hoy);
  const filas: SemanaEnResumen[] = [];
  for (let i = cuantas - 1; i >= 0; i -= 1) {
    const lunes = sumarDias(origen, -7 * i);
    const hasta = lunes === origen ? hoy : undefined;
    filas.push({ lunes, ...diasSemana(estado, lunes, hasta) });
  }
  return filas;
}

export type ActividadEnResumen = {
  nombre: string;
  hechas: number;
  saltadas: number;
  pendientes: number;
  extras: number;
  minutos: number;
  segundos: number;
  repeticiones: number;
};

export function resumenActividades(
  estado: Estado,
  rango?: { desde: IsoDate; hasta: IsoDate },
): ActividadEnResumen[] {
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
      ...totalesVacios(),
    };
    mapa.set(nombre, nueva);
    return nueva;
  }

  function anotarCuanto(item: ActividadEnResumen, cuanto?: CuantoEjercicio) {
    const totales = sumarCuanto(item, cuanto);
    item.minutos = totales.minutos;
    item.segundos = totales.segundos;
    item.repeticiones = totales.repeticiones;
  }

  for (const [fecha, dia] of Object.entries(estado.dias)) {
    if (rango && (fecha < rango.desde || fecha > rango.hasta)) continue;
    if (dia.sesion) {
      const item = fila(dia.sesion.actividadNombre);
      if (dia.sesion.estado === "hecha") {
        item.hechas += 1;
        anotarCuanto(item, dia.sesion.cuanto);
        for (const linea of dia.sesion.guion) {
          anotarCuanto(item, linea.cuanto);
        }
      } else if (dia.sesion.estado === "saltada") item.saltadas += 1;
      else item.pendientes += 1;
    }
    for (const extra of dia.extras) {
      const item = fila(extra.actividadNombre);
      item.extras += 1;
      anotarCuanto(item, extra.cuanto);
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
