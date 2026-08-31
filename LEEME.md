# Estudio de artes — web + panel

Web one-page con página propia por curso, panel de gestión para el cliente y
formularios (inscripción, contacto, newsletter) que aterrizan en base de datos.

**Estado: sin publicar.** Faltan los datos reales del estudio. El `npm run build`
se niega a compilar hasta que estén: es a propósito.

---

## Lo primero: rellenar `data/estudio.ts`

Quedan **12 campos** marcados `PENDIENTE` (nombre, dominio, dirección y titular
ya están puestos). Ninguno se inventa:

- Un teléfono inventado son llamadas a un desconocido.
- Una dirección inventada tumba la ficha de Google Business por datos incoherentes.
- Una razón social o un NIF que falten incumplen la LSSI en el aviso legal.

```bash
npm run datos     # dice cuáles faltan
```

Mientras falte algo:

- `npm run build` para y no despliega.
- `robots.txt` bloquea a todos los buscadores.
- El título de la web dice «Estudio», nunca «PENDIENTE».

Para una previsualización interna (y solo eso): `PERMITIR_PENDIENTES=1 npm run build`.

---

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # y rellenar
npm run migrar                 # crea las tablas
npm run dev
```

Panel en `/admin`, con la contraseña de `ADMIN_CLAVE`.

### Variables

| Variable | Para qué | Sin ella |
|---|---|---|
| `DATABASE_URL` | Neon Postgres | La web no arranca |
| `ADMIN_CLAVE` | Entrar al panel | Nadie entra |
| `ADMIN_SECRETO` | Firma la cookie de sesión (≥24 caracteres) | Nadie entra |
| `RESEND_API_KEY` | Avisos por correo | Las peticiones **se guardan igual**, marcadas «aviso no enviado» |
| `CORREO_REMITENTE` | Remitente del dominio verificado | Los correos caen en spam |
| `CORREO_AVISOS` | Buzón que recibe las inscripciones | Se usa el de `data/estudio.ts` |
| `BLOB_READ_WRITE_TOKEN` | Subir imágenes desde el panel | El panel ofrece pegar una URL en su lugar |

`ADMIN_SECRETO` se genera con `openssl rand -hex 32`.

---

## Cuentas: TODAS a nombre del cliente

Ni Neon ni Resend cuelgan de las cuentas de la agencia.

- **Resend**: la abre el estudio con su tarjeta y verifica **su** dominio. Además
  de ser lo correcto (el responsable de esos datos personales es el estudio),
  evita la suspensión por multicuenta que ya se ha comido una web del grupo.
- **Neon**: proyecto propio del cliente, región **Fráncfort** (`aws-eu-central-1`),
  para que la base esté donde están las funciones (`fra1` en `vercel.json`).

> ⚠️ El proyecto Neon `estudio-artes` que existe hoy en la organización
> «reparto de flyers» es **un sandbox de desarrollo**. Al abrir la cuenta del
> cliente hay que migrar el esquema allí y **borrar el sandbox**, o el plan free
> se queda clavado en 10/10 proyectos.

### ⛔ La base de pruebas NO se copia a producción

El sandbox de desarrollo contiene un curso inventado («Cerámica: torno básico»,
impartido por una «Profesora de prueba») que existe solo para poder enseñar el
panel. Si la producción se monta volcando esta base, ese curso falso acaba
publicado con nombre de profesora incluido.

La producción se crea **vacía**:

```bash
DATABASE_URL=<la del cliente> node scripts/migrar.mjs
```

y el cliente mete sus cursos desde el panel. Nunca un `pg_dump` del sandbox.

### Ramas de Neon

`.env.local` apunta a la rama **`desarrollo`**, nunca a producción. La cadena de
producción vive solo en las variables de Vercel. Un `dev` apuntando a la base del
cliente escribe de verdad.

---

## Antes de publicar

```bash
npm run datos      # 0 pendientes
npm run vaciar     # borra inscripciones y mensajes de prueba (pide confirmación)
npm run build
```

`vaciar` no toca cursos ni contenidos: eso es trabajo del cliente.

---

## Dos idiomas: castellano y català

El **castellano es el principal** y vive en la raíz (`/`). El catalán cuelga de
`/ca`. No al revés y no con `/es`: cambiar la dirección del idioma principal
tira por la borda lo que ya esté posicionado.

| Castellano | Català |
|---|---|
| `/` | `/ca` |
| `/cursos/ceramica-torno-basico` | `/ca/cursos/ceramica-torn-basic` |
| `/privacidad`, `/aviso-legal` | `/ca/privacidad`, `/ca/aviso-legal` |

**La interfaz** —botones, etiquetas, mensajes de error— ya está traducida y vive
en `lib/idioma.ts`. **El contenido del estudio** se traduce desde el panel:

- **Cursos** → dentro de cada curso hay un bloque «Català».
- **Portada** → en Contenidos, la pestaña «Català».

### Lo que se enseña cuando algo no está traducido

Cae al castellano **campo a campo**, no de golpe. Si el titular está traducido y
las preguntas frecuentes no, la portada catalana sale con el titular en catalán
y las preguntas en castellano; no todo en castellano por culpa de una sección.

### Por qué un curso sin traducir NO entra en el sitemap catalán

Una página catalana que repite el texto castellano es contenido duplicado: las
dos URL compiten por la misma búsqueda y Google se queda con una. Por eso:

- Un curso entra en el sitemap catalán **solo si tiene título y resumen propios**.
- Mientras no los tenga, `/ca/cursos/…` se sirve igual (para no dar un 404 a
  quien navega en catalán) pero con `noindex`.
- El `hreflang` catalán solo se declara cuando la traducción existe.

Se puede comprobar de un vistazo: `/sitemap.xml` debe listar la URL catalana de
los cursos traducidos y de ninguno más.

### El `lang` de la página

Va en un contenedor, no en la etiqueta `<html>`. En Next solo el layout raíz
pinta `<html>`, y hacer que varíe por ruta obliga a leer cabeceras, lo que
volvería dinámica toda la web y se llevaría por delante el cacheado. En un
contenedor es HTML válido y los lectores de pantalla lo respetan igual.

---

## Qué gestiona el cliente sin tocar código

| Sección del panel | Qué hace |
|---|---|
| Resumen | Cuántas inscripciones sin atender, qué curso tira, avisos de correo fallidos |
| Inscripciones | Bandeja con estados, notas internas, exportar a CSV |
| Mensajes | Formulario de contacto, mismo flujo |
| Cursos | Crear, editar, publicar, precios, imágenes, convocatorias con aforo y la versión catalana |
| Contenidos | Todos los textos e imágenes de la portada, en los dos idiomas |
| Newsletter | Lista de correos, exportar a CSV |

**Una sección vacía no se pinta.** Es deliberado: mejor una web con menos bloques
que una con huecos rellenos de texto de mentira.

---

## El flotante de WhatsApp

Aparece abajo a la derecha y abre un panel para **elegir curso** antes de saltar
a WhatsApp; el mensaje va escrito («Hola, me gustaría información sobre el curso
«…».»). En la página de un curso no pregunta: ya sabe cuál es y va directo. En
catalán, el mensaje va en catalán.

**No aparece hasta que hay número real** en `data/estudio.ts`. Un flotante que
abre un chat con un número inventado es peor que no tenerlo.

### Se esconde solo en tres momentos, y es lo importante

Un flotante mal hecho **tapa los campos del formulario**. Ya ha pasado en otras
webs del grupo. Este desaparece cuando:

1. **El formulario está en pantalla.** Ahí ya hay un botón de enviar; el
   flotante solo puede tapar el último campo o el propio botón.
2. **Hay un campo enfocado.** En el móvil eso significa teclado abierto, y el
   flotante se queda encima de lo que se está escribiendo.
3. **No se ha bajado nada todavía.** Aparecer sobre el titular de portada es de
   web de plantilla.

Está verificado en móvil: con el formulario a la vista hay un solape geométrico
con un campo, pero el botón está en opacidad 0 y sin capturar toques, así que no
estorba. Si algún día se toca este componente, **hay que volver a comprobar
justo eso**.

---

## Decisiones que parecen raras y no lo son

**El lead se guarda ANTES de avisar.** Si Resend falla, la inscripción sigue en la
base y el panel la marca. Al revés, un correo en spam se lleva por delante un
alumno sin dejar rastro.

**Trampa para robots en vez de reCAPTCHA.** Cuando el token de reCAPTCHA no carga
o caduca, el formulario deja de enviar y se pierden leads en silencio.

**El título del curso se copia en la inscripción.** Si el cliente borra un curso,
las peticiones siguen diciendo a qué se apuntó cada persona.

**Las plazas ocupadas cuentan solo «aceptada» y «matriculada».** Una solicitud
nueva no reserva sitio; contarla marcaría el curso como completo por gente que
nunca contestó.

**El `lastmod` del sitemap sale de la fecha de edición, no del build.** Si cada
despliegue dice que toda la web cambió, Google deja de creerse el dato.

**El JSON-LD va con `<script>` normal, no con `<Script>` de Next.** El componente
de Next lo inyecta desde JavaScript y el HTML que lee Google sale sin schema.

**La baja de la newsletter marca, no borra.** Si se borrara, la siguiente
importación de correos volvería a apuntar a esa persona.

**Sin botón flotante de WhatsApp.** Tapa los campos del formulario en móvil.

---

## Lo que NO entra en el presupuesto de 3.100 €

El **área privada del alumno** (login, sus inscripciones, materiales, avisos).
Necesita usuarios, autenticación, recuperación de contraseña y su propio
tratamiento RGPD. Se presupuesta aparte.

La base ya está preparada para ello: las inscripciones guardan correo y estado,
así que añadirla después no obliga a rehacer nada.
