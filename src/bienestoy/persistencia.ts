import { openDB, type IDBPDatabase } from "idb";
import { estadoSemilla } from "./seed";
import { normalizarEstado } from "./normalizar";
import type { Estado } from "./types";

const NOMBRE = "bienestoy";
const STORE = "datos";
const CLAVE = "estado";

async function db(): Promise<IDBPDatabase> {
  return openDB(NOMBRE, 1, {
    upgrade(database) {
      database.createObjectStore(STORE);
    },
  });
}

export async function cargarEstado(): Promise<Estado> {
  const conexion = await db();
  const guardado = await conexion.get(STORE, CLAVE);
  conexion.close();
  if (!guardado) return estadoSemilla();
  return normalizarEstado(guardado as Estado);
}

export async function guardarEstado(estado: Estado): Promise<void> {
  const conexion = await db();
  await conexion.put(STORE, estado, CLAVE);
  conexion.close();
}
