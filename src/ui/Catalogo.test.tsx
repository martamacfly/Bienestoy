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
import { Catalogo } from "./Catalogo";

function Arnes() {
  const [estado, setEstado] = useState<Estado>(estadoSemilla);
  function dispatch(accion: Accion) {
    setEstado((prev) => aplicar(prev, accion, { hoy: "2026-08-31" }));
  }
  return <Catalogo estado={estado} dispatch={dispatch} />;
}

describe("Catálogo", () => {
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

  it("muestra la lista y solo deja cambiarla al editar", async () => {
    await act(async () => {
      raiz.render(<Arnes />);
    });
    expect(nodo.textContent).toContain("Gym");
    expect(nodo.textContent).toContain("Sentadilla");
    expect(nodo.textContent).toContain("Editar");
    expect(nodo.textContent).not.toContain("Añadir ejercicio");
    expect(nodo.textContent).not.toContain("Añadir actividad");

    const editar = Array.from(nodo.querySelectorAll("button")).find(
      (b) => b.textContent === "Editar",
    );
    await act(async () => {
      editar!.click();
    });
    expect(nodo.textContent).toContain("Añadir ejercicio");
    expect(nodo.textContent).toContain("Añadir actividad");
    expect(
      nodo.querySelector("input[aria-label='Nombre del ejercicio']"),
    ).toBeTruthy();
  });
});
