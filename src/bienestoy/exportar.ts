import { normalizarEstado } from "./normalizar";
import type { Estado } from "./types";

const VERSION = 1;

export type Documento = {
  version: number;
  estado: Estado;
};

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

export function exportarJSON(estado: Estado): string {
  const documento: Documento = { version: VERSION, estado };
  return JSON.stringify(documento, null, 2);
}

export function importarJSON(texto: string): Estado {
  const bruto = JSON.parse(texto) as unknown;
  if (!esObjeto(bruto) || bruto.version !== VERSION || !esObjeto(bruto.estado)) {
    throw new Error("Copia no válida");
  }
  const estado = bruto.estado as Estado;
  if (
    !Array.isArray(estado.actividades) ||
    !Array.isArray(estado.medidas) ||
    !esObjeto(estado.dias) ||
    !esObjeto(estado.pesajes) ||
    !esObjeto(estado.valoresMedida)
  ) {
    throw new Error("Copia no válida");
  }
  return normalizarEstado(estado);
}
