@AGENTS.md

# CLAUDE.md

Este archivo brinda guía a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Idioma

Responde siempre en español en este proyecto, sin importar el idioma del código, la documentación o el mensaje del usuario.

## ⚠️ Lee primero AGENTS.md

`AGENTS.md` (importado arriba vía `@AGENTS.md` — `next dev` lo regenera, así que conserva esa línea de import) no es texto de relleno: es una instrucción real. Este proyecto usa **Next.js 16.3.5** / **React 19.2.8**, versiones posteriores a la mayoría de los datos de entrenamiento. Antes de escribir cualquier código de Next.js (routing, fetching de datos, caching, config), lee la guía correspondiente en `node_modules/next/dist/docs/` en lugar de confiar en conocimiento previo de Next.js. Ese directorio es la documentación vendorizada y correspondiente a esta versión exacta — trátala como más autorizada que la memoria.

Dos trampas concretas de esta versión que difieren de versiones anteriores de Next.js:

- **Los tipos de props de rutas son globales, no requieren import.** `PageProps<'/ruta'>` y `LayoutProps<'/ruta'>` son helpers ambientales generados por Next (ver `app/layout.tsx`, que ya usa `LayoutProps<"/">`). No escribas a mano tipos `{ params, children }` ni importes `PageProps`/`LayoutProps` desde ningún lado.
- **Cache Components (`cacheComponents: true` en `next.config.ts`) es un modelo de caché distinto y opcional** (directiva `use cache`, `cacheLife`, Partial Prerendering) que reemplaza el modelo mental anterior de fetch-cache/`revalidate` descrito en la mayoría de tutoriales previos a 2026. **No está habilitado** todavía en el `next.config.ts` de este proyecto — si lo habilitas o escribes código de caching, lee `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` (modelo Cache Components) frente a `.../02-guides/caching-without-cache-components.md` (modelo anterior) y no mezcles ambos modelos mentales.

## Comandos

```bash
npm run dev      # inicia el servidor de desarrollo (Turbopack, vía next dev)
npm run build    # build de producción
npm run start    # ejecuta el build de producción
npm run lint     # eslint (flat config, eslint.config.mjs)
```

Todavía no hay configuración ni script de tests.

## Arquitectura

Este es un scaffold básico de `create-next-app` (App Router) — por ahora solo la landing page por defecto, la app real aún no está construida:

- `app/` — raíz del App Router; `layout.tsx` configura las fuentes Geist y el shell HTML global, `page.tsx` es la landing page por defecto de CNA (se puede reemplazar por completo sin problema).
- Estilos: Tailwind CSS v4 vía `@import "tailwindcss"` en `app/globals.css` (no hay `tailwind.config.*` — v4 usa configuración basada en CSS con `@theme` directamente en ese archivo). El modo oscuro se controla con `prefers-color-scheme`, no con una clase toggle.
- Alias de rutas: `@/*` → raíz del proyecto (`tsconfig.json`).
- ESLint usa el formato flat-config (`eslint.config.mjs`) extendiendo los rule sets `core-web-vitals` y `typescript` de `eslint-config-next`.

## Dirección del producto (según README.md)

Arcade Vault está planeado como una plataforma para jugar online y competir por la mayor cantidad de puntos. El proyecto pretende seguir un flujo de **Spec Driven Design** usando los comandos `/spec` y `/spec-impl` del paquete de skills `Klerith/fernando-skills` (se instala con `npx skills@latest add Klerith/fernando-skills`). Estas skills todavía no están instaladas en este repo — si te piden planificar o implementar una funcionalidad y se espera ese flujo, verifica primero si `/spec` / `/spec-impl` están disponibles antes de recurrir a una implementación ad hoc.
