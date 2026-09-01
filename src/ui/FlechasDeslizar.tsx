import type { ReactNode } from "react";

function Chevron({ lado }: { lado: "izq" | "der" }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      {lado === "izq" ? (
        <path d="M10 3 L5 8 L10 13" />
      ) : (
        <path d="M6 3 L11 8 L6 13" />
      )}
    </svg>
  );
}

export function FlechasDeslizar({
  anterior,
  siguiente,
  children,
}: {
  anterior?: { etiqueta: string; ir: () => void };
  siguiente?: { etiqueta: string; ir: () => void };
  children: ReactNode;
}) {
  return (
    <p className="flechas-deslizar">
      {anterior ? (
        <button
          type="button"
          className="flecha-deslizar"
          aria-label={anterior.etiqueta}
          onClick={anterior.ir}
        >
          <Chevron lado="izq" />
        </button>
      ) : (
        <span className="flecha-hueco" />
      )}
      <span>{children}</span>
      {siguiente ? (
        <button
          type="button"
          className="flecha-deslizar"
          aria-label={siguiente.etiqueta}
          onClick={siguiente.ir}
        >
          <Chevron lado="der" />
        </button>
      ) : (
        <span className="flecha-hueco" />
      )}
    </p>
  );
}
