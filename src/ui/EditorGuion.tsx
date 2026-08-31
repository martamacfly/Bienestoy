import type { DibujoId, PlantillaEjercicio } from "../bienestoy";
import { SelectorDibujo } from "./SelectorDibujo";

export function EditorGuion<T extends PlantillaEjercicio>({
  lineas,
  onCambiar,
}: {
  lineas: T[];
  onCambiar: (lineas: T[]) => void;
}) {
  return (
    <div className="editor-guion">
      {lineas.map((linea, indice) => (
        <div className="linea-ejercicio" key={`${indice}-${linea.dibujo}`}>
          <SelectorDibujo
            valor={linea.dibujo}
            onElegir={(dibujo: DibujoId) =>
              onCambiar(
                lineas.map((item, i) =>
                  i === indice ? { ...item, dibujo } : item,
                ),
              )
            }
          />
          <input
            defaultValue={linea.nombre}
            aria-label="Nombre del ejercicio"
            onBlur={(e) => {
              const nombre = e.target.value.trim();
              if (!nombre || nombre === linea.nombre) return;
              onCambiar(
                lineas.map((item, i) =>
                  i === indice ? { ...item, nombre } : item,
                ),
              );
            }}
          />
          <button
            className="boton secundario"
            onClick={() =>
              onCambiar(lineas.filter((_, i) => i !== indice))
            }
          >
            Quitar
          </button>
        </div>
      ))}
      <button
        className="boton secundario"
        type="button"
        onClick={() =>
          onCambiar([
            ...lineas,
            { nombre: "Ejercicio", dibujo: "otro" } as T,
          ])
        }
      >
        Añadir ejercicio
      </button>
    </div>
  );
}
