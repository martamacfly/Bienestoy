import type { Accion, Actividad, Dia, Estado, IsoDate } from "../bienestoy";
import {
  diaDe,
  etiquetaFecha,
  fechaAlDeslizar,
  nombreDia,
} from "../bienestoy";
import { usarDeslizar } from "./deslizar";
import { FlechasDeslizar } from "./FlechasDeslizar";
import { IconoHecho, IconoPantalla, TituloPantalla } from "./IconoPantalla";
import { SelectorActividad } from "./SelectorActividad";

function ExtrasDelDia({
  pista,
  dia,
  fecha,
  actividades,
  dispatch,
}: {
  pista: string;
  dia: Dia;
  fecha: IsoDate;
  actividades: Actividad[];
  dispatch: (accion: Accion) => void;
}) {
  return (
    <>
      <h3>Qué se hizo</h3>
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
  onVerDia,
}: {
  estado: Estado;
  fecha: IsoDate;
  hoy: IsoDate;
  dispatch: (accion: Accion) => void;
  onVerDia: (fecha: IsoDate) => void;
}) {
  const dia = diaDe(estado, fecha);
  const sesion = dia.sesion;
  const esHoy = fecha === hoy;
  const diaAnterior = fechaAlDeslizar(fecha, hoy, "anterior");
  const diaSiguiente = fechaAlDeslizar(fecha, hoy, "siguiente");
  const deslizar = usarDeslizar((direccion) => {
    const siguiente = fechaAlDeslizar(fecha, hoy, direccion);
    if (siguiente) onVerDia(siguiente);
  });

  return (
    <main {...deslizar}>
      <header className="marca">
        <div>
          <TituloPantalla ruta="hoy">
            {esHoy
              ? "Hoy"
              : nombreDia(fecha).replace(/^\p{L}/u, (letra) =>
                  letra.toUpperCase(),
                )}
          </TituloPantalla>
          <FlechasDeslizar
            anterior={
              diaAnterior
                ? {
                    etiqueta: "Día anterior",
                    ir: () => onVerDia(diaAnterior),
                  }
                : undefined
            }
            siguiente={
              diaSiguiente
                ? {
                    etiqueta: "Día siguiente",
                    ir: () => onVerDia(diaSiguiente),
                  }
                : undefined
            }
          >
            {etiquetaFecha(fecha)}
          </FlechasDeslizar>
        </div>
        <a
          href={fecha === hoy ? "#/cuerpo" : `#/cuerpo/${fecha}`}
          className="atajo-icono"
          aria-label="Cuerpo"
        >
          <IconoPantalla ruta="cuerpo" />
        </a>
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
                    {linea.nombre}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="fila-hecho">
            <h2>Día de descanso</h2>
            {dia.extras.length > 0 && <IconoHecho />}
          </div>
        )}
        <ExtrasDelDia
          pista={
            sesion
              ? "Si hiciste otra actividad, apúntala."
              : "Si hiciste alguna actividad, apúntala."
          }
          dia={dia}
          fecha={fecha}
          actividades={estado.actividades}
          dispatch={dispatch}
        />
      </section>
    </main>
  );
}
