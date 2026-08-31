/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { estadoSemilla, exportarJSON, type Estado } from "../bienestoy";
import { Ajustes } from "./Ajustes";

async function elegirArchivo(nodo: HTMLElement, contenido: string) {
  const input = nodo.querySelector<HTMLInputElement>("input[type='file']");
  const fichero = new File([contenido], "copia.json", {
    type: "application/json",
  });
  Object.defineProperty(input, "files", { configurable: true, value: [fichero] });
  await act(async () => {
    input!.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function pulsar(nodo: HTMLElement, texto: string) {
  const boton = Array.from(nodo.querySelectorAll("button")).find(
    (b) => b.textContent === texto,
  );
  boton!.click();
}

describe("Ajustes", () => {
  let raiz: Root;
  let nodo: HTMLDivElement;
  let importado: Estado | null;

  beforeEach(() => {
    nodo = document.createElement("div");
    document.body.appendChild(nodo);
    raiz = createRoot(nodo);
    importado = null;
  });

  afterEach(() => {
    act(() => raiz.unmount());
    nodo.remove();
  });

  it("muestra la versión de la app", async () => {
    await act(async () => {
      raiz.render(
        <Ajustes estado={estadoSemilla()} onImportar={() => undefined} />,
      );
    });
    expect(nodo.textContent).toContain("Bienestoy 0.1.0");
  });

  it("no restaura la copia hasta confirmar que se borra lo del dispositivo", async () => {
    await act(async () => {
      raiz.render(
        <Ajustes
          estado={estadoSemilla()}
          onImportar={(siguiente) => {
            importado = siguiente;
          }}
        />,
      );
    });
    await elegirArchivo(nodo, exportarJSON(estadoSemilla()));
    expect(importado).toBeNull();
    expect(nodo.textContent).toContain(
      "Esto borra lo de este dispositivo. ¿Sigues?",
    );

    await act(async () => {
      pulsar(nodo, "Cancelar");
    });
    expect(importado).toBeNull();

    await elegirArchivo(nodo, exportarJSON(estadoSemilla()));
    await act(async () => {
      pulsar(nodo, "Seguir");
    });
    expect(importado).not.toBeNull();
  });
});
