import { useState } from "react";
import type { Accion, Estado, IsoDate } from "../bienestoy";
import {
  cumplimientoSemana,
  deporteDelDia,
  diaDe,
  etiquetaFecha,
  fechasDeSemana,
  lunesDe,
  puedeReplanificar,
  sumarDias,
} from "../bienestoy";
import { TituloPantalla } from "./IconoPantalla";
import { SelectorActividad } from "./SelectorActividad";

export function Semana({
  estado,
  hoy,
  dispatch,
}: {
  estado: Estado;
  hoy: IsoDate;
  dispatch: (accion: Accion) => void;
}) {
  const [lunes, setLunes] = useState(() => lunesDe(hoy));
  const dias = fechasDeSemana(lunes);
  const { hechas, planificadas } = cumplimientoSemana(estado, lunes);

  return (
    <main>
      <header className="marca">
        <div>
          <TituloPantalla ruta="semana">Semana</TituloPantalla>
          <p>
            {etiquetaFecha(dias[0])} – {etiquetaFecha(dias[6])}
          </p>
        </div>
        <strong className="cumplimiento">
          {hechas}/{planificadas || 0}
        </strong>
      </header>

      <div className="fila" style={{ marginBottom: "0.9rem" }}>
        <button
          className="boton secundario"
          onClick={() => setLunes(sumarDias(lunes, -7))}
        >
          Anterior
        </button>
        <button
          className="boton secundario"
          onClick={() => setLunes(lunesDe(hoy))}
        >
          Esta
        </button>
        <button
          className="boton secundario"
          onClick={() => setLunes(sumarDias(lunes, 7))}
        >
          Siguiente
        </button>
      </div>

      <section className="tarjeta">
        {dias.map((fecha) => {
          const dia = diaDe(estado, fecha);
          const deporte = deporteDelDia(estado, fecha);
          const editable = puedeReplanificar(fecha, hoy);
          return (
            <div className="dia-semana" key={fecha}>
              <div>
                <strong>
                  {etiquetaFecha(fecha)}
                  {fecha === hoy ? " · hoy" : ""}
                </strong>
                <p className="muted" style={{ margin: "0.2rem 0 0" }}>
                  {dia.sesion
                    ? `${dia.sesion.actividadNombre} · ${dia.sesion.estado}`
                    : `Descanso · deporte ${deporte === "si" ? "sí" : deporte === "no" ? "no" : "—"}`}
                </p>
                {editable ? (
                  <SelectorActividad
                    actividades={estado.actividades}
                    etiqueta={dia.sesion ? "Cambiar" : "Planificar"}
                    onElegir={(actividadId) =>
                      dispatch({
                        tipo: "colocarSesion",
                        fecha,
                        actividadId,
                      })
                    }
                  />
                ) : null}
              </div>
              {dia.sesion && editable && (
                <button
                  className="boton secundario"
                  onClick={() => dispatch({ tipo: "quitarSesion", fecha })}
                >
                  Quitar
                </button>
              )}
            </div>
          );
        })}
      </section>

      <button
        className="boton ancho"
        onClick={() =>
          dispatch({ tipo: "copiarSemanaAnterior", lunesDestino: lunes })
        }
      >
        Copiar semana anterior
      </button>
    </main>
  );
}
