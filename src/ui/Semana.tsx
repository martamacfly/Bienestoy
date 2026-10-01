import { useEffect, useState } from "react";
import type { Accion, Estado, IsoDate } from "../bienestoy";
import {
  cumplimientoSemana,
  diaDe,
  etiquetaCuanto,
  etiquetaFecha,
  etiquetaSemana,
  fechasDeSemana,
  lunesDe,
  sumarDias,
} from "../bienestoy";
import { BotonQuitar, IconoHecho, TituloPantalla } from "./IconoPantalla";
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
          const hecho = dia.sesiones.some((sesion) => sesion.estado === "hecha");
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
                  {hecho && <IconoHecho />}
                </div>
              </header>
              {!editando && dia.sesiones.length === 0 && (
                <p className="ficha-subtitulo">Descanso</p>
              )}
              {!editando &&
                dia.sesiones.map((sesion, indice) => (
                  <div
                    className="actividad-dia"
                    key={`${sesion.actividadId}-${indice}`}
                  >
                    <div className="ficha-cabecera">
                      <p className="ficha-subtitulo">
                        <NombreConCuanto
                          nombre={sesion.actividadNombre}
                          cuanto={sesion.cuanto}
                        />
                      </p>
                      {sesion.guion.length > 0 && (
                        <p className="ficha-cuenta">
                          {cuentaEjercicios(sesion.guion.length)}
                        </p>
                      )}
                    </div>
                    {sesion.guion.length > 0 ? (
                      <ul className="lista-guion">
                        {sesion.guion.map((linea, lineaIndice) => (
                          <li
                            className="linea-guion"
                            key={`${linea.nombre}-${lineaIndice}`}
                          >
                            <span className="linea-guion-nombre">{linea.nombre}</span>
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
                  </div>
                ))}
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
                  {dia.sesiones.length === 0 && (
                    <p className="ficha-subtitulo">Descanso</p>
                  )}
                  {dia.sesiones.map((sesion, indice) => (
                    <div
                      className="detalle-dia"
                      key={`${sesion.actividadId}-${indice}`}
                    >
                      <div className="ficha-subtitulo-fila">
                        <p className="ficha-subtitulo">
                          <NombreConCuanto
                            nombre={sesion.actividadNombre}
                            cuanto={sesion.cuanto}
                          />
                        </p>
                        <BotonQuitar
                          onClick={() =>
                            dispatch({ tipo: "quitarSesion", fecha, indice })
                          }
                        />
                      </div>
                      <SelectorActividad
                        actividades={estado.actividades}
                        etiqueta="Cambiar"
                        onElegir={(actividadId) =>
                          dispatch({
                            tipo: "cambiarSesion",
                            fecha,
                            indice,
                            actividadId,
                          })
                        }
                      />
                      <p className="muted">
                        Ejercicios
                        {sesion.guion.length ? ` (${sesion.guion.length})` : ""}
                      </p>
                      <EditorGuion
                        lineas={sesion.guion}
                        onCambiar={(lineas) =>
                          dispatch({
                            tipo: "reemplazarGuion",
                            fecha,
                            sesion: indice,
                            lineas,
                          })
                        }
                      />
                    </div>
                  ))}
                  <SelectorActividad
                    actividades={estado.actividades}
                    etiqueta="Añadir actividad"
                    onElegir={(actividadId) =>
                      dispatch({
                        tipo: "colocarSesion",
                        fecha,
                        actividadId,
                      })
                    }
                  />
                </>
              )}
            </article>
          );
        })}
      </section>

      {editando && (
        <>
          <button
            className="boton ancho"
            onClick={() =>
              dispatch({ tipo: "copiarSemanaAnterior", lunesDestino: lunes })
            }
          >
            Copiar semana anterior
          </button>
          <button className="boton ancho" onClick={() => setEditando(false)}>
            Guardar
          </button>
        </>
      )}
    </main>
  );
}
