# spellmoney

**Convierte montos numéricos a letras, con el formato exacto que exigen los documentos legales y financieros** — cheques, facturas, recibos y contratos: `CIENTO VEINTICINCO DÓLARES CON 50/100`.

[![npm](https://img.shields.io/npm/v/spellmoney?logo=npm&color=CB3837)](https://www.npmjs.com/package/spellmoney)
![Node](https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js&logoColor=white)
![Tests](https://github.com/brandriver-bit/spellmoney-js/actions/workflows/tests.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-green)
![Dependencies](https://img.shields.io/badge/dependencias-cero-brightgreen)
![Idiomas](https://img.shields.io/badge/idiomas-es%20%7C%20en%20%7C%20pt%20%7C%20fr-blue)

Este es el puerto a TypeScript/JavaScript de [`spellmoney`](https://github.com/brandriver-bit/spellmoney) (la versión Python original). Misma lógica, mismos datos de moneda, mismo resultado exacto — para quien trabaja en Node.

## Instalación

```bash
npm install spellmoney
```

## Uso

```ts
import { aLetras } from "spellmoney";

aLetras(125.50);
// 'CIENTO VEINTICINCO DÓLARES CON 50/100'

aLetras(1, { moneda: "GTQ" });
// 'UN QUETZAL CON 00/100'

aLetras(21000000, { moneda: "EUR" });
// 'VEINTIÚN MILLONES DE EUROS CON 00/100'

aLetras(2, { moneda: "GBP", mayusculas: false });
// 'dos libras esterlinas con 00/100'

aLetras(10.50, { centavos: "palabras" });
// 'DIEZ DÓLARES CON CINCUENTA CENTAVOS'
```

### Otros idiomas

```ts
aLetras(125.50, { idioma: "en" });
// 'ONE HUNDRED TWENTY-FIVE DOLLARS AND 50/100'

aLetras(125.50, { idioma: "pt", moneda: "BRL" });
// 'CENTO E VINTE E CINCO REAIS E 50/100'

aLetras(125.50, { idioma: "fr", moneda: "EUR" });
// 'CENT VINGT-CINQ EUROS ET 50/100'
```

### Solo el número, sin moneda

```ts
import { numeroALetras, numeroALetrasEn, numeroALetrasPt, numeroALetrasFr } from "spellmoney";

numeroALetras(1000000);        // 'un millón'
numeroALetras(1000000000);     // 'mil millones'   (¡no "un billón"!)
numeroALetras(1000000000000);  // 'un billón'

numeroALetrasEn(1000000000);   // 'one billion'    (escala corta del inglés)

numeroALetrasPt(21, "f");      // 'vinte e uma'     (concordancia de género)

numeroALetrasFr(71);           // 'soixante et onze'  (base vigesimal del francés)
```

## Monedas soportadas

**Las 154 divisas activas del estándar ISO 4217.** La cobertura varía según el idioma:

| Idioma | Divisas cubiertas |
|---|---|
| `es` (español) | 154 — todas |
| `en` (inglés) | 154 — todas |
| `pt` (portugués, Brasil) | 46 — países lusófonos + las divisas más usadas del mundo |
| `fr` (francés) | 45 — países francófonos + las divisas más usadas del mundo |

Si se pide una combinación de moneda e idioma que aún no existe, `aLetras` lanza `SpellMoneyError` con un mensaje explicando exactamente qué falta, en vez de fallar en silencio.

### 🙋 Ayuda buscada

Portugués y francés todavía tienen huecos en divisas regionales. Los pasos exactos para contribuir (fork, rama, pruebas, Pull Request) están en [`CONTRIBUTING.md`](CONTRIBUTING.md) — en español e inglés.

## API

| Función | Descripción |
|---|---|
| `aLetras(monto, opciones?)` | Convierte un monto con nombre de moneda. Ver `ALetrasOptions`. |
| `numeroALetras(n)` | Solo el número, en español. |
| `numeroALetrasEn(n)` | Solo el número, en inglés. |
| `numeroALetrasPt(n, genero?)` | Solo el número, en portugués. |
| `numeroALetrasFr(n)` | Solo el número, en francés. |
| `MONEDAS` | Catálogo de las 154 divisas ISO 4217. |
| `IDIOMAS` | `["es", "en", "pt", "fr"]`. |
| `SpellMoneyError` | Error lanzado ante un monto, moneda o idioma inválidos. |

`ALetrasOptions`: `{ moneda?: string; idioma?: "es"|"en"|"pt"|"fr"; centavos?: "fraccion"|"palabras"; mayusculas?: boolean }`.

## Rango soportado

Enteros de `0` a `999,999,999,999,999`. Un monto fuera de ese rango lanza `SpellMoneyError`, igual que un monto negativo, una moneda no reconocida o un idioma no soportado.

## Redondeo y precisión

Los montos con **dos decimales** —el caso normal en dinero— se convierten de forma exacta. Verificado sobre el millón de montos de `0.00` a `9999.99`: ninguna diferencia frente a aritmética decimal exacta.

Con **tres o más decimales**, el empate exacto (`2.675`, `1.005`) se resuelve según el valor binario que JavaScript almacena realmente, que puede quedar apenas por debajo del decimal escrito. En ese caso `2.675` se convierte como `2.67`, igual que devuelve `(2.675).toFixed(2)` — la diferencia está en el tipo `number`, no en esta librería.

Si necesitás control exacto sobre montos de más de dos decimales, redondealos con tu propio criterio antes de llamar a `aLetras`.

## Desarrollo

```bash
git clone https://github.com/brandriver-bit/spellmoney-js.git
cd spellmoney-js
npm install
npm test
npm run build
```

## Licencia

MIT — ver [`LICENSE`](LICENSE).
