import { Resend } from 'resend'
import { ESTUDIO, real } from '@/data/estudio'
import { aTexto, boton, escapar, maquetar, parrafo, tablaDatos } from '@/lib/plantilla-correo'

/**
 * Avisos por correo, con la cuenta de Resend DEL CLIENTE.
 *
 * A nombre del cliente y no de la agencia por dos motivos: Resend suspende por
 * multicuenta (ya cayó una del grupo y se llevó por delante el envío de esa
 * web), y porque el responsable de esos datos personales es el estudio, no
 * quien le hace la web.
 *
 * Nada de lo que hay aquí puede tumbar un formulario: si el envío falla, quien
 * llama es quien ya ha guardado la petición en la base de datos, y lo único
 * que pasa es que el panel la marca como «no avisada».
 *
 * La maqueta de los cuatro correos está en `lib/plantilla-correo.ts`, con el
 * porqué de cada rareza del medio (tablas, PNG en vez de SVG, anticipo…).
 */

export type ResultadoEnvio = { ok: true } | { ok: false; motivo: string }

function cliente(): Resend | null {
  const clave = process.env.RESEND_API_KEY
  if (!clave) return null
  return new Resend(clave)
}

/** El remitente TIENE que ser del dominio verificado en Resend. Un Gmail ahí
 *  es la vía rápida a la carpeta de spam, porque ningún SPF lo respalda. */
function remitente(): string {
  return process.env.CORREO_REMITENTE || `web@${ESTUDIO.dominio}`
}

function destinoAvisos(): string {
  return process.env.CORREO_AVISOS || ESTUDIO.contacto.emailAvisos
}

async function enviar(opciones: {
  para: string
  asunto: string
  html: string
  /** Versión en texto plano. Va siempre: un correo solo-HTML huele a spam. */
  texto: string
  responderA?: string
}): Promise<ResultadoEnvio> {
  const resend = cliente()
  if (!resend) return { ok: false, motivo: 'Falta RESEND_API_KEY' }

  try {
    const { error } = await resend.emails.send({
      from: `${ESTUDIO.nombre} <${remitente()}>`,
      to: opciones.para,
      subject: opciones.asunto,
      html: opciones.html,
      text: opciones.texto,
      replyTo: opciones.responderA,
    })
    if (error) return { ok: false, motivo: error.message || 'Resend devolvió un error' }
    return { ok: true }
  } catch (e) {
    return { ok: false, motivo: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

/* ─────────────── Aviso al estudio: nueva inscripción ─────────────── */

export type DatosInscripcion = {
  id: number
  nombre: string
  email: string
  telefono: string | null
  /** Cuando la plaza es para un menor, quien escribe es el tutor. */
  alumno: string | null
  alumnoEdad: string | null
  curso: string
  convocatoria: string | null
  modalidad: string | null
  experiencia: string | null
  mensaje: string | null
  origen: string
  /** Lo que opinó reCAPTCHA, si hubo algo raro. */
  antispam: string | null
  prefijoAsunto: string
}

/** El HTML del aviso, aparte del envío: así se puede ver sin mandar nada. */
export function htmlInscripcion(datos: DatosInscripcion): { html: string; texto: string } {
  const campos: [string, string | null][] = [
    ['Alumno', datos.alumno],
    ['Edad o curso', datos.alumnoEdad],
    [datos.alumno ? 'Tutor' : 'Nombre', datos.nombre],
    ['Correo', datos.email],
    ['Teléfono', datos.telefono],
    ['Convocatoria', datos.convocatoria],
    ['Modalidad', datos.modalidad],
    ['Experiencia', datos.experiencia],
    ['Mensaje', datos.mensaje],
    ['Página', datos.origen],
    ['Antispam', datos.antispam],
  ]

  const html = maquetar({
    anticipo: `${datos.nombre} pide plaza en ${datos.curso}`,
    titulo: datos.curso,
    interno: true,
    cuerpo: `
      ${parrafo(`Inscripción <strong>#${datos.id}</strong> · plaza pedida desde la web.`, {
        suave: true,
      })}
      ${tablaDatos(campos)}
      ${parrafo(
        'Si respondes a este correo, le llega directamente a quien se ha apuntado.',
        { suave: true },
      )}`,
  })

  const texto = aTexto([
    `Nueva inscripción #${datos.id} · ${datos.curso}`,
    '',
    ...campos.filter(([, v]) => v && v.trim()).map(([e, v]) => `${e}: ${v}`),
    '',
    `Panel: ${ESTUDIO.url}/admin`,
  ])

  return { html, texto }
}

export async function avisarInscripcion(datos: DatosInscripcion): Promise<ResultadoEnvio> {
  const { html, texto } = htmlInscripcion(datos)
  return enviar({
    para: destinoAvisos(),
    asunto: `${datos.prefijoAsunto}Nueva inscripción · ${datos.curso} · ${datos.nombre}`,
    html,
    texto,
    // Responder al correo lleva directo al alumno, sin copiar y pegar.
    responderA: datos.email,
  })
}

/* ─────────────── Acuse de recibo al alumno ─────────────── */

export type DatosAcuse = {
  nombre: string
  email: string
  curso: string
  convocatoria: string | null
}

export function htmlAcuse(datos: DatosAcuse): { html: string; texto: string } {
  const telefono = real(ESTUDIO.contacto.telefono)
  const grupo = datos.convocatoria ? ` (${escapar(datos.convocatoria)})` : ''

  const html = maquetar({
    anticipo: `Tenemos tu solicitud de plaza en ${datos.curso}. Te escribimos para confirmarla.`,
    titulo: 'Hemos recibido tu solicitud',
    cuerpo: `
      ${parrafo(`Hola ${escapar(datos.nombre)},`)}
      ${parrafo(
        `Hemos recibido tu solicitud de plaza en <strong>${escapar(datos.curso)}</strong>${grupo}.`,
      )}
      ${parrafo(
        'Todavía no es una matrícula: revisamos las plazas y te escribimos para confirmarte si hay sitio y cómo formalizarla.',
      )}
      ${parrafo(
        `Si necesitas contarnos algo antes, responde a este correo${
          telefono ? ` o llámanos al ${escapar(telefono)}` : ''
        }.`,
      )}`,
  })

  const texto = aTexto([
      `Hola ${datos.nombre},`,
      '',
      `Hemos recibido tu solicitud de plaza en ${datos.curso}${
        datos.convocatoria ? ` (${datos.convocatoria})` : ''
      }.`,
      '',
      'Todavía no es una matrícula: revisamos las plazas y te escribimos para confirmarte si hay sitio y cómo formalizarla.',
      '',
      `Si necesitas contarnos algo antes, responde a este correo${
        telefono ? ` o llámanos al ${telefono}` : ''
      }.`,
      '',
    ESTUDIO.nombre,
    ESTUDIO.url,
  ])

  return { html, texto }
}

export async function acusarInscripcion(datos: DatosAcuse): Promise<ResultadoEnvio> {
  const { html, texto } = htmlAcuse(datos)
  return enviar({
    para: datos.email,
    asunto: `Hemos recibido tu solicitud · ${datos.curso}`,
    html,
    texto,
    responderA: destinoAvisos(),
  })
}

/* ─────────────── Reseña al terminar el curso ─────────────── */

const TEXTOS_RESENA = {
  es: {
    asunto: (curso: string) => `¿Qué tal ${curso}? Nos ayudas con una reseña`,
    anticipo: 'Un minuto y nos ayudas mucho: cuenta cómo ha ido el curso.',
    titulo: 'Gracias por este curso',
    hola: 'Hola',
    terminado: (curso: string, alumno: string | null) =>
      alumno
        ? `Ya ha terminado <strong>${curso}</strong> y queremos daros las gracias por confiarnos a ${alumno}.`
        : `Ya ha terminado <strong>${curso}</strong> y queremos darte las gracias por venir al taller.`,
    pedir:
      'Somos un estudio pequeño y lo que más nos ayuda es que otras personas lean cómo ha ido. Si tienes un minuto, ¿nos dejas una reseña?',
    boton: 'Dejar una reseña',
    cierre: 'Y si algo no fue como esperabas, respóndenos a este correo: lo leemos.',
  },
  ca: {
    asunto: (curso: string) => `Què tal ${curso}? Ens ajudes amb una ressenya`,
    anticipo: 'Un minut i ens ajudes molt: explica com ha anat el curs.',
    titulo: 'Gràcies per aquest curs',
    hola: 'Hola',
    terminado: (curso: string, alumno: string | null) =>
      alumno
        ? `Ja ha acabat <strong>${curso}</strong> i volem donar-vos les gràcies per confiar-nos ${alumno}.`
        : `Ja ha acabat <strong>${curso}</strong> i volem donar-te les gràcies per venir al taller.`,
    pedir:
      'Som un estudi petit i el que més ens ajuda és que altres persones llegeixin com ha anat. Si tens un minut, ens deixes una ressenya?',
    boton: 'Deixar una ressenya',
    cierre: 'I si alguna cosa no va anar com esperaves, respon aquest correu: el llegim.',
  },
}

export type DatosResena = {
  nombre: string
  email: string
  /** Si la plaza era de un menor, `nombre` es el tutor y este es el alumno. */
  alumno: string | null
  curso: string
  url: string
  idioma: 'es' | 'ca'
}

export function htmlResena(datos: DatosResena): { html: string; texto: string } {
  const t = TEXTOS_RESENA[datos.idioma]
  const curso = escapar(datos.curso)

  const html = maquetar({
    anticipo: t.anticipo,
    titulo: t.titulo,
    idioma: datos.idioma,
    cuerpo: `
      ${parrafo(`${t.hola} ${escapar(datos.nombre)},`)}
      ${parrafo(t.terminado(curso, datos.alumno ? escapar(datos.alumno) : null))}
      ${parrafo(t.pedir)}
      ${boton(datos.url, t.boton)}
      ${parrafo(t.cierre, { suave: true })}`,
  })

  const texto = aTexto([
      `${t.hola} ${datos.nombre},`,
      '',
      t
        .terminado(datos.curso, datos.alumno)
        .replace(/<[^>]+>/g, ''),
      '',
      t.pedir,
      '',
      datos.url,
      '',
    t.cierre,
    '',
    ESTUDIO.nombre,
  ])

  return { html, texto }
}

export async function pedirResena(datos: DatosResena): Promise<ResultadoEnvio> {
  const t = TEXTOS_RESENA[datos.idioma]
  const { html, texto } = htmlResena(datos)
  return enviar({
    para: datos.email,
    asunto: t.asunto(datos.curso),
    html,
    texto,
    responderA: destinoAvisos(),
  })
}

/* ─────────────── Aviso al estudio: contacto ─────────────── */

export type DatosContacto = {
  id: number
  nombre: string
  email: string
  telefono: string | null
  asunto: string | null
  mensaje: string
  origen: string
  antispam: string | null
  prefijoAsunto: string
}

export function htmlContacto(datos: DatosContacto): { html: string; texto: string } {
  const campos: [string, string | null][] = [
    ['Nombre', datos.nombre],
    ['Correo', datos.email],
    ['Teléfono', datos.telefono],
    ['Mensaje', datos.mensaje],
    ['Página', datos.origen],
    ['Antispam', datos.antispam],
  ]

  const html = maquetar({
    anticipo: `${datos.nombre}: ${datos.mensaje.slice(0, 90)}`,
    titulo: datos.asunto || 'Contacto desde la web',
    interno: true,
    cuerpo: `
      ${parrafo(`Mensaje <strong>#${datos.id}</strong> del formulario de contacto.`, {
        suave: true,
      })}
      ${tablaDatos(campos)}
      ${parrafo('Si respondes a este correo, le llega directamente a quien escribe.', {
        suave: true,
      })}`,
  })

  const texto = aTexto([
      `Contacto web #${datos.id} · ${datos.asunto || 'sin asunto'}`,
      '',
      ...campos.filter(([, v]) => v && v.trim()).map(([e, v]) => `${e}: ${v}`),
      '',
    `Panel: ${ESTUDIO.url}/admin`,
  ])

  return { html, texto }
}

export async function avisarContacto(datos: DatosContacto): Promise<ResultadoEnvio> {
  const { html, texto } = htmlContacto(datos)
  return enviar({
    para: destinoAvisos(),
    asunto: `${datos.prefijoAsunto}Contacto web · ${datos.nombre}`,
    html,
    texto,
    responderA: datos.email,
  })
}
