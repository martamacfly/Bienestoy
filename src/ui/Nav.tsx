import { IconoPantalla, type Ruta } from "./IconoPantalla";

export type { Ruta };

const ITEMS: { ruta: Ruta; etiqueta: string }[] = [
  { ruta: "hoy", etiqueta: "Hoy" },
  { ruta: "semana", etiqueta: "Semana" },
  { ruta: "catalogo", etiqueta: "Catálogo" },
  { ruta: "resumen", etiqueta: "Resumen" },
  { ruta: "cuerpo", etiqueta: "Cuerpo" },
  { ruta: "ajustes", etiqueta: "Ajustes" },
];

export function Nav({
  ruta,
  ir,
}: {
  ruta: Ruta;
  ir: (ruta: Ruta) => void;
}) {
  return (
    <nav className="nav" aria-label="Principal">
      {ITEMS.map((item) => (
        <button
          key={item.ruta}
          className={item.ruta === ruta ? "activa" : ""}
          onClick={() => ir(item.ruta)}
        >
          <IconoPantalla ruta={item.ruta} />
          {item.etiqueta}
        </button>
      ))}
    </nav>
  );
}
