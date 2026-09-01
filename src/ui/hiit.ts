export const RONDAS_HIIT = 5;
export const SEGUNDOS_PREPARACION = 5;
export const SEGUNDOS_TRABAJO = 20;
export const SEGUNDOS_DESCANSO = 10;
export const SEGUNDOS_CICLO = SEGUNDOS_TRABAJO + SEGUNDOS_DESCANSO;
export const SEGUNDOS_HIIT =
  SEGUNDOS_PREPARACION +
  RONDAS_HIIT * SEGUNDOS_TRABAJO +
  (RONDAS_HIIT - 1) * SEGUNDOS_DESCANSO;

export type FaseHiit =
  | { tipo: "preparacion"; ronda: number; segundos: number }
  | { tipo: "trabajo"; ronda: number; segundos: number }
  | { tipo: "descanso"; ronda: number; segundos: number }
  | { tipo: "fin" };

export function faseHiitEn(segundo: number): FaseHiit {
  if (segundo < SEGUNDOS_PREPARACION) {
    return {
      tipo: "preparacion",
      ronda: 1,
      segundos: SEGUNDOS_PREPARACION - segundo,
    };
  }
  if (segundo >= SEGUNDOS_HIIT) return { tipo: "fin" };

  const transcurrido = segundo - SEGUNDOS_PREPARACION;
  const hastaUltima = (RONDAS_HIIT - 1) * SEGUNDOS_CICLO;
  if (transcurrido < hastaUltima) {
    const ronda = Math.floor(transcurrido / SEGUNDOS_CICLO) + 1;
    const enCiclo = transcurrido % SEGUNDOS_CICLO;
    if (enCiclo < SEGUNDOS_TRABAJO) {
      return {
        tipo: "trabajo",
        ronda,
        segundos: SEGUNDOS_TRABAJO - enCiclo,
      };
    }
    return {
      tipo: "descanso",
      ronda: ronda + 1,
      segundos: SEGUNDOS_DESCANSO - (enCiclo - SEGUNDOS_TRABAJO),
    };
  }

  return {
    tipo: "trabajo",
    ronda: RONDAS_HIIT,
    segundos: SEGUNDOS_TRABAJO - (transcurrido - hastaUltima),
  };
}
