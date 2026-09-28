# Fateplas · Rediseño

Rediseño de la landing de Fateplas con Next.js App Router, React, TypeScript y Motion. Dirección industrial clara inspirada en Topsoe, conservando la identidad rosa y las mecánicas de la página original. Las imágenes y fuentes se sirven desde este proyecto.

La versión original permanece en https://gabsplat.github.io/fateplas/. Esta variante se publica por separado en https://gabsplat.github.io/fateplas-redesign/.

## Desarrollo

Requiere Node.js 20.9 o superior y pnpm. Desde la raíz del proyecto:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

El servidor local usa el puerto 4320.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Con el servidor levantado, `pnpm test:e2e` prueba la web en escritorio, tablet y móvil. Instalar Chromium con `pnpm exec playwright install chromium` o indicar el navegador del sistema con `CHROMIUM_PATH=/usr/bin/chromium pnpm test:e2e`. Estas pruebas simulan los envíos de correo. `pnpm format:check` verifica el formato del código.

## Contacto

`POST /api/contact` valida los campos y guarda cada consulta en `data/contact/`, con un archivo JSON privado por consulta. La carpeta está excluida de Git y no se sirve por HTTP. `CONTACT_DATA_DIR` permite elegir otra ubicación persistente. El servidor requiere permisos de escritura en esa carpeta.

El identificador de cada envío permite reintentar sin duplicar el registro ni el correo. Un mismo identificador con otro contenido devuelve un conflicto. El formulario conserva el contenido cuando falla el envío.

Copiar `.env.example` a `.env.local` para configurar correo. Por defecto `CONTACT_EMAIL_PROVIDER=none` impide cualquier envío, incluso si existen credenciales en el entorno. Las credenciales deben quedar solo en el servidor.

Para Resend, establecer `CONTACT_EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `CONTACT_EMAIL_FROM` y `CONTACT_EMAIL_TO`. Antes de activarlo hace falta crear la cuenta y verificar el dominio remitente mediante sus registros DNS. La integración usa la API HTTP con tiempo límite e identificador de idempotencia, sin instalar otro SDK.

El [plan gratuito de Resend](https://resend.com/pricing), verificado el 28 de septiembre de 2026, incluye 3.000 correos al mes y hasta 100 por día. No se creó ninguna cuenta, suscripción ni configuración de envío real durante este desarrollo.

Como alternativa, `CONTACT_EMAIL_PROVIDER=smtp` usa `SMTP_HOST`, `CONTACT_EMAIL_FROM` y `CONTACT_EMAIL_TO`; las demás variables SMTP configuran puerto, TLS y autenticación.

El guardado local es la confirmación de recepción. Si el proveedor falla, la consulta sigue guardada y su campo `emailDelivery` queda en `failed`. No hay una cola de reintentos automática. Revisar las consultas con `failed` o `pending` antes de reenviarlas manualmente; un fallo durante la actualización del estado puede dejar `pending` aunque el proveedor haya aceptado el correo.

Para producción usar un servidor Node con almacenamiento persistente y copias de seguridad. Un filesystem efímero de una función serverless no conserva estas consultas entre despliegues.

## Demo en GitHub Pages

La demo del rediseño está en https://gabsplat.github.io/fateplas-redesign/.

```sh
PAGES_BASE_PATH=/fateplas-redesign pnpm build:pages
```

Este comando genera `out/` en una copia de compilación separada. Excluye las rutas API, usa el prefijo elegido en `PAGES_BASE_PATH` y activa el formulario placeholder. No guarda ni envía consultas; al pulsar el botón informa que el formulario aún no está habilitado. No requiere claves ni servicios externos de correo.

`PAGES_BASE_PATH` permite cambiar el prefijo al construir. El workflow `.github/workflows/pages.yml` publica automáticamente cada push a `main`. GitHub Pages debe estar configurado para GitHub Actions.

La aplicación Node conserva su API y persistencia con `pnpm build` y `pnpm start`. La exportación estática sirve los archivos de imagen originales porque Pages no ejecuta el optimizador de imágenes de Next.js.

Las capturas de comparación y los respaldos de WordPress no forman parte de este repositorio público.

## Criterios de implementación

La página y su contenido estático usan Server Components. El menú, los carruseles, el diagrama, los acordeones y el formulario usan componentes cliente. Las fuentes locales pasan por `next/font/local` y las imágenes de contenido por `next/image`.

La foto de las barricas conserva el archivo JPEG original, sin recomprimir, para respetar el detalle de la referencia. El resto de las imágenes de contenido usa la optimización de Next.js. El mapa conserva el iframe de Google Maps del sitio original; su contenido depende de ese servicio externo.

La revisión toma como referencia [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices), [Next.js Best Practices](https://github.com/vercel-labs/openreview/tree/main/.agents/skills/next-best-practices) y la documentación incluida con la versión instalada de Next.js.

## Diseño e interacción

La membrana es un SVG vectorial propio de tres capas. Motion explica la selección del material y suaviza la apertura de acordeones y el cambio de fotografías. Las acciones de teclado responden sin espera y las preferencias de movimiento reducido eliminan desplazamientos. Las fotos y los carruseles tienen controles de pausa.

Las decisiones de diseño y movimiento usan las [skills de Emil Kowalski](https://github.com/emilkowalski/skills) y [frontend-design de Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design), descubiertas con find-skills. Las fuentes instaladas se registran en `skills-lock.json`.
