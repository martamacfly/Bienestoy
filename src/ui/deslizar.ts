import { useRef, type PointerEvent } from "react";

function esControl(objetivo: EventTarget | null): boolean {
  if (!(objetivo instanceof Element)) return false;
  return Boolean(objetivo.closest("button, a, input, select, label, textarea"));
}

export function usarDeslizar(
  alDeslizar: (direccion: "anterior" | "siguiente") => void,
) {
  const gesto = useRef<{ x: number; y: number } | null>(null);

  return {
    className: "deslizable" as const,
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (esControl(e.target)) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* jsdom */
      }
      gesto.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const origen = gesto.current;
      gesto.current = null;
      if (!origen) return;
      const dx = e.clientX - origen.x;
      const dy = e.clientY - origen.y;
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      alDeslizar(dx > 0 ? "anterior" : "siguiente");
    },
    onPointerCancel() {
      gesto.current = null;
    },
  };
}
