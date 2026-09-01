import { describe, expect, it } from "vitest";
import { faseHiitEn } from "./hiit";

describe("contador HIIT", () => {
  it("empieza con 5 s de cuenta atrás", () => {
    expect(faseHiitEn(0)).toEqual({
      tipo: "preparacion",
      ronda: 1,
      segundos: 5,
    });
    expect(faseHiitEn(4)).toEqual({
      tipo: "preparacion",
      ronda: 1,
      segundos: 1,
    });
  });

  it("después de la cuenta atrás empieza el trabajo de 20 s", () => {
    expect(faseHiitEn(5)).toEqual({
      tipo: "trabajo",
      ronda: 1,
      segundos: 20,
    });
    expect(faseHiitEn(24)).toEqual({
      tipo: "trabajo",
      ronda: 1,
      segundos: 1,
    });
  });

  it("entre tandas cuenta atrás 10 s hacia la siguiente", () => {
    expect(faseHiitEn(25)).toEqual({
      tipo: "descanso",
      ronda: 2,
      segundos: 10,
    });
    expect(faseHiitEn(34)).toEqual({
      tipo: "descanso",
      ronda: 2,
      segundos: 1,
    });
    expect(faseHiitEn(35)).toEqual({
      tipo: "trabajo",
      ronda: 2,
      segundos: 20,
    });
  });

  it("repite trabajo y cuenta atrás cinco tandas", () => {
    expect(faseHiitEn(125)).toEqual({
      tipo: "trabajo",
      ronda: 5,
      segundos: 20,
    });
    expect(faseHiitEn(144)).toEqual({
      tipo: "trabajo",
      ronda: 5,
      segundos: 1,
    });
    expect(faseHiitEn(145)).toEqual({ tipo: "fin" });
  });
});
