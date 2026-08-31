import { useState } from "react";
import type { Accion, Estado } from "../bienestoy";
import { TituloPantalla } from "./IconoPantalla";
import { EditorGuion } from "./EditorGuion";

export function Catalogo({
  estado,
  dispatch,
}: {
  estado: Estado;
  dispatch: (accion: Accion) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState("");

  return (
    <main>
      <header className="marca">
        <div>
          <TituloPantalla ruta="catalogo">Catálogo</TituloPantalla>
          <p>Actividades y sus ejercicios.</p>
        </div>
        {editando ? (
          <button className="boton" onClick={() => setEditando(false)}>
            Listo
          </button>
        ) : (
          <button className="boton" onClick={() => setEditando(true)}>
            Editar
          </button>
        )}
      </header>

      <section className="tarjeta">
        {estado.actividades.length === 0 ? (
          <p className="vacio">Nada en el catálogo.</p>
        ) : (
          estado.actividades.map((actividad) => (
            <article className="dia-semana" key={actividad.id}>
              {editando ? (
                <>
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
                  <p className="muted">Ejercicios</p>
                  <EditorGuion
                    lineas={actividad.guionPorDefecto}
                    onCambiar={(lineas) =>
                      dispatch({
                        tipo: "definirGuionActividad",
                        id: actividad.id,
                        lineas,
                      })
                    }
                  />
                  <button
                    className="boton secundario"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() =>
                      dispatch({
                        tipo: "eliminarActividad",
                        id: actividad.id,
                      })
                    }
                  >
                    Eliminar actividad
                  </button>
                </>
              ) : (
                <div>
                  <strong>{actividad.nombre}</strong>
                  {actividad.guionPorDefecto.length > 0 ? (
                    <p className="muted" style={{ margin: "0.15rem 0 0" }}>
                      {actividad.guionPorDefecto
                        .map((linea) => linea.nombre)
                        .join(" · ")}
                    </p>
                  ) : (
                    <p className="vacio" style={{ margin: "0.15rem 0 0" }}>
                      Sin ejercicios
                    </p>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </section>

      {editando && (
        <section className="tarjeta">
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
      )}
    </main>
  );
}
