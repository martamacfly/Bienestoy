import { useEffect, useRef, useState, type Ref } from "react";
import type {
  CuantoEjercicio,
  PlantillaEjercicio,
  UnidadEjercicio,
} from "../bienestoy";
import { cuantoDesdeCampos } from "../bienestoy";

function conCuanto<T extends PlantillaEjercicio>(
  linea: T,
  texto: string,
  unidad: UnidadEjercicio,
): T {
  const cuanto = cuantoDesdeCampos(texto, unidad);
  if (!cuanto) {
    const siguiente = { ...linea };
    delete siguiente.cuanto;
    return siguiente;
  }
  return { ...linea, cuanto };
}

function FilaEjercicio<T extends PlantillaEjercicio>({
  linea,
  nombreRef,
  onCambiar,
  onQuitar,
}: {
  linea: T;
  nombreRef?: Ref<HTMLInputElement>;
  onCambiar: (linea: T) => void;
  onQuitar: () => void;
}) {
  const unidadInicial: UnidadEjercicio =
    linea.cuanto?.unidad ?? "repeticiones";

  function leer(fila: HTMLElement) {
    const nombre =
      fila
        .querySelector<HTMLInputElement>(
          "input[aria-label='Nombre del ejercicio']",
        )
        ?.value.trim() ?? "";
    const cantidad =
      fila.querySelector<HTMLInputElement>("input[aria-label='Cantidad']")
        ?.value ?? "";
    const unidad = (fila.querySelector<HTMLSelectElement>(
      "select[aria-label='Unidad']",
    )?.value ?? unidadInicial) as UnidadEjercicio;
    return { nombre, cantidad, unidad };
  }

  function guardar(e: { currentTarget: EventTarget | null }) {
    const origen =
      e.currentTarget instanceof HTMLElement ? e.currentTarget : null;
    const fila = origen?.closest(".linea-ejercicio");
    if (!(fila instanceof HTMLElement)) return;
    const { nombre, cantidad, unidad } = leer(fila);
    if (!nombre) return;
    onCambiar(conCuanto({ ...linea, nombre }, cantidad, unidad));
  }

  return (
    <div className="linea-ejercicio">
      <input
        ref={nombreRef}
        defaultValue={linea.nombre}
        aria-label="Nombre del ejercicio"
        onBlur={guardar}
      />
      <input
        className="linea-ejercicio-cuanto"
        inputMode="decimal"
        defaultValue={linea.cuanto ? String(linea.cuanto.valor) : ""}
        aria-label="Cantidad"
        placeholder="—"
        onChange={guardar}
        onBlur={guardar}
      />
      <select
        aria-label="Unidad"
        defaultValue={unidadInicial}
        onChange={guardar}
      >
        <option value="repeticiones">rep</option>
        <option value="segundos">s</option>
      </select>
      <button className="boton secundario" onClick={onQuitar}>
        Quitar
      </button>
    </div>
  );
}

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

  return (
    <div className="editor-guion">
      {lineas.map((linea, indice) => (
        <FilaEjercicio
          key={`${indice}-${linea.nombre}`}
          linea={linea}
          onCambiar={(siguiente) =>
            onCambiar(
              lineas.map((item, i) => (i === indice ? siguiente : item)),
            )
          }
          onQuitar={() =>
            onCambiar(lineas.filter((_, i) => i !== indice))
          }
        />
      ))}
      {nuevo && (
        <FilaEjercicio
          linea={{ nombre: "" } as T}
          nombreRef={alta}
          onCambiar={(siguiente) => {
            setNuevo(false);
            if (!siguiente.nombre.trim()) return;
            onCambiar([...lineas, siguiente]);
          }}
          onQuitar={() => setNuevo(false)}
        />
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

const UNIDADES_ACTIVIDAD: { valor: UnidadEjercicio; etiqueta: string }[] = [
  { valor: "minutos", etiqueta: "min" },
  { valor: "segundos", etiqueta: "s" },
  { valor: "repeticiones", etiqueta: "rep" },
];

export function CamposCuantoActividad({
  cuanto,
  onCambiar,
}: {
  cuanto?: CuantoEjercicio;
  onCambiar: (cuanto?: CuantoEjercicio) => void;
}) {
  const unidadInicial: UnidadEjercicio = cuanto?.unidad ?? "minutos";

  function leer(fila: HTMLElement) {
    const cantidad =
      fila.querySelector<HTMLInputElement>(
        "input[aria-label='Cantidad de la actividad']",
      )?.value ?? "";
    const unidad = (fila.querySelector<HTMLSelectElement>(
      "select[aria-label='Unidad de la actividad']",
    )?.value ?? unidadInicial) as UnidadEjercicio;
    return { cantidad, unidad };
  }

  function guardar(e: { currentTarget: EventTarget | null }) {
    const origen =
      e.currentTarget instanceof HTMLElement ? e.currentTarget : null;
    const fila = origen?.closest(".linea-ejercicio");
    if (!(fila instanceof HTMLElement)) return;
    const { cantidad, unidad } = leer(fila);
    onCambiar(cuantoDesdeCampos(cantidad, unidad));
  }

  return (
    <div className="linea-ejercicio linea-actividad-cuanto">
      <input
        className="linea-ejercicio-cuanto"
        inputMode="decimal"
        defaultValue={cuanto ? String(cuanto.valor) : ""}
        aria-label="Cantidad de la actividad"
        placeholder="—"
        onChange={guardar}
        onBlur={guardar}
      />
      <select
        aria-label="Unidad de la actividad"
        defaultValue={unidadInicial}
        onChange={guardar}
      >
        {UNIDADES_ACTIVIDAD.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </div>
  );
}
