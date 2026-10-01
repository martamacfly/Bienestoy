import { useState } from "react";
import type { Accion, Estado, IsoDate } from "../bienestoy";
import {
  diaDe,
  etiquetaCuanto,
  etiquetaFecha,
  fechaAlDeslizar,
  nombreDia,
} from "../bienestoy";
import { usarDeslizar } from "./deslizar";
import { FlechasDeslizar } from "./FlechasDeslizar";
import { IconoHecho, IconoPantalla, TituloPantalla, BotonQuitar } from "./IconoPantalla";
import { SelectorActividad } from "./SelectorActividad";
import { ContadorHiit } from "./ContadorHiit";
import { NombreConCuanto } from "./NombreConCuanto";
import { CamposCuantoActividad } from "./EditorGuion";

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
        {dia.sesiones.length === 0 ? (
          <div className="fila-hecho">
            <h2>Día de descanso</h2>
          </div>
        ) : (
          dia.sesiones.map((sesion, indice) => (
            <div className="actividad-dia" key={`${sesion.actividadId}-${indice}`}>
              <label className="marca-sesion">
                <input
                  type="checkbox"
                  checked={sesion.estado === "hecha"}
                  aria-label="Hecha"
                  onChange={(e) =>
                    dispatch({
                      tipo: "marcarSesion",
                      fecha,
                      indice,
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
              {sesion.programada === false && (
                <BotonQuitar
                  onClick={() =>
                    dispatch({ tipo: "quitarSesion", fecha, indice })
                  }
                />
              )}
              <CamposCuantoActividad
                cuanto={sesion.cuanto}
                onCambiar={(cuanto) =>
                  dispatch({
                    tipo: "definirCuantoSesion",
                    fecha,
                    indice,
                    cuanto,
                  })
                }
              />
              {sesion.guion.length > 0 && (
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
              )}
            </div>
          ))
        )}
        <SelectorActividad
          actividades={estado.actividades.filter(
            (actividad) =>
              !dia.sesiones.some(
                (sesion) => sesion.actividadId === actividad.id,
              ),
          )}
          etiqueta="Añadir actividad"
          onElegir={(actividadId) =>
            dispatch({
              tipo: "colocarSesion",
              fecha,
              actividadId,
              programada: false,
            })
          }
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
