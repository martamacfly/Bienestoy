import { useEffect, useMemo, useState } from "react";
import {
  aplicar,
  esFechaIso,
  estadoSemilla,
  hoyLocal,
  lunesDe,
  type Accion,
  type Estado,
  type IsoDate,
} from "./bienestoy";
import { cargarEstado, guardarEstado } from "./bienestoy/persistencia";
import { Ajustes } from "./ui/Ajustes";
import { Catalogo } from "./ui/Catalogo";
import { Cuerpo } from "./ui/Cuerpo";
import { Hoy } from "./ui/Hoy";
import { Nav, type Ruta } from "./ui/Nav";
import { Resumen } from "./ui/Resumen";
import { Semana } from "./ui/Semana";

type Vista =
  | { pantalla: "hoy"; fecha: IsoDate }
  | { pantalla: "dia"; fecha: IsoDate }
  | { pantalla: "semana"; lunes: IsoDate }
  | { pantalla: "resumen"; lunes: IsoDate }
  | { pantalla: "cuerpo"; fecha: IsoDate }
  | { pantalla: "catalogo" }
  | { pantalla: "ajustes" };

function vistaDesdeHash(hoy: IsoDate): Vista {
  const crudo = window.location.hash.replace(/^#\/?/, "");
  const partes = crudo.split("/").filter(Boolean);
  const cabeza = partes[0] ?? "hoy";
  const dato = partes[1];

  if (cabeza === "hoy") {
    return {
      pantalla: "hoy",
      fecha: dato && esFechaIso(dato) ? dato : hoy,
    };
  }
  if (cabeza === "dia" && dato && esFechaIso(dato)) {
    return { pantalla: "dia", fecha: dato };
  }
  if (cabeza === "semana") {
    return {
      pantalla: "semana",
      lunes: dato && esFechaIso(dato) ? lunesDe(dato) : lunesDe(hoy),
    };
  }
  if (cabeza === "resumen") {
    const tope = lunesDe(hoy);
    const pedido = dato && esFechaIso(dato) ? lunesDe(dato) : tope;
    return { pantalla: "resumen", lunes: pedido > tope ? tope : pedido };
  }
  if (cabeza === "cuerpo") {
    return {
      pantalla: "cuerpo",
      fecha: dato && esFechaIso(dato) ? dato : hoy,
    };
  }
  if (cabeza === "catalogo") return { pantalla: "catalogo" };
  if (cabeza === "ajustes") return { pantalla: "ajustes" };
  return { pantalla: "hoy", fecha: hoy };
}

function rutaNav(vista: Vista, hoy: IsoDate): Ruta {
  if (vista.pantalla === "dia") {
    return vista.fecha === hoy ? "hoy" : "semana";
  }
  if (vista.pantalla === "semana") return "semana";
  return vista.pantalla;
}

export function App() {
  const [estado, setEstado] = useState<Estado | null>(null);
  const hoy = useMemo(() => hoyLocal(), []);
  const [vista, setVista] = useState<Vista>(() => vistaDesdeHash(hoy));
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    cargarEstado()
      .then(setEstado)
      .catch(() => setErrorCarga("No se pudieron leer los datos guardados."));
  }, []);

  useEffect(() => {
    const onHash = () => setVista(vistaDesdeHash(hoyLocal()));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function dispatch(accion: Accion) {
    setEstado((prev) => {
      if (!prev) return prev;
      const siguiente = aplicar(prev, accion, { hoy: hoyLocal() });
      void guardarEstado(siguiente);
      return siguiente;
    });
  }

  function irA(hash: string) {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    setVista(vistaDesdeHash(hoyLocal()));
  }

  function ir(siguiente: Ruta) {
    if (
      siguiente === "cuerpo" &&
      (vista.pantalla === "hoy" || vista.pantalla === "dia")
    ) {
      irA(
        vista.fecha === hoy ? "#/cuerpo" : `#/cuerpo/${vista.fecha}`,
      );
      return;
    }
    irA(`#/${siguiente}`);
  }

  if (errorCarga) {
    return (
      <main className="app">
        <p>{errorCarga}</p>
      </main>
    );
  }

  if (!estado) {
    return (
      <main className="app">
        <p className="muted">Cargando…</p>
      </main>
    );
  }

  const fechaDia =
    vista.pantalla === "dia" || vista.pantalla === "hoy"
      ? vista.fecha
      : null;

  return (
    <div className="app">
      {fechaDia && (
        <Hoy
          estado={estado}
          fecha={fechaDia}
          hoy={hoy}
          dispatch={dispatch}
          onVerDia={(fecha) => {
            if (vista.pantalla === "dia") {
              irA(`#/dia/${fecha}`);
              return;
            }
            irA(fecha === hoy ? "#/hoy" : `#/hoy/${fecha}`);
          }}
        />
      )}
      {vista.pantalla === "semana" && (
        <Semana
          estado={estado}
          hoy={hoy}
          lunes={vista.lunes}
          dispatch={dispatch}
          onVerDia={(fecha) => irA(`#/dia/${fecha}`)}
          onVerSemana={(lunes) => irA(`#/semana/${lunes}`)}
        />
      )}
      {vista.pantalla === "resumen" && (
        <Resumen
          estado={estado}
          hoy={hoy}
          lunes={vista.lunes}
          onVerSemana={(lunes) =>
            irA(lunes === lunesDe(hoy) ? "#/resumen" : `#/resumen/${lunes}`)
          }
        />
      )}
      {vista.pantalla === "cuerpo" && (
        <Cuerpo
          key={vista.fecha}
          estado={estado}
          fecha={vista.fecha}
          hoy={hoy}
          dispatch={dispatch}
        />
      )}
      {vista.pantalla === "catalogo" && (
        <Catalogo estado={estado} dispatch={dispatch} />
      )}
      {vista.pantalla === "ajustes" && (
        <Ajustes
          estado={estado}
          hoy={hoy}
          onImportar={(siguiente) => {
            setEstado(siguiente);
            void guardarEstado(siguiente);
          }}
          onEmpezarDeCero={() => {
            const limpio = estadoSemilla();
            setEstado(limpio);
            void guardarEstado(limpio);
          }}
        />
      )}
      <Nav ruta={rutaNav(vista, hoy)} ir={ir} />
    </div>
  );
}
