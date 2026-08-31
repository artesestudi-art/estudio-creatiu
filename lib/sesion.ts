import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Sesión del panel.
 *
 * Una sola contraseña, la del dueño. No hay usuarios ni registro porque no
 * hacen falta: al panel entra una persona.
 *
 * La cookie no guarda la contraseña, sino una marca de caducidad firmada con
 * HMAC. Así no se puede fabricar desde el navegador y caduca sola.
 */

const COOKIE = 'ea_sesion'
const DURACION_MS = 30 * 24 * 60 * 60 * 1000 // 30 días

function secreto(): string {
  const s = process.env.ADMIN_SECRETO
  if (!s || s.length < 24) {
    throw new Error('Falta ADMIN_SECRETO (mínimo 24 caracteres)')
  }
  return s
}

function firmar(caduca: number): string {
  const mac = createHmac('sha256', secreto()).update(String(caduca)).digest('hex')
  return `${caduca}.${mac}`
}

/** Compara en tiempo constante: comparar con === filtra el secreto por el reloj. */
function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export function comprobarClave(clave: string): boolean {
  const buena = process.env.ADMIN_CLAVE
  if (!buena) return false
  return iguales(clave, buena)
}

export async function abrirSesion() {
  const caduca = Date.now() + DURACION_MS
  const galletas = await cookies()
  galletas.set(COOKIE, firmar(caduca), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DURACION_MS / 1000,
  })
}

export async function cerrarSesion() {
  const galletas = await cookies()
  galletas.delete(COOKIE)
}

export async function haySesion(): Promise<boolean> {
  const galletas = await cookies()
  const valor = galletas.get(COOKIE)?.value
  if (!valor) return false

  const [caducaTexto] = valor.split('.')
  const caduca = Number(caducaTexto)
  if (!Number.isFinite(caduca) || caduca < Date.now()) return false

  try {
    return iguales(valor, firmar(caduca))
  } catch {
    // Falta ADMIN_SECRETO: sin secreto no hay sesión válida.
    return false
  }
}

/**
 * Guarda de las páginas del panel.
 *
 * El layout ya enseña el login cuando no hay sesión, pero eso NO basta: Next
 * renderiza la página hija en paralelo al layout, y su resultado acaba
 * serializado dentro del HTML aunque el layout no lo pinte. Comprobado: sin
 * iniciar sesión, `/admin/inscripciones` devolvía los datos de los alumnos
 * dentro del payload de la página.
 *
 * Por eso cada página del panel empieza con:
 *
 *     if (await panelBloqueado()) return null
 *
 * Así ni se consulta la base ni hay nada que filtrar.
 */
export async function panelBloqueado(): Promise<boolean> {
  return !(await haySesion())
}
