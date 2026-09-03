import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cache } from 'react'
import { contarUsuarios, usuarioPorId, type Usuario } from './usuarios'

/**
 * Sesión del panel.
 *
 * Al panel se entra con **correo y contraseña**, y cada persona tiene la suya
 * (ver `lib/usuarios.ts`). La cookie no guarda ni el correo ni la contraseña:
 * guarda quién eres y hasta cuándo, firmado con HMAC, así que no se puede
 * fabricar desde el navegador y caduca sola.
 *
 * Quién eres se vuelve a leer de la base en cada petición, y no se cree lo que
 * diga la cookie: si a alguien se le retira el acceso, su sesión abierta deja
 * de valer al instante en vez de aguantar treinta días. `cache()` hace que esa
 * lectura ocurra UNA vez por petición aunque la pidan el layout y la página.
 *
 * ⚠️ El primer arranque: mientras no haya NINGÚN usuario dado de alta, se
 * puede entrar con `ADMIN_CLAVE` para crear el primero. En cuanto existe uno,
 * esa puerta se cierra sola —no queda una contraseña maestra olvidada en las
 * variables de entorno— y el panel avisa mientras siga abierta.
 */

const COOKIE = 'ea_sesion'
const DURACION_MS = 30 * 24 * 60 * 60 * 1000 // 30 días

/** Sesión de arranque, la del `ADMIN_CLAVE`. No es una fila de la tabla. */
export const ID_ARRANQUE = 0

function secreto(): string {
  const s = process.env.ADMIN_SECRETO
  if (!s || s.length < 24) {
    throw new Error('Falta ADMIN_SECRETO (mínimo 24 caracteres)')
  }
  return s
}

function firmar(id: number, caduca: number): string {
  const cuerpo = `${id}.${caduca}`
  const mac = createHmac('sha256', secreto()).update(cuerpo).digest('hex')
  return `${cuerpo}.${mac}`
}

/** Compara en tiempo constante: comparar con === filtra el secreto por el reloj. */
function iguales(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

/** La contraseña de arranque, la de las variables de entorno. */
export function comprobarClave(clave: string): boolean {
  const buena = process.env.ADMIN_CLAVE
  if (!buena) return false
  return iguales(clave, buena)
}

/** ¿Seguimos en el primer arranque, sin nadie dado de alta? */
export const sinUsuarios = cache(async (): Promise<boolean> => {
  try {
    return (await contarUsuarios()) === 0
  } catch {
    // Sin base de datos no se puede afirmar que no haya usuarios.
    return false
  }
})

export async function abrirSesion(usuarioId: number) {
  const caduca = Date.now() + DURACION_MS
  const galletas = await cookies()
  galletas.set(COOKIE, firmar(usuarioId, caduca), {
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

/** Lo que dice la cookie, ya comprobada la firma. Todavía no dice si vale. */
async function cookieValida(): Promise<{ id: number; caduca: number } | null> {
  const galletas = await cookies()
  const valor = galletas.get(COOKIE)?.value
  if (!valor) return null

  const [idTexto, caducaTexto] = valor.split('.')
  const id = Number(idTexto)
  const caduca = Number(caducaTexto)
  if (!Number.isFinite(id) || !Number.isFinite(caduca) || caduca < Date.now()) return null

  try {
    return iguales(valor, firmar(id, caduca)) ? { id, caduca } : null
  } catch {
    // Falta ADMIN_SECRETO: sin secreto no hay sesión válida.
    return null
  }
}

/**
 * Quién está dentro, o `null`.
 *
 * Se consulta en cada petición porque una cookie de 30 días no puede ser la
 * última palabra sobre quién tiene acceso hoy.
 */
export const usuarioActual = cache(async (): Promise<Usuario | null> => {
  const sesion = await cookieValida()
  if (!sesion) return null

  if (sesion.id === ID_ARRANQUE) {
    // La sesión de arranque solo vale mientras no haya usuarios de verdad.
    return (await sinUsuarios())
      ? {
          id: ID_ARRANQUE,
          email: '',
          nombre: 'Primer acceso',
          activo: true,
          creado: '',
          ultimo_acceso: null,
        }
      : null
  }

  return usuarioPorId(sesion.id)
})

export async function haySesion(): Promise<boolean> {
  return Boolean(await usuarioActual())
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
