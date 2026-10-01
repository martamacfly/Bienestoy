import { describe, expect, it } from "vitest";
import { aplicar } from "./aplicar";
import { fechaAlDeslizar, lunesAlDeslizar, lunesDe } from "./calendario";
import { normalizarEstado } from "./normalizar";
import { cumplimientoSemana, deporteDelDia, diaDe, diasSemana, fechasConDeporte, historialDias, historialSemanas, resumenActividades, resumenDeporte, serieMedida } from "./consultas";
import { exportarJSON, importarJSON } from "./exportar";
import { ID_CAMINAR, ID_CINTURA, ID_GYM, ID_RUNNING, ID_YOGA, estadoSemilla } from "./seed";
import type { Accion, Estado } from "./types";

const LUNES = "2026-08-24";
const MARTES = "2026-08-25";
const MIERCOLES = "2026-08-26";
const JUEVES = "2026-08-27";

describe("semana lunes a domingo", () => {
  it("el lunes de un domingo es el lunes anterior", () => {
    expect(lunesDe("2026-08-30")).toBe(LUNES);
    expect(lunesDe(LUNES)).toBe(LUNES);
  });

  it("deslizar en Hoy va al día anterior y no pasa de hoy", () => {
    expect(fechaAlDeslizar(MARTES, MARTES, "anterior")).toBe(LUNES);
    expect(fechaAlDeslizar(LUNES, MARTES, "siguiente")).toBe(MARTES);
    expect(fechaAlDeslizar(MARTES, MARTES, "siguiente")).toBeNull();
  });

  it("deslizar en Resumen va a la semana anterior y no pasa de esta", () => {
    expect(lunesAlDeslizar(LUNES, MARTES, "anterior")).toBe("2026-08-17");
    expect(lunesAlDeslizar("2026-08-17", MARTES, "siguiente")).toBe(LUNES);
    expect(lunesAlDeslizar(LUNES, MARTES, "siguiente")).toBeNull();
  });
});

function hacer(
  estado: Estado,
  accion: Accion,
  hoy = LUNES,
): Estado {
  return aplicar(estado, accion, { hoy });
}

describe("deporte del día", () => {
  it("un día vacío queda sin marcar", () => {
    const estado = estadoSemilla();
    expect(deporteDelDia(estado, MARTES)).toBe("sin_marcar");
  });

  it("una actividad hecha implica deporte sí", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: MARTES,
      estado: "hecha",
    });
    expect(deporteDelDia(estado, MARTES)).toBe("si");
  });

  it("en día vacío se puede responder no", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "responderDeporte",
      fecha: MARTES,
      si: false,
    });
    expect(deporteDelDia(estado, MARTES)).toBe("no");
  });

  it("sesión hecha implica sí", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_RUNNING,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: MARTES,
      estado: "hecha",
    });
    expect(deporteDelDia(estado, MARTES)).toBe("si");
  });

  it("si todas las actividades están saltadas el día es no", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: MARTES,
      estado: "saltada",
    });
    expect(deporteDelDia(estado, MARTES)).toBe("no");
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
    });
    expect(deporteDelDia(estado, MARTES)).toBe("sin_marcar");
    expect(diaDe(estado, MARTES).sesiones).toHaveLength(2);
  });

  it("no deja responder deporte a mano si ya hay sesión", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_RUNNING,
    });
    estado = hacer(estado, {
      tipo: "responderDeporte",
      fecha: MARTES,
      si: true,
    });
    expect(deporteDelDia(estado, MARTES)).toBe("sin_marcar");
  });
});

describe("sesión y plan", () => {
  it("admite varias actividades en el mismo día y copia el guion", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_RUNNING,
    });
    const sesiones = diaDe(estado, MARTES).sesiones;
    expect(sesiones.map((sesion) => sesion.actividadId)).toEqual([
      ID_GYM,
      ID_RUNNING,
    ]);
    expect(sesiones[0].guion.map((linea) => linea.nombre)).toEqual([
      "Sentadilla",
      "Press",
      "Plank",
    ]);
    expect(sesiones[1].guion).toEqual([]);
    expect(sesiones[1].estado).toBe("pendiente");
  });

  it("copia repeticiones o segundos del catálogo al planificar", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "definirGuionActividad",
      id: ID_GYM,
      lineas: [
        { nombre: "Sentadilla", cuanto: { valor: 12, unidad: "repeticiones" } },
        { nombre: "Plank", cuanto: { valor: 30, unidad: "segundos" } },
      ],
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    expect(diaDe(estado, MARTES).sesiones[0]?.guion).toEqual([
      {
        nombre: "Sentadilla",
        tachado: false,
        cuanto: { valor: 12, unidad: "repeticiones" },
      },
      {
        nombre: "Plank",
        tachado: false,
        cuanto: { valor: 30, unidad: "segundos" },
      },
    ]);
  });

  it("copia repeticiones o tiempo de la actividad al planificar", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "definirCuantoActividad",
      id: ID_RUNNING,
      cuanto: { valor: 30, unidad: "minutos" },
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_RUNNING,
    });
    expect(diaDe(estado, MARTES).sesiones[0]?.cuanto).toEqual({
      valor: 30,
      unidad: "minutos",
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MIERCOLES,
      actividadId: ID_RUNNING,
    });
    expect(diaDe(estado, MIERCOLES).sesiones[0].cuanto).toEqual({
      valor: 30,
      unidad: "minutos",
    });
  });

  it("refleja en las actividades del día un cambio del catálogo", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_RUNNING,
    });
    estado = hacer(estado, {
      tipo: "renombrarActividad",
      id: ID_GYM,
      nombre: "Fuerza",
    });
    estado = hacer(estado, {
      tipo: "definirCuantoActividad",
      id: ID_RUNNING,
      cuanto: { valor: 25, unidad: "minutos" },
    });
    estado = hacer(estado, {
      tipo: "definirGuionActividad",
      id: ID_GYM,
      lineas: [{ nombre: "Peso muerto" }],
    });
    const dia = diaDe(estado, MARTES);
    expect(dia.sesiones[0]?.actividadNombre).toBe("Fuerza");
    expect(dia.sesiones[0]?.guion.map((linea) => linea.nombre)).toEqual([
      "Peso muerto",
    ]);
    expect(dia.sesiones[1].cuanto).toEqual({ valor: 25, unidad: "minutos" });
  });

  it("no pisa el guion de un día ya retocado al cambiar el catálogo", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "reemplazarGuion",
      fecha: MARTES,
      lineas: [{ nombre: "Solo este día", tachado: false }],
    });
    estado = hacer(estado, {
      tipo: "definirGuionActividad",
      id: ID_GYM,
      lineas: [{ nombre: "Peso muerto" }],
    });
    expect(
      diaDe(estado, MARTES).sesiones[0]?.guion.map((linea) => linea.nombre),
    ).toEqual(["Solo este día"]);
  });

  it("permite poner repeticiones o tiempo en una actividad del día", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
    });
    estado = hacer(estado, {
      tipo: "definirCuantoSesion",
      fecha: MARTES,
      indice: 0,
      cuanto: { valor: 40, unidad: "minutos" },
    });
    expect(diaDe(estado, MARTES).sesiones[0].cuanto).toEqual({
      valor: 40,
      unidad: "minutos",
    });
  });

  it("permite colocar o cambiar la sesión de un día pasado", () => {
    let estado = estadoSemilla();
    estado = hacer(
      estado,
      { tipo: "colocarSesion", fecha: LUNES, actividadId: ID_GYM },
      JUEVES,
    );
    estado = hacer(
      estado,
      { tipo: "cambiarSesion", fecha: LUNES, indice: 0, actividadId: ID_YOGA },
      JUEVES,
    );
    expect(diaDe(estado, LUNES).sesiones[0]?.actividadId).toBe(ID_YOGA);
  });

  it("sí permite marcar tarde un día pasado", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    estado = hacer(
      estado,
      { tipo: "marcarSesion", fecha: LUNES, estado: "hecha" },
      JUEVES,
    );
    expect(diaDe(estado, LUNES).sesiones[0]?.estado).toBe("hecha");
  });

  it("tachar el guion no cumple la sesión", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "tacharGuion",
      fecha: MARTES,
      indice: 0,
      tachado: true,
    });
    expect(diaDe(estado, MARTES).sesiones[0]?.estado).toBe("pendiente");
    expect(cumplimientoSemana(estado, LUNES)).toEqual({
      hechas: 0,
      planificadas: 1,
    });
  });

  it("editar el guion conserva lo ya tachado", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "tacharGuion",
      fecha: MARTES,
      indice: 0,
      tachado: true,
    });
    const actual = diaDe(estado, MARTES).sesiones[0]!.guion;
    estado = hacer(estado, {
      tipo: "reemplazarGuion",
      fecha: MARTES,
      lineas: actual.map((linea, i) =>
        i === 0 ? { ...linea, nombre: "Sentadilla goblet" } : linea,
      ),
    });
    const guion = diaDe(estado, MARTES).sesiones[0]?.guion;
    expect(guion?.[0]).toMatchObject({
      nombre: "Sentadilla goblet",
      tachado: true,
    });
    expect(guion?.[1]?.tachado).toBe(false);
  });
});

describe("cumplimiento de la semana", () => {
  it("pendiente y saltada no cuentan como hechas", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_RUNNING,
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MIERCOLES,
      actividadId: ID_YOGA,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: LUNES,
      estado: "hecha",
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: MARTES,
      estado: "saltada",
    });
    expect(cumplimientoSemana(estado, LUNES)).toEqual({
      hechas: 1,
      planificadas: 3,
    });
  });
});

describe("copiar semana anterior", () => {
  it("copia las actividades y el guion, no las marcas ni el peso", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: MARTES,
      estado: "hecha",
    });
    estado = hacer(estado, {
      tipo: "tacharGuion",
      fecha: MARTES,
      indice: 0,
      tachado: true,
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
    });
    estado = hacer(estado, { tipo: "registrarPesaje", fecha: MARTES, kg: 62.3 });

    const lunesSiguiente = "2026-08-31";
    const martesSiguiente = "2026-09-01";
    estado = hacer(
      estado,
      { tipo: "copiarSemanaAnterior", lunesDestino: lunesSiguiente },
      lunesSiguiente,
    );

    const copia = diaDe(estado, martesSiguiente).sesiones[0];
    expect(copia?.actividadId).toBe(ID_GYM);
    expect(copia?.estado).toBe("pendiente");
    expect(copia?.guion[0]?.tachado).toBe(false);
    expect(copia?.guion[0]?.nombre).toBe("Sentadilla");
    expect(diaDe(estado, martesSiguiente).sesiones[1]?.actividadId).toBe(
      ID_CAMINAR,
    );
    expect(diaDe(estado, martesSiguiente).sesiones[1]?.estado).toBe("pendiente");
    expect(estado.pesajes[martesSiguiente]).toBeUndefined();
    expect(diaDe(estado, MARTES).sesiones[0]?.estado).toBe("hecha");
  });

  it("copia también los días ya pasados de la semana destino", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    const lunesSiguiente = "2026-08-31";
    estado = hacer(
      estado,
      { tipo: "copiarSemanaAnterior", lunesDestino: lunesSiguiente },
      "2026-09-02",
    );
    expect(diaDe(estado, lunesSiguiente).sesiones[0]?.actividadId).toBe(ID_GYM);
  });
});

describe("cuerpo", () => {
  it("un segundo pesaje el mismo día sustituye", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, { tipo: "registrarPesaje", fecha: MARTES, kg: 62 });
    estado = hacer(estado, { tipo: "registrarPesaje", fecha: MARTES, kg: 61.5 });
    expect(estado.pesajes[MARTES]).toBe(61.5);
  });

  it("guarda la serie de una medida en el tiempo", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "registrarMedida",
      fecha: LUNES,
      medidaId: ID_CINTURA,
      valor: 70,
    });
    estado = hacer(estado, {
      tipo: "registrarMedida",
      fecha: MARTES,
      medidaId: ID_CINTURA,
      valor: 69.5,
    });
    expect(serieMedida(estado, ID_CINTURA)).toEqual([
      { fecha: LUNES, valor: 70 },
      { fecha: MARTES, valor: 69.5 },
    ]);
  });

  it("las medidas son fijas: cintura, brazo y cadera", () => {
    const estado = estadoSemilla();
    expect(estado.medidas.map((m) => m.nombre)).toEqual([
      "Cintura",
      "Brazo",
      "Cadera",
    ]);
    const siguiente = hacer(estado, {
      tipo: "registrarMedida",
      fecha: MARTES,
      medidaId: "med-inventada",
      valor: 10,
    });
    expect(siguiente.valoresMedida[MARTES]).toBeUndefined();
  });

  it("al cargar un estado viejo deja las medidas fijas", () => {
    const bruto = estadoSemilla();
    bruto.medidas = [{ id: "otra", nombre: "Cuello", unidad: "cm" }];
    expect(normalizarEstado(bruto).medidas.map((m) => m.nombre)).toEqual([
      "Cintura",
      "Brazo",
      "Cadera",
    ]);
  });
});

describe("copia JSON", () => {
  it("exporta e importa el mismo estado", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    const texto = exportarJSON(estado);
    expect(importarJSON(texto)).toEqual(estado);
  });

  it("rechaza un JSON que no es una copia", () => {
    expect(() => importarJSON("{}")).toThrow(/no válida/);
  });
});

describe("resumen", () => {
  it("cuenta actividades hechas y saltadas", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: LUNES,
      estado: "hecha",
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_RUNNING,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: MARTES,
      estado: "saltada",
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: MARTES,
      indice: 1,
      estado: "hecha",
    });
    const filas = resumenActividades(estado);
    expect(filas.find((f) => f.nombre === "Gym")).toMatchObject({
      hechas: 1,
      saltadas: 0,
    });
    expect(filas.find((f) => f.nombre === "Running")).toMatchObject({
      hechas: 0,
      saltadas: 1,
    });
    expect(filas.find((f) => f.nombre === "Caminar")?.hechas).toBe(1);
  });

  it("suma tiempo y repeticiones de lo hecho, no de lo pendiente", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "definirCuantoActividad",
      id: ID_GYM,
      cuanto: { valor: 45, unidad: "minutos" },
    });
    estado = hacer(estado, {
      tipo: "definirGuionActividad",
      id: ID_GYM,
      lineas: [
        { nombre: "Sentadilla", cuanto: { valor: 12, unidad: "repeticiones" } },
      ],
    });
    estado = hacer(estado, {
      tipo: "definirCuantoActividad",
      id: ID_RUNNING,
      cuanto: { valor: 30, unidad: "minutos" },
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: LUNES,
      estado: "hecha",
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_RUNNING,
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MIERCOLES,
      actividadId: ID_CAMINAR,
    });
    estado = hacer(estado, {
      tipo: "definirCuantoSesion",
      fecha: MIERCOLES,
      indice: 0,
      cuanto: { valor: 40, unidad: "minutos" },
    });
    const filas = resumenActividades(estado);
    expect(filas.find((f) => f.nombre === "Gym")).toMatchObject({
      hechas: 1,
      minutos: 45,
      repeticiones: 12,
    });
    expect(filas.find((f) => f.nombre === "Running")).toMatchObject({
      pendientes: 1,
      minutos: 0,
    });
    expect(filas.find((f) => f.nombre === "Caminar")).toMatchObject({
      pendientes: 1,
      minutos: 0,
    });
  });

  it("cuenta un día cuando alguna de sus actividades está hecha", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: LUNES,
      estado: "hecha",
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: MARTES,
      estado: "hecha",
    });
    expect(diasSemana(estado, LUNES, MARTES)).toEqual({
      hechas: 2,
      total: 2,
    });
    expect(fechasConDeporte(estado, LUNES, MARTES)).toEqual([LUNES, MARTES]);
    const semanas = historialDias(estado, MARTES, 2);
    expect(semanas[1]).toMatchObject({
      lunes: LUNES,
      hechas: 2,
      total: 2,
    });
  });

  it("un día con actividades sin hacer no cuenta como deporte", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
    });
    expect(diasSemana(estado, LUNES, MARTES)).toEqual({
      hechas: 0,
      total: 2,
    });
    expect(fechasConDeporte(estado, LUNES, MARTES)).toEqual([]);
  });

  it("un día cuenta si alguna de sus actividades está hecha", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_CAMINAR,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: LUNES,
      indice: 1,
      estado: "hecha",
    });
    expect(diasSemana(estado, LUNES, LUNES)).toEqual({
      hechas: 1,
      total: 1,
    });
    expect(cumplimientoSemana(estado, LUNES)).toEqual({
      hechas: 1,
      planificadas: 2,
    });
  });

  it("el historial de semanas incluye la actual y las anteriores", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: LUNES,
      estado: "hecha",
    });
    const semanas = historialSemanas(estado, LUNES, 2);
    expect(semanas).toHaveLength(2);
    expect(semanas[1]).toMatchObject({
      lunes: LUNES,
      hechas: 1,
      planificadas: 1,
    });
    expect(semanas[0]?.planificadas).toBe(0);
  });

  it("resume deporte sí/no en un rango", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: LUNES,
      actividadId: ID_GYM,
    });
    estado = hacer(estado, {
      tipo: "marcarSesion",
      fecha: LUNES,
      estado: "hecha",
    });
    estado = hacer(estado, {
      tipo: "responderDeporte",
      fecha: MARTES,
      si: false,
    });
    expect(resumenDeporte(estado, LUNES, MARTES)).toEqual({
      si: 1,
      no: 1,
      sinMarcar: 0,
    });
  });
});

describe("guion", () => {
  it("normaliza un guion antiguo de solo texto o con dibujo", () => {
    const bruto = estadoSemilla();
    bruto.actividades[0] = {
      ...bruto.actividades[0],
      guionPorDefecto: ["Sentadilla", { nombre: "Press", dibujo: "press" }] as never,
    };
    const estado = normalizarEstado(bruto);
    expect(estado.actividades[0]?.guionPorDefecto).toEqual([
      { nombre: "Sentadilla" },
      { nombre: "Press" },
    ]);
  });
});
