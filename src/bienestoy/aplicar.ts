import { fechasDeSemana, lunesDe, sumarDias } from "./calendario";
import { diaDe, puedeReplanificar } from "./consultas";
import { lineaDesdeNombre } from "./lineas";
import type {
  Accion,
  Actividad,
  Contexto,
  Dia,
  Estado,
  Extra,
  IsoDate,
  Sesion,
} from "./types";

function clonarEstado(estado: Estado): Estado {
  return structuredClone(estado);
}

function escribirDia(estado: Estado, fecha: IsoDate, dia: Dia): void {
  const vacio =
    !dia.sesion &&
    dia.extras.length === 0 &&
    dia.deporteManual === undefined;
  if (vacio) {
    delete estado.dias[fecha];
    return;
  }
  estado.dias[fecha] = dia;
}

function actividadPorId(estado: Estado, id: string): Actividad | undefined {
  return estado.actividades.find((a) => a.id === id);
}

function sesionDesdeActividad(actividad: Actividad): Sesion {
  return {
    actividadId: actividad.id,
    actividadNombre: actividad.nombre,
    estado: "pendiente",
    guion: actividad.guionPorDefecto.map((linea) => ({
      nombre: linea.nombre,
      dibujo: linea.dibujo,
      tachado: false,
    })),
  };
}

function extraDesdeActividad(actividad: Actividad): Extra {
  return { actividadId: actividad.id, actividadNombre: actividad.nombre };
}

function colocarSesion(
  estado: Estado,
  fecha: IsoDate,
  actividadId: string,
  hoy: IsoDate,
): Estado {
  if (!puedeReplanificar(fecha, hoy)) return estado;
  const actividad = actividadPorId(estado, actividadId);
  if (!actividad) return estado;
  const dia = diaDe(estado, fecha);
  const siguiente: Dia = {
    ...dia,
    sesion: sesionDesdeActividad(actividad),
    deporteManual: undefined,
  };
  escribirDia(estado, fecha, siguiente);
  return estado;
}

function quitarSesion(estado: Estado, fecha: IsoDate, hoy: IsoDate): Estado {
  if (!puedeReplanificar(fecha, hoy)) return estado;
  const dia = diaDe(estado, fecha);
  const siguiente: Dia = { ...dia, sesion: undefined };
  escribirDia(estado, fecha, siguiente);
  return estado;
}

function marcarSesion(
  estado: Estado,
  fecha: IsoDate,
  siguienteEstado: Sesion["estado"],
): Estado {
  const dia = diaDe(estado, fecha);
  if (!dia.sesion) return estado;
  escribirDia(estado, fecha, {
    ...dia,
    sesion: { ...dia.sesion, estado: siguienteEstado },
  });
  return estado;
}

function tacharGuion(
  estado: Estado,
  fecha: IsoDate,
  indice: number,
  tachado: boolean,
): Estado {
  const dia = diaDe(estado, fecha);
  if (!dia.sesion) return estado;
  const linea = dia.sesion.guion[indice];
  if (!linea) return estado;
  const guion = dia.sesion.guion.map((item, i) =>
    i === indice ? { ...item, tachado } : item,
  );
  escribirDia(estado, fecha, {
    ...dia,
    sesion: { ...dia.sesion, guion },
  });
  return estado;
}

function reemplazarGuion(
  estado: Estado,
  fecha: IsoDate,
  lineas: { nombre: string; dibujo: import("./dibujos").DibujoId }[],
  hoy: IsoDate,
): Estado {
  if (!puedeReplanificar(fecha, hoy)) return estado;
  const dia = diaDe(estado, fecha);
  if (!dia.sesion) return estado;
  escribirDia(estado, fecha, {
    ...dia,
    sesion: {
      ...dia.sesion,
      guion: lineas
        .map((linea) => lineaDesdeNombre(linea.nombre, linea.dibujo))
        .filter((linea) => linea.nombre),
    },
  });
  return estado;
}

function anadirExtra(
  estado: Estado,
  fecha: IsoDate,
  actividadId: string,
): Estado {
  const actividad = actividadPorId(estado, actividadId);
  if (!actividad) return estado;
  const dia = diaDe(estado, fecha);
  escribirDia(estado, fecha, {
    ...dia,
    extras: [...dia.extras, extraDesdeActividad(actividad)],
  });
  return estado;
}

function quitarExtra(estado: Estado, fecha: IsoDate, indice: number): Estado {
  const dia = diaDe(estado, fecha);
  if (!dia.extras[indice]) return estado;
  escribirDia(estado, fecha, {
    ...dia,
    extras: dia.extras.filter((_, i) => i !== indice),
  });
  return estado;
}

function responderDeporte(
  estado: Estado,
  fecha: IsoDate,
  si: boolean,
): Estado {
  const dia = diaDe(estado, fecha);
  if (dia.sesion) return estado;
  if (dia.extras.length > 0) return estado;
  escribirDia(estado, fecha, { ...dia, deporteManual: si });
  return estado;
}

function copiarSemanaAnterior(
  estado: Estado,
  lunesDestino: IsoDate,
  hoy: IsoDate,
): Estado {
  const origenLunes = sumarDias(lunesDe(lunesDestino), -7);
  const origen = fechasDeSemana(origenLunes);
  const destino = fechasDeSemana(lunesDe(lunesDestino));
  destino.forEach((fechaDestino, i) => {
    if (!puedeReplanificar(fechaDestino, hoy)) return;
    const origenDia = diaDe(estado, origen[i]);
    const destDia = diaDe(estado, fechaDestino);
    const sesion = origenDia.sesion
      ? {
          ...origenDia.sesion,
          estado: "pendiente" as const,
          guion: origenDia.sesion.guion.map((linea) => ({
            nombre: linea.nombre,
            dibujo: linea.dibujo,
            tachado: false,
          })),
        }
      : undefined;
    escribirDia(estado, fechaDestino, {
      ...destDia,
      sesion,
      extras: destDia.extras,
    });
  });
  return estado;
}

export function aplicar(
  estado: Estado,
  accion: Accion,
  ctx: Contexto,
): Estado {
  const siguiente = clonarEstado(estado);
  switch (accion.tipo) {
    case "colocarSesion":
      return colocarSesion(
        siguiente,
        accion.fecha,
        accion.actividadId,
        ctx.hoy,
      );
    case "quitarSesion":
      return quitarSesion(siguiente, accion.fecha, ctx.hoy);
    case "marcarSesion":
      return marcarSesion(siguiente, accion.fecha, accion.estado);
    case "tacharGuion":
      return tacharGuion(
        siguiente,
        accion.fecha,
        accion.indice,
        accion.tachado,
      );
    case "reemplazarGuion":
      return reemplazarGuion(
        siguiente,
        accion.fecha,
        accion.lineas,
        ctx.hoy,
      );
    case "anadirExtra":
      return anadirExtra(siguiente, accion.fecha, accion.actividadId);
    case "quitarExtra":
      return quitarExtra(siguiente, accion.fecha, accion.indice);
    case "responderDeporte":
      return responderDeporte(siguiente, accion.fecha, accion.si);
    case "registrarPesaje":
      siguiente.pesajes[accion.fecha] = accion.kg;
      return siguiente;
    case "registrarMedida":
      if (!siguiente.medidas.some((m) => m.id === accion.medidaId)) {
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
      act.nombre = accion.nombre.trim();
      return siguiente;
    }
    case "definirGuionActividad": {
      const act = actividadPorId(siguiente, accion.id);
      if (!act) return estado;
      act.guionPorDefecto = accion.lineas
        .map((linea) => {
          const hecha = lineaDesdeNombre(linea.nombre, linea.dibujo);
          return { nombre: hecha.nombre, dibujo: hecha.dibujo };
        })
        .filter((linea) => linea.nombre);
      return siguiente;
    }
    case "eliminarActividad":
      siguiente.actividades = siguiente.actividades.filter(
        (a) => a.id !== accion.id,
      );
      return siguiente;
    case "anadirMedida":
      if (siguiente.medidas.some((m) => m.id === accion.id)) return estado;
      siguiente.medidas.push({
        id: accion.id,
        nombre: accion.nombre.trim(),
        unidad: accion.unidad.trim() || "cm",
      });
      return siguiente;
    case "renombrarMedida": {
      const med = siguiente.medidas.find((m) => m.id === accion.id);
      if (!med) return estado;
      med.nombre = accion.nombre.trim();
      return siguiente;
    }
    case "eliminarMedida":
      siguiente.medidas = siguiente.medidas.filter((m) => m.id !== accion.id);
      return siguiente;
    case "copiarSemanaAnterior":
      return copiarSemanaAnterior(siguiente, accion.lunesDestino, ctx.hoy);
  }
}
