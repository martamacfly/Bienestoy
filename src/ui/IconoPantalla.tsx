import type { ReactNode } from "react";

export type Ruta =
  | "hoy"
  | "semana"
  | "resumen"
  | "cuerpo"
  | "catalogo"
  | "ajustes";

const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Figura({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="dibujo" aria-hidden>
      {children}
    </svg>
  );
}

export function IconoPantalla({ ruta }: { ruta: Ruta }) {
  switch (ruta) {
    case "hoy":
      return (
        <Figura>
          <circle cx="24" cy="24" r="14" {...trazo} />
          <path d="M16 24 l5 6 12 -14" {...trazo} />
        </Figura>
      );
    case "semana":
      return (
        <Figura>
          <rect x="8" y="10" width="32" height="30" rx="5" {...trazo} />
          <path d="M8 20 h32 M16 10 v-4 M32 10 v-4" {...trazo} />
          <rect x="13" y="25" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="21" y="25" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.45" />
          <rect x="29" y="25" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.45" />
        </Figura>
      );
    case "resumen":
      return (
        <Figura>
          <path d="M10 38 h28" {...trazo} />
          <rect x="12" y="24" width="7" height="14" rx="2" fill="currentColor" />
          <rect x="21" y="12" width="7" height="26" rx="2" fill="currentColor" />
          <rect x="30" y="18" width="7" height="20" rx="2" fill="currentColor" />
        </Figura>
      );
    case "cuerpo":
      return (
        <Figura>
          <rect x="4" y="16" width="40" height="16" rx="3" {...trazo} />
          <path d="M12 19 v10 M18 19 v6 M24 19 v10 M30 19 v6 M36 19 v10" {...trazo} />
        </Figura>
      );
    case "catalogo":
      return (
        <Figura>
          <circle cx="12" cy="24" r="7" {...trazo} />
          <circle cx="36" cy="24" r="7" {...trazo} />
          <path d="M19 24 h10" {...trazo} />
        </Figura>
      );
    case "ajustes":
      return (
        <Figura>
          <path d="M8 18 h32 M8 30 h32" {...trazo} />
          <circle cx="18" cy="18" r="5" fill="currentColor" />
          <circle cx="30" cy="30" r="5" fill="currentColor" />
        </Figura>
      );
  }
}

export function IconoHecho() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="icono-hecho"
      aria-hidden
    >
      <circle cx="24" cy="24" r="14" {...trazo} />
      <path d="M16 24 l5 6 12 -14" {...trazo} />
    </svg>
  );
}

export function TituloPantalla({
  ruta,
  children,
}: {
  ruta: Ruta;
  children: ReactNode;
}) {
  return (
    <h1 className="titulo-pantalla">
      <IconoPantalla ruta={ruta} />
      {children}
    </h1>
  );
}
