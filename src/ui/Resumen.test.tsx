/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  aplicar,
  estadoSemilla,
  ID_CAMINAR,
  ID_GYM,
  type Estado,
} from "../bienestoy";
import { Resumen } from "./Resumen";

const HOY = "2026-08-31";
const LUNES_PASADO = "2026-08-24";

function conMarcas(): Estado {
  let estado = estadoSemilla();
  estado = aplicar(
    estado,
    {
      tipo: "definirCuantoActividad",
      id: ID_GYM,
      cuanto: { valor: 45, unidad: "minutos" },
    },
    { hoy: HOY },
  );
  estado = aplicar(
    estado,
    { tipo: "colocarSesion", fecha: HOY, actividadId: ID_GYM },
    { hoy: HOY },
  );
  estado = aplicar(
    estado,
    { tipo: "marcarSesion", fecha: HOY, estado: "hecha" },
    { hoy: HOY },
  );
  estado = aplicar(
    estado,
    { tipo: "anadirExtra", fecha: HOY, actividadId: ID_CAMINAR },
    { hoy: HOY },
  );
  estado = aplicar(
    estado,
    {
      tipo: "definirCuantoExtra",
      fecha: HOY,
      indice: 0,
      cuanto: { valor: 40, unidad: "minutos" },
    },
    { hoy: HOY },
  );
  return estado;
}

describe("Resumen", () => {
  let raiz: Root;
  let nodo: HTMLDivElement;

  beforeEach(() => {
    nodo = document.createElement("div");
    document.body.appendChild(nodo);
    raiz = createRoot(nodo);
  });

  afterEach(() => {
    act(() => raiz.unmount());
    nodo.remove();
  });

  function pintar(
    estado: Estado,
    lunes = HOY,
    onVerSemana: (lunes: string) => void = () => undefined,
  ) {
    raiz.render(
      <Resumen
        estado={estado}
        hoy={HOY}
        lunes={lunes}
        onVerSemana={onVerSemana}
      />,
    );
  }

  it("sin marcas no muestra gráfica de actividades", async () => {
    await act(async () => {
      pintar(estadoSemilla());
    });
    expect(nodo.querySelector("svg[aria-label='Actividades']")).toBeNull();
    expect(nodo.textContent).toContain("Aún no hay actividad programada ni extra");
    expect(nodo.querySelector("svg[aria-label='Deporte']")).toBeTruthy();
    expect(nodo.textContent).toContain("sin marcar");
  });

  it("grafica deporte, sesiones y actividades", async () => {
    await act(async () => {
      pintar(conMarcas());
    });
    expect(nodo.querySelector("svg[aria-label='Deporte']")).toBeTruthy();
    expect(nodo.textContent).toContain("sí 1");
    expect(nodo.querySelector("svg[aria-label='Días']")).toBeTruthy();
    const grafica = nodo.querySelector("svg[aria-label='Actividades']");
    expect(grafica).toBeTruthy();
    expect(grafica?.textContent).toContain("Gym");
    expect(grafica?.textContent).toContain("Caminar");
    expect(grafica?.querySelectorAll("rect").length).toBeGreaterThanOrEqual(2);
    expect(nodo.textContent).toContain("programadas 1");
    expect(nodo.textContent).toContain("extras 1");
    expect(nodo.textContent).toContain("Gym · 45 min");
    expect(nodo.textContent).toContain("1 programada");
    expect(nodo.textContent).toContain("Caminar · 40 min");
    expect(nodo.textContent).toContain("1 extra");
  });

  it("un extra sin plan cuenta en los días y en las 8 semanas", async () => {
    let estado = estadoSemilla();
    estado = aplicar(
      estado,
      { tipo: "anadirExtra", fecha: HOY, actividadId: ID_CAMINAR },
      { hoy: HOY },
    );
    await act(async () => {
      pintar(estado);
    });
    expect(nodo.querySelector("svg[aria-label='Días']")).toBeTruthy();
    expect(nodo.textContent).toContain("con deporte 1");
    expect(nodo.querySelector("svg[aria-label='Cumplimiento por semana']")).toBeTruthy();
    expect(nodo.textContent).not.toContain("Cuando tengas un plan");
    expect(nodo.querySelector("svg[aria-label='Actividades']")?.textContent).toContain(
      "Caminar",
    );
  });

  it("una semana pasada resume esa semana, no la actual", async () => {
    let estado = estadoSemilla();
    estado = aplicar(
      estado,
      { tipo: "anadirExtra", fecha: LUNES_PASADO, actividadId: ID_CAMINAR },
      { hoy: HOY },
    );
    estado = aplicar(
      estado,
      { tipo: "colocarSesion", fecha: HOY, actividadId: ID_GYM },
      { hoy: HOY },
    );
    estado = aplicar(
      estado,
      { tipo: "marcarSesion", fecha: HOY, estado: "hecha" },
      { hoy: HOY },
    );
    await act(async () => {
      pintar(estado, LUNES_PASADO);
    });
    expect(nodo.textContent).toContain("24–30 ago 2026");
    expect(nodo.textContent).not.toContain(" · esta");
    expect(nodo.textContent).toContain("sí 1");
    expect(nodo.querySelector("svg[aria-label='Actividades']")?.textContent).toContain(
      "Caminar",
    );
    expect(nodo.querySelector("svg[aria-label='Actividades']")?.textContent).not.toContain(
      "Gym",
    );
  });

  it("al deslizar a la derecha pasa a la semana anterior", async () => {
    let visto = "";
    await act(async () => {
      pintar(estadoSemilla(), HOY, (lunes) => {
        visto = lunes;
      });
    });
    const pantalla = nodo.querySelector("main");
    await act(async () => {
      pantalla!.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          clientX: 80,
          clientY: 80,
          pointerId: 1,
        }),
      );
      pantalla!.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          clientX: 200,
          clientY: 80,
          pointerId: 1,
        }),
      );
    });
    expect(visto).toBe(LUNES_PASADO);
  });

  it("al deslizar a la izquierda desde esta semana no avanza al futuro", async () => {
    let visto = "";
    await act(async () => {
      pintar(estadoSemilla(), HOY, (lunes) => {
        visto = lunes;
      });
    });
    const pantalla = nodo.querySelector("main");
    await act(async () => {
      pantalla!.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          clientX: 200,
          clientY: 80,
          pointerId: 1,
        }),
      );
      pantalla!.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          clientX: 80,
          clientY: 80,
          pointerId: 1,
        }),
      );
    });
    expect(visto).toBe("");
  });

  it("enseña flecha atrás y no adelante en esta semana", async () => {
    await act(async () => {
      pintar(estadoSemilla());
    });
    expect(nodo.querySelector("button[aria-label='Semana anterior']")).toBeTruthy();
    expect(
      nodo.querySelector("button[aria-label='Semana siguiente']"),
    ).toBeNull();
  });

  it("la flecha adelante vuelve a esta semana", async () => {
    let visto = "";
    await act(async () => {
      pintar(estadoSemilla(), LUNES_PASADO, (lunes) => {
        visto = lunes;
      });
    });
    await act(async () => {
      nodo
        .querySelector<HTMLButtonElement>("button[aria-label='Semana siguiente']")!
        .click();
    });
    expect(visto).toBe(HOY);
  });
});
