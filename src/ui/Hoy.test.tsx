/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useState } from "react";
import {
  aplicar,
  estadoSemilla,
  ID_GYM,
  type Accion,
  type Estado,
} from "../bienestoy";
import { Hoy } from "./Hoy";

const HOY = "2026-08-24";

function Arnes({
  fecha = HOY,
  inicial,
}: {
  fecha?: string;
  inicial?: Estado;
}) {
  const [estado, setEstado] = useState<Estado>(inicial ?? estadoSemilla);
  function dispatch(accion: Accion) {
    setEstado((prev) => aplicar(prev, accion, { hoy: HOY }));
  }
  return <Hoy estado={estado} fecha={fecha} hoy={HOY} dispatch={dispatch} />;
}

describe("Hoy", () => {
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

  it("sin sesión solo pregunta si hubo deporte, no planifica", async () => {
    await act(async () => {
      raiz.render(<Arnes />);
    });
    expect(nodo.textContent).toContain("Sin sesión planificada");
    expect(nodo.textContent).toContain("El plan se edita en Semana");
    expect(
      Array.from(nodo.querySelectorAll("select")).find((el) =>
        el.closest("label")?.textContent?.includes("Planificar"),
      ),
    ).toBeUndefined();
    expect(nodo.textContent).not.toContain("Extras");
  });

  it("con sesión permite marcarla hecha y tachar el guion", async () => {
    const inicial = aplicar(
      estadoSemilla(),
      { tipo: "colocarSesion", fecha: HOY, actividadId: ID_GYM },
      { hoy: HOY },
    );
    await act(async () => {
      raiz.render(<Arnes inicial={inicial} />);
    });
    expect(nodo.textContent).toContain("Gym");
    expect(nodo.textContent).toContain("Sentadilla");
    expect(nodo.querySelector("input[type='checkbox']")).toBeTruthy();
    expect(
      Array.from(nodo.querySelectorAll("select")).find((el) =>
        el.closest("label")?.textContent?.includes("Cambiar"),
      ),
    ).toBeUndefined();

    const hecha = Array.from(nodo.querySelectorAll("button")).find(
      (b) => b.textContent === "Hecha",
    );
    await act(async () => {
      hecha!.click();
    });
    expect(nodo.textContent).toContain("Sesión hecha");
  });

  it("permite marcar una sesión de un día pasado", async () => {
    const pasado = "2026-08-20";
    const inicial = aplicar(
      estadoSemilla(),
      { tipo: "colocarSesion", fecha: pasado, actividadId: ID_GYM },
      { hoy: HOY },
    );
    await act(async () => {
      raiz.render(<Arnes fecha={pasado} inicial={inicial} />);
    });
    expect(nodo.textContent).toContain("jueves 20/8/2026");
    const hecha = Array.from(nodo.querySelectorAll("button")).find(
      (b) => b.textContent === "Hecha",
    );
    await act(async () => {
      hecha!.click();
    });
    expect(nodo.textContent).toContain("Sesión hecha");
  });
});
