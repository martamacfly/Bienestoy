import { useState } from "react";
import {
  etiquetaFecha,
  serieMedida,
  seriePesajes,
  type Accion,
  type Estado,
  type IsoDate,
} from "../bienestoy";
import { Linea } from "./graficas";
import { TituloPantalla } from "./IconoPantalla";

export function Cuerpo({
  estado,
  fecha,
  hoy,
  dispatch,
}: {
  estado: Estado;
  fecha: IsoDate;
  hoy: IsoDate;
  dispatch: (accion: Accion) => void;
}) {
  const [peso, setPeso] = useState(
    estado.pesajes[fecha] !== undefined ? String(estado.pesajes[fecha]) : "",
  );
  const pesajes = seriePesajes(estado);
  const esHoy = fecha === hoy;

  return (
    <main>
      <header className="marca">
        <div>
          <TituloPantalla ruta="cuerpo">Cuerpo</TituloPantalla>
          <p>{etiquetaFecha(fecha)}</p>
        </div>
      </header>

      <section className="tarjeta">
        <h2>{esHoy ? "Pesaje de hoy" : "Pesaje"}</h2>
        <label className="campo">
          Peso (kg)
          <input
            inputMode="decimal"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
          />
        </label>
        <button
          className="boton"
          onClick={() => {
            const kg = Number(peso.replace(",", "."));
            if (!Number.isFinite(kg) || kg <= 0) return;
            dispatch({ tipo: "registrarPesaje", fecha, kg });
          }}
        >
          Guardar peso
        </button>
      </section>

      <section className="tarjeta">
        <h2>Medidas</h2>
        {estado.medidas.map((medida) => (
          <MedidaDelDia
            key={`${medida.id}-${fecha}`}
            nombre={`${medida.nombre} (${medida.unidad})`}
            valor={estado.valoresMedida[fecha]?.[medida.id]}
            onGuardar={(valor) =>
              dispatch({
                tipo: "registrarMedida",
                fecha,
                medidaId: medida.id,
                valor,
              })
            }
          />
        ))}
      </section>

      <section className="tarjeta">
        <h2>Peso en el tiempo</h2>
        {pesajes.length === 0 ? (
          <p className="vacio">Aún no hay pesajes.</p>
        ) : (
          <Linea
            puntos={pesajes.map((p) => ({ fecha: p.fecha, valor: p.kg }))}
            unidad="kg"
          />
        )}
      </section>

      <section className="tarjeta">
        <h2>Medidas en el tiempo</h2>
        {estado.medidas.map((medida) => {
          const serie = serieMedida(estado, medida.id);
          return (
            <div key={medida.id} className="bloque-grafica">
              <h3>
                {medida.nombre} ({medida.unidad})
              </h3>
              {serie.length === 0 ? (
                <p className="vacio">Aún no hay valores.</p>
              ) : (
                <Linea puntos={serie} unidad={medida.unidad} />
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}

function MedidaDelDia({
  nombre,
  valor,
  onGuardar,
}: {
  nombre: string;
  valor: number | undefined;
  onGuardar: (valor: number) => void;
}) {
  const [texto, setTexto] = useState(valor !== undefined ? String(valor) : "");
  return (
    <div className="campo">
      <span>{nombre}</span>
      <input
        inputMode="decimal"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <button
        className="boton"
        onClick={() => {
          const n = Number(texto.replace(",", "."));
          if (!Number.isFinite(n) || n <= 0) return;
          onGuardar(n);
        }}
      >
        Guardar
      </button>
    </div>
  );
}
