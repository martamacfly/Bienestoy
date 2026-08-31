import type { Accion, Actividad, Dia, Estado, IsoDate } from "../bienestoy";
import {
  deporteDelDia,
  diaDe,
  etiquetaFecha,
  lunesDe,
  nombreDia,
} from "../bienestoy";
import { IconoHecho, TituloPantalla } from "./IconoPantalla";
import { Dibujo } from "./Dibujo";
import { SelectorActividad } from "./SelectorActividad";

function ExtrasDelDia({
  titulo,
  pista,
  dia,
  fecha,
  actividades,
  dispatch,
}: {
  titulo: string;
  pista: string;
  dia: Dia;
  fecha: IsoDate;
  actividades: Actividad[];
  dispatch: (accion: Accion) => void;
}) {
  return (
    <>
      <h3>{titulo}</h3>
      {dia.extras.length === 0 ? (
        <p className="muted">{pista}</p>
      ) : (
        <ul className="lista">
          {dia.extras.map((extra, indice) => (
            <li key={`${extra.actividadId}-${indice}`}>
              <span>{extra.actividadNombre}</span>
              <button
                className="boton secundario"
                onClick={() =>
                  dispatch({ tipo: "quitarExtra", fecha, indice })
                }
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
      <SelectorActividad
        actividades={actividades}
        etiqueta="Añadir actividad"
        onElegir={(actividadId) =>
          dispatch({ tipo: "anadirExtra", fecha, actividadId })
        }
      />
    </>
  );
}

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
            <label className="marca-sesion">
              <input
                type="checkbox"
                checked={sesion.estado === "hecha"}
                aria-label="Hecha"
                onChange={(e) =>
                  dispatch({
                    tipo: "marcarSesion",
                    fecha,
                    estado: e.target.checked ? "hecha" : "pendiente",
                  })
                }
              />
              <h2>{sesion.actividadNombre}</h2>
              {sesion.estado === "hecha" && <IconoHecho />}
            </label>
            {sesion.guion.length > 0 && (
              <div className="guion">
                <h3>Guion</h3>
                {sesion.guion.map((linea, indice) => (
                  <div className="linea-guion" key={`${linea.nombre}-${indice}`}>
                    <Dibujo id={linea.dibujo} />
                    {linea.nombre}
                  </div>
                ))}
              </div>
            )}
            <ExtrasDelDia
              titulo="Además"
              pista="Si hiciste otro deporte, apúntalo."
              dia={dia}
              fecha={fecha}
              actividades={estado.actividades}
              dispatch={dispatch}
            />
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
            <p className="fila-hecho">
              <span>
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
              </span>
              {deporte === "si" && <IconoHecho />}
            </p>
            {deporte === "si" && (
              <ExtrasDelDia
                titulo="Qué se hizo"
                pista="Puedes apuntar la actividad."
                dia={dia}
                fecha={fecha}
                actividades={estado.actividades}
                dispatch={dispatch}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}
