import { useRef, useState } from "react";
import { exportarJSON, importarJSON, type Estado } from "../bienestoy";
import { TituloPantalla } from "./IconoPantalla";

export function Ajustes({
  estado,
  onImportar,
}: {
  estado: Estado;
  onImportar: (estado: Estado) => void;
}) {
  const archivo = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<Estado | null>(null);

  function exportar() {
    const blob = new Blob([exportarJSON(estado)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "bienestoy.json";
    enlace.click();
    URL.revokeObjectURL(url);
    setMensaje("Copia descargada.");
  }

  async function elegirCopia(fichero: File) {
    try {
      const texto = await fichero.text();
      setPendiente(importarJSON(texto));
      setMensaje(null);
    } catch {
      setPendiente(null);
      setMensaje("Ese archivo no es una copia válida.");
    }
  }

  return (
    <main>
      <header className="marca">
        <div>
          <TituloPantalla ruta="ajustes">Ajustes</TituloPantalla>
          <p>Los datos viven en este dispositivo. Exporta de vez en cuando.</p>
        </div>
      </header>

      <section className="tarjeta">
        {pendiente ? (
          <>
            <p>Esto borra lo de este dispositivo. ¿Sigues?</p>
            <div className="fila">
              <button
                className="boton peligro"
                onClick={() => {
                  onImportar(pendiente);
                  setPendiente(null);
                  setMensaje("Copia restaurada.");
                }}
              >
                Seguir
              </button>
              <button
                className="boton secundario"
                onClick={() => setPendiente(null)}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="boton ancho" onClick={exportar}>
              Exportar JSON
            </button>
            <button
              className="boton secundario ancho"
              style={{ marginTop: "0.6rem" }}
              onClick={() => archivo.current?.click()}
            >
              Importar JSON
            </button>
          </>
        )}
        <input
          ref={archivo}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const fichero = e.target.files?.[0];
            if (fichero) void elegirCopia(fichero);
            e.target.value = "";
          }}
        />
        {mensaje && <p className="muted">{mensaje}</p>}
      </section>

      <p className="muted version">Bienestoy {__APP_VERSION__}</p>
    </main>
  );
}
