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
  ID_CAMINAR,
  ID_GYM,
  type Accion,
  type Estado,
} from "../bienestoy";
import { Hoy } from "./Hoy";

const HOY = "2026-08-24";

function Arnes({
  fecha = HOY,
  inicial,
  onVerDia = () => undefined,
}: {
  fecha?: string;
  inicial?: Estado;
  onVerDia?: (fecha: string) => void;
}) {
  const [estado, setEstado] = useState<Estado>(inicial ?? estadoSemilla);
  function dispatch(accion: Accion) {
    setEstado((prev) => aplicar(prev, accion, { hoy: HOY }));
  }
  return (
    <Hoy
      estado={estado}
      fecha={fecha}
      hoy={HOY}
      dispatch={dispatch}
      onVerDia={onVerDia}
    />
  );
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

  it("sin sesión es día de descanso y deja apuntar lo que se hizo", async () => {
    await act(async () => {
      raiz.render(<Arnes />);
    });
    expect(nodo.textContent).toContain("Día de descanso");
    expect(nodo.textContent).toContain("Qué se hizo");
    expect(nodo.textContent).toContain("Añadir actividad");
    expect(nodo.textContent).not.toContain("Sin sesión planificada");
    expect(
      Array.from(nodo.querySelectorAll("button")).find(
        (b) => b.textContent === "Sí" || b.textContent === "No",
      ),
    ).toBeUndefined();
    expect(
      Array.from(nodo.querySelectorAll("select")).find((el) =>
        el.closest("label")?.textContent?.includes("Planificar"),
      ),
    ).toBeUndefined();
    expect(nodo.querySelector(".icono-hecho")).toBeNull();
  });

  it("al apuntar una actividad en día de descanso muestra el check", async () => {
    await act(async () => {
      raiz.render(<Arnes />);
    });
    const selector = Array.from(nodo.querySelectorAll("select")).find((el) =>
      el.closest("label")?.textContent?.includes("Añadir actividad"),
    );
    await act(async () => {
      selector!.value = ID_CAMINAR;
      selector!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(nodo.querySelector("li")?.textContent).toContain("Caminar");
    expect(nodo.querySelector(".icono-hecho")).toBeTruthy();
  });

  it("con sesión permite marcarla hecha y muestra el guion", async () => {
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
    expect(nodo.querySelectorAll("input[type='checkbox']")).toHaveLength(1);
    expect(
      Array.from(nodo.querySelectorAll("select")).find((el) =>
        el.closest("label")?.textContent?.includes("Cambiar"),
      ),
    ).toBeUndefined();
    expect(
      Array.from(nodo.querySelectorAll("button")).find(
        (b) => b.textContent === "Hecha" || b.textContent === "Saltada",
      ),
    ).toBeUndefined();

    const hecha = nodo.querySelector<HTMLInputElement>(
      "input[aria-label='Hecha']",
    );
    await act(async () => {
      hecha!.click();
    });
    expect(
      nodo.querySelector<HTMLInputElement>("input[aria-label='Hecha']")?.checked,
    ).toBe(true);
    expect(nodo.querySelector(".icono-hecho")).toBeTruthy();
  });

  it("con sesión permite apuntar otro deporte además", async () => {
    const inicial = aplicar(
      estadoSemilla(),
      { tipo: "colocarSesion", fecha: HOY, actividadId: ID_GYM },
      { hoy: HOY },
    );
    await act(async () => {
      raiz.render(<Arnes inicial={inicial} />);
    });
    expect(nodo.textContent).toContain("Qué se hizo");
    const selector = Array.from(nodo.querySelectorAll("select")).find((el) =>
      el.closest("label")?.textContent?.includes("Añadir actividad"),
    );
    await act(async () => {
      selector!.value = ID_CAMINAR;
      selector!.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(nodo.querySelector("li")?.textContent).toContain("Caminar");
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
    expect(
      nodo.querySelector<HTMLAnchorElement>("a[aria-label='Cuerpo']")?.href,
    ).toContain("#/cuerpo/2026-08-20");
    expect(nodo.querySelector("a[href^='#/semana']")).toBeNull();
    const hecha = nodo.querySelector<HTMLInputElement>(
      "input[aria-label='Hecha']",
    );
    await act(async () => {
      hecha!.click();
    });
    expect(
      nodo.querySelector<HTMLInputElement>("input[aria-label='Hecha']")?.checked,
    ).toBe(true);
    expect(nodo.querySelector(".icono-hecho")).toBeTruthy();
  });

  it("al deslizar a la derecha pasa al día anterior", async () => {
    let visto = "";
    await act(async () => {
      raiz.render(<Arnes onVerDia={(fecha) => { visto = fecha; }} />);
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
    expect(visto).toBe("2026-08-23");
  });

  it("al deslizar a la izquierda desde hoy no avanza al futuro", async () => {
    let visto = "";
    await act(async () => {
      raiz.render(<Arnes onVerDia={(fecha) => { visto = fecha; }} />);
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

  it("enseña flecha atrás y no adelante cuando es hoy", async () => {
    await act(async () => {
      raiz.render(<Arnes />);
    });
    expect(nodo.querySelector("button[aria-label='Día anterior']")).toBeTruthy();
    expect(nodo.querySelector("button[aria-label='Día siguiente']")).toBeNull();
  });

  it("la flecha adelante vuelve hacia hoy desde un día pasado", async () => {
    let visto = "";
    await act(async () => {
      raiz.render(
        <Arnes fecha="2026-08-23" onVerDia={(fecha) => { visto = fecha; }} />,
      );
    });
    expect(nodo.querySelector("button[aria-label='Día siguiente']")).toBeTruthy();
    await act(async () => {
      nodo.querySelector<HTMLButtonElement>("button[aria-label='Día siguiente']")!.click();
    });
    expect(visto).toBe(HOY);
  });
});
