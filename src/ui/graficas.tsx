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
  const alto = 100;
  const pad = 16;
  const xs = puntos.map((_, i) =>
    puntos.length === 1
      ? ancho / 2
      : pad + (i / (puntos.length - 1)) * (ancho - pad * 2),
  );
  const nums = puntos.map((p) => p.valor);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const ys = nums.map(
    (n) => alto - pad - ((n - min) / span) * (alto - pad * 2),
  );
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label={`Evolución en ${unidad}`}
      className="grafica"
    >
      <path d={d} fill="none" stroke="var(--naranja)" strokeWidth="2.5" />
      {xs.map((x, i) => (
        <circle key={puntos[i].fecha} cx={x} cy={ys[i]} r="3.5" fill="var(--naranja)" />
      ))}
      <text x={pad} y={12} fontSize="10" fill="var(--tinta-suave)">
        {max} {unidad}
      </text>
      <text x={pad} y={alto - 4} fontSize="10" fill="var(--tinta-suave)">
        {min} {unidad}
      </text>
    </svg>
  );
}
