import type { Accion, Estado, IsoDate } from "../bienestoy";
import {
  deporteDelDia,
  diaDe,
  etiquetaFecha,
  lunesDe,
  nombreDia,
} from "../bienestoy";
import { TituloPantalla } from "./IconoPantalla";
import { Dibujo } from "./Dibujo";

export function Hoy({
  estado,
  fecha,
  hoy,
  dispatch,
}: {
  estado: Estado;
  fecha: IsoDate;
  hoy: IsoDate;
  dispatch: (accion: Accion) => void;
}) {
  const dia = diaDe(estado, fecha);
  const deporte = deporteDelDia(estado, fecha);
  const sesion = dia.sesion;
  const esHoy = fecha === hoy;

  return (
    <main>
      <header className="marca">
        <div>
          <TituloPantalla ruta="hoy">
            {esHoy
              ? "Hoy"
              : nombreDia(fecha).replace(/^\p{L}/u, (letra) =>
                  letra.toUpperCase(),
                )}
          </TituloPantalla>
          <p>{etiquetaFecha(fecha)}</p>
        </div>
        <div className="fila" style={{ justifyContent: "flex-end" }}>
          <a href={`#/semana/${lunesDe(fecha)}`} className="muted">
            Semana
          </a>
          <a href="#/cuerpo" className="muted">
            Cuerpo
          </a>
        </div>
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
                    fecha,
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
                    fecha,
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
                      fecha,
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
                          fecha,
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
            <p className="muted">
              El plan se edita en Semana. ¿Hubo deporte igual?
            </p>
            {dia.extras.length === 0 && (
              <div className="fila">
                <button
                  className="boton"
                  onClick={() =>
                    dispatch({
                      tipo: "responderDeporte",
                      fecha,
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
                      fecha,
                      si: false,
                    })
                  }
                >
                  No
                </button>
              </div>
            )}
            <p>
              Deporte del día:{" "}
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
          </>
        )}
      </section>
    </main>
  );
}
