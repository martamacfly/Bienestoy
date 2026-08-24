/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useState } from "react";
import { aplicar, estadoSemilla, ID_GYM, type Accion, type Estado } from "../bienestoy";
import { Hoy } from "./Hoy";

const HOY = "2026-08-24";

function Arnes() {
  const [estado, setEstado] = useState<Estado>(estadoSemilla);
  function dispatch(accion: Accion) {
    setEstado((prev) => aplicar(prev, accion, { hoy: HOY }));
  }
  return <Hoy estado={estado} hoy={HOY} dispatch={dispatch} />;
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

  it("permite planificar gym y marcar la sesión hecha", async () => {
    await act(async () => {
      raiz.render(<Arnes />);
    });
    expect(nodo.textContent).toContain("Sin sesión planificada");

    const selector = Array.from(nodo.querySelectorAll("select")).find((el) =>
      el.closest("label")?.textContent?.includes("Planificar hoy"),
    );
    expect(selector).toBeTruthy();

    await act(async () => {
      selector!.value = ID_GYM;
      selector!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(nodo.textContent).toContain("Gym");
    expect(nodo.textContent).toContain("Sentadilla");

    const hecha = Array.from(nodo.querySelectorAll("button")).find(
      (b) => b.textContent === "Hecha",
    );
    await act(async () => {
      hecha!.click();
    });
    expect(nodo.textContent).toContain("Sesión hecha");
  });
});
