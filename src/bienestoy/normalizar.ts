import { esDibujoId, inferirDibujo } from "./dibujos";
import type {
  Actividad,
  Dia,
  Estado,
  LineaGuion,
  PlantillaEjercicio,
} from "./types";

function plantilla(bruto: unknown): PlantillaEjercicio | null {
  if (typeof bruto === "string") {
    const nombre = bruto.trim();
    if (!nombre) return null;
    return { nombre, dibujo: inferirDibujo(nombre) };
  }
  if (typeof bruto !== "object" || bruto === null) return null;
  const fila = bruto as Record<string, unknown>;
  if (typeof fila.nombre !== "string" || !fila.nombre.trim()) return null;
  return {
    nombre: fila.nombre.trim(),
    dibujo: esDibujoId(fila.dibujo) ? fila.dibujo : inferirDibujo(fila.nombre),
  };
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

export function normalizarEstado(bruto: Estado): Estado {
  return {
    ...bruto,
    actividades: bruto.actividades.map((actividad: Actividad) => ({
      ...actividad,
      guionPorDefecto: (actividad.guionPorDefecto as unknown[])
        .map(plantilla)
        .filter((linea): linea is PlantillaEjercicio => linea !== null),
    })),
    dias: Object.fromEntries(
      Object.entries(bruto.dias).map(([fecha, dia]) => {
        const sesion = dia.sesion
          ? {
              ...dia.sesion,
              guion: (dia.sesion.guion as unknown[])
                .map(lineaGuion)
                .filter((linea): linea is LineaGuion => linea !== null),
            }
          : undefined;
        const siguiente: Dia = { ...dia, sesion };
        return [fecha, siguiente];
      }),
    ),
  };
}
