import type {
  Actividad,
  CuantoEjercicio,
  Dia,
  Estado,
  Extra,
  LineaGuion,
  PlantillaEjercicio,
  Sesion,
} from "./types";
import { medidasFijas } from "./seed";
import { cuantoValido } from "./lineas";

function plantilla(bruto: unknown): PlantillaEjercicio | null {
  if (typeof bruto === "string") {
    const nombre = bruto.trim();
    if (!nombre) return null;
    return { nombre };
  }
  if (typeof bruto !== "object" || bruto === null) return null;
  const fila = bruto as Record<string, unknown>;
  if (typeof fila.nombre !== "string" || !fila.nombre.trim()) return null;
  const cuanto = cuantoValido(fila.cuanto);
  return cuanto
    ? { nombre: fila.nombre.trim(), cuanto }
    : { nombre: fila.nombre.trim() };
}

function lineaGuion(bruto: unknown): LineaGuion | null {
  const base = plantilla(bruto);
  if (!base) return null;
  const tachado =
    typeof bruto === "object" &&
    bruto !== null &&
    (bruto as { tachado?: unknown }).tachado === true;
  return { ...base, tachado };
}

function conCuantoLimpio<T extends { cuanto?: unknown }>(
  fila: T,
): Omit<T, "cuanto"> & { cuanto?: CuantoEjercicio } {
  const cuanto = cuantoValido(fila.cuanto);
  const { cuanto: _omitido, ...resto } = fila;
  return cuanto ? { ...resto, cuanto } : resto;
}

export function normalizarEstado(bruto: Estado): Estado {
  return {
    ...bruto,
    actividades: bruto.actividades.map((actividad: Actividad) => ({
      ...conCuantoLimpio(actividad),
      guionPorDefecto: (actividad.guionPorDefecto as unknown[])
        .map(plantilla)
        .filter((linea): linea is PlantillaEjercicio => linea !== null),
    })),
    medidas: medidasFijas.map((m) => ({ ...m })),
    dias: Object.fromEntries(
      Object.entries(bruto.dias).map(([fecha, dia]) => {
        const sesion = dia.sesion
          ? {
              ...conCuantoLimpio(dia.sesion),
              guion: (dia.sesion.guion as unknown[])
                .map(lineaGuion)
                .filter((linea): linea is LineaGuion => linea !== null),
            }
          : undefined;
        const siguiente: Dia = {
          ...dia,
          sesion: sesion as Sesion | undefined,
          extras: dia.extras.map((extra) => conCuantoLimpio(extra) as Extra),
        };
        return [fecha, siguiente];
      }),
    ),
  };
}
