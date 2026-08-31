import { useEffect, useMemo, useState } from "react";
import {
  aplicar,
  esFechaIso,
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
  | { pantalla: "hoy" }
  | { pantalla: "dia"; fecha: IsoDate }
  | { pantalla: "semana"; lunes: IsoDate }
  | { pantalla: "resumen" }
  | { pantalla: "cuerpo" }
  | { pantalla: "catalogo" }
  | { pantalla: "ajustes" };

function vistaDesdeHash(hoy: IsoDate): Vista {
  const crudo = window.location.hash.replace(/^#\/?/, "");
  const partes = crudo.split("/").filter(Boolean);
  const cabeza = partes[0] ?? "hoy";
  const dato = partes[1];

  if (cabeza === "dia" && dato && esFechaIso(dato)) {
    return { pantalla: "dia", fecha: dato };
  }
  if (cabeza === "semana") {
    return {
      pantalla: "semana",
      lunes: dato && esFechaIso(dato) ? lunesDe(dato) : lunesDe(hoy),
    };
  }
  if (cabeza === "resumen") return { pantalla: "resumen" };
  if (cabeza === "cuerpo") return { pantalla: "cuerpo" };
  if (cabeza === "catalogo") return { pantalla: "catalogo" };
  if (cabeza === "ajustes") return { pantalla: "ajustes" };
  return { pantalla: "hoy" };
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
    vista.pantalla === "dia"
      ? vista.fecha
      : vista.pantalla === "hoy"
        ? hoy
        : null;

  return (
    <div className="app">
      {fechaDia && (
        <Hoy estado={estado} fecha={fechaDia} hoy={hoy} dispatch={dispatch} />
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
      {vista.pantalla === "resumen" && <Resumen estado={estado} hoy={hoy} />}
      {vista.pantalla === "cuerpo" && (
        <Cuerpo estado={estado} hoy={hoy} dispatch={dispatch} />
      )}
      {vista.pantalla === "catalogo" && (
        <Catalogo estado={estado} dispatch={dispatch} />
      )}
      {vista.pantalla === "ajustes" && (
        <Ajustes
          estado={estado}
          onImportar={(siguiente) => {
            setEstado(siguiente);
            void guardarEstado(siguiente);
          }}
        />
      )}
      <Nav ruta={rutaNav(vista, hoy)} ir={ir} />
    </div>
  );
}
