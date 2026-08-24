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

  async function importar(fichero: File) {
    try {
      const texto = await fichero.text();
      onImportar(importarJSON(texto));
      setMensaje("Copia restaurada.");
    } catch {
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
        <input
          ref={archivo}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const fichero = e.target.files?.[0];
            if (fichero) void importar(fichero);
            e.target.value = "";
          }}
        />
        {mensaje && <p className="muted">{mensaje}</p>}
      </section>
    </main>
  );
}
