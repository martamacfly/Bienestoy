import type { IsoDate } from "../bienestoy";

export function Barras({
  valores,
}: {
  valores: { etiqueta: string; numerador: number; denominador: number }[];
}) {
  const ancho = 280;
  const alto = 110;
  const margen = 22;
  const hueco = 8;
  const barra =
    (ancho - margen * 2) / Math.max(valores.length, 1) - hueco;

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label="Cumplimiento por semana"
      className="grafica"
    >
      {valores.map((item, i) => {
        const x = margen + i * (barra + hueco);
        const ratio =
          item.denominador === 0 ? 0 : item.numerador / item.denominador;
        const h = Math.max(ratio * (alto - 36), item.denominador === 0 ? 0 : 2);
        const y = alto - 18 - h;
        return (
          <g key={item.etiqueta}>
            <rect
              x={x}
              y={y}
              width={barra}
              height={h}
              rx="4"
              fill="var(--naranja)"
              opacity={item.denominador === 0 ? 0.25 : 1}
            />
            <text
              x={x + barra / 2}
              y={alto - 4}
              textAnchor="middle"
              fontSize="9"
              fill="var(--tinta-suave)"
            >
              {item.etiqueta}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Linea({
  puntos,
  unidad,
}: {
  puntos: { fecha: IsoDate; valor: number }[];
  unidad: string;
}) {
  if (puntos.length === 0) return null;
  const ancho = 280;
  const alto = 118;
  const padX = 18;
  const padTop = 18;
  const padBottom = 26;
  const serie = [...puntos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const times = serie.map((p) => Date.parse(p.fecha));
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const tSpan = tMax - tMin || 1;
  const xs = times.map((t) =>
    serie.length === 1
      ? ancho / 2
      : padX + ((t - tMin) / tSpan) * (ancho - padX * 2),
  );
  const nums = serie.map((p) => p.valor);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const ys = nums.map(
    (n) => padTop + ((max - n) / span) * (alto - padTop - padBottom),
  );
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");

  function corta(fecha: IsoDate) {
    const [, mes, dia] = fecha.split("-");
    return `${Number(dia)}/${Number(mes)}`;
  }

  const indicesEtiqueta =
    serie.length <= 6 ? serie.map((_, i) => i) : [0, serie.length - 1];

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label={`Evolución en ${unidad}`}
      className="grafica"
    >
      <path
        d={d}
        fill="none"
        stroke="var(--naranja)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {xs.map((x, i) => (
        <circle
          key={serie[i].fecha}
          cx={x}
          cy={ys[i]}
          r="4"
          fill="var(--naranja)"
        />
      ))}
      <text
        x={ancho - padX}
        y={12}
        textAnchor="end"
        fontSize="10"
        fill="var(--tinta-suave)"
      >
        {max} {unidad}
      </text>
      <text
        x={ancho - padX}
        y={alto - padBottom - 2}
        textAnchor="end"
        fontSize="10"
        fill="var(--tinta-suave)"
      >
        {min} {unidad}
      </text>
      {indicesEtiqueta.map((i) => (
        <text
          key={serie[i].fecha}
          x={xs[i]}
          y={alto - 6}
          textAnchor="middle"
          fontSize="9"
          fill="var(--tinta-suave)"
        >
          {corta(serie[i].fecha)}
        </text>
      ))}
    </svg>
  );
}

export function BarrasActividades({
  valores,
}: {
  valores: {
    etiqueta: string;
    hechas: number;
    extras: number;
    pendientes: number;
    saltadas: number;
  }[];
}) {
  const filas = valores
    .map((item) => ({
      etiqueta: item.etiqueta,
      segmentos: [
        { clave: "hechas", valor: item.hechas, color: "var(--naranja)" },
        { clave: "extras", valor: item.extras, color: "var(--naranja-clara)" },
        { clave: "pendientes", valor: item.pendientes, color: "#d3c8b4" },
        { clave: "saltadas", valor: item.saltadas, color: "var(--terracota)" },
      ].filter((seg) => seg.valor > 0),
    }))
    .filter((fila) => fila.segmentos.length > 0);
  if (filas.length === 0) return null;

  const max = Math.max(
    ...filas.map((fila) =>
      fila.segmentos.reduce((suma, seg) => suma + seg.valor, 0),
    ),
  );
  const ancho = 280;
  const filaAlto = 38;
  const pad = 2;
  const altoBarra = 10;
  const alto = filas.length * filaAlto;
  const maxAncho = ancho - pad - 22;

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label="Actividades"
      className="grafica"
    >
      {filas.map((fila, i) => {
        const y = i * filaAlto;
        const total = fila.segmentos.reduce((suma, seg) => suma + seg.valor, 0);
        let x = pad;
        return (
          <g key={fila.etiqueta}>
            <text x={pad} y={y + 12} fontSize="11" fill="var(--tinta)">
              {fila.etiqueta}
            </text>
            <text
              x={ancho - pad}
              y={y + 12}
              textAnchor="end"
              fontSize="11"
              fill="var(--tinta-suave)"
            >
              {total}
            </text>
            {fila.segmentos.map((seg) => {
              const w = Math.max((seg.valor / max) * maxAncho, 4);
              const rect = (
                <rect
                  key={seg.clave}
                  x={x}
                  y={y + 18}
                  width={w}
                  height={altoBarra}
                  rx="3"
                  fill={seg.color}
                />
              );
              x += w + 1;
              return rect;
            })}
          </g>
        );
      })}
    </svg>
  );
}

type Porcion = { etiqueta: string; valor: number; color: string };

function puntoEnArco(
  cx: number,
  cy: number,
  r: number,
  grados: number,
): { x: number; y: number } {
  const rad = ((grados - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function Tarta({
  porciones,
  ariaLabel,
}: {
  porciones: Porcion[];
  ariaLabel: string;
}) {
  const visibles = porciones.filter((item) => item.valor > 0);
  const total = visibles.reduce((suma, item) => suma + item.valor, 0);
  if (total === 0) return null;

  const cx = 140;
  const cy = 72;
  const r = 58;
  let acumulado = 0;
  const trozos = visibles.map((item) => {
    const inicio = (acumulado / total) * 360;
    acumulado += item.valor;
    const fin = (acumulado / total) * 360;
    return { ...item, inicio, fin };
  });

  return (
    <svg
      viewBox="0 0 280 148"
      role="img"
      aria-label={ariaLabel}
      className="grafica"
    >
      {trozos.map((trozo) => {
        if (trozo.fin - trozo.inicio >= 359.9) {
          return (
            <circle
              key={trozo.etiqueta}
              cx={cx}
              cy={cy}
              r={r}
              fill={trozo.color}
            />
          );
        }
        const a = puntoEnArco(cx, cy, r, trozo.inicio);
        const b = puntoEnArco(cx, cy, r, trozo.fin);
        const grande = trozo.fin - trozo.inicio > 180 ? 1 : 0;
        return (
          <path
            key={trozo.etiqueta}
            d={`M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${grande} 1 ${b.x} ${b.y} Z`}
            fill={trozo.color}
          />
        );
      })}
    </svg>
  );
}

export function Leyenda({ items }: { items: Porcion[] }) {
  const visibles = items.filter((item) => item.valor > 0);
  if (visibles.length === 0) return null;
  return (
    <ul className="leyenda">
      {visibles.map((item) => (
        <li key={item.etiqueta}>
          <span className="leyenda-punto" style={{ background: item.color }} />
          {item.etiqueta} {item.valor}
        </li>
      ))}
    </ul>
  );
}
