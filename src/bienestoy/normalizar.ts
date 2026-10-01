import type {
  Actividad,
  CuantoEjercicio,
  Dia,
  Estado,
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
        const viejo = dia as Dia & {
          sesion?: Sesion;
          extras?: { actividadId: string; actividadNombre: string; cuanto?: unknown }[];
        };
        const crudas = viejo.sesiones ?? [
          ...(viejo.sesion ? [viejo.sesion] : []),
          ...(viejo.extras ?? []).map((extra) => ({
            actividadId: extra.actividadId,
            actividadNombre: extra.actividadNombre,
            estado: "hecha" as const,
            programada: false,
            cuanto: extra.cuanto,
            guion: [],
          })),
        ];
        const sesiones = crudas.map((sesion) => {
          const limpia = conCuantoLimpio(sesion);
          return {
            ...limpia,
            programada: sesion.programada !== false,
            guion: ((sesion.guion ?? []) as unknown[])
              .map(lineaGuion)
              .filter((linea): linea is LineaGuion => linea !== null),
          };
        });
        const siguiente: Dia = {
          sesiones,
          ...(viejo.deporteManual === undefined
            ? {}
            : { deporteManual: viejo.deporteManual }),
        };
        return [fecha, siguiente];
      }),
    ),
  };
}
