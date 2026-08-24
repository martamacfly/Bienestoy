import type { Accion, Estado, IsoDate } from "../bienestoy";
import {
  deporteDelDia,
  diaDe,
  etiquetaFecha,
  puedeReplanificar,
} from "../bienestoy";
import { TituloPantalla } from "./IconoPantalla";
import { Dibujo } from "./Dibujo";
import { SelectorActividad } from "./SelectorActividad";

export function Hoy({
  estado,
  hoy,
  dispatch,
}: {
  estado: Estado;
  hoy: IsoDate;
  dispatch: (accion: Accion) => void;
}) {
  const dia = diaDe(estado, hoy);
  const deporte = deporteDelDia(estado, hoy);
  const sesion = dia.sesion;
  const sePuedePlanear = puedeReplanificar(hoy, hoy);

  return (
    <main>
      <header className="marca">
        <div>
          <TituloPantalla ruta="hoy">Hoy</TituloPantalla>
          <p>{etiquetaFecha(hoy)}</p>
        </div>
        <a href="#/cuerpo" className="muted">
          Cuerpo
        </a>
      </header>

      <section className="tarjeta">
        {sesion ? (
          <>
            <h2>{sesion.actividadNombre}</h2>
            <p className="muted">
              {sesion.estado === "hecha"
                ? "Sesión hecha"
                : sesion.estado === "saltada"
                  ? "Sesión saltada"
                  : "Pendiente"}
            </p>
            <div className="fila">
              <button
                className="boton"
                onClick={() =>
                  dispatch({
                    tipo: "marcarSesion",
                    fecha: hoy,
                    estado: "hecha",
                  })
                }
              >
                Hecha
              </button>
              <button
                className="boton peligro"
                onClick={() =>
                  dispatch({
                    tipo: "marcarSesion",
                    fecha: hoy,
                    estado: "saltada",
                  })
                }
              >
                Saltada
              </button>
              {sesion.estado !== "pendiente" && (
                <button
                  className="boton secundario"
                  onClick={() =>
                    dispatch({
                      tipo: "marcarSesion",
                      fecha: hoy,
                      estado: "pendiente",
                    })
                  }
                >
                  Quitar marca
                </button>
              )}
            </div>
            {sesion.guion.length > 0 && (
              <div className="guion">
                <h3>Guion</h3>
                {sesion.guion.map((linea, indice) => (
                  <label key={`${linea.nombre}-${indice}`}>
                    <Dibujo id={linea.dibujo} />
                    <input
                      type="checkbox"
                      checked={linea.tachado}
                      onChange={(e) =>
                        dispatch({
                          tipo: "tacharGuion",
                          fecha: hoy,
                          indice,
                          tachado: e.target.checked,
                        })
                      }
                    />
                    {linea.nombre}
                  </label>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2>Sin sesión planificada</h2>
            <p className="muted">Descanso del plan. ¿Hubo deporte igual?</p>
            {dia.extras.length === 0 && (
              <div className="fila">
                <button
                  className="boton"
                  onClick={() =>
                    dispatch({
                      tipo: "responderDeporte",
                      fecha: hoy,
                      si: true,
                    })
                  }
                >
                  Sí
                </button>
                <button
                  className="boton secundario"
                  onClick={() =>
                    dispatch({
                      tipo: "responderDeporte",
                      fecha: hoy,
                      si: false,
                    })
                  }
                >
                  No
                </button>
              </div>
            )}
            <p>
              Deporte de hoy:{" "}
              <span
                className={
                  deporte === "si"
                    ? "estado-si"
                    : deporte === "no"
                      ? "estado-no"
                      : "muted"
                }
              >
                {deporte === "si"
                  ? "sí"
                  : deporte === "no"
                    ? "no"
                    : "sin marcar"}
              </span>
            </p>
            {sePuedePlanear && (
              <SelectorActividad
                actividades={estado.actividades}
                etiqueta="Planificar hoy"
                onElegir={(actividadId) =>
                  dispatch({
                    tipo: "colocarSesion",
                    fecha: hoy,
                    actividadId,
                  })
                }
              />
            )}
          </>
        )}
      </section>

      <section className="tarjeta">
        <h2>Extras</h2>
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
                    dispatch({ tipo: "quitarExtra", fecha: hoy, indice })
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
            dispatch({ tipo: "anadirExtra", fecha: hoy, actividadId })
          }
        />
      </section>
    </main>
  );
}
