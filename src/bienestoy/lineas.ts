import type { DibujoId } from "./dibujos";
import type { LineaGuion } from "./types";
import { inferirDibujo } from "./dibujos";

export function lineaDesdeNombre(
  nombre: string,
  dibujo?: DibujoId,
): LineaGuion {
  const limpio = nombre.trim();
  return {
    nombre: limpio,
    dibujo: dibujo ?? inferirDibujo(limpio),
    tachado: false,
  };
}

