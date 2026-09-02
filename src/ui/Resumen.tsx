import {
  diasSemana,
  etiquetaSemana,
  etiquetaTotalesCuanto,
  historialDias,
  lunesAlDeslizar,
  lunesDe,
  resumenActividades,
  resumenDeporte,
  serieMedida,
  seriePesajes,
  sumarDias,
  type Estado,
  type IsoDate,
} from "../bienestoy";
import { usarDeslizar } from "./deslizar";
import { FlechasDeslizar } from "./FlechasDeslizar";
import { Barras, BarrasActividades, Leyenda, Linea, Tarta } from "./graficas";
import { TituloPantalla } from "./IconoPantalla";

function corta(fecha: IsoDate): string {
  const [, mes, dia] = fecha.split("-");
  return `${Number(dia)}/${Number(mes)}`;
}

function pieza(n: number, una: string, varias: string): string | undefined {
  if (n === 1) return `1 ${una}`;
  if (n > 1) return `${n} ${varias}`;
  return undefined;
}

function cuentaActividad(a: {
  hechas: number;
  extras: number;
  pendientes: number;
  saltadas: number;
}): string {
  return [
    pieza(a.hechas, "programada", "programadas"),
    pieza(a.extras, "extra", "extras"),
    pieza(a.pendientes, "pendiente", "pendientes"),
    pieza(a.saltadas, "saltada", "saltadas"),
  ]
    .filter((parte): parte is string => Boolean(parte))
    .join(" · ");
}

const COLOR_SI = "var(--naranja)";
const COLOR_NO = "var(--terracota)";
const COLOR_SUAVE = "#c4b4a4";
const COLOR_EXTRA = "var(--naranja-clara)";
const COLOR_PENDIENTE = "#d3c8b4";

export function Resumen({
  estado,
  hoy,
  lunes,
  onVerSemana,
}: {
  estado: Estado;
  hoy: IsoDate;
  lunes: IsoDate;
  onVerSemana: (lunes: IsoDate) => void;
}) {
  const esta = lunes === lunesDe(hoy);
  const tope = esta ? hoy : sumarDias(lunes, 6);
  const estaSemana = diasSemana(estado, lunes, tope);
  const deporte = resumenDeporte(estado, lunes, tope);
  const semanas = historialDias(estado, tope, 8);
  const actividades = resumenActividades(estado, {
    desde: lunes,
    hasta: tope,
  });
  const pesajes = seriePesajes(estado);
  const hayDias = semanas.some((s) => s.total > 0);
  const hayMarcas = actividades.length > 0;
  const hayGraficaActividades = actividades.some(
    (a) => a.hechas + a.extras + a.pendientes + a.saltadas > 0,
  );
  const noCumplidas = Math.max(estaSemana.total - estaSemana.hechas, 0);
  const porcionesDeporte = [
    { etiqueta: "sí", valor: deporte.si, color: COLOR_SI },
    { etiqueta: "no", valor: deporte.no, color: COLOR_NO },
    { etiqueta: "sin marcar", valor: deporte.sinMarcar, color: COLOR_SUAVE },
  ];
  const porcionesDias = [
    { etiqueta: "con deporte", valor: estaSemana.hechas, color: COLOR_SI },
    { etiqueta: "sin cumplir", valor: noCumplidas, color: COLOR_PENDIENTE },
  ];
  const deslizar = usarDeslizar((direccion) => {
    const siguiente = lunesAlDeslizar(lunes, hoy, direccion);
    if (siguiente) onVerSemana(siguiente);
  });
  const semanaAnterior = lunesAlDeslizar(lunes, hoy, "anterior");
  const semanaSiguiente = lunesAlDeslizar(lunes, hoy, "siguiente");

  return (
    <main {...deslizar}>
      <header className="marca">
        <div>
          <TituloPantalla ruta="resumen">Resumen</TituloPantalla>
          <FlechasDeslizar
            anterior={
              semanaAnterior
                ? {
                    etiqueta: "Semana anterior",
                    ir: () => onVerSemana(semanaAnterior),
                  }
                : undefined
            }
            siguiente={
              semanaSiguiente
                ? {
                    etiqueta: "Semana siguiente",
                    ir: () => onVerSemana(semanaSiguiente),
                  }
                : undefined
            }
          >
            {etiquetaSemana(lunes)}
            {esta ? " · esta" : ""}
          </FlechasDeslizar>
        </div>
      </header>

      <section className="tarjeta">
        <h2>{esta ? "Esta semana" : "Semana"}</h2>
        <div className="bloque-grafica">
          <h3>Deporte</h3>
          <p className="muted">{esta ? "lunes → hoy" : "lunes → domingo"}</p>
          <Tarta porciones={porcionesDeporte} ariaLabel="Deporte" />
          <Leyenda items={porcionesDeporte} />
        </div>
        {estaSemana.total > 0 && (
          <div className="bloque-grafica">
            <h3>Días</h3>
            <Tarta porciones={porcionesDias} ariaLabel="Días" />
            <Leyenda items={porcionesDias} />
          </div>
        )}
      </section>

      <section className="tarjeta">
        <h2>Días con deporte (8 semanas)</h2>
        {hayDias ? (
          <Barras
            valores={semanas.map((s) => ({
              etiqueta: corta(s.lunes),
              numerador: s.hechas,
              denominador: s.total,
            }))}
          />
        ) : (
          <p className="vacio">Cuando haya días con deporte, aquí verás las barras.</p>
        )}
      </section>

      <section className="tarjeta">
        <h2>Actividades</h2>
        {hayMarcas && hayGraficaActividades ? (
          <>
            <BarrasActividades
              valores={actividades.map((a) => ({
                etiqueta: a.nombre,
                hechas: a.hechas,
                extras: a.extras,
                pendientes: a.pendientes,
                saltadas: a.saltadas,
              }))}
            />
            <Leyenda
              items={[
                {
                  etiqueta: "programadas",
                  valor: actividades.reduce((s, a) => s + a.hechas, 0),
                  color: COLOR_SI,
                },
                {
                  etiqueta: "extras",
                  valor: actividades.reduce((s, a) => s + a.extras, 0),
                  color: COLOR_EXTRA,
                },
                {
                  etiqueta: "pendientes",
                  valor: actividades.reduce((s, a) => s + a.pendientes, 0),
                  color: COLOR_PENDIENTE,
                },
                {
                  etiqueta: "saltadas",
                  valor: actividades.reduce((s, a) => s + a.saltadas, 0),
                  color: COLOR_NO,
                },
              ]}
            />
            <ul className="lista">
              {actividades.map((actividad) => {
                const cantidades = etiquetaTotalesCuanto(actividad);
                const cuenta = cuentaActividad(actividad);
                if (!cuenta && !cantidades) return null;
                return (
                  <li key={actividad.nombre}>
                    <div className="resumen-actividad">
                      <span className="nombre-con-cuanto">
                        <span className="nombre-con-cuanto-nombre">
                          {actividad.nombre}
                        </span>
                        {cantidades ? (
                          <span className="cuanto"> · {cantidades}</span>
                        ) : null}
                      </span>
                      {cuenta ? (
                        <p className="muted resumen-actividad-cuenta">
                          {cuenta}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="vacio">Aún no hay actividad programada ni extra.</p>
        )}
      </section>

      <section className="tarjeta">
        <h2>Peso</h2>
        {pesajes.length >= 1 ? (
          <Linea
            puntos={pesajes.map((p) => ({ fecha: p.fecha, valor: p.kg }))}
            unidad="kg"
          />
        ) : (
          <p className="vacio">Sin pesajes todavía. Se anotan en Cuerpo.</p>
        )}
      </section>

      {estado.medidas.map((medida) => {
        const serie = serieMedida(estado, medida.id);
        if (serie.length === 0) return null;
        return (
          <section className="tarjeta" key={medida.id}>
            <h2>
              {medida.nombre} ({medida.unidad})
            </h2>
            <Linea puntos={serie} unidad={medida.unidad} />
          </section>
        );
      })}
    </main>
  );
}
