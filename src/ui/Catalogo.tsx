import { useState } from "react";
import type { Accion, Estado } from "../bienestoy";
import type { PlantillaEjercicio } from "../bienestoy/types";
import { TituloPantalla } from "./IconoPantalla";
import { SelectorDibujo } from "./SelectorDibujo";

export function Catalogo({
  estado,
  dispatch,
}: {
  estado: Estado;
  dispatch: (accion: Accion) => void;
}) {
  const [nuevaActividad, setNuevaActividad] = useState("");

  function guardarGuion(id: string, lineas: PlantillaEjercicio[]) {
    dispatch({ tipo: "definirGuionActividad", id, lineas });
  }

  return (
    <main>
      <header className="marca">
        <div>
          <TituloPantalla ruta="catalogo">Catálogo</TituloPantalla>
          <p>Actividades, ejercicios y sus dibujitos.</p>
        </div>
      </header>

      <section className="tarjeta">
        <h2>Actividades</h2>
        {estado.actividades.map((actividad) => (
          <article key={actividad.id} style={{ marginBottom: "1.2rem" }}>
            <label className="campo">
              Nombre
              <input
                defaultValue={actividad.nombre}
                onBlur={(e) => {
                  const nombre = e.target.value.trim();
                  if (nombre && nombre !== actividad.nombre) {
                    dispatch({
                      tipo: "renombrarActividad",
                      id: actividad.id,
                      nombre,
                    });
                  }
                }}
              />
            </label>
            <p className="muted">Ejercicios del guion</p>
            {actividad.guionPorDefecto.map((linea, indice) => (
              <div className="linea-ejercicio" key={`${actividad.id}-${indice}`}>
                <SelectorDibujo
                  valor={linea.dibujo}
                  onElegir={(dibujo) => {
                    const lineas = actividad.guionPorDefecto.map((item, i) =>
                      i === indice ? { ...item, dibujo } : item,
                    );
                    guardarGuion(actividad.id, lineas);
                  }}
                />
                <input
                  defaultValue={linea.nombre}
                  aria-label="Nombre del ejercicio"
                  onBlur={(e) => {
                    const nombre = e.target.value.trim();
                    if (!nombre || nombre === linea.nombre) return;
                    const lineas = actividad.guionPorDefecto.map((item, i) =>
                      i === indice ? { ...item, nombre } : item,
                    );
                    guardarGuion(actividad.id, lineas);
                  }}
                />
                <button
                  className="boton secundario"
                  onClick={() => {
                    guardarGuion(
                      actividad.id,
                      actividad.guionPorDefecto.filter((_, i) => i !== indice),
                    );
                  }}
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              className="boton secundario"
              style={{ margin: "0.4rem 0 0.8rem" }}
              onClick={() =>
                guardarGuion(actividad.id, [
                  ...actividad.guionPorDefecto,
                  { nombre: "Ejercicio", dibujo: "otro" },
                ])
              }
            >
              Añadir ejercicio
            </button>
            <button
              className="boton secundario"
              onClick={() =>
                dispatch({ tipo: "eliminarActividad", id: actividad.id })
              }
            >
              Eliminar actividad
            </button>
          </article>
        ))}
        <label className="campo">
          Nueva actividad
          <input
            value={nuevaActividad}
            onChange={(e) => setNuevaActividad(e.target.value)}
          />
        </label>
        <button
          className="boton"
          onClick={() => {
            const nombre = nuevaActividad.trim();
            if (!nombre) return;
            dispatch({
              tipo: "anadirActividad",
              id: crypto.randomUUID(),
              nombre,
            });
            setNuevaActividad("");
          }}
        >
          Añadir actividad
        </button>
      </section>
    </main>
  );
}
