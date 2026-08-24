import { useState } from "react";
import { DIBUJOS, etiquetaDibujo, type DibujoId } from "../bienestoy/dibujos";
import { Dibujo } from "./Dibujo";

export function SelectorDibujo({
  valor,
  onElegir,
}: {
  valor: DibujoId;
  onElegir: (id: DibujoId) => void;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="selector-dibujo">
      <button
        type="button"
        className="dibujo-boton"
        aria-label={`Dibujo: ${etiquetaDibujo(valor)}`}
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <Dibujo id={valor} />
      </button>
      {abierto && (
        <div className="dibujo-grid" role="listbox" aria-label="Elegir dibujo">
          {DIBUJOS.map((id) => (
            <button
              key={id}
              type="button"
              className={id === valor ? "elegida" : ""}
              aria-label={etiquetaDibujo(id)}
              onClick={() => {
                onElegir(id);
                setAbierto(false);
              }}
            >
              <Dibujo id={id} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
