import { useEffect, useMemo, useState } from "react";
import {
  aplicar,
  hoyLocal,
  type Accion,
  type Estado,
} from "./bienestoy";
import { cargarEstado, guardarEstado } from "./bienestoy/persistencia";
import { Ajustes } from "./ui/Ajustes";
import { Catalogo } from "./ui/Catalogo";
import { Cuerpo } from "./ui/Cuerpo";
import { Hoy } from "./ui/Hoy";
import { Nav, type Ruta } from "./ui/Nav";
import { Resumen } from "./ui/Resumen";
import { Semana } from "./ui/Semana";

function rutaDesdeHash(): Ruta {
  const valor = window.location.hash.replace("#/", "") as Ruta;
  if (["hoy", "semana", "resumen", "cuerpo", "catalogo", "ajustes"].includes(valor)) {
    return valor;
  }
  return "hoy";
}

export function App() {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [ruta, setRuta] = useState<Ruta>(rutaDesdeHash);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const hoy = useMemo(() => hoyLocal(), []);

  useEffect(() => {
    cargarEstado()
      .then(setEstado)
      .catch(() => setErrorCarga("No se pudieron leer los datos guardados."));
  }, []);

  useEffect(() => {
    setRuta(rutaDesdeHash());
    const onHash = () => setRuta(rutaDesdeHash());
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

  function ir(siguiente: Ruta) {
    setRuta(siguiente);
    const hash = `/${siguiente}`;
    if (window.location.hash !== `#${hash}`) {
      window.location.hash = hash;
    }
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

  return (
    <div className="app">
      {ruta === "hoy" && <Hoy estado={estado} hoy={hoy} dispatch={dispatch} />}
      {ruta === "semana" && (
        <Semana estado={estado} hoy={hoy} dispatch={dispatch} />
      )}
      {ruta === "resumen" && <Resumen estado={estado} hoy={hoy} />}
      {ruta === "cuerpo" && (
        <Cuerpo estado={estado} hoy={hoy} dispatch={dispatch} />
      )}
      {ruta === "catalogo" && (
        <Catalogo estado={estado} dispatch={dispatch} />
      )}
      {ruta === "ajustes" && (
        <Ajustes
          estado={estado}
          onImportar={(siguiente) => {
            setEstado(siguiente);
            void guardarEstado(siguiente);
          }}
        />
      )}
      <Nav ruta={ruta} ir={ir} />
    </div>
  );
}
