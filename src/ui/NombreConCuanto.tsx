import type { CuantoEjercicio } from "../bienestoy";
import { etiquetaCuanto } from "../bienestoy";

export function NombreConCuanto({
  nombre,
  cuanto,
}: {
  nombre: string;
  cuanto?: CuantoEjercicio;
}) {
  const etiqueta = etiquetaCuanto(cuanto);
  if (!etiqueta) return nombre;
  return (
    <span className="nombre-con-cuanto">
      <span className="nombre-con-cuanto-nombre">{nombre}</span>
      <span className="cuanto"> · {etiqueta}</span>
    </span>
  );
}
