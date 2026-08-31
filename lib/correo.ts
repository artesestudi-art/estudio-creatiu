import { Resend } from 'resend'
import { ESTUDIO } from '@/data/estudio'

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

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function tabla(filas: [string, string | null][]): string {
  return filas
    .filter(([, valor]) => valor && valor.trim())
    .map(
      ([etiqueta, valor]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${escapar(
          etiqueta,
        )}</td><td style="padding:6px 0"><strong>${escapar(valor!).replace(
          /\n/g,
          '<br>',
        )}</strong></td></tr>`,
    )
    .join('')
}

async function enviar(opciones: {
  para: string
  asunto: string
  html: string
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
      replyTo: opciones.responderA,
    })
    if (error) return { ok: false, motivo: error.message || 'Resend devolvió un error' }
    return { ok: true }
  } catch (e) {
    return { ok: false, motivo: e instanceof Error ? e.message : 'Error desconocido' }
  }
}

/* ─────────────── Aviso al estudio: nueva inscripción ─────────────── */

export async function avisarInscripcion(datos: {
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
}): Promise<ResultadoEnvio> {
  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;color:#111">
      <p style="margin:0 0 4px;font-size:13px;color:#666">Inscripción #${datos.id}</p>
      <h2 style="margin:0 0 18px;font-size:20px">${escapar(datos.curso)}</h2>
      <table style="border-collapse:collapse;font-size:15px">
        ${tabla([
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
        ])}
      </table>
      <p style="margin:22px 0 0;font-size:13px;color:#666">
        Gestiónala en el panel: ${escapar(ESTUDIO.url)}/admin
      </p>
    </div>`

  return enviar({
    para: destinoAvisos(),
    asunto: `Nueva inscripción · ${datos.curso} · ${datos.nombre}`,
    html,
    // Responder al correo lleva directo al alumno, sin copiar y pegar.
    responderA: datos.email,
  })
}

/* ─────────────── Acuse de recibo al alumno ─────────────── */

export async function acusarInscripcion(datos: {
  nombre: string
  email: string
  curso: string
  convocatoria: string | null
}): Promise<ResultadoEnvio> {
  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;color:#111">
      <p style="font-size:16px;margin:0 0 14px">Hola ${escapar(datos.nombre)},</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 14px">
        Hemos recibido tu solicitud de plaza en <strong>${escapar(datos.curso)}</strong>${
          datos.convocatoria ? ` (${escapar(datos.convocatoria)})` : ''
        }.
      </p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 14px">
        Todavía no es una matrícula: revisamos las plazas y te escribimos para
        confirmarte si hay sitio y cómo formalizarla.
      </p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px">
        Si necesitas contarnos algo antes, responde a este correo${
          ESTUDIO.contacto.telefono !== 'PENDIENTE'
            ? ` o llámanos al ${escapar(ESTUDIO.contacto.telefono)}`
            : ''
        }.
      </p>
      <p style="font-size:15px;color:#444;margin:0">${escapar(ESTUDIO.nombre)}</p>
    </div>`

  return enviar({
    para: datos.email,
    asunto: `Hemos recibido tu solicitud · ${datos.curso}`,
    html,
    responderA: destinoAvisos(),
  })
}

/* ─────────────── Aviso al estudio: contacto ─────────────── */

export async function avisarContacto(datos: {
  id: number
  nombre: string
  email: string
  telefono: string | null
  asunto: string | null
  mensaje: string
  origen: string
}): Promise<ResultadoEnvio> {
  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:560px;color:#111">
      <p style="margin:0 0 4px;font-size:13px;color:#666">Mensaje #${datos.id}</p>
      <h2 style="margin:0 0 18px;font-size:20px">${escapar(datos.asunto || 'Contacto desde la web')}</h2>
      <table style="border-collapse:collapse;font-size:15px">
        ${tabla([
          ['Nombre', datos.nombre],
          ['Correo', datos.email],
          ['Teléfono', datos.telefono],
          ['Mensaje', datos.mensaje],
          ['Página', datos.origen],
        ])}
      </table>
    </div>`

  return enviar({
    para: destinoAvisos(),
    asunto: `Contacto web · ${datos.nombre}`,
    html,
    responderA: datos.email,
  })
}
