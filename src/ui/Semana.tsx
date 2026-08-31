import { useEffect, useState } from "react";
import type { Accion, Estado, IsoDate } from "../bienestoy";
import {
  cumplimientoSemana,
  diaDe,
  etiquetaFecha,
  etiquetaSemana,
  fechasDeSemana,
  lunesDe,
  sumarDias,
} from "../bienestoy";
import { TituloPantalla } from "./IconoPantalla";
import { EditorGuion } from "./EditorGuion";
import { SelectorActividad } from "./SelectorActividad";

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
    <main>
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

      <section className="tarjeta">
        {dias.map((fecha) => {
          const dia = diaDe(estado, fecha);
          const sesion = dia.sesion;
          return (
            <div className="dia-semana" key={fecha}>
              <div>
                <button
                  type="button"
                  className="enlace-dia"
                  onClick={() => onVerDia(fecha)}
                >
                  <strong>
                    {etiquetaFecha(fecha)}
                    {fecha === hoy ? " · hoy" : ""}
                  </strong>
                </button>
                {sesion ? (
                  <>
                    <p style={{ margin: "0.2rem 0 0" }}>
                      {sesion.actividadNombre}
                    </p>
                    {sesion.guion.length > 0 && (
                      <p className="muted" style={{ margin: "0.15rem 0 0" }}>
                        {sesion.guion.map((linea) => linea.nombre).join(" · ")}
                      </p>
                    )}
                  </>
                ) : editando ? (
                  <p className="vacio" style={{ margin: "0.2rem 0 0" }}>
                    Sin sesión
                  </p>
                ) : null}
                {dia.extras.length > 0 && (
                  <p className="muted" style={{ margin: "0.15rem 0 0" }}>
                    Extra: {dia.extras.map((e) => e.actividadNombre).join(", ")}
                  </p>
                )}
              </div>
              <div className="fila" style={{ justifyContent: "flex-end" }}>
                {!editando && (
                  <button
                    className="boton secundario"
                    onClick={() => onVerDia(fecha)}
                  >
                    Apuntar
                  </button>
                )}
                {editando && sesion && (
                  <button
                    className="boton secundario"
                    onClick={() => dispatch({ tipo: "quitarSesion", fecha })}
                  >
                    Quitar
                  </button>
                )}
              </div>
              {editando && (
                <>
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
                            <span>{extra.actividadNombre}</span>
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
            </div>
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
