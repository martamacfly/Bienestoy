import { fechasDeSemana, lunesDe, sumarDias } from "./calendario";
import { diaDe } from "./consultas";
import { cuantoValido, lineaDesdePlantilla, plantillaLimpia } from "./lineas";
import { medidasFijas } from "./seed";
import type {
  Accion,
  Actividad,
  Contexto,
  CuantoEjercicio,
  Dia,
  Estado,
  IsoDate,
  LineaGuion,
  PlantillaEjercicio,
  Sesion,
} from "./types";

function clonarEstado(estado: Estado): Estado {
  return structuredClone(estado);
}

function escribirDia(estado: Estado, fecha: IsoDate, dia: Dia): void {
  const vacio = dia.sesiones.length === 0 && dia.deporteManual === undefined;
  if (vacio) {
    delete estado.dias[fecha];
    return;
  }
  estado.dias[fecha] = dia;
}

function actividadPorId(estado: Estado, id: string): Actividad | undefined {
  return estado.actividades.find((a) => a.id === id);
}

function sesionDesdeActividad(actividad: Actividad, programada: boolean): Sesion {
  const cuanto = cuantoValido(actividad.cuanto);
  return {
    actividadId: actividad.id,
    actividadNombre: actividad.nombre,
    estado: "pendiente",
    programada,
    ...(cuanto ? { cuanto } : {}),
    guion: actividad.guionPorDefecto
      .map((linea) => lineaDesdePlantilla(linea))
      .filter((linea): linea is NonNullable<typeof linea> => linea !== null),
  };
}

function mismoCuanto(
  a: CuantoEjercicio | undefined,
  b: CuantoEjercicio | undefined,
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.valor === b.valor && a.unidad === b.unidad;
}

function guionSiguePlantilla(
  guion: LineaGuion[],
  plantilla: PlantillaEjercicio[],
): boolean {
  if (guion.length !== plantilla.length) return false;
  return guion.every(
    (linea, indice) =>
      linea.nombre === plantilla[indice].nombre &&
      mismoCuanto(linea.cuanto, plantilla[indice].cuanto),
  );
}

function escribirCuanto(
  destino: { cuanto?: CuantoEjercicio },
  cuanto: CuantoEjercicio | undefined,
): void {
  if (cuanto) destino.cuanto = { ...cuanto };
  else delete destino.cuanto;
}

function sincronizarUsos(estado: Estado, antes: Actividad): void {
  const act = actividadPorId(estado, antes.id);
  if (!act) return;
  for (const dia of Object.values(estado.dias)) {
    for (const sesion of dia.sesiones) {
      if (sesion.actividadId !== act.id) continue;
      sesion.actividadNombre = act.nombre;
      if (mismoCuanto(sesion.cuanto, antes.cuanto)) {
        escribirCuanto(sesion, act.cuanto);
      }
      if (guionSiguePlantilla(sesion.guion, antes.guionPorDefecto)) {
        const tachados = sesion.guion.map((linea) => linea.tachado);
        sesion.guion = act.guionPorDefecto
          .map((linea, indice) => {
            const creada = lineaDesdePlantilla(linea);
            if (!creada) return null;
            if (
              tachados[indice] &&
              creada.nombre === antes.guionPorDefecto[indice]?.nombre
            ) {
              creada.tachado = true;
            }
            return creada;
          })
          .filter((linea): linea is LineaGuion => linea !== null);
      }
    }
  }
}

function conSesion(
  dia: Dia,
  indice: number,
  sesion: Sesion,
): Dia {
  return {
    ...dia,
    sesiones: dia.sesiones.map((item, i) => (i === indice ? sesion : item)),
  };
}

function colocarSesion(
  estado: Estado,
  fecha: IsoDate,
  actividadId: string,
  programada: boolean,
): Estado {
  const actividad = actividadPorId(estado, actividadId);
  if (!actividad) return estado;
  const dia = diaDe(estado, fecha);
  escribirDia(estado, fecha, {
    ...dia,
    sesiones: [...dia.sesiones, sesionDesdeActividad(actividad, programada)],
    deporteManual: undefined,
  });
  return estado;
}

function cambiarSesion(
  estado: Estado,
  fecha: IsoDate,
  indice: number,
  actividadId: string,
): Estado {
  const actividad = actividadPorId(estado, actividadId);
  const dia = diaDe(estado, fecha);
  if (!actividad || !dia.sesiones[indice]) return estado;
  escribirDia(
    estado,
    fecha,
    conSesion(dia, indice, sesionDesdeActividad(actividad, true)),
  );
  return estado;
}

function quitarSesion(estado: Estado, fecha: IsoDate, indice: number): Estado {
  const dia = diaDe(estado, fecha);
  if (!dia.sesiones[indice]) return estado;
  escribirDia(estado, fecha, {
    ...dia,
    sesiones: dia.sesiones.filter((_, i) => i !== indice),
  });
  return estado;
}

function marcarSesion(
  estado: Estado,
  fecha: IsoDate,
  indice: number,
  siguienteEstado: Sesion["estado"],
): Estado {
  const dia = diaDe(estado, fecha);
  const sesion = dia.sesiones[indice];
  if (!sesion) return estado;
  escribirDia(
    estado,
    fecha,
    conSesion(dia, indice, { ...sesion, estado: siguienteEstado }),
  );
  return estado;
}

function tacharGuion(
  estado: Estado,
  fecha: IsoDate,
  sesionIndice: number,
  indice: number,
  tachado: boolean,
): Estado {
  const dia = diaDe(estado, fecha);
  const sesion = dia.sesiones[sesionIndice];
  const linea = sesion?.guion[indice];
  if (!sesion || !linea) return estado;
  const guion = sesion.guion.map((item, i) =>
    i === indice ? { ...item, tachado } : item,
  );
  escribirDia(estado, fecha, conSesion(dia, sesionIndice, { ...sesion, guion }));
  return estado;
}

function reemplazarGuion(
  estado: Estado,
  fecha: IsoDate,
  sesionIndice: number,
  lineas: LineaGuion[],
): Estado {
  const dia = diaDe(estado, fecha);
  const sesion = dia.sesiones[sesionIndice];
  if (!sesion) return estado;
  escribirDia(estado, fecha, conSesion(dia, sesionIndice, {
    ...sesion,
    guion: lineas
      .map((linea) => lineaDesdePlantilla(linea))
      .filter((linea): linea is NonNullable<typeof linea> => linea !== null),
  }));
  return estado;
}

function definirCuantoSesion(
  estado: Estado,
  fecha: IsoDate,
  indice: number,
  pedido?: Sesion["cuanto"],
): Estado {
  const dia = diaDe(estado, fecha);
  const sesion = dia.sesiones[indice];
  if (!sesion) return estado;
  const cuanto = cuantoValido(pedido);
  const siguiente = { ...sesion };
  if (cuanto) siguiente.cuanto = cuanto;
  else delete siguiente.cuanto;
  escribirDia(estado, fecha, conSesion(dia, indice, siguiente));
  return estado;
}

function responderDeporte(
  estado: Estado,
  fecha: IsoDate,
  si: boolean,
): Estado {
  const dia = diaDe(estado, fecha);
  if (dia.sesiones.length > 0) return estado;
  escribirDia(estado, fecha, { ...dia, deporteManual: si });
  return estado;
}

function copiarSemanaAnterior(
  estado: Estado,
  lunesDestino: IsoDate,
): Estado {
  const origenLunes = sumarDias(lunesDe(lunesDestino), -7);
  const origen = fechasDeSemana(origenLunes);
  const destino = fechasDeSemana(lunesDe(lunesDestino));
  destino.forEach((fechaDestino, i) => {
    const origenDia = diaDe(estado, origen[i]);
    const destDia = diaDe(estado, fechaDestino);
    const sesiones = origenDia.sesiones.map((sesion) => ({
      ...sesion,
      estado: "pendiente" as const,
      programada: true,
      guion: sesion.guion.map((linea) => ({ ...linea, tachado: false })),
    }));
    escribirDia(estado, fechaDestino, {
      ...destDia,
      sesiones,
      deporteManual: undefined,
    });
  });
  return estado;
}

export function aplicar(
  estado: Estado,
  accion: Accion,
  _ctx: Contexto,
): Estado {
  const siguiente = clonarEstado(estado);
  switch (accion.tipo) {
    case "colocarSesion":
      return colocarSesion(
        siguiente,
        accion.fecha,
        accion.actividadId,
        accion.programada !== false,
      );
    case "cambiarSesion":
      return cambiarSesion(
        siguiente,
        accion.fecha,
        accion.indice,
        accion.actividadId,
      );
    case "quitarSesion":
      return quitarSesion(siguiente, accion.fecha, accion.indice);
    case "marcarSesion":
      return marcarSesion(
        siguiente,
        accion.fecha,
        accion.indice ?? 0,
        accion.estado,
      );
    case "tacharGuion":
      return tacharGuion(
        siguiente,
        accion.fecha,
        accion.sesion ?? 0,
        accion.indice,
        accion.tachado,
      );
    case "reemplazarGuion":
      return reemplazarGuion(
        siguiente,
        accion.fecha,
        accion.sesion ?? 0,
        accion.lineas,
      );
    case "definirCuantoSesion":
      return definirCuantoSesion(
        siguiente,
        accion.fecha,
        accion.indice,
        accion.cuanto,
      );
    case "responderDeporte":
      return responderDeporte(siguiente, accion.fecha, accion.si);
    case "registrarPesaje":
      siguiente.pesajes[accion.fecha] = accion.kg;
      return siguiente;
    case "registrarMedida":
      if (!medidasFijas.some((m) => m.id === accion.medidaId)) {
        return estado;
      }
      siguiente.valoresMedida[accion.fecha] = {
        ...siguiente.valoresMedida[accion.fecha],
        [accion.medidaId]: accion.valor,
      };
      return siguiente;
    case "anadirActividad":
      if (siguiente.actividades.some((a) => a.id === accion.id)) return estado;
      siguiente.actividades.push({
        id: accion.id,
        nombre: accion.nombre.trim(),
        guionPorDefecto: [],
      });
      return siguiente;
    case "renombrarActividad": {
      const act = actividadPorId(siguiente, accion.id);
      if (!act) return estado;
      const antes = structuredClone(act);
      act.nombre = accion.nombre.trim();
      sincronizarUsos(siguiente, antes);
      return siguiente;
    }
    case "definirCuantoActividad": {
      const act = actividadPorId(siguiente, accion.id);
      if (!act) return estado;
      const antes = structuredClone(act);
      const cuanto = cuantoValido(accion.cuanto);
      if (cuanto) act.cuanto = cuanto;
      else delete act.cuanto;
      sincronizarUsos(siguiente, antes);
      return siguiente;
    }
    case "definirGuionActividad": {
      const act = actividadPorId(siguiente, accion.id);
      if (!act) return estado;
      const antes = structuredClone(act);
      act.guionPorDefecto = accion.lineas
        .map((linea) => plantillaLimpia(linea))
        .filter((linea): linea is NonNullable<typeof linea> => linea !== null);
      sincronizarUsos(siguiente, antes);
      return siguiente;
    }
    case "eliminarActividad":
      siguiente.actividades = siguiente.actividades.filter(
        (a) => a.id !== accion.id,
      );
      return siguiente;
    case "copiarSemanaAnterior":
      return copiarSemanaAnterior(siguiente, accion.lunesDestino);
  }
}
