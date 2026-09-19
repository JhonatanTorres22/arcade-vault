# 02 — Home (landing) y reubicación de Biblioteca a /juegos

**Estado:** IMPLEMENTADO
**Depende de:** SPEC 01
**Fecha:** 2026-09-18

**Objetivo:** Implementar visualmente la nueva pestaña "Inicio" (landing de `references/templates/home-about/home.jsx`) en la ruta `/`, moviendo la Biblioteca que hoy vive en `/` a `/juegos`.

## Alcance

**Incluye:**

- Nueva pantalla **Home** en `/` (`app/page.tsx`), portada 1:1 en diseño desde `references/templates/home-about/home.jsx`:
  - Hero con siluetas pixel flotantes (`FloatingSilhouettes`), eyebrow, título de 3 líneas, subtítulo y CTAs "EXPLORAR JUEGOS" (→ `/juegos`) y "CREAR CUENTA" (→ `/iniciar-sesion`).
  - Sección "¿POR QUÉ ARCADE VAULT?" con las 4 `feature-card` y sus íconos pixel (`FeatureIcon`), tal cual el template (textos fijos).
  - Sección "JUEGOS DISPONIBLES AHORA": franja de 6 `MiniCard` tomadas de `GAMES.slice(0, 6)` (`lib/games-data.ts`), cada una navegando a `/juegos/[id]` con `next/link`; botón "VER TODOS LOS JUEGOS →" a `/juegos`.
  - Sección de stats (`home-stats`): tres bloques con texto fijo tipo marketing ("12+ JUEGOS", "MILES DE PARTIDAS", "GLOBAL RANKING"), igual que el template — no se calculan dinámicamente.
  - Sección "ACTIVIDAD EN VIVO": ticker de últimas puntuaciones y "TOP JUGADORES · HOY", con los mismos datos mock hardcodeados del template (nombres, puntajes y tiempos relativos fijos como "hace 2 min"). El botón "VER SALÓN →" navega a `/salon-de-la-fama` (ruta ya existente de SPEC 01).
  - Sección "PRECIOS": tarjeta de precio única ("$0 / SIEMPRE") y FAQ, texto fijo del template; el botón "EMPEZAR GRATIS →" navega a `/iniciar-sesion`.
  - CTA final ("¿LISTO PARA JUGAR?") con botón a `/juegos`.
  - Animación `reveal`/`IntersectionObserver` al hacer scroll, igual que en el template (`useReveal`), implementada como hook local en el Client Component.
- **Reubicación de la Biblioteca**: el contenido actual de `app/page.tsx` (buscador, chips de categoría, grid de `GameCard`) se mueve tal cual a `app/juegos/page.tsx`, sin cambios de lógica ni de diseño.
- Actualización de `components/nav.tsx`:
  - Se agrega el tab **"Inicio"** apuntando a `/`.
  - El tab **"Biblioteca"** pasa a apuntar a `/juegos` (antes `/`).
  - Se agrega el tab **"Acerca de"** apuntando a `/acerca-de` (ruta que todavía no existe; ver "No incluye").
  - `isActive` se actualiza para reconocer "inicio" (`pathname === "/"`), "biblioteca" (`pathname` empieza con `/juegos`) y "acerca de" (`pathname === "/acerca-de"`).
  - Mismo orden y cambios aplicados en el panel móvil (hamburguesa).

**No incluye:**

- La pantalla **Acerca de** (`/acerca-de`): no se implementa ningún contenido ni componente para ella en este spec. El tab del nav existe y apunta ahí, pero hasta que exista un spec dedicado la ruta da 404 — comportamiento aceptado explícitamente (ver Decisiones).
- Cualquier cambio a `/juegos/[id]` (Detalle), `/juegos/[id]/jugar` (Reproductor), `/salon-de-la-fama` o `/iniciar-sesion`: se reutilizan tal cual, sin tocar su lógica ni su diseño.
- Cálculo dinámico de las stats del home (cantidad real de juegos, partidas jugadas, etc.): se mantiene el texto fijo del template.
- Puntuaciones o "top jugadores" reales en la sección "ACTIVIDAD EN VIVO": sigue siendo mock hardcodeado idéntico al template, no conectado a `localStorage` (`av_scores`) ni a `lib/games-data.ts`.
- Redirect o alias desde la Biblioteca antigua en `/`: `/` deja de mostrar la Biblioteca por completo y pasa a mostrar el Home; no se crea ningún `redirect()` de `/` a `/juegos`.
- Rediseño visual: es un port fiel de `home.jsx`/`home-about/styles.css` (ya portado a `globals.css`), no pasa por `/frontend-design` ni `/ui-ux-pro-max`.

## Modelo de datos

No se introduce ningún modelo de datos nuevo ni persistente. Se reutiliza `GAMES` de `lib/games-data.ts` (SPEC 01) para la franja de juegos del home. Los datos del ticker de actividad y del top de jugadores son arrays literales locales dentro de `app/page.tsx` (mismo shape que en `home.jsx`, sin tipo exportado ni persistencia):

```ts
// dentro de app/page.tsx, solo para la sección "ACTIVIDAD EN VIVO"
type ActivityRow = { p: string; g: string; s: number; t: string; c: "magenta" | "yellow" | "green" | "cyan" };
type TopRow = { r: number; p: string; s: number };
```

## Plan de implementación

1. Crear `app/juegos/page.tsx` con el contenido íntegro que hoy tiene `app/page.tsx` (buscador, chips, grid de `GameCard`), sin modificar su lógica.
2. Reescribir `app/page.tsx` con el nuevo Home: hero + `FloatingSilhouettes` + CTAs, usando `next/link`/`useRouter` en vez del prop `navigate` del prototipo.
3. Agregar a `app/page.tsx` la sección "¿POR QUÉ ARCADE VAULT?" con `FeatureIcon` (funciones locales del archivo, igual que en `home.jsx`).
4. Agregar la sección "JUEGOS DISPONIBLES AHORA" con `MiniCard` alimentada por `GAMES.slice(0, 6)` de `lib/games-data.ts`, enlazando cada tarjeta a `/juegos/[id]`.
5. Agregar la sección de stats (`home-stats`) y la sección "ACTIVIDAD EN VIVO" (ticker + top jugadores) con los arrays mock locales, más el botón "VER SALÓN →" a `/salon-de-la-fama`.
6. Agregar la sección "PRECIOS" (tarjeta + FAQ) y el CTA final, con sus botones enlazando a `/iniciar-sesion` y `/juegos` respectivamente.
7. Portar el hook `useReveal` (IntersectionObserver sobre `.reveal`) como hook local de `app/page.tsx`, montado en `useEffect`.
8. Actualizar `components/nav.tsx`: agregar tabs "Inicio" (`/`) y "Acerca de" (`/acerca-de`), reapuntar "Biblioteca" a `/juegos`, y ajustar `isActive` para las tres rutas — en desktop y en el panel móvil.
9. Verificación manual con `npm run dev`: recorrer `/` (todas las secciones del home y sus animaciones al hacer scroll), confirmar que `/juegos` muestra la Biblioteca igual que antes, que los links del nav (Inicio, Biblioteca, Salón de la Fama, Acerca de, Iniciar Sesión) navegan a las rutas correctas, y que el menú hamburguesa responsive (<840px) refleja los mismos cuatro tabs.

## Criterios de aceptación

- [ ] `/` renderiza el nuevo Home: hero con siluetas animadas, sección "¿POR QUÉ ARCADE VAULT?", franja de 6 juegos, stats, "ACTIVIDAD EN VIVO", "PRECIOS" y CTA final.
- [ ] `/juegos` renderiza exactamente lo que antes se veía en `/` (buscador, chips de categoría, grid de juegos con tilt-hover), sin regresiones.
- [ ] `/` ya no muestra el grid de la Biblioteca; visitar `/` directamente muestra el Home, no un redirect a `/juegos`.
- [ ] En el Home, "EXPLORAR JUEGOS" e "INSERTAR MONEDA →" (CTA final) navegan a `/juegos`; "CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/iniciar-sesion`; "VER TODOS LOS JUEGOS →" navega a `/juegos`; "VER SALÓN →" navega a `/salon-de-la-fama`.
- [ ] Cada una de las 6 mini-tarjetas de "JUEGOS DISPONIBLES AHORA" corresponde a un juego real de `lib/games-data.ts` y navega a su `/juegos/[id]` correspondiente.
- [ ] Las secciones marcadas `reveal` en el Home aparecen con la animación de fade/slide al hacer scroll hasta ellas (igual que en el template).
- [ ] El nav muestra 4 tabs en este orden: Inicio, Biblioteca, Salón de la Fama, Acerca de — en desktop y en el panel móvil (<840px).
- [ ] El tab "Inicio" queda activo (resaltado) en `/`; "Biblioteca" queda activo en `/juegos` y en `/juegos/[id]`; "Salón de la Fama" y "Acerca de" mantienen su propia lógica de activo.
- [ ] El tab "Acerca de" apunta a `/acerca-de`; al hacer click hoy resulta en 404 (comportamiento esperado hasta que exista el spec de Acerca de).
- [ ] No hay errores en consola del navegador al navegar entre `/`, `/juegos` y el resto de rutas existentes.

## Decisiones tomadas y descartadas

- **La franja "JUEGOS DISPONIBLES AHORA" usa `GAMES.slice(0, 6)` real** en vez de datos hardcodeados del template — se descarta duplicar un mock de juegos que ya existe en `lib/games-data.ts`, y así cada mini-tarjeta navega a un `/juegos/[id]` real.
- **Las stats del home ("12+ JUEGOS", etc.) quedan como texto fijo**, sin calcularlas desde `GAMES.length` ni desde ninguna métrica real — se descarta agregar lógica de conteo/analítica que el alcance no pide; es copy de marketing, no un dato del sistema.
- **El ticker de "ACTIVIDAD EN VIVO" y el "TOP JUGADORES · HOY" quedan como mock hardcodeado idéntico al template**, sin conectarlos a `av_scores` (localStorage) ni a `seededScores` de `lib/games-data.ts` — se descarta esa integración porque el spec es explícitamente visual y esas secciones son decorativas en el prototipo original.
- **Se agrega ya el tab "Acerca de" al nav**, aunque su página no existe — decisión explícita del usuario; se acepta el 404 temporal en vez de ocultar el tab, para no tener que volver a tocar `nav.tsx` en el próximo spec.
- **`/` deja de ser la Biblioteca y pasa a ser el Home sin redirect** — se descarta mantener `/` como alias de `/juegos`, ya que el pedido explícito es que la Biblioteca "debería mostrarse en /juegos".
- **Sin rediseño visual**: no se invocan `/frontend-design` ni `/ui-ux-pro-max`, igual que en SPEC 01 — es un port fiel del prototipo ya vigente en `globals.css`.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| El tab "Acerca de" del nav queda apuntando a una ruta inexistente (`/acerca-de`) hasta el próximo spec | Aceptado explícitamente por el usuario; el 404 es temporal y se resuelve en el spec dedicado a Acerca de. |
| Enlaces externos o internos que apuntaban a `/` esperando ver la Biblioteca dejan de funcionar como antes | No aplica navegación externa en este proyecto (MVP sin usuarios reales); dentro de la app todos los enlaces a la Biblioteca se actualizan a `/juegos` en este mismo spec (paso 8 del plan). |
