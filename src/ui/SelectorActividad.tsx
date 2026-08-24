import type { Actividad } from "../bienestoy";

export function SelectorActividad({
  actividades,
  etiqueta,
  onElegir,
}: {
  actividades: Actividad[];
  etiqueta: string;
  onElegir: (actividadId: string) => void;
}) {
  return (
    <label className="campo">
      {etiqueta}
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            onElegir(e.target.value);
            e.target.value = "";
          }
        }}
      >
        <option value="">{etiqueta}…</option>
        {actividades.map((actividad) => (
          <option key={actividad.id} value={actividad.id}>
            {actividad.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
