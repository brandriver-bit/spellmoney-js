import { describe, expect, it } from "vitest";
import {
  aLetras,
  IDIOMAS,
  MONEDAS,
  numeroALetras,
  numeroALetrasEn,
  numeroALetrasFr,
  numeroALetrasPt,
  SpellMoneyError,
} from "../src/index.js";

describe("numeroALetras (español)", () => {
  const casos: [number, string][] = [
    [0, "cero"], [1, "uno"], [5, "cinco"], [10, "diez"], [11, "once"],
    [15, "quince"], [16, "dieciséis"], [19, "diecinueve"], [20, "veinte"],
    [21, "veintiuno"], [22, "veintidós"], [29, "veintinueve"], [30, "treinta"],
    [31, "treinta y uno"], [45, "cuarenta y cinco"], [99, "noventa y nueve"],
    [100, "cien"], [101, "ciento uno"], [115, "ciento quince"],
    [199, "ciento noventa y nueve"], [200, "doscientos"],
    [221, "doscientos veintiuno"], [500, "quinientos"],
    [999, "novecientos noventa y nueve"], [1000, "mil"], [1001, "mil uno"],
    [1100, "mil cien"], [2000, "dos mil"], [21000, "veintiún mil"],
    [100000, "cien mil"], [101000, "ciento un mil"],
    [999999, "novecientos noventa y nueve mil novecientos noventa y nueve"],
    [1000000, "un millón"], [2000000, "dos millones"],
    [1000001, "un millón uno"], [21000000, "veintiún millones"],
    [1000000000, "mil millones"], [2000000000, "dos mil millones"],
    [1000000000000, "un billón"], [2000000000000, "dos billones"],
  ];

  it.each(casos)("numeroALetras(%i) === %s", (n, esperado) => {
    expect(numeroALetras(n)).toBe(esperado);
  });

  it("rechaza negativos", () => {
    expect(() => numeroALetras(-5)).toThrow(SpellMoneyError);
  });

  it("rechaza no enteros", () => {
    expect(() => numeroALetras(5.5)).toThrow(SpellMoneyError);
  });

  it("rechaza fuera de rango", () => {
    expect(() => numeroALetras(10 ** 15)).toThrow(SpellMoneyError);
  });
});

describe("numeroALetrasEn (inglés)", () => {
  const casos: [number, string][] = [
    [0, "zero"], [1, "one"], [15, "fifteen"], [21, "twenty-one"],
    [100, "one hundred"], [101, "one hundred one"],
    [999, "nine hundred ninety-nine"], [1000, "one thousand"],
    [1_000_000, "one million"], [1_000_000_000, "one billion"],
    [1_000_000_000_000, "one trillion"], [2_000_000_000, "two billion"],
  ];

  it.each(casos)("numeroALetrasEn(%i) === %s", (n, esperado) => {
    expect(numeroALetrasEn(n)).toBe(esperado);
  });
});

describe("numeroALetrasPt (portugués)", () => {
  const casos: [number, "m" | "f", string][] = [
    [0, "m", "zero"], [1, "m", "um"], [1, "f", "uma"], [2, "m", "dois"],
    [2, "f", "duas"], [15, "m", "quinze"], [21, "m", "vinte e um"],
    [21, "f", "vinte e uma"], [100, "m", "cem"], [101, "m", "cento e um"],
    [200, "m", "duzentos"], [200, "f", "duzentas"], [1000, "m", "mil"],
    [1_000_000, "m", "um milhão"], [1_000_000_000, "m", "um bilhão"],
    [2_000_000_000, "m", "dois bilhões"],
  ];

  it.each(casos)("numeroALetrasPt(%i, %s) === %s", (n, genero, esperado) => {
    expect(numeroALetrasPt(n, genero)).toBe(esperado);
  });
});

describe("numeroALetrasFr (francés)", () => {
  const casos: [number, string][] = [
    [0, "zéro"], [1, "un"], [21, "vingt et un"], [71, "soixante et onze"],
    [80, "quatre-vingts"], [81, "quatre-vingt-un"], [90, "quatre-vingt-dix"],
    [99, "quatre-vingt-dix-neuf"], [100, "cent"], [125, "cent vingt-cinq"],
    [200, "deux cents"], [201, "deux cent un"], [1000, "mille"],
    [1_000_000, "un million"], [1_000_000_000, "un milliard"],
    [1_000_000_000_000, "un billion"],
  ];

  it.each(casos)("numeroALetrasFr(%i) === %s", (n, esperado) => {
    expect(numeroALetrasFr(n)).toBe(esperado);
  });
});

describe("aLetras", () => {
  it("monto básico en USD", () => {
    expect(aLetras(125.5)).toBe("CIENTO VEINTICINCO DÓLARES CON 50/100");
  });

  it("singular de moneda", () => {
    expect(aLetras(1, { moneda: "GTQ" })).toBe("UN QUETZAL CON 00/100");
  });

  it("apócope antes de moneda masculina", () => {
    expect(aLetras(21, { moneda: "USD" })).toBe("VEINTIÚN DÓLARES CON 00/100");
  });

  it("género femenino", () => {
    expect(aLetras(1, { moneda: "GBP" })).toBe("UNA LIBRA ESTERLINA CON 00/100");
    expect(aLetras(21, { moneda: "GBP" })).toBe("VEINTIUNA LIBRAS ESTERLINAS CON 00/100");
  });

  it("cero", () => {
    expect(aLetras(0)).toBe("CERO DÓLARES CON 00/100");
  });

  it('"de" antes de millón', () => {
    expect(aLetras(1000000, { moneda: "EUR" })).toBe("UN MILLÓN DE EUROS CON 00/100");
    expect(aLetras(21000000, { moneda: "EUR" })).toBe("VEINTIÚN MILLONES DE EUROS CON 00/100");
  });

  it('sin "de" cuando hay unidades menores', () => {
    expect(aLetras(1000100, { moneda: "USD" })).toBe("UN MILLÓN CIEN DÓLARES CON 00/100");
  });

  it('sin "de" con mil', () => {
    expect(aLetras(1000, { moneda: "USD" })).toBe("MIL DÓLARES CON 00/100");
  });

  it("centavos en palabras", () => {
    expect(aLetras(10.5, { centavos: "palabras" })).toBe("DIEZ DÓLARES CON CINCUENTA CENTAVOS");
    expect(aLetras(10.01, { centavos: "palabras" })).toBe("DIEZ DÓLARES CON UN CENTAVO");
    expect(aLetras(10.0, { centavos: "palabras" })).toBe("DIEZ DÓLARES CON CERO CENTAVOS");
  });

  it("minúsculas", () => {
    expect(aLetras(2, { moneda: "GBP", mayusculas: false })).toBe("dos libras esterlinas con 00/100");
  });

  it("redondeo flotante", () => {
    expect(aLetras(19.999999)).toBe("VEINTE DÓLARES CON 00/100");
  });

  it("moneda inválida", () => {
    expect(() => aLetras(10, { moneda: "XXX" })).toThrow(SpellMoneyError);
  });

  it("monto negativo", () => {
    expect(() => aLetras(-10)).toThrow(SpellMoneyError);
  });

  it("idioma inválido", () => {
    // @ts-expect-error idioma inválido a propósito
    expect(() => aLetras(10, { idioma: "de" })).toThrow(SpellMoneyError);
  });

  it("las 154 monedas ISO 4217 funcionan en español", () => {
    for (const codigo of Object.keys(MONEDAS)) {
      for (const monto of [0, 1, 21, 1000, 1000000, 1234.56]) {
        const resultado = aLetras(monto, { moneda: codigo });
        expect(resultado.includes("CON")).toBe(true);
        expect(resultado.endsWith("/100")).toBe(true);
        expect(` ${resultado} `.includes(" UNO ")).toBe(false);
      }
    }
  });

  it("las 154 monedas ISO 4217 funcionan en inglés", () => {
    for (const codigo of Object.keys(MONEDAS)) {
      for (const monto of [0, 1, 21, 1000, 1000000, 1234.56]) {
        const resultado = aLetras(monto, { moneda: codigo, idioma: "en" });
        expect(resultado.includes("AND")).toBe(true);
        expect(resultado.endsWith("/100")).toBe(true);
      }
    }
  });

  it("ejemplos del docstring", () => {
    expect(aLetras(125.5)).toBe("CIENTO VEINTICINCO DÓLARES CON 50/100");
    expect(aLetras(125.5, { idioma: "en" })).toBe("ONE HUNDRED TWENTY-FIVE DOLLARS AND 50/100");
    expect(aLetras(125.5, { idioma: "pt", moneda: "BRL" })).toBe("CENTO E VINTE E CINCO REAIS E 50/100");
    expect(aLetras(125.5, { idioma: "fr", moneda: "EUR" })).toBe("CENT VINGT-CINQ EUROS ET 50/100");
  });

  it("idioma en", () => {
    expect(aLetras(1, { moneda: "USD", idioma: "en" })).toBe("ONE DOLLAR AND 00/100");
    expect(aLetras(2, { moneda: "USD", idioma: "en" })).toBe("TWO DOLLARS AND 00/100");
    expect(aLetras(1_000_000, { moneda: "EUR", idioma: "en" })).toBe("ONE MILLION EUROS AND 00/100");
  });

  it("idioma pt y género", () => {
    expect(aLetras(1, { moneda: "BRL", idioma: "pt" })).toBe("UM REAL E 00/100");
    expect(aLetras(1, { moneda: "GBP", idioma: "pt" })).toBe("UMA LIBRA ESTERLINA E 00/100");
    expect(aLetras(2, { moneda: "GBP", idioma: "pt" })).toBe("DUAS LIBRAS ESTERLINAS E 00/100");
    expect(aLetras(1_000_000, { moneda: "BRL", idioma: "pt" })).toBe("UM MILHÃO DE REAIS E 00/100");
  });

  it('idioma fr, "de" y elisión', () => {
    expect(aLetras(1_000_000, { moneda: "USD", idioma: "fr" })).toBe("UN MILLION DE DOLLARS AMÉRICAINS ET 00/100");
    expect(aLetras(1_000_000, { moneda: "EUR", idioma: "fr" })).toBe("UN MILLION D'EUROS ET 00/100");
    expect(aLetras(1, { moneda: "EUR", idioma: "fr" })).toBe("UN EURO ET 00/100");
  });

  it("ayuda buscada: moneda sin traducción a un idioma", () => {
    expect(() => aLetras(10, { moneda: "AFN", idioma: "pt" })).toThrow(SpellMoneyError);
    expect(() => aLetras(10, { moneda: "AFN", idioma: "fr" })).toThrow(SpellMoneyError);
  });

  it("idiomas declarados", () => {
    expect(IDIOMAS).toEqual(["es", "en", "pt", "fr"]);
  });
});
