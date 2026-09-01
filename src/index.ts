/**
 * spellmoney
 * ==========
 *
 * Convierte cantidades numéricas a su representación en letras, para
 * documentos legales y financieros: cheques, facturas, recibos y contratos
 * (por ejemplo: "CIENTO VEINTICINCO DÓLARES CON 50/100").
 *
 * Soporta cuatro idiomas — español, inglés, portugués (variante de Brasil) y
 * francés — y las 154 divisas activas del estándar ISO 4217. La cobertura de
 * nombres de moneda es completa en español e inglés; en portugués y francés
 * cubre los países que hablan esos idiomas más las monedas más usadas del
 * mundo — el resto está marcado como "ayuda buscada": se aceptan pull
 * requests de quien domine ese idioma y esa moneda.
 *
 * Uso básico:
 *
 *   import { aLetras } from "spellmoney";
 *   aLetras(125.50);                       // "CIENTO VEINTICINCO DÓLARES CON 50/100"
 *   aLetras(125.50, { idioma: "en" });      // "ONE HUNDRED TWENTY-FIVE DOLLARS AND 50/100"
 *   aLetras(125.50, { idioma: "pt", moneda: "BRL" }); // "CENTO E VINTE E CINCO REAIS E 50/100"
 *   aLetras(125.50, { idioma: "fr", moneda: "EUR" }); // "CENT VINGT-CINQ EUROS ET 50/100"
 */

import { MONEDAS, type CurrencyEntry } from "./currencies.js";

export { MONEDAS };
export type { CurrencyForm, CurrencyEntry } from "./currencies.js";

export const IDIOMAS = ["es", "en", "pt", "fr"] as const;
export type Idioma = (typeof IDIOMAS)[number];
export type Genero = "m" | "f";

export class SpellMoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpellMoneyError";
  }
}

// =============================================================================
// ESPAÑOL
// =============================================================================

const _UNIDADES_ES = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];

const _ESPECIALES_ES: Record<number, string> = {
  10: "diez", 11: "once", 12: "doce", 13: "trece", 14: "catorce",
  15: "quince", 16: "dieciséis", 17: "diecisiete", 18: "dieciocho",
  19: "diecinueve", 20: "veinte", 21: "veintiuno", 22: "veintidós",
  23: "veintitrés", 24: "veinticuatro", 25: "veinticinco",
  26: "veintiséis", 27: "veintisiete", 28: "veintiocho", 29: "veintinueve",
};

const _DECENAS_ES: Record<number, string> = {
  30: "treinta", 40: "cuarenta", 50: "cincuenta",
  60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa",
};

const _CENTENAS_ES: Record<number, string> = {
  100: "cien", 200: "doscientos", 300: "trescientos", 400: "cuatrocientos",
  500: "quinientos", 600: "seiscientos", 700: "setecientos",
  800: "ochocientos", 900: "novecientos",
};

function _grupoEs(n: number): string {
  if (n === 0) return "";
  if (n < 10) return _UNIDADES_ES[n];
  if (n < 30) return _ESPECIALES_ES[n];
  if (n < 100) {
    const decena = Math.floor(n / 10) * 10;
    const unidad = n % 10;
    const palabra = _DECENAS_ES[decena];
    return unidad ? `${palabra} y ${_UNIDADES_ES[unidad]}` : palabra;
  }
  if (n === 100) return "cien";
  const centena = Math.floor(n / 100) * 100;
  const resto = n % 100;
  const prefijo = centena === 100 ? "ciento" : _CENTENAS_ES[centena];
  return resto ? `${prefijo} ${_grupoEs(resto)}` : prefijo;
}

function _apocoparEs(palabra: string, genero: Genero): string {
  if (!palabra.endsWith("uno")) return palabra;
  if (genero === "f") return palabra.slice(0, -1) + "a";
  if (palabra.endsWith("veintiuno")) return palabra.slice(0, -3) + "ún";
  return palabra.slice(0, -1);
}

/** Convierte un entero no negativo a palabras en español (minúsculas, sin
 * nombre de moneda). Soporta hasta 999,999,999,999,999.
 *
 * Usa la escala larga real del español: 10**9 es "mil millones" y 10**12 es
 * "billón" — no el falso amigo de "billion" en inglés.
 */
export function numeroALetras(n: number): string {
  _validarEntero(n);
  if (n === 0) return "cero";

  const billones = Math.floor(n / 1e12);
  let resto = n - billones * 1e12;
  const milMillones = Math.floor(resto / 1e9);
  resto -= milMillones * 1e9;
  const millones = Math.floor(resto / 1e6);
  resto -= millones * 1e6;
  const miles = Math.floor(resto / 1000);
  const unidades = resto - miles * 1000;

  const partes: string[] = [];
  if (billones) {
    const palabra = _apocoparEs(_grupoEs(billones), "m");
    partes.push(billones === 1 ? `${palabra} billón` : `${palabra} billones`);
  }
  if (milMillones) {
    const palabra = milMillones === 1 ? "mil" : `${_apocoparEs(_grupoEs(milMillones), "m")} mil`;
    partes.push(`${palabra} millones`);
  }
  if (millones) {
    const palabra = _apocoparEs(_grupoEs(millones), "m");
    partes.push(millones === 1 ? `${palabra} millón` : `${palabra} millones`);
  }
  if (miles) {
    partes.push(miles === 1 ? "mil" : `${_apocoparEs(_grupoEs(miles), "m")} mil`);
  }
  if (unidades) {
    partes.push(_grupoEs(unidades));
  }
  return partes.join(" ");
}

// =============================================================================
// INGLÉS (sin género, escala corta: billion = 10**9)
// =============================================================================

const _UNITS_EN = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

const _TEENS_EN: Record<number, string> = {
  10: "ten", 11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen",
  15: "fifteen", 16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen",
};

const _TENS_EN: Record<number, string> = {
  20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",
  60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety",
};

function _grupoEn(n: number): string {
  if (n === 0) return "";
  if (n < 10) return _UNITS_EN[n];
  if (n < 20) return _TEENS_EN[n];
  if (n < 100) {
    const tens = Math.floor(n / 10) * 10;
    const unit = n % 10;
    const palabra = _TENS_EN[tens];
    return unit ? `${palabra}-${_UNITS_EN[unit]}` : palabra;
  }
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const palabra = `${_UNITS_EN[hundred]} hundred`;
  return rest ? `${palabra} ${_grupoEn(rest)}` : palabra;
}

/** Converts a non-negative integer to English words. Supports up to
 * 999,999,999,999,999. Uses the short scale (billion = 10**9). */
export function numeroALetrasEn(n: number): string {
  _validarEntero(n);
  if (n === 0) return "zero";

  const trillions = Math.floor(n / 1e12);
  let resto = n - trillions * 1e12;
  const billions = Math.floor(resto / 1e9);
  resto -= billions * 1e9;
  const millions = Math.floor(resto / 1e6);
  resto -= millions * 1e6;
  const thousands = Math.floor(resto / 1000);
  const units = resto - thousands * 1000;

  const partes: string[] = [];
  if (trillions) partes.push(`${_grupoEn(trillions)} trillion`);
  if (billions) partes.push(`${_grupoEn(billions)} billion`);
  if (millions) partes.push(`${_grupoEn(millions)} million`);
  if (thousands) partes.push(`${_grupoEn(thousands)} thousand`);
  if (units) partes.push(_grupoEn(units));
  return partes.join(" ");
}

// =============================================================================
// PORTUGUÉS (Brasil; escala corta: bilhão = 10**9). "um/dois" y las
// centenas (duzentos...) tienen forma femenina.
// =============================================================================

const _UNIDADES_PT_M = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const _UNIDADES_PT_F = ["", "uma", "duas", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];

const _ESPECIALES_PT: Record<number, string> = {
  10: "dez", 11: "onze", 12: "doze", 13: "treze", 14: "catorze",
  15: "quinze", 16: "dezesseis", 17: "dezessete", 18: "dezoito",
  19: "dezenove", 20: "vinte",
};

const _DEZENAS_PT: Record<number, string> = {
  20: "vinte", 30: "trinta", 40: "quarenta", 50: "cinquenta",
  60: "sessenta", 70: "setenta", 80: "oitenta", 90: "noventa",
};

const _CENTENAS_PT_M: Record<number, string> = {
  200: "duzentos", 300: "trezentos", 400: "quatrocentos",
  500: "quinhentos", 600: "seiscentos", 700: "setecentos",
  800: "oitocentos", 900: "novecentos",
};
const _CENTENAS_PT_F: Record<number, string> = {
  200: "duzentas", 300: "trezentas", 400: "quatrocentas",
  500: "quinhentas", 600: "seiscentas", 700: "setecentas",
  800: "oitocentas", 900: "novecentas",
};

function _grupoPt(n: number, genero: Genero): string {
  const unidades = genero === "f" ? _UNIDADES_PT_F : _UNIDADES_PT_M;
  if (n === 0) return "";
  if (n < 10) return unidades[n];
  if (n <= 20) return _ESPECIALES_PT[n];
  if (n < 100) {
    const dezena = Math.floor(n / 10) * 10;
    const unidade = n % 10;
    const palavra = _DEZENAS_PT[dezena];
    return unidade ? `${palavra} e ${unidades[unidade]}` : palavra;
  }
  if (n === 100) return "cem";
  const centena = Math.floor(n / 100) * 100;
  const resto = n % 100;
  const prefixo = centena === 100 ? "cento" : (genero === "f" ? _CENTENAS_PT_F : _CENTENAS_PT_M)[centena];
  return resto ? `${prefixo} e ${_grupoPt(resto, genero)}` : prefixo;
}

/** Converte um número inteiro não negativo em palavras, em português do
 * Brasil. Suporta até 999.999.999.999.999. Usa a escala curta (bilhão =
 * 10**9), padrão no Brasil.
 *
 * `genero` afeta apenas o dígito final (um/uma, dois/duas, e as centenas):
 * os multiplicadores de milhão/bilhão/trilhão são sempre tratados como
 * masculinos, porque concordam com "milhão" e não com o substantivo que
 * vem depois.
 */
export function numeroALetrasPt(n: number, genero: Genero = "m"): string {
  _validarEntero(n);
  if (n === 0) return "zero";

  const trilhoes = Math.floor(n / 1e12);
  let resto = n - trilhoes * 1e12;
  const bilhoes = Math.floor(resto / 1e9);
  resto -= bilhoes * 1e9;
  const milhoes = Math.floor(resto / 1e6);
  resto -= milhoes * 1e6;
  const milhares = Math.floor(resto / 1000);
  const unidades = resto - milhares * 1000;

  const partes: string[] = [];
  if (trilhoes) {
    const palavra = _grupoPt(trilhoes, "m");
    partes.push(trilhoes === 1 ? `${palavra} trilhão` : `${palavra} trilhões`);
  }
  if (bilhoes) {
    const palavra = _grupoPt(bilhoes, "m");
    partes.push(bilhoes === 1 ? `${palavra} bilhão` : `${palavra} bilhões`);
  }
  if (milhoes) {
    const palavra = _grupoPt(milhoes, "m");
    partes.push(milhoes === 1 ? `${palavra} milhão` : `${palavra} milhões`);
  }
  if (milhares) {
    partes.push(milhares === 1 ? "mil" : `${_grupoPt(milhares, "m")} mil`);
  }
  if (unidades) {
    partes.push(_grupoPt(unidades, genero));
  }
  return partes.join(" ");
}

// =============================================================================
// FRANCÉS (escala larga: milliard = 10**9, billion = 10**12). Solo "un"
// tiene forma femenina ("une"); se aplica al final, sobre el grupo de
// unidades que queda pegado directamente al sustantivo.
// =============================================================================

const _0_99_FR: Record<number, string> = {
  0: "", 1: "un", 2: "deux", 3: "trois", 4: "quatre", 5: "cinq", 6: "six",
  7: "sept", 8: "huit", 9: "neuf", 10: "dix", 11: "onze", 12: "douze",
  13: "treize", 14: "quatorze", 15: "quinze", 16: "seize",
  17: "dix-sept", 18: "dix-huit", 19: "dix-neuf", 20: "vingt",
  21: "vingt et un", 22: "vingt-deux", 23: "vingt-trois", 24: "vingt-quatre",
  25: "vingt-cinq", 26: "vingt-six", 27: "vingt-sept", 28: "vingt-huit",
  29: "vingt-neuf", 30: "trente", 31: "trente et un", 32: "trente-deux",
  33: "trente-trois", 34: "trente-quatre", 35: "trente-cinq", 36: "trente-six",
  37: "trente-sept", 38: "trente-huit", 39: "trente-neuf", 40: "quarante",
  41: "quarante et un", 42: "quarante-deux", 43: "quarante-trois",
  44: "quarante-quatre", 45: "quarante-cinq", 46: "quarante-six",
  47: "quarante-sept", 48: "quarante-huit", 49: "quarante-neuf",
  50: "cinquante", 51: "cinquante et un", 52: "cinquante-deux",
  53: "cinquante-trois", 54: "cinquante-quatre", 55: "cinquante-cinq",
  56: "cinquante-six", 57: "cinquante-sept", 58: "cinquante-huit",
  59: "cinquante-neuf", 60: "soixante", 61: "soixante et un",
  62: "soixante-deux", 63: "soixante-trois", 64: "soixante-quatre",
  65: "soixante-cinq", 66: "soixante-six", 67: "soixante-sept",
  68: "soixante-huit", 69: "soixante-neuf", 70: "soixante-dix",
  71: "soixante et onze", 72: "soixante-douze", 73: "soixante-treize",
  74: "soixante-quatorze", 75: "soixante-quinze", 76: "soixante-seize",
  77: "soixante-dix-sept", 78: "soixante-dix-huit", 79: "soixante-dix-neuf",
  80: "quatre-vingts", 81: "quatre-vingt-un", 82: "quatre-vingt-deux",
  83: "quatre-vingt-trois", 84: "quatre-vingt-quatre", 85: "quatre-vingt-cinq",
  86: "quatre-vingt-six", 87: "quatre-vingt-sept", 88: "quatre-vingt-huit",
  89: "quatre-vingt-neuf", 90: "quatre-vingt-dix", 91: "quatre-vingt-onze",
  92: "quatre-vingt-douze", 93: "quatre-vingt-treize", 94: "quatre-vingt-quatorze",
  95: "quatre-vingt-quinze", 96: "quatre-vingt-seize", 97: "quatre-vingt-dix-sept",
  98: "quatre-vingt-dix-huit", 99: "quatre-vingt-dix-neuf",
};

function _grupoFr(n: number): string {
  if (n < 100) return _0_99_FR[n];
  const centaine = Math.floor(n / 100);
  const resto = n % 100;
  let mot: string;
  if (centaine === 1) {
    mot = "cent";
  } else {
    mot = `${_0_99_FR[centaine]} cent`;
    if (resto === 0) mot += "s";
  }
  return resto ? `${mot} ${_0_99_FR[resto]}` : mot;
}

function _feminiserFr(mot: string): string {
  return mot.endsWith("un") ? mot.slice(0, -2) + "une" : mot;
}

/** Convertit un entier non négatif en mots français. Prend en charge
 * jusqu'à 999 999 999 999 999. Utilise l'échelle longue réelle du
 * français : 10**9 est "milliard" et 10**12 est "billion". */
export function numeroALetrasFr(n: number): string {
  _validarEntero(n);
  if (n === 0) return "zéro";

  const billions = Math.floor(n / 1e12);
  let resto = n - billions * 1e12;
  const milliards = Math.floor(resto / 1e9);
  resto -= milliards * 1e9;
  const millions = Math.floor(resto / 1e6);
  resto -= millions * 1e6;
  const milliers = Math.floor(resto / 1000);
  const unites = resto - milliers * 1000;

  const partes: string[] = [];
  if (billions) {
    const mot = _grupoFr(billions);
    partes.push(billions === 1 ? `${mot} billion` : `${mot} billions`);
  }
  if (milliards) {
    const mot = _grupoFr(milliards);
    partes.push(milliards === 1 ? `${mot} milliard` : `${mot} milliards`);
  }
  if (millions) {
    const mot = _grupoFr(millions);
    partes.push(millions === 1 ? `${mot} million` : `${mot} millions`);
  }
  if (milliers) {
    partes.push(milliers === 1 ? "mille" : `${_grupoFr(milliers)} mille`);
  }
  if (unites) {
    partes.push(_grupoFr(unites));
  }
  return partes.join(" ");
}

function _validarEntero(n: number): void {
  if (!Number.isInteger(n)) {
    throw new SpellMoneyError("se esperaba un entero no negativo");
  }
  if (n < 0) {
    throw new SpellMoneyError("no se admiten números negativos");
  }
  if (n >= 1e15) {
    throw new SpellMoneyError("el número excede el rango soportado (máximo 999,999,999,999,999)");
  }
}

const _MOTOR: Record<Idioma, (n: number, genero: Genero) => string> = {
  es: (n) => numeroALetras(n),
  en: (n) => numeroALetrasEn(n),
  pt: (n, genero) => numeroALetrasPt(n, genero),
  fr: (n) => numeroALetrasFr(n),
};

const _PALABRA_CERO: Record<Idioma, string> = { es: "cero", en: "zero", pt: "zero", fr: "zéro" };
const _CONECTOR: Record<Idioma, string> = { es: "CON", en: "AND", pt: "E", fr: "ET" };
const _CENTAVOS_PALABRA: Record<Idioma, [string, string]> = {
  es: ["centavo", "centavos"],
  en: ["cent", "cents"],
  pt: ["centavo", "centavos"],
  fr: ["centime", "centimes"],
};
const _ESCALA_QUE_PIDE_DE: Partial<Record<Idioma, string[]>> = {
  es: ["millón", "millones", "billón", "billones"],
  pt: ["milhão", "milhões", "bilhão", "bilhões", "trilhão", "trilhões"],
  fr: ["million", "millions", "milliard", "milliards", "billion", "billions"],
};
const _VOCALES_FR = new Set("aeiouàâäéèêëïîôöùûüh".split(""));

function _deFr(nombre: string): string {
  return _VOCALES_FR.has(nombre[0]?.toLowerCase() ?? "") ? `d'${nombre}` : `de ${nombre}`;
}

function _apocoparUno(idioma: Idioma, cantidad: string, genero: Genero): string {
  if (idioma === "es") return _apocoparEs(cantidad, genero);
  if (idioma === "fr" && genero === "f") return _feminiserFr(cantidad);
  return cantidad; // en: sin género; pt: ya viene con el género correcto
}

const _RE_MONTO = /^\s*(\d+)(?:\.(\d*))?\s*$/;

/**
 * Separa un monto en su parte entera y sus centavos.
 *
 * Con un `string` el corte es exacto: se leen los dígitos tal como fueron
 * escritos y el redondeo del tercer decimal en adelante es half-up
 * ("2.675" -> 68 centavos). Con un `number` el resultado depende de la
 * representación binaria del valor recibido, igual que `toFixed(2)`.
 */
function _partirMonto(monto: number | string): { entero: number; centavos: number } {
  if (typeof monto === "string") {
    if (/^\s*-/.test(monto)) {
      throw new SpellMoneyError("no se admiten montos negativos");
    }
    const partes = _RE_MONTO.exec(monto);
    if (!partes) {
      throw new SpellMoneyError(
        `monto '${monto}' no es un decimal válido. Se espera algo como "125.50"`
      );
    }
    const entero = Number(partes[1]);
    if (!Number.isSafeInteger(entero) || entero >= 1e15) {
      throw new SpellMoneyError("el monto excede el rango soportado (máximo 999,999,999,999,999)");
    }
    const decimales = partes[2] ?? "";
    let centavos = Number((decimales + "00").slice(0, 2));
    if ((decimales[2] ?? "0") >= "5") centavos += 1;
    return centavos === 100 ? { entero: entero + 1, centavos: 0 } : { entero, centavos };
  }
  if (typeof monto !== "number" || Number.isNaN(monto)) {
    throw new SpellMoneyError("se esperaba un monto numérico o una cadena decimal");
  }
  if (monto < 0) {
    throw new SpellMoneyError("no se admiten montos negativos");
  }
  let entero = Math.trunc(monto);
  let centavos = Math.round((monto - entero) * 100);
  if (centavos === 100) {
    entero += 1;
    centavos = 0;
  }
  return { entero, centavos };
}

export interface ALetrasOptions {
  moneda?: string;
  idioma?: Idioma;
  centavos?: "fraccion" | "palabras";
  mayusculas?: boolean;
}

/**
 * Convierte un monto a su representación en letras para documentos legales
 * y financieros.
 *
 * @param monto Cantidad a convertir. Debe ser >= 0. Puede ser un `number`
 *   o una cadena decimal (`"125.50"`); la cadena se interpreta de forma
 *   exacta, sin pasar por la aritmética de punto flotante.
 * @param options.moneda Código ISO 4217 de la moneda (por defecto "USD").
 * @param options.idioma "es" (por defecto), "en", "pt" o "fr". Si la moneda
 *   elegida todavía no tiene traducción a ese idioma, se lanza
 *   SpellMoneyError invitando a contribuir la traducción.
 * @param options.centavos "fraccion" (por defecto) escribe los centavos
 *   como fracción (50/100). "palabras" los escribe en letras.
 * @param options.mayusculas Si es true (por defecto) devuelve el resultado
 *   en mayúsculas.
 */
export function aLetras(monto: number | string, options: ALetrasOptions = {}): string {
  const { moneda = "USD", idioma = "es", centavos = "fraccion", mayusculas = true } = options;

  if (!IDIOMAS.includes(idioma)) {
    throw new SpellMoneyError(`idioma '${idioma}' no soportado. Disponibles: ${IDIOMAS.join(", ")}`);
  }
  if (!(moneda in MONEDAS)) {
    const disponibles = Object.keys(MONEDAS).sort().join(", ");
    throw new SpellMoneyError(`moneda '${moneda}' no reconocida. Disponibles: ${disponibles}`);
  }
  const entradaMoneda: CurrencyEntry = MONEDAS[moneda];
  if (!entradaMoneda[idioma]) {
    throw new SpellMoneyError(
      `la moneda '${moneda}' todavía no tiene nombre en idioma '${idioma}'. ` +
        `¡Ayuda buscada! Se acepta un pull request agregando ` +
        `MONEDAS['${moneda}']['${idioma}'] en src/currencies.ts.`
    );
  }
  if (centavos !== "fraccion" && centavos !== "palabras") {
    throw new SpellMoneyError("centavos debe ser 'fraccion' o 'palabras'");
  }
  const { entero, centavos: parteCentavos } = _partirMonto(monto);

  const info = entradaMoneda[idioma]!;
  const genero = info.genero;
  const motor = _MOTOR[idioma];

  let nombreMoneda: string;
  let cantidadEnLetras: string;

  if (entero === 1) {
    nombreMoneda = info.singular;
    if (idioma === "es") {
      cantidadEnLetras = _apocoparEs("uno", genero);
    } else if (idioma === "en") {
      cantidadEnLetras = "one";
    } else if (idioma === "pt") {
      cantidadEnLetras = genero === "f" ? "uma" : "um";
    } else {
      cantidadEnLetras = genero === "f" ? "une" : "un";
    }
  } else {
    nombreMoneda = info.plural;
    cantidadEnLetras = entero === 0 ? _PALABRA_CERO[idioma] : motor(entero, genero);
    cantidadEnLetras = _apocoparUno(idioma, cantidadEnLetras, genero);
    const escala = _ESCALA_QUE_PIDE_DE[idioma];
    const ultimaPalabra = cantidadEnLetras.split(" ").pop() ?? "";
    if (escala && escala.includes(ultimaPalabra)) {
      nombreMoneda = idioma === "fr" ? _deFr(nombreMoneda) : `de ${nombreMoneda}`;
    }
  }

  const [singCentavos, plurCentavos] = _CENTAVOS_PALABRA[idioma];
  const conector = _CONECTOR[idioma];

  let sufijoCentavos: string;
  if (centavos === "fraccion") {
    sufijoCentavos = `${conector} ${String(parteCentavos).padStart(2, "0")}/100`;
  } else if (parteCentavos === 0) {
    sufijoCentavos = `${conector} ${_PALABRA_CERO[idioma].toUpperCase()} ${plurCentavos.toUpperCase()}`;
  } else if (parteCentavos === 1) {
    const unoCentavo: Record<Idioma, string> = { es: "un", en: "one", pt: "um", fr: "un" };
    sufijoCentavos = `${conector} ${unoCentavo[idioma].toUpperCase()} ${singCentavos.toUpperCase()}`;
  } else {
    const texto = _apocoparUno(idioma, motor(parteCentavos, "m"), "m");
    sufijoCentavos = `${conector} ${texto.toUpperCase()} ${plurCentavos.toUpperCase()}`;
  }

  const resultado = `${cantidadEnLetras} ${nombreMoneda} ${sufijoCentavos}`;
  return mayusculas ? resultado.toUpperCase() : resultado.toLowerCase();
}
