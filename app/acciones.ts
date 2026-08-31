'use server'

import { randomBytes } from 'node:crypto'
import {
  cursoPorId,
  convocatoriaPorId,
  guardarInscripcion,
  guardarContacto,
  guardarSuscriptor,
  marcarAviso,
} from '@/lib/bd'
import { avisarInscripcion, acusarInscripcion, avisarContacto } from '@/lib/correo'

/**
 * Formularios públicos.
 *
 * El orden es siempre el mismo y es deliberado: **primero se guarda, después
 * se avisa**. Si el aviso fuera lo único que ocurre, un correo en spam o una
 * clave de Resend caducada se llevarían por delante la inscripción entera sin
 * dejar rastro. Guardando antes, lo peor que pasa es que el panel muestre la
 * petición marcada como «no avisada».
 *
 * Y nunca al revés: no se dice «gracias» sin haber guardado nada.
 */

export type EstadoFormulario = {
  ok: boolean
  mensaje: string
  campo?: string
  /**
   * Lo que la persona había escrito.
   *
   * React 19 vacía los formularios no controlados en cuanto termina una
   * acción, también cuando la acción devuelve un error. Sin esto, quien se
   * equivoca en el teléfono se encuentra el formulario en blanco y con el
   * mensaje largo que acababa de escribir perdido: la mitad no lo repite.
   * Devolviendo los valores, el formulario los vuelve a pintar.
   */
  valores?: Record<string, string>
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/
const TELEFONO_ES = /^(\+34|0034|34)?[\s.-]?[6-9](?:[\s.-]?\d){8}$/

function texto(datos: FormData, campo: string): string {
  return String(datos.get(campo) ?? '').trim()
}

/** Recorta antes de guardar: un mensaje de 2 MB pegado desde un bot llena la
 *  base de datos y no aporta nada que se pueda leer. */
function limitar(valor: string, max: number): string {
  return valor.length > max ? valor.slice(0, max) : valor
}

/* ────────────────────── Inscripción a un curso ────────────────────── */

export async function enviarInscripcion(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  // Campo trampa: los humanos no lo ven, los robots lo rellenan.
  if (texto(datos, 'empresa')) {
    // Se responde ok para no darle pistas al robot, pero no se guarda nada.
    return { ok: true, mensaje: 'Recibido.' }
  }

  const nombre = limitar(texto(datos, 'nombre'), 120)
  const email = limitar(texto(datos, 'email'), 160).toLowerCase()
  const telefono = limitar(texto(datos, 'telefono'), 40)
  const experiencia = limitar(texto(datos, 'experiencia'), 120)
  const esMenor = Boolean(datos.get('es_menor'))
  const alumnoNombre = limitar(texto(datos, 'alumno_nombre'), 120)
  const alumnoEdad = limitar(texto(datos, 'alumno_edad'), 60)
  const mensaje = limitar(texto(datos, 'mensaje'), 4000)
  const origen = limitar(texto(datos, 'origen') || '/', 200)
  const cursoId = Number(texto(datos, 'curso_id')) || null
  const convocatoriaId = Number(texto(datos, 'convocatoria_id')) || null

  // Se devuelve en CADA error para que el formulario se repinte con lo escrito.
  const valores = {
    nombre,
    email,
    telefono,
    es_menor: esMenor ? 'si' : '',
    alumno_nombre: alumnoNombre,
    alumno_edad: alumnoEdad,
    experiencia,
    mensaje,
    curso_id: cursoId ? String(cursoId) : '',
    convocatoria_id: convocatoriaId ? String(convocatoriaId) : '',
    consentimiento: datos.get('consentimiento') ? 'si' : '',
  }

  if (nombre.length < 2) {
    return {
      ok: false,
      mensaje: esMenor ? 'Escribe tu nombre como tutor.' : 'Escribe tu nombre.',
      campo: 'nombre',
      valores,
    }
  }
  // Si es una plaza para un menor, saber quién es el alumno no es un extra:
  // es lo que el estudio necesita para montar el grupo por edades.
  if (esMenor && alumnoNombre.length < 2) {
    return {
      ok: false,
      mensaje: 'Dinos el nombre del alumno o la alumna.',
      campo: 'alumno_nombre',
      valores,
    }
  }
  if (!EMAIL.test(email)) {
    return {
      ok: false,
      mensaje: 'Revisa el correo: es por donde te contestamos.',
      campo: 'email',
      valores,
    }
  }
  if (telefono && !TELEFONO_ES.test(telefono)) {
    return { ok: false, mensaje: 'Ese teléfono no parece correcto.', campo: 'telefono', valores }
  }
  if (!datos.get('consentimiento')) {
    return {
      ok: false,
      mensaje: 'Necesitamos tu permiso para contactarte.',
      campo: 'consentimiento',
      valores,
    }
  }

  // El curso se lee de la base de datos, no del formulario: si viniera del
  // navegador, cualquiera podría inscribirse a un curso despublicado o
  // inventarse el título que se guarda.
  const curso = cursoId ? await cursoPorId(cursoId) : null
  if (cursoId && !curso) {
    return { ok: false, mensaje: 'Ese curso ya no está disponible.', campo: 'curso_id', valores }
  }
  if (curso && !curso.publicado) {
    return { ok: false, mensaje: 'Ese curso ya no está disponible.', campo: 'curso_id', valores }
  }

  const convocatoria = convocatoriaId ? await convocatoriaPorId(convocatoriaId) : null
  const convocatoriaValida = convocatoria && curso && convocatoria.curso_id === curso.id
  const convocatoriaTexto = convocatoriaValida
    ? [convocatoria.etiqueta, convocatoria.horario].filter(Boolean).join(' · ') || null
    : null

  let id: number
  try {
    id = await guardarInscripcion({
      nombre,
      email,
      telefono: telefono || null,
      es_menor: esMenor,
      alumno_nombre: esMenor ? alumnoNombre : null,
      alumno_edad: esMenor ? alumnoEdad || null : null,
      curso_id: curso?.id ?? null,
      convocatoria_id: convocatoriaValida ? convocatoria.id : null,
      curso_titulo: curso?.titulo ?? 'Consulta general',
      convocatoria_texto: convocatoriaTexto,
      modalidad: (convocatoriaValida && convocatoria.modalidad) || curso?.modalidad || null,
      experiencia: experiencia || null,
      mensaje: mensaje || null,
      origen,
    })
  } catch (e) {
    console.error('[inscripcion] no se pudo guardar', e)
    return {
      ok: false,
      mensaje: 'No hemos podido registrar tu solicitud. Vuelve a intentarlo en un minuto.',
      valores,
    }
  }

  // A partir de aquí la petición YA está a salvo. Nada de lo que siga puede
  // devolver un error al alumno, porque su solicitud sí ha llegado.
  const aviso = await avisarInscripcion({
    id,
    nombre,
    email,
    telefono: telefono || null,
    alumno: esMenor ? alumnoNombre : null,
    alumnoEdad: esMenor ? alumnoEdad || null : null,
    curso: curso?.titulo ?? 'Consulta general',
    convocatoria: convocatoriaTexto,
    modalidad: (convocatoriaValida && convocatoria.modalidad) || curso?.modalidad || null,
    experiencia: experiencia || null,
    mensaje: mensaje || null,
    origen,
  })
  await marcarAviso('inscripciones', id, aviso.ok, aviso.ok ? undefined : aviso.motivo)

  // El acuse al alumno es secundario: si falla, no se marca nada ni se avisa.
  await acusarInscripcion({
    nombre,
    email,
    curso: curso?.titulo ?? 'tu consulta',
    convocatoria: convocatoriaTexto,
  })

  return {
    ok: true,
    mensaje: 'Solicitud recibida. Te escribimos para confirmarte la plaza.',
  }
}

/* ────────────────────────── Contacto ────────────────────────── */

export async function enviarContacto(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  if (texto(datos, 'empresa')) return { ok: true, mensaje: 'Recibido.' }

  const nombre = limitar(texto(datos, 'nombre'), 120)
  const email = limitar(texto(datos, 'email'), 160).toLowerCase()
  const telefono = limitar(texto(datos, 'telefono'), 40)
  const asunto = limitar(texto(datos, 'asunto'), 160)
  const mensaje = limitar(texto(datos, 'mensaje'), 4000)
  const origen = limitar(texto(datos, 'origen') || '/', 200)

  const valores = {
    nombre,
    email,
    telefono,
    asunto,
    mensaje,
    consentimiento: datos.get('consentimiento') ? 'si' : '',
  }

  if (nombre.length < 2) return { ok: false, mensaje: 'Escribe tu nombre.', campo: 'nombre', valores }
  if (!EMAIL.test(email)) return { ok: false, mensaje: 'Revisa el correo.', campo: 'email', valores }
  if (telefono && !TELEFONO_ES.test(telefono)) {
    return { ok: false, mensaje: 'Ese teléfono no parece correcto.', campo: 'telefono', valores }
  }
  if (mensaje.length < 5) {
    return { ok: false, mensaje: 'Cuéntanos algo más para poder ayudarte.', campo: 'mensaje', valores }
  }
  if (!datos.get('consentimiento')) {
    return {
      ok: false,
      mensaje: 'Necesitamos tu permiso para contactarte.',
      campo: 'consentimiento',
      valores,
    }
  }

  let id: number
  try {
    id = await guardarContacto({
      nombre,
      email,
      telefono: telefono || null,
      asunto: asunto || null,
      mensaje,
      origen,
    })
  } catch (e) {
    console.error('[contacto] no se pudo guardar', e)
    return {
      ok: false,
      mensaje: 'No hemos podido enviar el mensaje. Inténtalo en un minuto.',
      valores,
    }
  }

  const aviso = await avisarContacto({
    id,
    nombre,
    email,
    telefono: telefono || null,
    asunto: asunto || null,
    mensaje,
    origen,
  })
  await marcarAviso('contactos', id, aviso.ok, aviso.ok ? undefined : aviso.motivo)

  return { ok: true, mensaje: 'Mensaje enviado. Te contestamos lo antes posible.' }
}

/* ────────────────────────── Newsletter ────────────────────────── */

export async function suscribirse(
  _previo: EstadoFormulario | null,
  datos: FormData,
): Promise<EstadoFormulario> {
  if (texto(datos, 'empresa')) return { ok: true, mensaje: 'Recibido.' }

  const email = limitar(texto(datos, 'email'), 160).toLowerCase()
  const nombre = limitar(texto(datos, 'nombre'), 120)
  const origen = limitar(texto(datos, 'origen') || '/', 200)

  const valores = { email, nombre, consentimiento: datos.get('consentimiento') ? 'si' : '' }

  if (!EMAIL.test(email)) {
    return { ok: false, mensaje: 'Revisa el correo.', campo: 'email', valores }
  }
  if (!datos.get('consentimiento')) {
    return {
      ok: false,
      mensaje: 'Marca la casilla para poder escribirte.',
      campo: 'consentimiento',
      valores,
    }
  }

  try {
    // El token va en el enlace de baja de cada envío. Sin él, cualquiera podría
    // dar de baja a otro con solo saber su dirección.
    const resultado = await guardarSuscriptor(email, nombre || null, origen, randomBytes(16).toString('hex'))
    // No se distingue «ya estabas» de «alta nueva» hacia fuera: decirlo revela
    // quién está apuntado a quien pruebe direcciones ajenas.
    return {
      ok: true,
      mensaje: resultado === 'ya_estaba' ? 'Ya estás en la lista.' : 'Apuntado. Gracias.',
    }
  } catch (e) {
    console.error('[newsletter] no se pudo guardar', e)
    return { ok: false, mensaje: 'No hemos podido apuntarte. Inténtalo en un minuto.', valores }
  }
}
