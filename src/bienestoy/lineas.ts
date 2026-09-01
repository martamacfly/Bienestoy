import type { LineaGuion } from "./types";

export function lineaDesdeNombre(nombre: string): LineaGuion {
  return {
    nombre: nombre.trim(),
    tachado: false,
  };
}
