import type {
  CuantoEjercicio,
  LineaGuion,
  PlantillaEjercicio,
  UnidadEjercicio,
} from "./types";

export function cuantoValido(bruto: unknown): CuantoEjercicio | undefined {
  if (typeof bruto !== "object" || bruto === null) return undefined;
  const fila = bruto as { valor?: unknown; unidad?: unknown };
  const valor = Number(fila.valor);
  if (!Number.isFinite(valor) || valor <= 0) return undefined;
  if (
    fila.unidad !== "repeticiones" &&
    fila.unidad !== "segundos" &&
    fila.unidad !== "minutos"
  ) {
    return undefined;
  }
  return { valor, unidad: fila.unidad };
}

export function plantillaLimpia(
  linea: PlantillaEjercicio,
): PlantillaEjercicio | null {
  const nombre = linea.nombre.trim();
  if (!nombre) return null;
  const cuanto = cuantoValido(linea.cuanto);
  return cuanto ? { nombre, cuanto } : { nombre };
}

export function lineaDesdeNombre(nombre: string): LineaGuion {
  return {
    nombre: nombre.trim(),
    tachado: false,
  };
}

export function lineaDesdePlantilla(
  linea: PlantillaEjercicio & { tachado?: boolean },
): LineaGuion | null {
  const base = plantillaLimpia(linea);
  if (!base) return null;
  return { ...base, tachado: linea.tachado === true };
}

export function etiquetaCuanto(cuanto?: CuantoEjercicio): string {
  if (!cuanto) return "";
  if (cuanto.unidad === "repeticiones") return `${cuanto.valor} repeticiones`;
  if (cuanto.unidad === "minutos") return `${cuanto.valor} min`;
  return `${cuanto.valor} s`;
}

export function etiquetaConCuanto(
  nombre: string,
  cuanto?: CuantoEjercicio,
): string {
  const etiqueta = etiquetaCuanto(cuanto);
  return etiqueta ? `${nombre} · ${etiqueta}` : nombre;
}

export type TotalesCuanto = {
  minutos: number;
  segundos: number;
  repeticiones: number;
};

export function totalesVacios(): TotalesCuanto {
  return { minutos: 0, segundos: 0, repeticiones: 0 };
}

export function sumarCuanto(
  totales: TotalesCuanto,
  cuanto?: CuantoEjercicio,
): TotalesCuanto {
  const limpio = cuantoValido(cuanto);
  if (!limpio) return totales;
  if (limpio.unidad === "minutos") {
    return { ...totales, minutos: totales.minutos + limpio.valor };
  }
  if (limpio.unidad === "segundos") {
    return { ...totales, segundos: totales.segundos + limpio.valor };
  }
  return { ...totales, repeticiones: totales.repeticiones + limpio.valor };
}

export function etiquetaTotalesCuanto(totales: TotalesCuanto): string {
  const partes: string[] = [];
  if (totales.minutos > 0) partes.push(`${totales.minutos} min`);
  if (totales.segundos > 0) partes.push(`${totales.segundos} s`);
  if (totales.repeticiones > 0) {
    partes.push(
      totales.repeticiones === 1
        ? "1 repetición"
        : `${totales.repeticiones} repeticiones`,
    );
  }
  return partes.join(" · ");
}

export function cuantoDesdeCampos(
  texto: string,
  unidad: UnidadEjercicio,
): CuantoEjercicio | undefined {
  return cuantoValido({
    valor: Number(texto.replace(",", ".")),
    unidad,
  });
}
