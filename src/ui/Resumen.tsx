import {
  cumplimientoSemana,
  etiquetaSemana,
  historialSemanas,
  lunesDe,
  resumenActividades,
  resumenDeporte,
  serieMedida,
  seriePesajes,
  type Estado,
  type IsoDate,
} from "../bienestoy";
import { Barras, Linea } from "./graficas";
import { TituloPantalla } from "./IconoPantalla";

function corta(fecha: IsoDate): string {
  const [, mes, dia] = fecha.split("-");
  return `${Number(dia)}/${Number(mes)}`;
}

export function Resumen({ estado, hoy }: { estado: Estado; hoy: IsoDate }) {
  const lunes = lunesDe(hoy);
  const estaSemana = cumplimientoSemana(estado, lunes);
  const deporte = resumenDeporte(estado, lunes, hoy);
  const semanas = historialSemanas(estado, lunes, 8);
  const actividades = resumenActividades(estado);
  const pesajes = seriePesajes(estado);
  const hayPlan = semanas.some((s) => s.planificadas > 0);
  const hayMarcas = actividades.length > 0;

  return (
    <main>
      <header className="marca">
        <div>
          <TituloPantalla ruta="resumen">Resumen</TituloPantalla>
          <p>Actividad, cumplimiento y cuerpo.</p>
        </div>
      </header>

      <section className="tarjeta">
        <h2>Esta semana</h2>
        <p className="muted">{etiquetaSemana(lunes)}</p>
        <p className="cumplimiento" style={{ fontSize: "1.6rem" }}>
          {estaSemana.hechas}/{estaSemana.planificadas || 0}
        </p>
        <p className="muted">sesiones hechas / planificadas</p>
        <p>
          Deporte: <span className="estado-si">{deporte.si} sí</span>
          {" · "}
          <span className="estado-no">{deporte.no} no</span>
          {" · "}
          <span className="muted">{deporte.sinMarcar} sin marcar</span>
          <span className="muted"> (lunes → hoy)</span>
        </p>
      </section>

      <section className="tarjeta">
        <h2>Cumplimiento (8 semanas)</h2>
        {hayPlan ? (
          <Barras
            valores={semanas.map((s) => ({
              etiqueta: corta(s.lunes),
              numerador: s.hechas,
              denominador: s.planificadas,
            }))}
          />
        ) : (
          <p className="vacio">Cuando tengas un plan, aquí verás las barras.</p>
        )}
      </section>

      <section className="tarjeta">
        <h2>Actividades</h2>
        {hayMarcas ? (
          <ul className="lista">
            {actividades.map((a) => (
              <li key={a.nombre}>
                <span>{a.nombre}</span>
                <span className="muted">
                  {a.hechas} hechas
                  {a.saltadas ? ` · ${a.saltadas} saltadas` : ""}
                  {a.pendientes ? ` · ${a.pendientes} pendientes` : ""}
                  {a.extras ? ` · ${a.extras} extras` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vacio">Aún no hay sesiones ni extras.</p>
        )}
      </section>

      <section className="tarjeta">
        <h2>Peso</h2>
        {pesajes.length >= 2 ? (
          <Linea
            puntos={pesajes.map((p) => ({ fecha: p.fecha, valor: p.kg }))}
            unidad="kg"
          />
        ) : pesajes.length === 1 ? (
          <p>
            {pesajes[0].kg} kg el {corta(pesajes[0].fecha)}. Hace falta otro
            pesaje para la gráfica.
          </p>
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
            {serie.length >= 2 ? (
              <Linea puntos={serie} unidad={medida.unidad} />
            ) : (
              <p>
                {serie[0].valor} {medida.unidad} el {corta(serie[0].fecha)}.
              </p>
            )}
          </section>
        );
      })}
    </main>
  );
}
