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
    expect(nodo.textContent).toContain("ejercicios");
    expect(nodo.textContent).not.toContain("Sentadilla · Press");
    expect(nodo.querySelectorAll(".ficha").length).toBeGreaterThanOrEqual(2);
    expect(nodo.querySelectorAll(".lista-guion .linea-guion").length).toBeGreaterThanOrEqual(3);
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
    expect(
      nodo.querySelector("input[aria-label='Cantidad de la actividad']"),
    ).toBeTruthy();
    expect(
      nodo.querySelector("select[aria-label='Unidad de la actividad']"),
    ).toBeTruthy();
    expect(nodo.querySelector("input[aria-label='Cantidad']")).toBeTruthy();
    expect(nodo.querySelector("select[aria-label='Unidad']")).toBeTruthy();
    expect(nodo.querySelector("button[aria-label='Quitar']")).toBeTruthy();
    expect(
      Array.from(nodo.querySelectorAll("button")).find(
        (b) => b.textContent === "Quitar",
      ),
    ).toBeUndefined();
  });

  it("guarda repeticiones o segundos en cada ejercicio", async () => {
    await act(async () => {
      raiz.render(<Arnes />);
    });
    const editar = Array.from(nodo.querySelectorAll("button")).find(
      (b) => b.textContent === "Editar",
    );
    await act(async () => {
      editar!.click();
    });
    const cantidad = nodo.querySelector<HTMLInputElement>(
      "input[aria-label='Cantidad']",
    );
    const escribir = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    await act(async () => {
      escribir.call(cantidad, "12");
      cantidad!.dispatchEvent(new Event("input", { bubbles: true }));
      cantidad!.blur();
    });
    const listo = Array.from(nodo.querySelectorAll("button")).find(
      (b) => b.textContent === "Listo",
    );
    await act(async () => {
      listo!.click();
    });
    expect(nodo.textContent).toContain("12 repeticiones");
  });

  it("guarda repeticiones o tiempo en la actividad", async () => {
    await act(async () => {
      raiz.render(<Arnes />);
    });
    const editar = Array.from(nodo.querySelectorAll("button")).find(
      (b) => b.textContent === "Editar",
    );
    await act(async () => {
      editar!.click();
    });
    const cantidad = nodo.querySelector<HTMLInputElement>(
      "input[aria-label='Cantidad de la actividad']",
    );
    const escribir = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    await act(async () => {
      escribir.call(cantidad, "30");
      cantidad!.dispatchEvent(new Event("input", { bubbles: true }));
      cantidad!.blur();
    });
    const listo = Array.from(nodo.querySelectorAll("button")).find(
      (b) => b.textContent === "Listo",
    );
    await act(async () => {
      listo!.click();
    });
    expect(nodo.textContent).toContain("Gym · 30 min");
  });
});
