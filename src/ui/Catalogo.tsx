import { useState } from "react";
import type { Accion, Estado } from "../bienestoy";
import { etiquetaCuanto } from "../bienestoy";
import { TituloPantalla } from "./IconoPantalla";
import { CamposCuantoActividad, EditorGuion } from "./EditorGuion";
import { NombreConCuanto } from "./NombreConCuanto";

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
    <main className="catalogo">
      <header className="marca">
        <div>
          <TituloPantalla ruta="catalogo">Catálogo</TituloPantalla>
          <p>Actividades y sus ejercicios.</p>
          {editando ? (
            <button className="boton" onClick={() => setEditando(false)}>
              Listo
            </button>
          ) : (
            <button className="boton" onClick={() => setEditando(true)}>
              Editar
            </button>
          )}
        </div>
      </header>

      {estado.actividades.length === 0 ? (
        <section className="tarjeta">
          <p className="vacio">Nada en el catálogo.</p>
        </section>
      ) : (
        <section className="lista-fichas">
          {estado.actividades.map((actividad) => (
            <article className="ficha" key={actividad.id}>
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
                  <label className="campo">
                    Repeticiones o tiempo
                    <CamposCuantoActividad
                      cuanto={actividad.cuanto}
                      onCambiar={(cuanto) =>
                        dispatch({
                          tipo: "definirCuantoActividad",
                          id: actividad.id,
                          cuanto,
                        })
                      }
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
                <>
                  <header className="ficha-cabecera">
                    <h2>
                      <NombreConCuanto
                        nombre={actividad.nombre}
                        cuanto={actividad.cuanto}
                      />
                    </h2>
                    {actividad.guionPorDefecto.length > 0 ? (
                      <p className="ficha-cuenta">
                        {actividad.guionPorDefecto.length === 1
                          ? "1 ejercicio"
                          : `${actividad.guionPorDefecto.length} ejercicios`}
                      </p>
                    ) : null}
                  </header>
                  {actividad.guionPorDefecto.length > 0 ? (
                    <ul className="lista-guion">
                      {actividad.guionPorDefecto.map((linea, indice) => (
                        <li
                          className="linea-guion"
                          key={`${linea.nombre}-${indice}`}
                        >
                          {linea.nombre}
                          {linea.cuanto ? (
                            <span className="linea-guion-cuanto">
                              {etiquetaCuanto(linea.cuanto)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vacio">Sin ejercicios</p>
                  )}
                </>
              )}
            </article>
          ))}
        </section>
      )}

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
