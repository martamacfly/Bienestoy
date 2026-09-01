import { useEffect, useRef, useState } from "react";
import { faseHiitEn, RONDAS_HIIT } from "./hiit";

export function ContadorHiit({ onCerrar }: { onCerrar: () => void }) {
  const inicio = useRef(Date.now());
  const [segundo, setSegundo] = useState(0);
  const fase = faseHiitEn(segundo);

  useEffect(() => {
    const id = window.setInterval(() => {
      const transcurrido = Math.floor((Date.now() - inicio.current) / 1000);
      setSegundo(transcurrido);
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  const clase =
    fase.tipo === "trabajo"
      ? "trabajo"
      : fase.tipo === "fin"
        ? "fin"
        : "descanso";

  return (
    <div
      className={`contador-hiit ${clase}`}
      role="region"
      aria-label="Contador HIIT"
    >
      {fase.tipo === "fin" ? (
        <>
          <p className="contador-hiit-fase">Listo</p>
          <p className="contador-hiit-numero">
            {RONDAS_HIIT}/{RONDAS_HIIT}
          </p>
        </>
      ) : (
        <>
          <div>
            <p className="contador-hiit-fase">
              {fase.tipo === "trabajo" ? "Trabajo" : "Cuenta atrás"}
            </p>
            <p className="contador-hiit-ronda">
              Ronda {fase.ronda} de {RONDAS_HIIT}
            </p>
          </div>
          <p className="contador-hiit-numero" aria-live="assertive">
            {fase.segundos}
          </p>
        </>
      )}
      <button className="boton" onClick={onCerrar}>
        Cerrar
      </button>
    </div>
  );
}
