import { useEffect, useRef, useState } from "react";
import type { PlantillaEjercicio } from "../bienestoy";

export function EditorGuion<T extends PlantillaEjercicio>({
  lineas,
  onCambiar,
}: {
  lineas: T[];
  onCambiar: (lineas: T[]) => void;
}) {
  const [nuevo, setNuevo] = useState(false);
  const alta = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nuevo) alta.current?.focus();
  }, [nuevo]);

  function guardarNuevo(valor: string) {
    const nombre = valor.trim();
    setNuevo(false);
    if (!nombre) return;
    onCambiar([...lineas, { nombre } as T]);
  }

  return (
    <div className="editor-guion">
      {lineas.map((linea, indice) => (
        <div className="linea-ejercicio" key={`${indice}-${linea.nombre}`}>
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
      {nuevo && (
        <div className="linea-ejercicio">
          <input
            ref={alta}
            defaultValue=""
            aria-label="Nombre del ejercicio"
            onBlur={(e) => guardarNuevo(e.target.value)}
          />
          <button
            className="boton secundario"
            onClick={() => setNuevo(false)}
          >
            Quitar
          </button>
        </div>
      )}
      <button
        className="boton secundario"
        type="button"
        onClick={() => setNuevo(true)}
      >
        Añadir ejercicio
      </button>
    </div>
  );
}
