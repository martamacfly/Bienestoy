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
import { Semana } from "./Semana";

const HOY = "2026-08-31";
const LUNES = "2026-08-24";

function Arnes({ inicial }: { inicial?: Estado }) {
  const [estado, setEstado] = useState<Estado>(inicial ?? estadoSemilla);
  function dispatch(accion: Accion) {
    setEstado((prev) => aplicar(prev, accion, { hoy: HOY }));
  }
  return (
    <Semana
      estado={estado}
      hoy={HOY}
      lunes={LUNES}
      dispatch={dispatch}
      onVerDia={() => undefined}
      onVerSemana={() => undefined}
    />
  );
}

async function pulsar(nodo: HTMLElement, texto: string) {
  const boton = Array.from(nodo.querySelectorAll("button")).find(
    (b) => b.textContent === texto,
  );
  await act(async () => {
    boton!.click();
  });
}

describe("Semana", () => {
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

  it("muestra el rango de fechas y deja apuntar un día pasado", async () => {
    const vistos: string[] = [];
    await act(async () => {
      raiz.render(
        <Semana
          estado={estadoSemilla()}
          hoy={HOY}
          lunes={LUNES}
          dispatch={() => undefined}
          onVerDia={(fecha) => vistos.push(fecha)}
          onVerSemana={() => undefined}
        />,
      );
    });

    expect(nodo.textContent).toContain("24–30 ago 2026");
    expect(nodo.textContent).toContain("lunes 24/8/2026");
    expect(nodo.textContent).toContain("Editar");
    expect(
      Array.from(nodo.querySelectorAll("select")).find((el) =>
        el.closest("label")?.textContent?.includes("Planificar"),
      ),
    ).toBeUndefined();

    await pulsar(nodo, "Apuntar");
    expect(vistos[0]).toBe(LUNES);
  });

  it("enseña lo planificado y solo deja cambiarlo al editar", async () => {
    const inicial = aplicar(
      estadoSemilla(),
      { tipo: "colocarSesion", fecha: LUNES, actividadId: ID_GYM },
      { hoy: HOY },
    );
    await act(async () => {
      raiz.render(<Arnes inicial={inicial} />);
    });
    expect(nodo.textContent).toContain("Gym");
    expect(nodo.textContent).toContain("Sentadilla");
    expect(nodo.querySelector(".icono-hecho")).toBeNull();

    const hecha = aplicar(
      inicial,
      { tipo: "marcarSesion", fecha: LUNES, estado: "hecha" },
      { hoy: HOY },
    );
    await act(async () => {
      raiz.render(<Arnes key="hecha" inicial={hecha} />);
    });
    expect(nodo.querySelector(".icono-hecho")).toBeTruthy();
    expect(nodo.textContent).not.toContain("Añadir ejercicio");

    await pulsar(nodo, "Editar");
    const nombres = Array.from(
      nodo.querySelectorAll<HTMLInputElement>(
        "input[aria-label='Nombre del ejercicio']",
      ),
    ).map((el) => el.value);
    expect(nombres).toContain("Sentadilla");

    await pulsar(nodo, "Añadir ejercicio");
    expect(nodo.textContent).toContain("Ejercicios (4)");
  });

  it("permite planificar un día vacío después de editar", async () => {
    await act(async () => {
      raiz.render(<Arnes />);
    });
    expect(nodo.textContent).not.toContain("Planificar");

    await pulsar(nodo, "Editar");
    const selector = Array.from(nodo.querySelectorAll("select")).find((el) =>
      el.closest("label")?.textContent?.includes("Planificar"),
    );
    await act(async () => {
      selector!.value = ID_GYM;
      selector!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(nodo.textContent).toContain("Gym");
  });
});
