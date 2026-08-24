import type { Actividad, DefinicionMedida, Estado } from "./types";

export const ID_GYM = "act-gym";
export const ID_RUNNING = "act-running";
export const ID_YOGA = "act-yoga";
export const ID_CAMINAR = "act-caminar";
export const ID_CINTURA = "med-cintura";

const actividadesSemilla: Actividad[] = [
  {
    id: ID_GYM,
    nombre: "Gym",
    guionPorDefecto: [
      { nombre: "Sentadilla", dibujo: "sentadilla" },
      { nombre: "Press", dibujo: "press" },
      { nombre: "Plank", dibujo: "plank" },
    ],
  },
  { id: ID_RUNNING, nombre: "Running", guionPorDefecto: [] },
  { id: ID_YOGA, nombre: "Yoga", guionPorDefecto: [] },
  { id: ID_CAMINAR, nombre: "Caminar", guionPorDefecto: [] },
];

const medidasSemilla: DefinicionMedida[] = [
  { id: ID_CINTURA, nombre: "Cintura", unidad: "cm" },
];

export function estadoSemilla(): Estado {
  return {
    actividades: actividadesSemilla.map((a) => ({
      ...a,
      guionPorDefecto: a.guionPorDefecto.map((linea) => ({ ...linea })),
    })),
    medidas: medidasSemilla.map((m) => ({ ...m })),
    dias: {},
    pesajes: {},
    valoresMedida: {},
  };
}
