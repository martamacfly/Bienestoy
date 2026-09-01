import { useRef, useState } from "react";
import {
  esFechaIso,
  etiquetaFecha,
  exportarJSON,
  importarJSON,
  type Estado,
  type IsoDate,
} from "../bienestoy";
import { TituloPantalla } from "./IconoPantalla";

const CLAVE_ULTIMA_COPIA = "bienestoy.ultimaCopia";

function leerUltimaCopia(): IsoDate | null {
  const valor = localStorage.getItem(CLAVE_ULTIMA_COPIA);
  return valor && esFechaIso(valor) ? valor : null;
}

function AvisoBorrar({
  texto,
  onSeguir,
  onCancelar,
}: {
  texto: string;
  onSeguir: () => void;
  onCancelar: () => void;
}) {
  return (
    <>
      <p>{texto}</p>
      <div className="fila">
        <button className="boton peligro" onClick={onSeguir}>
          Seguir
        </button>
        <button className="boton secundario" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </>
  );
}

export function Ajustes({
  estado,
  hoy,
  onImportar,
  onEmpezarDeCero,
}: {
  estado: Estado;
  hoy: IsoDate;
  onImportar: (estado: Estado) => void;
  onEmpezarDeCero: () => void;
}) {
  const archivo = useRef<HTMLInputElement>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [pendiente, setPendiente] = useState<Estado | null>(null);
  const [vaciar, setVaciar] = useState(false);
  const [ultimaCopia, setUltimaCopia] = useState<IsoDate | null>(leerUltimaCopia);

  function exportar() {
    const blob = new Blob([exportarJSON(estado)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "bienestoy.json";
    enlace.click();
    URL.revokeObjectURL(url);
    localStorage.setItem(CLAVE_ULTIMA_COPIA, hoy);
    setUltimaCopia(hoy);
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
          <AvisoBorrar
            texto="Esto borra lo de este dispositivo. ¿Sigues?"
            onSeguir={() => {
              onImportar(pendiente);
              setPendiente(null);
              setMensaje("Copia restaurada.");
            }}
            onCancelar={() => setPendiente(null)}
          />
        ) : (
          <>
            <button className="boton ancho" onClick={exportar}>
              Exportar JSON
            </button>
            <button
              className="boton secundario ancho"
              onClick={() => archivo.current?.click()}
            >
              Importar JSON
            </button>
            <p className="muted aviso-copia">
              {ultimaCopia
                ? `Última copia: ${etiquetaFecha(ultimaCopia)}`
                : "Aún no has exportado en este dispositivo."}
            </p>
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

      <section className="tarjeta">
        <h2>En el teléfono</h2>
        <p className="muted">
          iPhone: en Safari, compartir → Añadir a pantalla de inicio.
        </p>
        <p className="muted">
          Android: en Chrome, menú → Instalar aplicación.
        </p>
      </section>

      <section className="tarjeta">
        {vaciar ? (
          <AvisoBorrar
            texto="Esto borra el plan, las marcas y el cuerpo. ¿Sigues?"
            onSeguir={() => {
              onEmpezarDeCero();
              setVaciar(false);
              setMensaje("Listo. Empiezas de cero.");
            }}
            onCancelar={() => setVaciar(false)}
          />
        ) : (
          <>
            <p className="muted">
              Si quieres partir de cero, primero exporta una copia.
            </p>
            <button className="boton peligro ancho" onClick={() => setVaciar(true)}>
              Empezar de cero
            </button>
          </>
        )}
      </section>

      <p className="muted version">Bienestoy {__APP_VERSION__}</p>
    </main>
  );
}
