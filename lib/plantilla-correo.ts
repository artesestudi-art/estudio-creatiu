import { ESTUDIO, horarioEn, real } from '@/data/estudio'

/**
 * La plantilla de los correos de la web: una sola, para los cuatro avisos.
 *
 * Un correo no es una página. Lo que aquí hay de raro lo pide el medio:
 *
 * - **Tablas y estilos en línea.** Outlook (el de escritorio, que sigue
 *   usándose) pinta con el motor de Word: ni `flex`, ni `grid`, ni hojas de
 *   estilo. Todo lo que no vaya en un `style=` de la propia etiqueta se
 *   pierde, y lo que no sea una tabla se descoloca.
 * - **El logotipo es un PNG, no el SVG de la web.** Gmail y Outlook no pintan
 *   SVG. Va con `alt`, así que quien tenga las imágenes bloqueadas —Outlook lo
 *   hace de serie— lee «art-és · Espai Creatiu» y el correo sigue
 *   entendiéndose. Está sobre el crema de la marca, el mismo del cuerpo, para
 *   que no se vea el recuadro de la imagen.
 * - **Colores de la marca, y solo el marino lleva texto.** Sobre el crema, el
 *   marino da 8,19:1 y el azul de las etiquetas 4,8:1; la mostaza daría 1,79:1
 *   y es decoración, nunca letra ([[la paleta es pastel]]).
 * - **`color-scheme: light`**: sin esto, el modo oscuro de Gmail y Apple Mail
 *   invierte los colores a su gusto y el crema se vuelve un marrón sucio.
 * - **Texto de anticipo (`preheader`)**: es la línea que la bandeja enseña
 *   junto al asunto. Si no se pone, el cliente de correo coge la primera
 *   frase, que suele ser «Ver este correo en el navegador» o el nombre del
 *   estudio repetido.
 * - **Cada correo lleva su versión en texto plano.** Los filtros de spam
 *   desconfían del HTML a secas, y hay quien lee el correo en texto.
 */

const MARINO = '#14488b'
const CREMA = '#f9f5d7'
const FONDO = '#efe8cc'
const ARENA = '#d0c8b1'
/** Azul apagado para etiquetas y pie: 4,8:1 sobre el crema. */
const AZUL_SUAVE = '#4c6f9c'

const LOGO =
  'https://jgkfdqocjinx1mqn.public.blob.vercel-storage.com/correo/logo-artes-Nmy3SmgKK9Q6F2D6L6faUlWJykrkE3.png'

/** Una pila de palos secos geométricos: Jost no existe en el correo, así que
 *  se pide lo más parecido que traiga cada sistema y se acaba en `sans-serif`. */
const TIPOS = "Jost,'Century Gothic','Futura','Avenir Next',Avenir,'Segoe UI',system-ui,sans-serif"

export function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Una fila de datos: etiqueta a la izquierda, valor en marino. Las vacías no
 *  se pintan, que un «Teléfono: —» no informa de nada. */
export function filas(datos: [string, string | null | undefined][]): string {
  return datos
    .filter(([, valor]) => valor && String(valor).trim())
    .map(
      ([etiqueta, valor]) => `
        <tr>
          <td style="padding:7px 16px 7px 0;font-size:14px;color:${AZUL_SUAVE};vertical-align:top;white-space:nowrap">${escapar(
            etiqueta,
          )}</td>
          <td style="padding:7px 0;font-size:15px;color:${MARINO};font-weight:600">${escapar(
            String(valor),
          ).replace(/\n/g, '<br>')}</td>
        </tr>`,
    )
    .join('')
}

/** Un botón que también se ve en Outlook: es una tabla, no un `<a>` con
 *  `padding`, que allí se queda sin relleno y parece un enlace suelto. */
export function boton(url: string, texto: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px">
      <tr>
        <td align="center" bgcolor="${MARINO}" style="border-radius:999px">
          <a href="${escapar(url)}"
             style="display:inline-block;padding:14px 26px;font-family:${TIPOS};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px">${escapar(
               texto,
             )}</a>
        </td>
      </tr>
    </table>`
}

/**
 * Envuelve el contenido con la cabecera, el marco y el pie.
 *
 * `interno` distingue los dos públicos: los avisos que lee el estudio no
 * necesitan que se le recuerde su propia dirección ni el horario, y sí que se
 * vea de un golpe de dónde sale el mensaje.
 */
export function maquetar(opciones: {
  anticipo: string
  titulo?: string
  cuerpo: string
  interno?: boolean
  idioma?: 'es' | 'ca'
}): string {
  const idioma = opciones.idioma ?? 'es'
  const nombre = real(ESTUDIO.nombre) ?? 'Artés Espai Creatiu'
  const web = ESTUDIO.url.replace(/^https?:\/\//, '')
  const telefono = real(ESTUDIO.contacto.telefono)
  const direccion = [
    real(ESTUDIO.direccion.calle),
    [real(ESTUDIO.direccion.codigoPostal), real(ESTUDIO.direccion.localidad)]
      .filter(Boolean)
      .join(' '),
  ]
    .filter(Boolean)
    .join(' · ')

  const pie = opciones.interno
    ? `Lo manda el formulario de <a href="${ESTUDIO.url}" style="color:${AZUL_SUAVE}">${escapar(
        web,
      )}</a>. Se gestiona en <a href="${ESTUDIO.url}/admin" style="color:${AZUL_SUAVE}">el panel</a>.`
    : [
        escapar(nombre),
        direccion ? escapar(direccion) : '',
        telefono ? escapar(telefono) : '',
        `<a href="${ESTUDIO.url}" style="color:${AZUL_SUAVE};text-decoration:underline">${escapar(
          web,
        )}</a>`,
        real(horarioEn(idioma)) ? escapar(horarioEn(idioma)) : '',
      ]
        .filter(Boolean)
        .join(' · ')

  return `<!doctype html>
<html lang="${idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapar(opciones.titulo || nombre)}</title>
</head>
<body style="margin:0;padding:0;background:${FONDO};color-scheme:light">
  <!-- El anticipo: lo que se lee en la bandeja al lado del asunto. Va oculto. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapar(opciones.anticipo)}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${FONDO}">
    <tr>
      <td align="center" style="padding:28px 14px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560"
               style="width:100%;max-width:560px;background:${CREMA};border:1px solid ${ARENA};border-radius:16px">
          <tr>
            <td style="padding:26px 30px 0">
              <a href="${ESTUDIO.url}" style="text-decoration:none">
                <img src="${LOGO}" alt="${escapar(nombre)}" width="170"
                     style="display:block;width:170px;max-width:60%;height:auto;border:0">
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 30px 30px;font-family:${TIPOS};color:${MARINO}">
              ${
                opciones.titulo
                  ? `<h1 style="margin:0 0 18px;font-family:${TIPOS};font-size:23px;line-height:1.25;font-weight:600;color:${MARINO}">${escapar(
                      opciones.titulo,
                    )}</h1>`
                  : ''
              }
              ${opciones.cuerpo}
            </td>
          </tr>
          <tr>
            <td style="padding:0 30px 26px">
              <div style="border-top:1px solid ${ARENA};padding-top:16px;font-family:${TIPOS};font-size:13px;line-height:1.6;color:${AZUL_SUAVE}">
                ${pie}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Un párrafo del cuerpo, con la medida y el color ya puestos. */
export function parrafo(html: string, opciones?: { suave?: boolean }): string {
  return `<p style="margin:0 0 15px;font-family:${TIPOS};font-size:16px;line-height:1.6;color:${
    opciones?.suave ? AZUL_SUAVE : MARINO
  }">${html}</p>`
}

/** La tabla de datos de los avisos internos. */
export function tablaDatos(datos: [string, string | null | undefined][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 6px">${filas(
    datos,
  )}</table>`
}

/** Pasa a texto plano lo que se ha escrito en HTML: los filtros de spam
 *  desconfían de un correo que solo trae HTML, y hay quien lo lee en texto. */
export function aTexto(lineas: (string | null | undefined)[]): string {
  return lineas
    .filter((l) => l && String(l).trim())
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
}
