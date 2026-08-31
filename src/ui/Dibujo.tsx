import type { ReactNode } from "react";
import type { DibujoId } from "../bienestoy/dibujos";

const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
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

export function Dibujo({ id }: { id: DibujoId }) {
  switch (id) {
    case "sentadilla":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3.5" {...trazo} />
          <path d="M24 14 L24 22 L16 34 M24 22 L32 34 M16 22 H32" {...trazo} />
        </Figura>
      );
    case "zancada":
      return (
        <Figura>
          <circle cx="22" cy="10" r="3.2" {...trazo} />
          <path d="M22 14 V24 M16 20 H30 M22 24 L12 40 M22 24 L32 32 L36 40" {...trazo} />
        </Figura>
      );
    case "press":
      return (
        <Figura>
          <circle cx="24" cy="14" r="3.5" {...trazo} />
          <path d="M24 18 V30 M16 38 L24 30 L32 38 M10 16 H38 M10 16 V12 M38 16 V12" {...trazo} />
        </Figura>
      );
    case "plank":
      return (
        <Figura>
          <circle cx="38" cy="18" r="3.2" {...trazo} />
          <path d="M34 20 H14 L10 30 M34 20 L40 30 M18 20 V30" {...trazo} />
        </Figura>
      );
    case "flexion":
      return (
        <Figura>
          <circle cx="38" cy="16" r="3" {...trazo} />
          <path d="M34 18 H16 L10 24 M16 18 V28 M34 18 L40 28" {...trazo} />
        </Figura>
      );
    case "dominada":
      return (
        <Figura>
          <path d="M8 10 H40" {...trazo} />
          <circle cx="24" cy="22" r="3.2" {...trazo} />
          <path d="M16 10 V16 L24 26 L32 16 V10 M24 26 V38" {...trazo} />
        </Figura>
      );
    case "remo":
      return (
        <Figura>
          <circle cx="16" cy="16" r="3.2" {...trazo} />
          <path d="M20 18 H34 L30 12 M20 18 L34 26 M12 36 H28" {...trazo} />
        </Figura>
      );
    case "peso":
      return (
        <Figura>
          <circle cx="24" cy="12" r="3.2" {...trazo} />
          <path d="M24 16 V28 M16 38 L24 28 L32 38 M8 22 H16 M32 22 H40 M8 18 V26 M16 18 V26 M32 18 V26 M40 18 V26" {...trazo} />
        </Figura>
      );
    case "core":
      return (
        <Figura>
          <circle cx="16" cy="28" r="3.2" {...trazo} />
          <path d="M20 28 H36 L32 20 M20 28 L36 34" {...trazo} />
        </Figura>
      );
    case "puente":
      return (
        <Figura>
          <circle cx="36" cy="28" r="3" {...trazo} />
          <path d="M10 36 L16 24 H32 L38 28 M16 24 V36 M32 24 V36" {...trazo} />
        </Figura>
      );
    case "burpee":
      return (
        <Figura>
          <circle cx="24" cy="8" r="3" {...trazo} />
          <path d="M24 12 V22 M16 16 H32 M18 22 L10 18 M30 22 L38 18" {...trazo} />
          <path d="M12 36 H36" {...trazo} />
        </Figura>
      );
    case "cuerda":
      return (
        <Figura>
          <circle cx="24" cy="12" r="3.2" {...trazo} />
          <path d="M24 16 V28 M16 38 L24 28 L32 38" {...trazo} />
          <path d="M10 20 C10 8 24 6 24 16 C24 6 38 8 38 20" {...trazo} />
        </Figura>
      );
    case "estirar":
      return (
        <Figura>
          <circle cx="18" cy="12" r="3.2" {...trazo} />
          <path d="M18 16 V30 L12 40 M18 16 L32 10 M18 30 L28 38" {...trazo} />
        </Figura>
      );
    case "yoga":
      return (
        <Figura>
          <circle cx="24" cy="9" r="3.2" {...trazo} />
          <path d="M24 13 V28 M24 18 L12 14 M24 28 L16 40 M24 28 L32 40" {...trazo} />
        </Figura>
      );
    case "correr":
      return (
        <Figura>
          <circle cx="26" cy="11" r="3.2" {...trazo} />
          <path d="M24 15 L18 24 L12 22 M24 15 L22 28 L30 38 M18 24 L28 20 L36 16" {...trazo} />
        </Figura>
      );
    case "caminar":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3.2" {...trazo} />
          <path d="M24 14 V26 M24 18 L14 24 M24 18 L32 22 M24 26 L18 38 M24 26 L30 38" {...trazo} />
        </Figura>
      );
    case "salto":
      return (
        <Figura>
          <circle cx="24" cy="8" r="3" {...trazo} />
          <path d="M24 12 V22 M16 16 H32 M18 22 L14 30 M30 22 L34 30" {...trazo} />
          <path d="M10 38 H38" {...trazo} />
        </Figura>
      );
    case "bici":
      return (
        <Figura>
          <circle cx="14" cy="32" r="7" {...trazo} />
          <circle cx="34" cy="32" r="7" {...trazo} />
          <path d="M14 32 L24 18 L34 32 M24 18 L24 12 L28 12" {...trazo} />
        </Figura>
      );
    case "eliptica":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3" {...trazo} />
          <path d="M24 14 V24 M16 20 H32 M18 24 L12 34 M30 24 L36 34" {...trazo} />
          <ellipse cx="24" cy="38" rx="14" ry="4" {...trazo} />
        </Figura>
      );
    case "nadar":
      return (
        <Figura>
          <circle cx="16" cy="16" r="3" {...trazo} />
          <path d="M20 18 L32 22 L28 14 M20 20 C26 28 34 24 40 28" {...trazo} />
          <path d="M8 34 C14 30 20 38 26 34 C32 30 38 38 44 34" {...trazo} />
        </Figura>
      );
    case "kayak":
      return (
        <Figura>
          <circle cx="24" cy="14" r="3" {...trazo} />
          <path d="M24 18 V26 M16 22 L32 22 M8 32 C16 26 32 26 40 32 C32 36 16 36 8 32" {...trazo} />
          <path d="M12 20 L36 34" {...trazo} />
        </Figura>
      );
    case "senderismo":
      return (
        <Figura>
          <circle cx="20" cy="10" r="3.2" {...trazo} />
          <path d="M20 14 V26 M20 18 L12 24 M20 18 L28 16 L32 8 M20 26 L16 38 M20 26 L26 38" {...trazo} />
          <path d="M34 38 L40 22 L44 38" {...trazo} />
        </Figura>
      );
    case "escalada":
      return (
        <Figura>
          <circle cx="22" cy="12" r="3" {...trazo} />
          <path d="M22 16 L18 24 L12 22 M22 16 L26 28 L22 38 M18 24 L28 20" {...trazo} />
          <path d="M34 8 V40 M32 16 H36 M32 28 H36" {...trazo} />
        </Figura>
      );
    case "patines":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3.2" {...trazo} />
          <path d="M24 14 V26 M16 20 H30 M18 26 L14 34 H22 M30 26 L28 34 H36" {...trazo} />
          <circle cx="16" cy="38" r="2" {...trazo} />
          <circle cx="20" cy="38" r="2" {...trazo} />
          <circle cx="30" cy="38" r="2" {...trazo} />
          <circle cx="34" cy="38" r="2" {...trazo} />
        </Figura>
      );
    case "boxeo":
      return (
        <Figura>
          <circle cx="20" cy="12" r="3.2" {...trazo} />
          <path d="M20 16 V30 L14 40 M20 16 L12 22 M20 18 L32 14 L36 10" {...trazo} />
          <circle cx="38" cy="10" r="3" {...trazo} />
        </Figura>
      );
    case "baile":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3.2" {...trazo} />
          <path d="M24 14 V26 M12 16 L24 20 L36 12 M24 26 L16 38 M24 26 L34 34 L38 40" {...trazo} />
        </Figura>
      );
    case "futbol":
      return (
        <Figura>
          <circle cx="22" cy="10" r="3.2" {...trazo} />
          <path d="M22 14 V26 M16 20 H28 M22 26 L16 38 M22 26 L28 32" {...trazo} />
          <circle cx="34" cy="36" r="5" {...trazo} />
        </Figura>
      );
    case "tenis":
      return (
        <Figura>
          <circle cx="18" cy="12" r="3.2" {...trazo} />
          <path d="M18 16 V28 M12 22 H24 M18 28 L12 40 M18 28 L24 38" {...trazo} />
          <ellipse cx="34" cy="16" rx="6" ry="8" {...trazo} />
          <path d="M34 24 V30" {...trazo} />
        </Figura>
      );
    case "basket":
      return (
        <Figura>
          <circle cx="18" cy="12" r="3.2" {...trazo} />
          <path d="M18 16 V28 M12 22 L28 14 M18 28 L14 40 M18 28 L24 38" {...trazo} />
          <circle cx="34" cy="12" r="6" {...trazo} />
        </Figura>
      );
    case "muerto":
      return (
        <Figura>
          <circle cx="24" cy="14" r="3.2" {...trazo} />
          <path d="M24 18 L20 26 L16 38 M24 18 L30 38 M14 26 H34" {...trazo} />
          <path d="M10 38 H18 M30 38 H38 M10 34 V40 M18 34 V40 M30 34 V40 M38 34 V40" {...trazo} />
        </Figura>
      );
    case "curl":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3.2" {...trazo} />
          <path d="M24 14 V28 M16 38 L24 28 L32 38 M24 18 L12 16 M24 18 L36 14" {...trazo} />
          <circle cx="10" cy="16" r="2.4" {...trazo} />
          <circle cx="38" cy="14" r="2.4" {...trazo} />
        </Figura>
      );
    case "fondos":
      return (
        <Figura>
          <path d="M8 22 H18 M30 22 H40" {...trazo} />
          <circle cx="24" cy="16" r="3.2" {...trazo} />
          <path d="M18 22 L24 20 L30 22 M24 20 V32 M16 40 L24 32 L32 40" {...trazo} />
        </Figura>
      );
    case "jalon":
      return (
        <Figura>
          <path d="M10 8 H38 M24 8 V14" {...trazo} />
          <circle cx="24" cy="18" r="3.2" {...trazo} />
          <path d="M14 10 V16 L24 22 L34 16 V10 M24 22 V36" {...trazo} />
        </Figura>
      );
    case "laterales":
      return (
        <Figura>
          <circle cx="24" cy="12" r="3.2" {...trazo} />
          <path d="M24 16 V28 M16 38 L24 28 L32 38 M8 18 H18 M30 18 H40" {...trazo} />
          <circle cx="8" cy="18" r="2.2" {...trazo} />
          <circle cx="40" cy="18" r="2.2" {...trazo} />
        </Figura>
      );
    case "gemelo":
      return (
        <Figura>
          <circle cx="24" cy="8" r="3.2" {...trazo} />
          <path d="M24 12 V26 M16 20 H32 M20 26 L18 34 M28 26 L30 34" {...trazo} />
          <path d="M14 38 H22 M26 38 H34" {...trazo} />
        </Figura>
      );
    case "twist":
      return (
        <Figura>
          <circle cx="24" cy="12" r="3.2" {...trazo} />
          <path d="M24 16 V26 M12 22 L36 18 M16 26 L12 38 M32 26 L36 38" {...trazo} />
        </Figura>
      );
    case "bird":
      return (
        <Figura>
          <circle cx="36" cy="16" r="3" {...trazo} />
          <path d="M10 30 L20 26 L34 18 M20 26 L16 16 M20 26 L28 36" {...trazo} />
        </Figura>
      );
    case "superhombre":
      return (
        <Figura>
          <circle cx="38" cy="22" r="3" {...trazo} />
          <path d="M8 30 L18 26 L34 24 L40 22 M18 26 L12 20 M28 25 L34 18" {...trazo} />
        </Figura>
      );
    case "climber":
      return (
        <Figura>
          <circle cx="36" cy="14" r="3" {...trazo} />
          <path d="M32 16 H16 L10 26 M32 16 L40 26 M16 16 L22 28 M16 16 V28" {...trazo} />
        </Figura>
      );
    case "jumpingjack":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3.2" {...trazo} />
          <path d="M24 14 V26 M10 16 L24 18 L38 16 M14 40 L24 26 L34 40" {...trazo} />
        </Figura>
      );
    case "step":
      return (
        <Figura>
          <circle cx="22" cy="10" r="3.2" {...trazo} />
          <path d="M22 14 V24 M16 20 H28 M22 24 L16 36 M22 24 L30 28 L32 20" {...trazo} />
          <path d="M28 40 H42 V32 H28 Z" {...trazo} />
        </Figura>
      );
    case "wallsit":
      return (
        <Figura>
          <path d="M10 8 V40" {...trazo} />
          <circle cx="22" cy="14" r="3.2" {...trazo} />
          <path d="M18 18 V28 H32 M18 18 H12 M18 28 L16 40 M32 28 L36 40" {...trazo} />
        </Figura>
      );
    case "swing":
      return (
        <Figura>
          <circle cx="20" cy="12" r="3.2" {...trazo} />
          <path d="M20 16 V28 M14 38 L20 28 L26 36 M20 18 L32 28" {...trazo} />
          <circle cx="34" cy="32" r="5" {...trazo} />
        </Figura>
      );
    case "carry":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3.2" {...trazo} />
          <path d="M24 14 V26 M24 18 L16 22 M24 18 L32 22 M24 26 L20 38 M24 26 L28 38" {...trazo} />
          <path d="M12 22 V32 M10 24 H14 M36 22 V32 M34 24 H38" {...trazo} />
        </Figura>
      );
    case "battle":
      return (
        <Figura>
          <circle cx="16" cy="12" r="3.2" {...trazo} />
          <path d="M16 16 V28 M10 38 L16 28 L22 38 M16 20 H24" {...trazo} />
          <path d="M24 18 C28 10 32 26 36 16 C40 8 42 24 46 18" {...trazo} />
        </Figura>
      );
    case "trineo":
      return (
        <Figura>
          <circle cx="34" cy="12" r="3.2" {...trazo} />
          <path d="M34 16 L28 26 L22 24 M34 16 L32 28 L38 38 M28 26 L36 22" {...trazo} />
          <path d="M8 36 H24 V28 H8 Z" {...trazo} />
        </Figura>
      );
    case "pilates":
      return (
        <Figura>
          <circle cx="24" cy="16" r="3.2" {...trazo} />
          <path d="M24 20 V28 M14 24 L24 22 L34 24 M16 28 L12 36 M32 28 L36 36" {...trazo} />
          <path d="M10 40 H38" {...trazo} />
        </Figura>
      );
    case "pino":
      return (
        <Figura>
          <path d="M16 8 H32" {...trazo} />
          <path d="M20 8 V16 L24 28 L28 16 V8" {...trazo} />
          <circle cx="24" cy="34" r="3.2" {...trazo} />
          <path d="M24 30 V28" {...trazo} />
        </Figura>
      );
    case "meditacion":
      return (
        <Figura>
          <circle cx="24" cy="12" r="3.2" {...trazo} />
          <path d="M24 16 V26 M14 22 L24 20 L34 22 M16 26 C16 34 32 34 32 26" {...trazo} />
        </Figura>
      );
    case "escaleras":
      return (
        <Figura>
          <circle cx="20" cy="10" r="3" {...trazo} />
          <path d="M20 14 V24 M20 18 L12 22 M20 18 L26 16 M20 24 L16 34 M20 24 L26 28" {...trazo} />
          <path d="M28 40 H40 V32 H32 V24 H28" {...trazo} />
        </Figura>
      );
    case "paddle":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3" {...trazo} />
          <path d="M24 14 V24 M16 20 H28 M18 40 C12 32 36 32 30 40 Z" {...trazo} />
          <path d="M32 8 L28 24 L36 40" {...trazo} />
        </Figura>
      );
    case "esqui":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3.2" {...trazo} />
          <path d="M24 14 V26 M16 20 H30 M18 26 L12 36 M30 26 L34 36" {...trazo} />
          <path d="M6 40 L20 34 M28 34 L44 40" {...trazo} />
        </Figura>
      );
    case "karate":
      return (
        <Figura>
          <circle cx="20" cy="12" r="3.2" {...trazo} />
          <path d="M20 16 V28 M12 22 H26 M20 28 L14 40 M20 28 L36 22" {...trazo} />
        </Figura>
      );
    case "voleibol":
      return (
        <Figura>
          <circle cx="18" cy="14" r="3.2" {...trazo} />
          <path d="M18 18 V30 M12 24 L18 22 L28 12 M18 30 L14 40 M18 30 L24 38" {...trazo} />
          <circle cx="34" cy="10" r="4" {...trazo} />
        </Figura>
      );
    case "golf":
      return (
        <Figura>
          <circle cx="20" cy="12" r="3.2" {...trazo} />
          <path d="M20 16 V28 M14 22 H26 M20 28 L16 40 M20 28 L26 38" {...trazo} />
          <path d="M28 12 L36 32" {...trazo} />
          <circle cx="38" cy="36" r="2.4" {...trazo} />
        </Figura>
      );
    case "pingpong":
      return (
        <Figura>
          <circle cx="18" cy="12" r="3.2" {...trazo} />
          <path d="M18 16 V28 M12 22 H24 M18 28 L14 40 M18 28 L24 38" {...trazo} />
          <ellipse cx="34" cy="16" rx="5" ry="7" {...trazo} />
          <circle cx="40" cy="10" r="2" {...trazo} />
        </Figura>
      );
    case "skate":
      return (
        <Figura>
          <circle cx="24" cy="10" r="3.2" {...trazo} />
          <path d="M24 14 V24 M16 20 H30 M20 24 L18 30 M28 24 L32 30" {...trazo} />
          <path d="M12 34 H36" {...trazo} />
          <circle cx="16" cy="38" r="2.4" {...trazo} />
          <circle cx="32" cy="38" r="2.4" {...trazo} />
        </Figura>
      );
    default:
      return (
        <Figura>
          <circle cx="24" cy="12" r="3.2" {...trazo} />
          <path d="M24 16 V28 M16 20 H32 M18 28 L14 38 M30 28 L34 38" {...trazo} />
        </Figura>
      );
  }
}
