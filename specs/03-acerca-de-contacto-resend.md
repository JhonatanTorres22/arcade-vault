# 03 — Acerca de (About) y envío real de correo de contacto con Resend

**Estado:** IMPLEMENTADO
**Depende de:** SPEC 02
**Fecha:** 2026-09-19

**Objetivo:** Implementar la pantalla "Acerca de" (`/acerca-de`) portando 1:1 `references/templates/home-about/about.jsx`, conectando su formulario de contacto a un envío real de correo mediante Resend.

## Alcance

**Incluye:**

- Nueva ruta `/acerca-de` (`app/acerca-de/page.tsx`), port 1:1 en diseño desde `references/templates/home-about/about.jsx`:
  - Sección `about-hero`: kicker "▸ ACERCA DE", título "ACERCA DE ARCADE VAULT", párrafo de misión y `highlight-row` con los 3 highlights (HEART / BROWSER / PLANT) usando `HighlightIcon` como función local del archivo, igual que el patrón de `FeatureIcon` en el home de SPEC 02.
  - Divider animado `about-divider` (barra + pixeles parpadeantes), idéntico al template.
  - Sección `about-contact`: columna de intro (kicker, título, texto, tips de respuesta/sugerencias/sin-spam) y el formulario de contacto (Nombre, Correo Electrónico, Mensaje).
  - Animación `reveal`/`IntersectionObserver` al hacer scroll (`useReveal`), como hook local del archivo, mismo patrón que en `app/page.tsx` de SPEC 02.
- Envío real del formulario de contacto vía **Resend**:
  - Nuevo Route Handler `app/api/contact/route.ts` (`POST`) que valida los datos en el servidor y llama a `resend.emails.send(...)`.
  - El formulario llama a este endpoint con `fetch` en el `onSubmit`, reemplazando el `setSent` inmediato del prototipo.
  - Remitente: `onboarding@resend.dev` (dirección sandbox de Resend, sin necesidad de dominio propio verificado).
  - Destinatario: `process.env.CONTACT_EMAIL` (configurado en `.env.local` como `jhonatan.menesest@gmail.com`, no commiteado).
  - `replyTo` del correo enviado = correo ingresado por quien llena el formulario.
- Validación de formato de correo en cliente (regex simple) y en servidor, además del check existente de campos vacíos (con la animación `shake` ya presente en el template).
- Nuevo estado de carga: mientras se espera la respuesta del endpoint, el botón de envío se deshabilita y muestra "ENVIANDO…".
- Nuevo estado de error (`terminal-error`, mismo estilo visual que `terminal-success`): si el endpoint responde con error, se muestra un bloque con la línea `[ERROR] No se pudo transmitir el paquete.` y un botón "REINTENTAR" que vuelve al formulario sin perder los datos ya escritos.
- Estado de éxito (`terminal-success`): idéntico al template, incluyendo la secuencia fija de líneas `Conectando con servidor…` / `Validando contenido…` / `Transmitiendo paquete…` y el mensaje final con el nombre de quien envió el mensaje.
- `.env.example` nuevo en la raíz del proyecto, con `RESEND_API_KEY=` y `CONTACT_EMAIL=` vacíos, documentando las variables requeridas.
- Nueva dependencia `resend` (`npm install resend`) en `package.json`.
- Port de las clases CSS relacionadas (`about`, `about-hero`, `highlight-row`, `about-divider`, `about-contact`, `contact-form`, `terminal-success` y las nuevas para `terminal-error`) desde `references/templates/home-about/styles.css` hacia `app/globals.css`.

**No incluye:**

- Server Action como mecanismo de envío: se descarta explícitamente a favor de un Route Handler (`app/api/contact/route.ts`) — decisión del usuario, ver Decisiones.
- Dominio propio verificado en Resend: se usa la dirección sandbox `onboarding@resend.dev`; migrar a un dominio propio queda para un spec futuro si se vuelve necesario.
- Protección anti-spam (honeypot, rate limiting, captcha): fuera de alcance para este spec, mismo criterio de MVP sin tráfico público usado en SPEC 01/02.
- Persistencia de los mensajes de contacto: no se guardan en `localStorage`, base de datos ni ningún otro almacenamiento — el único efecto de un envío exitoso es el correo enviado por Resend.
- Cambios a `components/nav.tsx`: el tab "Acerca de" y su lógica de `isActive("acerca")` ya existen desde SPEC 02 y ya apuntan a `/acerca-de`; no se toca este archivo.
- Cualquier otro contenido de "Acerca de" fuera de lo que ya trae `about.jsx` (por ejemplo equipo, historia detallada, blog): no existe en el template, no se inventa aquí.
- Rediseño visual: es un port fiel del prototipo, no pasa por `/frontend-design` ni `/ui-ux-pro-max`, igual que SPEC 01 y SPEC 02.
- Animar las líneas del terminal de éxito (`Conectando…`, `Validando…`, `Transmitiendo…`) para reflejar el progreso real del request: se mantienen como texto fijo, igual al template.

## Modelo de datos

Este feature no introduce estructuras persistentes. Sí define el contrato del nuevo endpoint:

```ts
// app/api/contact/route.ts

// Body esperado en el POST
type ContactRequestBody = {
  name: string;
  email: string;
  msg: string;
};

// Respuesta del endpoint
type ContactResponse =
  | { ok: true }
  | { ok: false; error: string };
```

Variables de entorno nuevas (documentadas en `.env.example`, con valores reales solo en `.env.local`, ya ignorado por git):

- `RESEND_API_KEY`: API key de Resend, usada para instanciar `new Resend(process.env.RESEND_API_KEY)` dentro del Route Handler.
- `CONTACT_EMAIL`: dirección destino de los mensajes de contacto (`jhonatan.menesest@gmail.com` en el `.env.local` de desarrollo).

## Plan de implementación

1. Ejecutar `npm install resend` y crear `.env.example` en la raíz con `RESEND_API_KEY=` y `CONTACT_EMAIL=` vacíos.
2. Portar a `app/globals.css` las clases `about`, `about-hero`, `about-mission`, `highlight-row`, `.highlight` (y sus variantes `cyan`/`magenta`/`green`), `about-divider`, `div-bar`, `div-pixels`, `about-contact`, `contact-grid`, `contact-intro`, `contact-tips`, `contact-form` (incluida `.shake`) y `terminal-success` desde `references/templates/home-about/styles.css`, agregando además una variante `terminal-error` (mismo estilo que `terminal-success` pero con acento rojo/magenta en vez de verde) para el nuevo estado de error.
3. Crear `app/acerca-de/page.tsx` (Client Component) con `about-hero`, `highlight-row` (`HighlightIcon` local con los casos HEART/BROWSER/PLANT) y el divider, port 1:1 de la parte superior de `about.jsx`, con el hook `useReveal` local.
4. Agregar a la misma página la sección `about-contact` con el formulario controlado (`name`, `email`, `msg`) y la columna de intro/tips, igual al template; mantener la validación de campos vacíos con `shake` y sumar validación de formato de correo (regex simple) antes de intentar el envío.
5. Crear `app/api/contact/route.ts`: `POST` que valida el body en el servidor (campos no vacíos + regex de email, respondiendo 400 si falla), instancia `Resend` con `RESEND_API_KEY`, y llama a `resend.emails.send({ from: "Arcade Vault <onboarding@resend.dev>", to: process.env.CONTACT_EMAIL, replyTo: email, subject: \`Nuevo mensaje de ${name}\`, text: msg })`, respondiendo `{ ok: true }` o `{ ok: false, error }` (500 si Resend falla).
6. Conectar el formulario al endpoint con `fetch("/api/contact", { method: "POST", ... })` en `onSubmit`: botón deshabilitado con texto "ENVIANDO…" mientras se espera la respuesta; en éxito se muestra `terminal-success` (con el nombre ingresado); en error se muestra `terminal-error` con botón "REINTENTAR" que vuelve al formulario sin perder los datos escritos.
7. Verificación manual con `npm run dev`: configurar `RESEND_API_KEY` y `CONTACT_EMAIL=jhonatan.menesest@gmail.com` reales en `.env.local`, enviar un mensaje real de prueba y confirmar que llega a esa bandeja con el `replyTo` correcto; forzar el caso de error (por ejemplo con una `RESEND_API_KEY` inválida temporalmente) para confirmar que aparece `terminal-error` con "REINTENTAR"; recorrer `/acerca-de` completo y confirmar que el tab "Acerca de" del nav ya no da 404 y queda activo, en desktop y en el panel móvil.

## Criterios de aceptación

- [ ] `/acerca-de` ya no da 404; renderiza el hero "ACERCA DE ARCADE VAULT", el párrafo de misión, los 3 highlights (HEART/BROWSER/PLANT) y el divider animado, igual al template.
- [ ] La sección de contacto renderiza el formulario (Nombre, Correo Electrónico, Mensaje) y el bloque de tips (respuesta 24-48h, sugerencias bienvenidas, sin spam).
- [ ] Enviar el formulario con algún campo vacío dispara la animación `shake` y no llama al endpoint `/api/contact`.
- [ ] Enviar el formulario con un correo de formato inválido (ej. `abc`) muestra el error de validación en el cliente sin llamar al endpoint.
- [ ] Con datos válidos, al enviar el botón se deshabilita y muestra "ENVIANDO…" mientras se espera la respuesta de `/api/contact`.
- [ ] Un envío exitoso ejecuta realmente `resend.emails.send` y el correo llega a la casilla configurada en `CONTACT_EMAIL`, con `replyTo` igual al correo ingresado en el formulario.
- [ ] Tras un envío exitoso se muestra la pantalla `terminal-success` con el nombre de quien envió el mensaje, igual al template, y el botón "ENVIAR OTRO MENSAJE" reinicia el formulario.
- [ ] Si `/api/contact` responde con error (por ejemplo `RESEND_API_KEY` inválida), se muestra `terminal-error` con un botón "REINTENTAR" que regresa al formulario sin perder los datos ya escritos.
- [ ] `.env.example` existe en la raíz con `RESEND_API_KEY=` y `CONTACT_EMAIL=` documentados y vacíos; no hay ningún valor real commiteado en el repositorio.
- [ ] El tab "Acerca de" del nav queda activo (resaltado) en `/acerca-de`, tanto en desktop como en el panel móvil (<840px).
- [ ] No hay errores en consola del navegador al recorrer `/acerca-de` ni al enviar el formulario, tanto en el caso de éxito como en el de error.

## Decisiones tomadas y descartadas

- **Route Handler (`app/api/contact/route.ts`) en vez de Server Action** — decisión explícita del usuario; se descarta el patrón `'use server'` aunque encaja igual de bien con Next 16, para tener un endpoint HTTP explícito.
- **Destinatario fijo vía `CONTACT_EMAIL=jhonatan.menesest@gmail.com`** en `.env.local` (no commiteado) — decisión explícita del usuario; se descarta hardcodear el correo directo en el código para no exponerlo en el repo ni acoplar el endpoint a un valor fijo.
- **Remitente sandbox `onboarding@resend.dev`** en vez de un dominio propio verificado — se descarta el dominio propio porque el proyecto no tiene ninguno verificado en Resend todavía; migrar es un cambio de una sola línea en un spec futuro si se vuelve necesario.
- **Validación de formato de correo en cliente y servidor** — se descarta mantener el template intacto (solo verificación de campos vacíos) porque ahora el envío es real: un correo mal escrito significaría una llamada desperdiciada a Resend y un `replyTo` inválido.
- **Estado de error explícito (`terminal-error`) con reintento** — se descarta la opción de mostrar siempre éxito con el error solo en consola, por ser engañoso: el usuario debe saber si su mensaje no llegó.
- **Botón deshabilitado + "ENVIANDO…" durante el request** — se descarta dejar el formulario sin feedback de carga, ya que a diferencia del template original ahora hay una llamada de red real con latencia variable.
- **Protección anti-spam (honeypot, rate limiting) queda fuera de alcance** — mismo criterio que SPEC 01/02: proyecto MVP sin tráfico público real todavía; se puede agregar en un spec futuro si se vuelve necesario.
- **Las líneas del terminal de éxito no reflejan progreso real del request** — se mantienen como animación fija idéntica al template; se descarta instrumentarlas con pasos reales porque el envío es una sola llamada a Resend, sin fases intermedias observables, y agregar esa ilusión de progreso no aporta valor real.

## Riesgos identificados

| Riesgo | Mitigación |
| --- | --- |
| `RESEND_API_KEY` sin configurar en el entorno de quien corra el proyecto | `.env.example` documenta la variable requerida; sin ella, `/api/contact` responde con error controlado (`{ ok: false }`) y la UI muestra `terminal-error`, en vez de crashear el servidor. |
| La cuenta de Resend en modo sandbox (`onboarding@resend.dev`) puede tener límites de envío o restricciones sobre destinatarios en cuentas de prueba | Aceptado para este spec; documentado como decisión explícita — migrar a un dominio propio verificado si el límite se vuelve un problema real. |
| Mensajes de spam o abuso del formulario, al no tener protección anti-spam | Aceptado explícitamente fuera de alcance para este spec (ver Decisiones); revisar si se vuelve necesario cuando el proyecto tenga tráfico público real. |

## Lo que **no** está en este spec

- Server Action como mecanismo de envío (se usa Route Handler).
- Dominio propio verificado en Resend (se usa la dirección sandbox).
- Protección anti-spam (honeypot, rate limiting, captcha).
- Persistencia de los mensajes de contacto en cualquier almacenamiento.
- Cambios a `components/nav.tsx` (el tab "Acerca de" ya existe desde SPEC 02).
- Contenido adicional de "Acerca de" que no exista ya en `about.jsx` del template.
- Rediseño visual vía `/frontend-design` o `/ui-ux-pro-max`.

Cada uno de estos, si se necesita, va en su propio spec.
