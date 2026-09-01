import {
  diasSemana,
  etiquetaSemana,
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
import { Barras, BarrasActividades, Leyenda, Linea, Tarta } from "./graficas";
import { TituloPantalla } from "./IconoPantalla";

function corta(fecha: IsoDate): string {
  const [, mes, dia] = fecha.split("-");
  return `${Number(dia)}/${Number(mes)}`;
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
    { etiqueta: "hechas", valor: estaSemana.hechas, color: COLOR_SI },
    { etiqueta: "sin cumplir", valor: noCumplidas, color: COLOR_PENDIENTE },
  ];
  const deslizar = usarDeslizar((direccion) => {
    const siguiente = lunesAlDeslizar(lunes, hoy, direccion);
    if (siguiente) onVerSemana(siguiente);
  });

  return (
    <main {...deslizar}>
      <header className="marca">
        <div>
          <TituloPantalla ruta="resumen">Resumen</TituloPantalla>
          <p>
            {etiquetaSemana(lunes)}
            {esta ? " · esta" : ""}
          </p>
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
        <h2>Cumplimiento (8 semanas)</h2>
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
                  etiqueta: "hechas",
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
          </>
        ) : (
          <p className="vacio">Aún no hay sesiones ni extras.</p>
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
