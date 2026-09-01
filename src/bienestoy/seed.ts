import type { Actividad, DefinicionMedida, Estado } from "./types";

export const ID_GYM = "act-gym";
export const ID_RUNNING = "act-running";
export const ID_YOGA = "act-yoga";
export const ID_CAMINAR = "act-caminar";
export const ID_CINTURA = "med-cintura";
export const ID_BRAZO = "med-brazo";
export const ID_CADERA = "med-cadera";

export const medidasFijas: DefinicionMedida[] = [
  { id: ID_CINTURA, nombre: "Cintura", unidad: "cm" },
  { id: ID_BRAZO, nombre: "Brazo", unidad: "cm" },
  { id: ID_CADERA, nombre: "Cadera", unidad: "cm" },
];

const actividadesSemilla: Actividad[] = [
  {
    id: ID_GYM,
    nombre: "Gym",
    guionPorDefecto: [
      { nombre: "Sentadilla" },
      { nombre: "Press" },
      { nombre: "Plank" },
    ],
  },
  { id: ID_RUNNING, nombre: "Running", guionPorDefecto: [] },
  { id: ID_YOGA, nombre: "Yoga", guionPorDefecto: [] },
  { id: ID_CAMINAR, nombre: "Caminar", guionPorDefecto: [] },
];

export function estadoSemilla(): Estado {
  return {
    actividades: actividadesSemilla.map((a) => ({
      ...a,
      guionPorDefecto: a.guionPorDefecto.map((linea) => ({ ...linea })),
    })),
    medidas: medidasFijas.map((m) => ({ ...m })),
    dias: {},
    pesajes: {},
    valoresMedida: {},
  };
}
