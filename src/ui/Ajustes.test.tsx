/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { estadoSemilla, exportarJSON, type Estado } from "../bienestoy";
import { Ajustes } from "./Ajustes";

const HOY = "2026-09-01";

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
  let vaciado: boolean;

  function pintar() {
    raiz.render(
      <Ajustes
        estado={estadoSemilla()}
        hoy={HOY}
        onImportar={(siguiente) => {
          importado = siguiente;
        }}
        onEmpezarDeCero={() => {
          vaciado = true;
        }}
      />,
    );
  }

  beforeEach(() => {
    localStorage.clear();
    nodo = document.createElement("div");
    document.body.appendChild(nodo);
    raiz = createRoot(nodo);
    importado = null;
    vaciado = false;
    URL.createObjectURL = () => "blob:test";
    URL.revokeObjectURL = () => undefined;
  });

  afterEach(() => {
    act(() => raiz.unmount());
    nodo.remove();
  });

  it("muestra la versión de la app", async () => {
    await act(async () => {
      pintar();
    });
    expect(nodo.textContent).toContain("Bienestoy 0.1.0");
  });

  it("no restaura la copia hasta confirmar que se borra lo del dispositivo", async () => {
    await act(async () => {
      pintar();
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

  it("recuerda la fecha de la última copia al exportar", async () => {
    await act(async () => {
      pintar();
    });
    expect(nodo.textContent).toContain(
      "Aún no has exportado en este dispositivo.",
    );
    await act(async () => {
      pulsar(nodo, "Exportar JSON");
    });
    expect(nodo.textContent).toContain("Última copia: martes 1/9/2026");
  });

  it("explica cómo instalarla en el teléfono", async () => {
    await act(async () => {
      pintar();
    });
    expect(nodo.textContent).toContain("Añadir a pantalla de inicio");
    expect(nodo.textContent).toContain("Instalar aplicación");
  });

  it("no borra los datos hasta confirmar empezar de cero", async () => {
    await act(async () => {
      pintar();
    });
    await act(async () => {
      pulsar(nodo, "Empezar de cero");
    });
    expect(vaciado).toBe(false);
    expect(nodo.textContent).toContain(
      "Esto borra el plan, las marcas y el cuerpo. ¿Sigues?",
    );

    await act(async () => {
      pulsar(nodo, "Cancelar");
    });
    expect(vaciado).toBe(false);

    await act(async () => {
      pulsar(nodo, "Empezar de cero");
    });
    await act(async () => {
      pulsar(nodo, "Seguir");
    });
    expect(vaciado).toBe(true);
  });
});
