export type IsoDate = string;

export type UnidadEjercicio = "repeticiones" | "segundos" | "minutos";

export type CuantoEjercicio = {
  valor: number;
  unidad: UnidadEjercicio;
};

export type LineaGuion = {
  nombre: string;
  tachado: boolean;
  cuanto?: CuantoEjercicio;
};

export type PlantillaEjercicio = {
  nombre: string;
  cuanto?: CuantoEjercicio;
};

export type EstadoSesion = "pendiente" | "hecha" | "saltada";

export type Sesion = {
  actividadId: string;
  actividadNombre: string;
  estado: EstadoSesion;
  programada: boolean;
  cuanto?: CuantoEjercicio;
  guion: LineaGuion[];
};

export type Dia = {
  sesiones: Sesion[];
  deporteManual?: boolean;
};

export type Actividad = {
  id: string;
  nombre: string;
  cuanto?: CuantoEjercicio;
  guionPorDefecto: PlantillaEjercicio[];
};

export type DefinicionMedida = {
  id: string;
  nombre: string;
  unidad: string;
};

export type Estado = {
  actividades: Actividad[];
  medidas: DefinicionMedida[];
  dias: Record<IsoDate, Dia>;
  pesajes: Record<IsoDate, number>;
  valoresMedida: Record<IsoDate, Record<string, number>>;
};

export type DeporteDelDia = "si" | "no" | "sin_marcar";

export type Accion =
  | { tipo: "colocarSesion"; fecha: IsoDate; actividadId: string; programada?: boolean }
  | { tipo: "cambiarSesion"; fecha: IsoDate; indice: number; actividadId: string }
  | { tipo: "quitarSesion"; fecha: IsoDate; indice: number }
  | { tipo: "marcarSesion"; fecha: IsoDate; estado: EstadoSesion; indice?: number }
  | { tipo: "tacharGuion"; fecha: IsoDate; indice: number; tachado: boolean; sesion?: number }
  | { tipo: "reemplazarGuion"; fecha: IsoDate; lineas: LineaGuion[]; sesion?: number }
  | { tipo: "definirCuantoSesion"; fecha: IsoDate; indice: number; cuanto?: CuantoEjercicio }
  | { tipo: "responderDeporte"; fecha: IsoDate; si: boolean }
  | { tipo: "registrarPesaje"; fecha: IsoDate; kg: number }
  | { tipo: "registrarMedida"; fecha: IsoDate; medidaId: string; valor: number }
  | { tipo: "anadirActividad"; id: string; nombre: string }
  | { tipo: "renombrarActividad"; id: string; nombre: string }
  | { tipo: "definirCuantoActividad"; id: string; cuanto?: CuantoEjercicio }
  | { tipo: "definirGuionActividad"; id: string; lineas: PlantillaEjercicio[] }
  | { tipo: "eliminarActividad"; id: string }
  | { tipo: "copiarSemanaAnterior"; lunesDestino: IsoDate };

export type Contexto = {
  hoy: IsoDate;
};
