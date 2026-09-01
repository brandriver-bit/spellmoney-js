# Contribuir a spellmoney (JS/TS)

*[Read this in English](#contributing-to-spellmoney-jsts-english)*

Gracias por tu interés en mejorar este puerto de `spellmoney`. Si el cambio es sobre la lógica de idiomas o el catálogo de monedas, probablemente ya existe en la [versión Python](https://github.com/brandriver-bit/spellmoney) y solo hace falta reflejarlo aquí para mantener ambos puertos sincronizados.

## Antes de nada

El repositorio corre automáticamente las pruebas (`vitest`) en cada Pull Request. Si tu cambio hace fallar una prueba, o le faltan pruebas, te va a aparecer marcado en rojo antes de que se revise.

## Formas de ayudar

### 1. Reportar un error o pedir algo

Abre un [Issue](../../issues) describiendo qué esperabas que pasara y qué pasó en realidad.

### 2. Agregar o corregir el nombre de una moneda

Los nombres de moneda viven en `src/currencies.ts`, generados a partir del mismo catálogo que usa la versión Python. Para agregar una moneda en un idioma que todavía no la tiene, agrega la entrada correspondiente ahí siguiendo el mismo formato (`singular`, `plural`, `genero`).

### 3. Agregar un idioma nuevo

Cada idioma en `src/index.ts` sigue el mismo patrón: una función `numeroALetrasXX(n)`, una entrada en `IDIOMAS`, y conectarlo en `_MOTOR`, `_PALABRA_CERO`, `_CONECTOR`, `_CENTAVOS_PALABRA` y, si aplica, `_ESCALA_QUE_PIDE_DE`. Solo se acepta si la gramática está verificada, no adivinada — igual que en la versión Python.

## Cómo enviar tu cambio

```bash
git clone https://github.com/TU-USUARIO/spellmoney-js.git
cd spellmoney-js
npm install

git checkout -b agrega-moneda-XXX

# haz tu cambio, agrega tu prueba en test/index.test.ts
npm test

git add -A
git commit -m "Agrega AFN en portugués"
git push origin agrega-moneda-XXX
```

Y abre un Pull Request desde GitHub.

---

# Contributing to spellmoney (JS/TS) (English)

*[Leer esto en español](#contribuir-a-spellmoney-jsts)*

Thanks for your interest in improving this port of `spellmoney`. If the change is about language logic or the currency catalog, it likely already exists in the [Python version](https://github.com/brandriver-bit/spellmoney) and just needs to be mirrored here to keep both ports in sync.

## Before anything else

The repository automatically runs the test suite (`vitest`) on every Pull Request. If your change breaks a test, or is missing one, it'll show up red before review.

## Ways to help

### 1. Report a bug or request something

Open an [Issue](../../issues) describing what you expected versus what actually happened.

### 2. Add or fix a currency name

Currency names live in `src/currencies.ts`, generated from the same catalog the Python version uses. To add a currency for a language that doesn't have it yet, add the matching entry there following the same shape (`singular`, `plural`, `genero`).

### 3. Add a new language

Every language in `src/index.ts` follows the same pattern: a `numeroALetrasXX(n)` function, an entry in `IDIOMAS`, and wiring it into `_MOTOR`, `_PALABRA_CERO`, `_CONECTOR`, `_CENTAVOS_PALABRA`, and `_ESCALA_QUE_PIDE_DE` if it applies. Only accepted if the grammar is verified, not guessed — same rule as the Python version.

## How to submit your change

```bash
git clone https://github.com/YOUR-USERNAME/spellmoney-js.git
cd spellmoney-js
npm install

git checkout -b add-currency-XXX

# make your change, add your test in test/index.test.ts
npm test

git add -A
git commit -m "Add AFN in Portuguese"
git push origin add-currency-XXX
```

Then open a Pull Request on GitHub.
