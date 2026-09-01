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
    <>
      {nombre}
      <span className="cuanto"> · {etiqueta}</span>
    </>
  );
}
