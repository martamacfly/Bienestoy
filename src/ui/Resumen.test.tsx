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

function conMarcas(): Estado {
  let estado = estadoSemilla();
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

  it("sin marcas no muestra gráfica de actividades", async () => {
    await act(async () => {
      raiz.render(<Resumen estado={estadoSemilla()} hoy={HOY} />);
    });
    expect(nodo.querySelector("svg[aria-label='Actividades']")).toBeNull();
    expect(nodo.textContent).toContain("Aún no hay sesiones ni extras");
  });

  it("grafica las actividades hechas y los extras", async () => {
    await act(async () => {
      raiz.render(<Resumen estado={conMarcas()} hoy={HOY} />);
    });
    const grafica = nodo.querySelector("svg[aria-label='Actividades']");
    expect(grafica).toBeTruthy();
    expect(grafica?.textContent).toContain("Gym");
    expect(grafica?.textContent).toContain("Caminar");
    expect(grafica?.querySelectorAll("rect")).toHaveLength(2);
  });
});
