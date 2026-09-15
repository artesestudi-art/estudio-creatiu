import {
  guardarContenido,
  inscripcionPorId,
  leerContenido,
  marcarResena,
  matriculasConFin,
  type MatriculaConFin,
} from '@/lib/bd'
import { pedirResena, type ResultadoEnvio } from '@/lib/correo'

/**
 * Correo de reseñas al terminar un curso.
 *
 * A quien está MATRICULADO le llega, el día después de que acabe su grupo (o
 * su curso, si el grupo no tiene fecha), un correo con el enlace para dejar
 * una reseña. Lo lanza cada mañana el cron de Vercel (`/api/cron/resenas`) y
 * también el botón del panel, así que funciona igual sin cron.
 *
 * Tres reglas:
 * - **Solo matriculados.** Una solicitud «nueva» o «descartada» no ha pisado
 *   el taller: pedirle una reseña es pedirle que se la invente.
 * - **Ventana de 30 días.** Si Resend se configura en marzo, no puede salir
 *   de golpe un correo a todos los que acabaron en diciembre.
 * - **Se marca como enviado solo si SALIÓ.** Si Resend falla, mañana se
 *   reintenta; darlo por hecho sería perder la reseña en silencio.
 */

export type AjustesResenas = {
  /** El enlace de Google para dejar reseña (o el de donde sea). */
  url: string
  activo: boolean
}

const CLAVE = 'resenas'
export const VENTANA_DIAS = 30

export async function leerAjustesResenas(): Promise<AjustesResenas> {
  return leerContenido<AjustesResenas>(CLAVE, { url: '', activo: false })
}

export async function guardarAjustesResenas(ajustes: AjustesResenas): Promise<void> {
  await guardarContenido(CLAVE, ajustes)
}

/** Hoy en Artés, como `2026-10-01`. Vercel corre en UTC: entre las 22:00 y la
 *  medianoche de Madrid, «hoy» en UTC todavía sería ayer. */
export function hoyEnMadrid(ahora = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora)
}

function restarDias(dia: string, dias: number): string {
  const d = new Date(`${dia}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - dias)
  return d.toISOString().slice(0, 10)
}

export type SituacionResena =
  | 'enviada'
  | 'pendiente' // le toca y no ha salido
  | 'sin_fecha' // ni su grupo ni su curso tienen fecha de fin
  | 'en_curso' // su curso todavía no ha terminado
  | 'caducada' // terminó hace más de VENTANA_DIAS y no salió

export function situacion(m: MatriculaConFin, hoy = hoyEnMadrid()): SituacionResena {
  if (m.resena_enviada) return 'enviada'
  if (!m.termina) return 'sin_fecha'
  // Las fechas van como texto AAAA-MM-DD: se comparan bien como cadenas.
  if (m.termina >= hoy) return 'en_curso'
  if (m.termina < restarDias(hoy, VENTANA_DIAS)) return 'caducada'
  return 'pendiente'
}

async function enviarA(
  i: { id: number; nombre: string; email: string; alumno_nombre: string | null; curso_titulo: string; origen: string },
  url: string,
): Promise<ResultadoEnvio> {
  const resultado = await pedirResena({
    nombre: i.nombre,
    email: i.email,
    alumno: i.alumno_nombre,
    curso: i.curso_titulo,
    url,
    // Se le escribe en el idioma en que se apuntó.
    idioma: i.origen.startsWith('/ca') ? 'ca' : 'es',
  })
  await marcarResena(i.id, resultado.ok, resultado.ok ? undefined : resultado.motivo)
  return resultado
}

export type Informe = { enviadas: number; fallidas: number; motivo?: string }

/** Lo que hace el cron: todos los que les toca hoy. */
export async function enviarResenasPendientes(): Promise<Informe> {
  const ajustes = await leerAjustesResenas()
  if (!ajustes.activo) return { enviadas: 0, fallidas: 0, motivo: 'Desactivado en el panel' }
  if (!ajustes.url) return { enviadas: 0, fallidas: 0, motivo: 'Falta el enlace de reseñas' }

  const hoy = hoyEnMadrid()
  const toca = (await matriculasConFin()).filter((m) => situacion(m, hoy) === 'pendiente')

  let enviadas = 0
  let fallidas = 0
  let motivo: string | undefined
  for (const m of toca) {
    const r = await enviarA(m, ajustes.url)
    if (r.ok) enviadas++
    else {
      fallidas++
      motivo = r.motivo
    }
  }
  return { enviadas, fallidas, motivo }
}

/**
 * El botón «Enviar ahora» de una persona concreta.
 *
 * No mira fechas ni si ya salió: si el estudio lo pulsa, es que quiere
 * mandarlo (a quien acabó antes, o para repetirlo). Sí exige el enlace, porque
 * un correo pidiendo reseña sin enlace no sirve de nada.
 */
export async function enviarResenaA(id: number): Promise<ResultadoEnvio> {
  const ajustes = await leerAjustesResenas()
  if (!ajustes.url) return { ok: false, motivo: 'Falta el enlace de reseñas' }
  const i = await inscripcionPorId(id)
  if (!i) return { ok: false, motivo: 'Esa inscripción ya no existe' }
  return enviarA(i, ajustes.url)
}
