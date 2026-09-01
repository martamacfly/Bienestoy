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
  type Accion,
  type Estado,
} from "../bienestoy";
import { Cuerpo } from "./Cuerpo";

const HOY = "2026-09-01";
const AYER = "2026-08-31";

function Arnes({ fecha = HOY }: { fecha?: string }) {
  const [estado, setEstado] = useState<Estado>(estadoSemilla);
  function dispatch(accion: Accion) {
    setEstado((prev) => aplicar(prev, accion, { hoy: HOY }));
  }
  return (
    <Cuerpo estado={estado} fecha={fecha} hoy={HOY} dispatch={dispatch} />
  );
}

describe("Cuerpo", () => {
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

  it("muestra la fecha del día y guarda el pesaje en ese día", async () => {
    await act(async () => {
      raiz.render(<Arnes fecha={AYER} />);
    });
    expect(nodo.textContent).toContain("lunes 31/8/2026");
    expect(nodo.textContent).not.toContain("Pesaje de hoy");

    const input = nodo.querySelector<HTMLInputElement>(
      "input[inputMode='decimal']",
    );
    const escribir = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    await act(async () => {
      escribir.call(input, "62.3");
      input!.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const guardar = Array.from(nodo.querySelectorAll("button")).find(
      (b) => b.textContent === "Guardar peso",
    );
    await act(async () => {
      guardar!.click();
    });
    expect(nodo.textContent).toContain("62.3");
    expect(nodo.textContent).toContain(AYER);
  });
});
