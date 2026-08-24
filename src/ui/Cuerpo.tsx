import { useState } from "react";
import {
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
  hoy,
  dispatch,
}: {
  estado: Estado;
  hoy: IsoDate;
  dispatch: (accion: Accion) => void;
}) {
  const [peso, setPeso] = useState(
    estado.pesajes[hoy] !== undefined ? String(estado.pesajes[hoy]) : "",
  );
  const [nuevaMedida, setNuevaMedida] = useState("");
  const pesajes = seriePesajes(estado);
  const maxPeso = Math.max(...pesajes.map((p) => p.kg), 1);

  return (
    <main>
      <header className="marca">
        <div>
          <TituloPantalla ruta="cuerpo">Cuerpo</TituloPantalla>
          <p>Peso y medidas simples. Sin metas.</p>
        </div>
      </header>

      <section className="tarjeta">
        <h2>Pesaje de hoy</h2>
        <label className="campo">
          kg
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
            dispatch({ tipo: "registrarPesaje", fecha: hoy, kg });
          }}
        >
          Guardar peso
        </button>
      </section>

      <section className="tarjeta">
        <h2>Medidas</h2>
        {estado.medidas.length === 0 ? (
          <p className="vacio">Añade una medida, por ejemplo cintura.</p>
        ) : (
          estado.medidas.map((medida) => (
            <MedidaHoy
              key={medida.id}
              nombre={`${medida.nombre} (${medida.unidad})`}
              valor={estado.valoresMedida[hoy]?.[medida.id]}
              onGuardar={(valor) =>
                dispatch({
                  tipo: "registrarMedida",
                  fecha: hoy,
                  medidaId: medida.id,
                  valor,
                })
              }
              onEliminar={() =>
                dispatch({ tipo: "eliminarMedida", id: medida.id })
              }
            />
          ))
        )}
        <label className="campo">
          Nueva medida
          <input
            value={nuevaMedida}
            onChange={(e) => setNuevaMedida(e.target.value)}
            placeholder="Cadera"
          />
        </label>
        <button
          className="boton"
          onClick={() => {
            const nombre = nuevaMedida.trim();
            if (!nombre) return;
            dispatch({
              tipo: "anadirMedida",
              id: crypto.randomUUID(),
              nombre,
              unidad: "cm",
            });
            setNuevaMedida("");
          }}
        >
          Añadir medida
        </button>
      </section>

      <section className="tarjeta">
        <h2>Peso en el tiempo</h2>
        {pesajes.length === 0 ? (
          <p className="vacio">Aún no hay pesajes.</p>
        ) : (
          <ul className="lista">
            {pesajes.map((punto) => (
              <li key={punto.fecha}>
                <span>{punto.fecha}</span>
                <span>
                  {punto.kg} kg
                  <span
                    style={{
                      display: "inline-block",
                      width: `${(punto.kg / maxPeso) * 72}px`,
                      height: "8px",
                      marginLeft: "0.6rem",
                      background: "var(--naranja)",
                      borderRadius: "99px",
                      verticalAlign: "middle",
                    }}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="tarjeta">
        <h2>Medidas en el tiempo</h2>
        {estado.medidas.length === 0 ? (
          <p className="vacio">Añade una medida arriba para ver su evolución.</p>
        ) : (
          estado.medidas.map((medida) => {
            const serie = serieMedida(estado, medida.id);
            const tope = Math.max(...serie.map((p) => p.valor), 1);
            return (
              <div key={medida.id} style={{ marginBottom: "1.1rem" }}>
                <h3>
                  {medida.nombre} ({medida.unidad})
                </h3>
                {serie.length === 0 ? (
                  <p className="vacio">Aún no hay valores.</p>
                ) : (
                  <>
                    {serie.length >= 2 && (
                      <Linea puntos={serie} unidad={medida.unidad} />
                    )}
                    <ul className="lista">
                      {serie.map((punto) => (
                        <li key={punto.fecha}>
                          <span>{punto.fecha}</span>
                          <span>
                            {punto.valor} {medida.unidad}
                            <span
                              style={{
                                display: "inline-block",
                                width: `${(punto.valor / tope) * 72}px`,
                                height: "8px",
                                marginLeft: "0.6rem",
                                background: "var(--naranja)",
                                borderRadius: "99px",
                                verticalAlign: "middle",
                              }}
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}

function MedidaHoy({
  nombre,
  valor,
  onGuardar,
  onEliminar,
}: {
  nombre: string;
  valor: number | undefined;
  onGuardar: (valor: number) => void;
  onEliminar: () => void;
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
      <div className="fila">
        <button
          className="boton secundario"
          onClick={() => {
            const n = Number(texto.replace(",", "."));
            if (!Number.isFinite(n) || n <= 0) return;
            onGuardar(n);
          }}
        >
          Guardar
        </button>
        <button className="boton secundario" onClick={onEliminar}>
          Quitar
        </button>
      </div>
    </div>
  );
}
