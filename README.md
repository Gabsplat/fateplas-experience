# Fateplas · Cada capa cuenta

## Variante de materiales y movimiento

Rama `experience-material`, creada desde `redesign-industrial` en un worktree separado, `/home/gabsplat/Programming/Fateplas/web-experience`. La copia de `../web` conserva su rama y sus archivos. Esta variante se publica en [GitHub Pages, /fateplas-experience/](https://gabsplat.github.io/fateplas-experience/), desde el repositorio independiente [Gabsplat/fateplas-experience](https://github.com/Gabsplat/fateplas-experience).

Vista local: [Omarchy, puerto 22443](https://omarchy.tailff08b5.ts.net:22443/). El servicio temporal `fateplas-experience-preview.service` sirve `out/` en `127.0.0.1:4324`. El servicio dura hasta que se detenga o se reinicie la máquina. El formulario de esta vista es un placeholder, sin envío ni persistencia.

El hero presenta un estudio conceptual de material flexible con WebGPU y [vgpu 0.5 de Vercel Labs](https://github.com/vercel-labs/vgpu). Sus shaders WGSL producen cuatro efectos: luz rasante con el cursor, relieve y microsombras del tejido, láminas flexibles que se ensamblan y separan, y un barrido bordó al seleccionar una capa. Cubierta, Matriz y Soporte corresponden a poliéster, PVC y poliéster tejido. La escena usa geometría teselada, profundidad y MSAA4; se carga cuando entra en pantalla y limita la densidad a 1,5. Las dependencias de esta copia están instaladas por separado.

El ciclo dura 12 segundos y el cursor usa un resorte. El renderer se detiene fuera de pantalla, al ocultar la pestaña y al pausar; con movimiento reducido presenta una vista estática abierta. La selección por teclado es inmediata. Si WebGPU no está disponible o falla el dispositivo, se muestra la escena SVG. El diagrama técnico original sigue completo e inmóvil en la sección de materiales.

El film local de 12 segundos anima tres fotografías ya presentes en el proyecto, con una banda sonora sintetizada y silenciada por defecto. No es una filmación de la planta de Fateplas. Se puede regenerar con `python scripts/make-material-film.py`, que requiere ffmpeg. El MP4 pesa aproximadamente 1,6 MB. El selector prepara la consulta con la marca y el modelo, y conserva un mensaje o nombre que el visitante ya haya escrito.

Referencias de diseño: [Hardware Operations](https://hardwareoperations.com/) y [Teenage Engineering](https://teenage.engineering/). Movimiento basado en [Good vs Great Animations de Emil Kowalski](https://emilkowal.ski/ui/good-vs-great-animations), las skills locales de Emil y la documentación de Motion.

Para compilar y comprobar esta variante:

```sh
FATEPLAS_PROJECT_ROOT=/home/gabsplat/Programming/Fateplas PAGES_BASE_PATH='' node scripts/build-pages.mjs
TEST_BASE_URL=http://127.0.0.1:4324 CHROMIUM_PATH=/usr/bin/chromium node node_modules/@playwright/test/cli.js test tests/experience.spec.ts tests/membrane.spec.ts
```

Para detener solo esta vista:

```sh
systemctl --user stop fateplas-experience-preview.service
tailscale serve --https=22443 off
```

## Antecedentes de la versión base

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

La membrana conserva el modelo del SVG de WordPress, que incluye una imagen raster con el corte y el tejido originales. La imagen se mantiene completa e inmóvil; zonas SVG superpuestas resaltan sus materiales al explorarlos. Motion explica la selección del material y suaviza la apertura de acordeones y el cambio de fotografías. Las acciones de teclado responden sin espera y las preferencias de movimiento reducido eliminan desplazamientos. La capa seleccionada se explica con una etiqueta técnica conectada al modelo. Los carruseles permiten navegar con flechas, teclado y gestos; el de prensas también incluye selección numerada. No se muestran controles de pausa.

Las decisiones de diseño y movimiento usan las [skills de Emil Kowalski](https://github.com/emilkowalski/skills) y [frontend-design de Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design), descubiertas con find-skills. Las fuentes instaladas se registran en `skills-lock.json`.
