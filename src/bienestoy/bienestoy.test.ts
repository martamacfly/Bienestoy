import { describe, expect, it } from "vitest";
import { aplicar } from "./aplicar";
import { lunesDe } from "./calendario";
import { inferirDibujo } from "./dibujos";
import { normalizarEstado } from "./normalizar";
import { cumplimientoSemana, deporteDelDia, diaDe, historialSemanas, resumenActividades, resumenDeporte, serieMedida } from "./consultas";
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
});

function hacer(
  estado: Estado,
  accion: Accion,
  hoy = LUNES,
): Estado {
  return aplicar(estado, accion, { hoy });
}

describe("deporte del día", () => {
  it("un día vacío sin extras queda sin marcar", () => {
    const estado = estadoSemilla();
    expect(deporteDelDia(estado, MARTES)).toBe("sin_marcar");
  });

  it("un extra en día vacío implica deporte sí", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "anadirExtra",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
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

  it("sesión saltada implica no aunque haya extra", () => {
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
    estado = hacer(estado, {
      tipo: "anadirExtra",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
    });
    expect(deporteDelDia(estado, MARTES)).toBe("no");
    expect(diaDe(estado, MARTES).extras).toHaveLength(1);
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
  it("coloca como máximo una sesión y copia el guion de la actividad", () => {
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
    const sesion = diaDe(estado, MARTES).sesion;
    expect(sesion?.actividadId).toBe(ID_RUNNING);
    expect(sesion?.guion).toEqual([]);
    expect(sesion?.estado).toBe("pendiente");
  });

  it("copia el dibujito de cada ejercicio al colocar la sesión", () => {
    let estado = estadoSemilla();
    estado = hacer(estado, {
      tipo: "colocarSesion",
      fecha: MARTES,
      actividadId: ID_GYM,
    });
    expect(diaDe(estado, MARTES).sesion?.guion.map((l) => l.dibujo)).toEqual([
      "sentadilla",
      "press",
      "plank",
    ]);
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
      { tipo: "colocarSesion", fecha: LUNES, actividadId: ID_YOGA },
      JUEVES,
    );
    expect(diaDe(estado, LUNES).sesion?.actividadId).toBe(ID_YOGA);
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
    expect(diaDe(estado, LUNES).sesion?.estado).toBe("hecha");
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
    expect(diaDe(estado, MARTES).sesion?.estado).toBe("pendiente");
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
    const actual = diaDe(estado, MARTES).sesion!.guion;
    estado = hacer(estado, {
      tipo: "reemplazarGuion",
      fecha: MARTES,
      lineas: actual.map((linea, i) =>
        i === 0 ? { ...linea, nombre: "Sentadilla goblet" } : linea,
      ),
    });
    const guion = diaDe(estado, MARTES).sesion?.guion;
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
  it("copia actividad y guion, no marcas ni extras ni peso", () => {
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
      tipo: "anadirExtra",
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

    const copia = diaDe(estado, martesSiguiente).sesion;
    expect(copia?.actividadId).toBe(ID_GYM);
    expect(copia?.estado).toBe("pendiente");
    expect(copia?.guion[0]?.tachado).toBe(false);
    expect(copia?.guion[0]?.dibujo).toBe("sentadilla");
    expect(diaDe(estado, martesSiguiente).extras).toEqual([]);
    expect(estado.pesajes[martesSiguiente]).toBeUndefined();
    expect(diaDe(estado, MARTES).sesion?.estado).toBe("hecha");
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
    expect(diaDe(estado, lunesSiguiente).sesion?.actividadId).toBe(ID_GYM);
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
  it("cuenta sesiones hechas, saltadas y extras por actividad", () => {
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
      tipo: "anadirExtra",
      fecha: MARTES,
      actividadId: ID_CAMINAR,
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
    expect(filas.find((f) => f.nombre === "Caminar")?.extras).toBe(1);
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

describe("dibujos", () => {
  it("infiere el dibujo por el nombre del ejercicio", () => {
    expect(inferirDibujo("Zancadas")).toBe("zancada");
    expect(inferirDibujo("plancha")).toBe("plank");
    expect(inferirDibujo("flexiones")).toBe("flexion");
    expect(inferirDibujo("zumba")).toBe("baile");
    expect(inferirDibujo("peso muerto")).toBe("muerto");
    expect(inferirDibujo("fondos")).toBe("fondos");
    expect(inferirDibujo("pilates")).toBe("pilates");
    expect(inferirDibujo("jumping jack")).toBe("jumpingjack");
  });

  it("normaliza un guion antiguo de solo texto", () => {
    const bruto = estadoSemilla();
    bruto.actividades[0] = {
      ...bruto.actividades[0],
      guionPorDefecto: ["Sentadilla"] as never,
    };
    const estado = normalizarEstado(bruto);
    expect(estado.actividades[0]?.guionPorDefecto[0]).toEqual({
      nombre: "Sentadilla",
      dibujo: "sentadilla",
    });
  });
});
