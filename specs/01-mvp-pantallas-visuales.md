# 01 — MVP: Pantallas visuales de Arcade Vault

**Estado:** IMPLEMENTADO
**Depende de:** —
**Fecha:** 2026-09-17

**Objetivo:** Implementar en Next.js (App Router) las 5 pantallas visuales del prototipo de referencia (`references/templates/`) — Biblioteca, Detalle, Reproductor, Iniciar Sesión y Salón de la Fama — sin implementar lógica real de ningún juego.

## Alcance

**Incluye:**
- Las 5 pantallas del prototipo, portadas 1:1 en cuanto a diseño visual (el CSS ya fue portado a `app/globals.css` y las fuentes a `app/layout.tsx` en un commit anterior):
  - **Biblioteca** (`/`): hero, buscador, chips de categoría, grid de tarjetas de juego con efecto tilt.
  - **Detalle** (`/juegos/[id]`): portada, tags, descripción, stats, leaderboard mock, acciones "Jugar ahora" / "Volver al Vault".
  - **Reproductor** (`/juegos/[id]/jugar`): HUD (jugador, puntuación, vidas, nivel), pantalla CRT animada, simulación de puntuación automática (idéntica al template), pausa, fin de partida y modal para guardar puntuación.
  - **Iniciar Sesión** (`/iniciar-sesion`): tabs "Iniciar sesión" / "Crear cuenta", acceso como invitado, botones sociales decorativos.
  - **Salón de la Fama** (`/salon-de-la-fama`): tabs por juego, podio top 3, tabla completa, fila "tu mejor marca" si hay sesión iniciada.
- Navegación real de Next.js (`next/link`, `useRouter`, `usePathname`) reemplazando el router por hash del prototipo (`app.jsx`).
- Estado de sesión de usuario (nombre) y guardado de puntuaciones, persistidos solo en `localStorage` del navegador (mismas claves que el prototipo: `av_user`, `av_scores`).
- Datos mock de juegos, categorías, jugadores y generador de leaderboard (`data.jsx`) portados a un módulo TypeScript.
- Nav persistente (desktop + menú hamburguesa responsive <840px) compartido por todas las pantallas vía `app/layout.tsx`.

**No incluye:**
- Ninguna mecánica de juego real. El "gameplay" del Reproductor sigue siendo la simulación visual ya definida en el template (puntuación que sube sola por `setInterval`, sin input del jugador ni colisiones reales).
- Backend, base de datos o API routes. No hay autenticación real ni validación de credenciales.
- Que el Salón de la Fama refleje las puntuaciones realmente guardadas en `av_scores`: sigue usando datos mock generados con semilla (`seededScores`), igual que el template.
- Íconos/imágenes reales para las portadas de juego: se mantienen los fondos generados por CSS puro (`cover-bricks`, `cover-tetro`, etc.) ya definidos en `globals.css`.
- Cualquier pantalla no presente en el template (perfil de usuario, ajustes, tienda de créditos, etc.).
- Rediseño visual: no se pasa por `/frontend-design` ni `/ui-ux-pro-max`; es un port fiel del diseño ya portado a `globals.css`/`layout.tsx`.

## Modelo de datos

Todo el modelo es mock/estático en cliente, sin fuente de datos externa.

**`lib/games-data.ts`** (portado de `data.jsx`):
```ts
interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string;   // clase CSS de portada, ej. "cover-bricks"
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;
}

interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

const GAMES: Game[];
const CATS: string[];        // ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]
const PLAYERS: string[];
function seededScores(seed: number, count?: number): ScoreRow[];
```

**Sesión de usuario** — `lib/session-context.tsx` (Client Component, Context + Provider):
```ts
interface User { name: string; }
// UserProvider envuelve la app en app/layout.tsx
// useSession() expone: { user: User | null, login(name: string): void, logout(): void }
// Persiste en localStorage "av_user"
```
Se introduce un Context porque en el App Router cada ruta es un componente independiente — no existe, como en el prototipo, un único componente `App` que sostenga `useState` para pasarlo por props a todas las pantallas.

**Puntuaciones guardadas** — `lib/scores.ts`:
```ts
interface ScoreEntry { game: string; score: number; name: string; at: number; }
function saveScore(entry: Omit<ScoreEntry, "at">): void; // localStorage "av_scores"
```
Es solo un sumidero de escritura para reproducir la interacción "guardar puntuación" del modal de fin de partida; ninguna pantalla lee `av_scores` de vuelta (ver "No incluye").

## Plan de implementación

1. Crear `lib/games-data.ts` con los tipos, `GAMES`, `CATS`, `PLAYERS` y `seededScores` portados de `data.jsx`.
2. Crear `lib/session-context.tsx` (`UserProvider` + hook `useSession`) y `lib/scores.ts` (`saveScore`), ambos leyendo/escribiendo `localStorage` solo dentro de `useEffect`/handlers para evitar mismatches de hidratación.
3. Actualizar `app/layout.tsx`: envolver `children` con `UserProvider`, montar `<Nav />` de forma persistente y agregar el `<footer>` del template ("© 2026 ARCADE VAULT..."). El scaffold de create-next-app en `app/page.tsx` se reemplaza en el paso 6.
4. Crear `components/nav.tsx` portando `nav.jsx`: estado activo por `usePathname()`, navegación por `next/link`/`useRouter()`, usuario y logout desde `useSession()`, menú hamburguesa responsive con su propio `useState` de apertura.
5. Crear `components/game-card.tsx` portando el efecto tilt-hover de `biblioteca.jsx`.
6. Implementar `app/page.tsx` (Biblioteca): buscador + chips de categoría (estado local) + grid de `GameCard`, cada una enlazando a `/juegos/[id]`.
7. Implementar `app/juegos/[id]/page.tsx` (Detalle): busca el juego por `id` en `GAMES`, muestra portada/tags/descripción/stats/leaderboard (`seededScores`) y los botones "Jugar ahora" (`/juegos/[id]/jugar`) y "Volver al Vault" (`/`).
8. Implementar `app/juegos/[id]/jugar/page.tsx` (Reproductor): HUD, CRT animado, simulación de puntuación por intervalo, pausa, botón "Fin", modal de fin de partida con input de iniciales y `saveScore()`, tal como en `reproductor.jsx`.
9. Implementar `app/iniciar-sesion/page.tsx` (Auth): tabs iniciar/crear cuenta, botón "Jugar como invitado", botones sociales decorativos; al enviar el formulario llama a `useSession().login()` y redirige a `/`.
10. Implementar `app/salon-de-la-fama/page.tsx` (Salón): tabs por juego, podio top 3, tabla completa vía `seededScores`, y fila "tu mejor marca" si `useSession().user` existe.
11. Revisar que no queden residuos del scaffold original (`app/page.module.css` u otros archivos de create-next-app sin usar) y eliminarlos si aplica.
12. Verificación manual con `npm run dev`: recorrer las 5 pantallas, probar el menú hamburguesa (<840px), iniciar/cerrar sesión y confirmar que persiste tras recargar (F5), y guardar una puntuación en el Reproductor.

## Criterios de aceptación

- [ ] `/` renderiza la Biblioteca con buscador, chips de categoría y el grid de los 8 juegos de `lib/games-data.ts`.
- [ ] Cada tarjeta de juego navega a `/juegos/[id]` al hacer click en la tarjeta o en el botón "JUGAR".
- [ ] `/juegos/[id]` muestra portada, tags, descripción, stats y leaderboard mock; "JUGAR AHORA" navega a `/juegos/[id]/jugar`.
- [ ] `/juegos/[id]/jugar` muestra el HUD, la pantalla CRT animada, la puntuación sube automáticamente, "PAUSA" detiene el incremento y "FIN" abre el modal de fin de partida.
- [ ] En el modal de fin de partida se puede guardar la puntuación (persiste en `localStorage` bajo `av_scores`) y aparece el toast "PUNTUACIÓN GUARDADA_".
- [ ] `/iniciar-sesion` permite iniciar sesión, crear cuenta o entrar como invitado; iniciar sesión persiste el usuario en `localStorage` (`av_user`) y redirige a `/`.
- [ ] Con sesión iniciada, el Nav muestra el nombre del usuario en vez de "Iniciar Sesión" y permite cerrar sesión.
- [ ] `/salon-de-la-fama` muestra el podio (top 3), la tabla completa según el juego seleccionado (tabs) y, si hay sesión, la fila "tu mejor marca".
- [ ] El menú de navegación colapsa a hamburguesa por debajo de 840px de ancho y el panel lateral abre/cierra correctamente.
- [ ] Recargar la página (F5) en cualquier ruta conserva la sesión iniciada y muestra la pantalla correcta según la URL.
- [ ] No hay lógica real de ningún juego: el "gameplay" del Reproductor es únicamente la simulación visual ya definida (puntuación aleatoria por intervalo), sin mecánicas jugables ni input de control.

## Decisiones tomadas y descartadas

- **Rutas en español** (`/juegos/[id]`, `/iniciar-sesion`, `/salon-de-la-fama`) en vez de inglés — consistencia con que toda la UI está en español.
- **`/` es la Biblioteca directamente**, sin una ruta `/biblioteca` separada con redirect — igual que el comportamiento por defecto del prototipo, sin capa extra sin beneficio.
- **Persistencia solo en `localStorage` de cliente**, sin API routes ni backend stub — encaja con el alcance "solo visual, sin juego real"; se descarta agregar andamiaje de backend que el MVP no pide.
- **Reproductor idéntico al template** (con su simulación automática de puntuación) — se descarta una versión "más estática" porque la simulación ya cumple "no implementar ningún juego" y es la experiencia que el usuario pidió portar.
- **Componentes compartidos en `components/`** en vez de colocados por ruta — permite reutilizar `Nav` y `GameCard` entre pantallas sin duplicar código.
- **Botones sociales/olvidé-contraseña puramente decorativos**, sin estado "próximamente" — se descarta agregar feedback que el template no tiene, ya que el alcance es visual y no interactivo en ese punto.
- **Se introduce un Context (`UserProvider`) para la sesión** — se descarta prop-drilling porque el App Router no tiene un componente raíz único como `app.jsx` del prototipo; cada ruta es independiente.
- **El Salón de la Fama no lee `av_scores` real** — sigue usando `seededScores` mock, igual que el template; se descarta agregar lógica de agregación de puntuaciones reales porque no estaba en el prototipo ni la pidió el usuario.
- **Sin rediseño visual**: no se invocan `/frontend-design` ni `/ui-ux-pro-max` porque el diseño ya fue portado a `globals.css`/`layout.tsx` en un commit anterior y este spec es sobre implementar pantallas, no rediseñarlas.

## Riesgos identificados

- **Hidratación SSR/cliente:** leer `localStorage` (usuario, puntuaciones) durante el render inicial puede causar mismatches de hidratación en Next.js. Mitigación: `UserProvider` y cualquier lectura de `localStorage` deben ocurrir dentro de `useEffect`, nunca durante el render inicial del Server/Client Component.
- **Persistencia frágil:** al ser solo `localStorage`, la sesión y las puntuaciones guardadas no sobreviven a borrar datos del navegador ni se comparten entre dispositivos. Aceptable para este MVP visual; documentado aquí para no sorprender en specs futuros que sí requieran backend.
