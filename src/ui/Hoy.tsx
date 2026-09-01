import { useState } from "react";
import type { Accion, Actividad, Dia, Estado, IsoDate } from "../bienestoy";
import {
  diaDe,
  etiquetaCuanto,
  etiquetaFecha,
  fechaAlDeslizar,
  nombreDia,
} from "../bienestoy";
import { usarDeslizar } from "./deslizar";
import { FlechasDeslizar } from "./FlechasDeslizar";
import { IconoHecho, IconoPantalla, TituloPantalla } from "./IconoPantalla";
import { SelectorActividad } from "./SelectorActividad";
import { ContadorHiit } from "./ContadorHiit";
import { NombreConCuanto } from "./NombreConCuanto";
import { CamposCuantoActividad } from "./EditorGuion";

function ExtrasDelDia({
  dia,
  fecha,
  actividades,
  dispatch,
}: {
  dia: Dia;
  fecha: IsoDate;
  actividades: Actividad[];
  dispatch: (accion: Accion) => void;
}) {
  return (
    <>
      <h3>Actividad extra</h3>
      {dia.extras.length === 0 ? (
        <p className="muted">Si hiciste una actividad extra, apúntala.</p>
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
              <CamposCuantoActividad
                cuanto={extra.cuanto}
                onCambiar={(cuanto) =>
                  dispatch({
                    tipo: "definirCuantoExtra",
                    fecha,
                    indice,
                    cuanto,
                  })
                }
              />
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
        etiqueta="Añadir extra"
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
  const [hiit, setHiit] = useState(false);
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

      {hiit && <ContadorHiit onCerrar={() => setHiit(false)} />}

      <section className="tarjeta">
        {sesion ? (
          <>
            <h3>Actividad programada</h3>
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
              <h2>
                <NombreConCuanto
                  nombre={sesion.actividadNombre}
                  cuanto={sesion.cuanto}
                />
              </h2>
              {sesion.estado === "hecha" && <IconoHecho />}
            </label>
            {sesion.guion.length > 0 && (
              <div className="guion">
                <h3>Guion</h3>
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
          dia={dia}
          fecha={fecha}
          actividades={estado.actividades}
          dispatch={dispatch}
        />
      </section>
      {!hiit && (
        <button className="boton boton-hiit" onClick={() => setHiit(true)}>
          HIIT
        </button>
      )}
      </main>
  );
}
