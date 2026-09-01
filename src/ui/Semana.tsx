import { useEffect, useState } from "react";
import type { Accion, Estado, IsoDate } from "../bienestoy";
import {
  cumplimientoSemana,
  deporteDelDia,
  diaDe,
  etiquetaCuanto,
  etiquetaFecha,
  etiquetaSemana,
  fechasDeSemana,
  lunesDe,
  sumarDias,
} from "../bienestoy";
import { IconoHecho, TituloPantalla } from "./IconoPantalla";
import { EditorGuion } from "./EditorGuion";
import { SelectorActividad } from "./SelectorActividad";
import { NombreConCuanto } from "./NombreConCuanto";

function cuentaEjercicios(n: number) {
  return n === 1 ? "1 ejercicio" : `${n} ejercicios`;
}

export function Semana({
  estado,
  hoy,
  lunes,
  dispatch,
  onVerDia,
  onVerSemana,
}: {
  estado: Estado;
  hoy: IsoDate;
  lunes: IsoDate;
  dispatch: (accion: Accion) => void;
  onVerDia: (fecha: IsoDate) => void;
  onVerSemana: (lunes: IsoDate) => void;
}) {
  const [editando, setEditando] = useState(false);
  const dias = fechasDeSemana(lunes);
  const { hechas, planificadas } = cumplimientoSemana(estado, lunes);
  const esEstaSemana = lunes === lunesDe(hoy);

  useEffect(() => {
    setEditando(false);
  }, [lunes]);

  return (
    <main className="semana">
      <header className="marca">
        <div>
          <TituloPantalla ruta="semana">Semana</TituloPantalla>
          <p>
            {etiquetaSemana(lunes)}
            {esEstaSemana ? " · esta" : ""}
          </p>
        </div>
        <strong className="cumplimiento">
          {hechas}/{planificadas || 0}
        </strong>
      </header>

      <div className="fila" style={{ marginBottom: "0.9rem" }}>
        <button
          className="boton secundario"
          onClick={() => onVerSemana(sumarDias(lunes, -7))}
        >
          Anterior
        </button>
        <button
          className="boton secundario"
          onClick={() => onVerSemana(lunesDe(hoy))}
        >
          Esta
        </button>
        <button
          className="boton secundario"
          onClick={() => onVerSemana(sumarDias(lunes, 7))}
        >
          Siguiente
        </button>
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

      <section className="lista-fichas">
        {dias.map((fecha) => {
          const dia = diaDe(estado, fecha);
          const sesion = dia.sesion;
          const nGuion = sesion?.guion.length ?? 0;
          const hecho =
            sesion?.estado === "hecha" ||
            (!sesion && deporteDelDia(estado, fecha) === "si");
          return (
            <article className="ficha" key={fecha}>
              <header className="ficha-cabecera">
                <button
                  type="button"
                  className="enlace-dia"
                  onClick={() => onVerDia(fecha)}
                >
                  <h2>
                    {etiquetaFecha(fecha)}
                    {fecha === hoy ? " · hoy" : ""}
                  </h2>
                </button>
                <div className="ficha-cabecera-meta">
                  {!editando && nGuion > 0 && (
                    <p className="ficha-cuenta">{cuentaEjercicios(nGuion)}</p>
                  )}
                  {hecho && <IconoHecho />}
                </div>
              </header>
              {!editando && sesion && (
                <>
                  <p className="ficha-subtitulo">
                    <NombreConCuanto
                      nombre={sesion.actividadNombre}
                      cuanto={sesion.cuanto}
                    />
                  </p>
                  {nGuion > 0 ? (
                    <ul className="lista-guion">
                      {sesion.guion.map((linea, indice) => (
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
              {!editando && dia.extras.length > 0 && (
                <p className="muted extra-dia">
                  Extra:{" "}
                  {dia.extras.map((e, indice) => (
                    <span key={`${e.actividadId}-${indice}`}>
                      {indice > 0 ? ", " : ""}
                      <NombreConCuanto
                        nombre={e.actividadNombre}
                        cuanto={e.cuanto}
                      />
                    </span>
                  ))}
                </p>
              )}
              {!editando && (
                <div className="ficha-pie">
                  <button
                    className="boton secundario"
                    onClick={() => onVerDia(fecha)}
                  >
                    Apuntar
                  </button>
                </div>
              )}
              {editando && (
                <>
                  {sesion ? (
                    <p className="ficha-subtitulo">
                      <NombreConCuanto
                        nombre={sesion.actividadNombre}
                        cuanto={sesion.cuanto}
                      />
                    </p>
                  ) : (
                    <p className="vacio">Sin sesión</p>
                  )}
                  <SelectorActividad
                    actividades={estado.actividades}
                    etiqueta={sesion ? "Cambiar" : "Planificar"}
                    onElegir={(actividadId) =>
                      dispatch({
                        tipo: "colocarSesion",
                        fecha,
                        actividadId,
                      })
                    }
                  />
                  {sesion && (
                    <div className="detalle-dia">
                      <p className="muted">
                        Ejercicios
                        {sesion.guion.length ? ` (${sesion.guion.length})` : ""}
                      </p>
                      <EditorGuion
                        lineas={sesion.guion}
                        onCambiar={(lineas) =>
                          dispatch({ tipo: "reemplazarGuion", fecha, lineas })
                        }
                      />
                      <button
                        className="boton secundario"
                        onClick={() =>
                          dispatch({ tipo: "quitarSesion", fecha })
                        }
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                  <details className="detalle-dia">
                    <summary>
                      Extras
                      {dia.extras.length ? ` (${dia.extras.length})` : ""}
                    </summary>
                    {dia.extras.length === 0 ? (
                      <p className="vacio">Nada aparte del plan.</p>
                    ) : (
                      <ul className="lista">
                        {dia.extras.map((extra, indice) => (
                          <li key={`${extra.actividadId}-${indice}`}>
                            <span>
                              <NombreConCuanto
                                nombre={extra.actividadNombre}
                                cuanto={extra.cuanto}
                              />
                            </span>
                            <button
                              className="boton secundario"
                              onClick={() =>
                                dispatch({
                                  tipo: "quitarExtra",
                                  fecha,
                                  indice,
                                })
                              }
                            >
                              Quitar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <SelectorActividad
                      actividades={estado.actividades}
                      etiqueta="Añadir extra"
                      onElegir={(actividadId) =>
                        dispatch({
                          tipo: "anadirExtra",
                          fecha,
                          actividadId,
                        })
                      }
                    />
                  </details>
                </>
              )}
            </article>
          );
        })}
      </section>

      {editando && (
        <button
          className="boton ancho"
          onClick={() =>
            dispatch({ tipo: "copiarSemanaAnterior", lunesDestino: lunes })
          }
        >
          Copiar semana anterior
        </button>
      )}
    </main>
  );
}
