import { ESTUDIO } from '@/data/estudio'

/**
 * Verificación de reCAPTCHA v3, en el servidor.
 *
 * ⛔ REGLA QUE NO SE NEGOCIA: esto NUNCA descarta un envío. Devuelve un
 * veredicto y quien llama guarda igual, marcando la petición.
 *
 * El token falta por razones que no son un robot: un bloqueador de anuncios,
 * una extensión de privacidad, el script de Google que no carga, una red lenta
 * en el pueblo. Bloquear ahí pierde un alumno sin dejar rastro en la base, ni
 * en el correo, ni en el panel. Por eso esta web no tenía reCAPTCHA: se ha
 * puesto a condición de que opine y no decida. Lo mismo con una puntuación
 * baja: gente real con VPN o un navegador raro baja del umbral a diario.
 *
 * Contra el spam tonto el que trabaja de verdad sigue siendo el campo trampa.
 */

export type Veredicto =
  | { estado: 'ok'; puntuacion: number }
  | { estado: 'sospechoso'; puntuacion: number; motivo: string }
  | { estado: 'sin-comprobar'; motivo: string }
  /** No hay claves puestas: no es que el envío sea dudoso, es que no se mira. */
  | { estado: 'apagado' }

/** Por debajo de esto se marca, NO se bloquea. */
const UMBRAL = 0.5

/**
 * Hosts desde los que un token es bueno. Google ya comprueba que la clave
 * está dada de alta para el dominio, pero una clave registrada también para
 * `localhost` acepta tokens fabricados en el ordenador de cualquiera.
 */
function hostValido(host: string): boolean {
  const propios = [ESTUDIO.dominio, ...ESTUDIO.otrosDominios]
  return (
    propios.some((d) => host === d || host === `www.${d}`) ||
    host.endsWith('.vercel.app') ||
    (process.env.NODE_ENV !== 'production' && host === 'localhost')
  )
}

export async function verificarRecaptcha(
  token: string | undefined,
  accion: string,
): Promise<Veredicto> {
  const secreto = process.env.RECAPTCHA_SECRET_KEY

  // Sin clave no se finge una comprobación que no ha pasado.
  if (!secreto || !process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) return { estado: 'apagado' }
  if (!token) return { estado: 'sin-comprobar', motivo: 'el navegador no envió token' }

  try {
    const respuesta = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secreto, response: token }),
      // Si Google tarda, se sigue adelante: un formulario no se queda colgado
      // esperando a un tercero.
      signal: AbortSignal.timeout(5000),
    })

    if (!respuesta.ok) {
      return { estado: 'sin-comprobar', motivo: `Google respondió ${respuesta.status}` }
    }

    const datos = (await respuesta.json()) as {
      success?: boolean
      score?: number
      action?: string
      hostname?: string
      'error-codes'?: string[]
    }
    const puntuacion = typeof datos.score === 'number' ? datos.score : 0

    if (!datos.success) {
      return {
        estado: 'sospechoso',
        puntuacion,
        motivo: (datos['error-codes'] ?? ['rechazado']).join(', '),
      }
    }
    // Un token sacado de otro formulario (o de otra web con la misma clave)
    // trae otra acción u otro host: se marca, no se tira.
    if (datos.action && datos.action !== accion) {
      return { estado: 'sospechoso', puntuacion, motivo: `acción «${datos.action}»` }
    }
    if (datos.hostname && !hostValido(datos.hostname)) {
      return { estado: 'sospechoso', puntuacion, motivo: `enviado desde ${datos.hostname}` }
    }
    if (puntuacion < UMBRAL) {
      return { estado: 'sospechoso', puntuacion, motivo: `puntuación ${puntuacion}` }
    }
    return { estado: 'ok', puntuacion }
  } catch (e) {
    // Caída de red, tiempo agotado… se deja pasar y se dice.
    return { estado: 'sin-comprobar', motivo: e instanceof Error ? e.message : 'error de red' }
  }
}

/**
 * Lo que se guarda en la columna `antispam` y enseña el panel.
 *
 * `null` cuando no hay nada que decir (verificado, o reCAPTCHA apagado): una
 * marca en cada fila mientras no hay claves solo enseña a ignorarla, y el día
 * que aparece de verdad ya nadie la mira.
 */
export function marcaAntispam(v: Veredicto): string | null {
  if (v.estado === 'ok' || v.estado === 'apagado') return null
  if (v.estado === 'sospechoso') return `Posible robot: ${v.motivo}`
  return `Sin verificar: ${v.motivo}`
}

/** Prefijo para el ASUNTO del aviso: se ve en la bandeja sin abrir el correo. */
export function prefijoAsunto(v: Veredicto): string {
  if (v.estado === 'sospechoso') return '⚠️ REVISAR · '
  if (v.estado === 'sin-comprobar') return '⚠️ SIN VERIFICAR · '
  return ''
}
