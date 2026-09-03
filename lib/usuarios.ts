import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'
import { promisify } from 'node:util'
import { conexion } from './bd'
import { CLAVE_MINIMA } from './reglas'

export { CLAVE_MINIMA }

/**
 * Quién entra al panel.
 *
 * Antes había una contraseña y ya está. Eso funciona mientras el panel lo abra
 * una persona, y deja de funcionar el día que hay que darle acceso a una
 * profesora: se le entrega la contraseña del dueño, y el día que se va hay que
 * cambiársela a todo el mundo. Aquí cada persona tiene su correo, su
 * contraseña y su interruptor.
 *
 * La contraseña NO se guarda: se guarda un `scrypt` con su propia sal. Si
 * alguien se lleva la base de datos no se lleva las contraseñas, que es lo
 * que de verdad importa porque la gente repite contraseña en el correo.
 */

/* `promisify` pierde la sobrecarga con opciones y TypeScript se queda con la
   de tres argumentos; se declara la forma que sí se usa. */
const scryptAsync = promisify(scrypt) as (
  clave: string,
  sal: string,
  largo: number,
  opciones: ScryptOptions,
) => Promise<Buffer>

/* Coste de scrypt. 16384 es el mínimo recomendado y tarda ~80 ms: suficiente
   para que probar contraseñas a lo bruto salga caro, poco para que entrar al
   panel se note. `maxmem` va explícito porque 128·N·r son 32 MB justos y el
   valor por omisión de Node es exactamente ese: sin subirlo, scrypt lanza. */
const COSTE = 16384
const OPCIONES = { N: COSTE, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

const FALLOS_MAXIMOS = 5
const BLOQUEO_MINUTOS = 15

export type Usuario = {
  id: number
  email: string
  nombre: string | null
  activo: boolean
  creado: string
  ultimo_acceso: string | null
}

type Fila = Usuario & { clave_hash: string; fallos: number; bloqueado_hasta: string | null }

export async function hashear(clave: string): Promise<string> {
  const sal = randomBytes(16).toString('hex')
  const dk = await scryptAsync(clave.normalize('NFKC'), sal, 64, OPCIONES)
  return `scrypt$${COSTE}$${sal}$${dk.toString('hex')}`
}

async function coincide(clave: string, guardado: string): Promise<boolean> {
  const [tipo, coste, sal, hash] = guardado.split('$')
  if (tipo !== 'scrypt' || !sal || !hash) return false
  const dk = await scryptAsync(clave.normalize('NFKC'), sal, hash.length / 2, {
    ...OPCIONES,
    N: Number(coste) || COSTE,
  })
  const esperado = Buffer.from(hash, 'hex')
  return dk.length === esperado.length && timingSafeEqual(dk, esperado)
}

/**
 * Un hash de mentira, para gastar el mismo tiempo cuando el correo no existe.
 *
 * Sin esto, «correo desconocido» contesta en 2 ms y «contraseña mal» en 80: el
 * reloj dice cuáles de los correos probados son de verdad usuarios del panel.
 */
let hashFalso: Promise<string> | null = null
function señuelo(): Promise<string> {
  hashFalso ??= hashear(randomBytes(24).toString('hex'))
  return hashFalso
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

/* ─────────────────────────── Consultas ─────────────────────────── */

export async function contarUsuarios(): Promise<number> {
  const sql = conexion()
  const [f] = await sql`SELECT COUNT(*)::int AS n FROM usuarios`
  return (f as { n: number }).n
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const sql = conexion()
  return (await sql`
    SELECT id, email, nombre, activo, creado, ultimo_acceso
    FROM usuarios ORDER BY creado
  `) as Usuario[]
}

/** Solo devuelve a quien sigue teniendo acceso: desactivar cierra la sesión. */
export async function usuarioPorId(id: number): Promise<Usuario | null> {
  const sql = conexion()
  const filas = (await sql`
    SELECT id, email, nombre, activo, creado, ultimo_acceso
    FROM usuarios WHERE id = ${id} AND activo
  `) as Usuario[]
  return filas[0] ?? null
}

/* ─────────────────────────── Alta y cambios ─────────────────────────── */

export type Resultado = { ok: true } | { ok: false; error: string }

export async function crearUsuario(datos: {
  email: string
  nombre?: string | null
  clave: string
}): Promise<Resultado> {
  const email = normalizarEmail(datos.email)
  if (!emailValido(email)) return { ok: false, error: 'Ese correo no tiene forma de correo.' }
  if (datos.clave.length < CLAVE_MINIMA) {
    return { ok: false, error: `La contraseña necesita al menos ${CLAVE_MINIMA} caracteres.` }
  }

  const sql = conexion()
  const hash = await hashear(datos.clave)
  try {
    await sql`
      INSERT INTO usuarios (email, nombre, clave_hash)
      VALUES (${email}, ${datos.nombre?.trim() || null}, ${hash})
    `
    return { ok: true }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : ''
    if (mensaje.includes('usuarios_email_key')) {
      return { ok: false, error: 'Ya hay alguien con ese correo.' }
    }
    return { ok: false, error: 'No se pudo dar de alta.' }
  }
}

/** Cambia la contraseña y suelta el bloqueo por intentos fallidos. */
export async function cambiarClave(id: number, clave: string): Promise<Resultado> {
  if (clave.length < CLAVE_MINIMA) {
    return { ok: false, error: `La contraseña necesita al menos ${CLAVE_MINIMA} caracteres.` }
  }
  const sql = conexion()
  const hash = await hashear(clave)
  await sql`
    UPDATE usuarios
    SET clave_hash = ${hash}, fallos = 0, bloqueado_hasta = NULL
    WHERE id = ${id}
  `
  return { ok: true }
}

export async function cambiarActivo(id: number, activo: boolean): Promise<void> {
  const sql = conexion()
  await sql`UPDATE usuarios SET activo = ${activo}, fallos = 0, bloqueado_hasta = NULL WHERE id = ${id}`
}

export async function borrarUsuario(id: number): Promise<void> {
  const sql = conexion()
  await sql`DELETE FROM usuarios WHERE id = ${id}`
}

/* ─────────────────────────── Entrada ─────────────────────────── */

export type Autenticacion = { ok: true; usuario: Usuario } | { ok: false; error: string }

/**
 * Comprueba correo y contraseña.
 *
 * El mensaje de error es el MISMO para «ese correo no existe» y «la contraseña
 * no es esa»: decir cuál de las dos falla regala la mitad del trabajo a quien
 * está probando correos.
 */
export async function autenticar(email: string, clave: string): Promise<Autenticacion> {
  const sql = conexion()
  const filas = (await sql`
    SELECT id, email, nombre, activo, creado, ultimo_acceso, clave_hash, fallos, bloqueado_hasta
    FROM usuarios WHERE email = ${normalizarEmail(email)}
  `) as Fila[]
  const fila = filas[0]

  if (!fila) {
    await coincide(clave, await señuelo())
    return { ok: false, error: 'Correo o contraseña incorrectos.' }
  }

  if (fila.bloqueado_hasta && new Date(fila.bloqueado_hasta) > new Date()) {
    return {
      ok: false,
      error: `Demasiados intentos. Vuelve a probar en ${BLOQUEO_MINUTOS} minutos.`,
    }
  }

  if (!(await coincide(clave, fila.clave_hash))) {
    const fallos = fila.fallos + 1
    const bloquear = fallos >= FALLOS_MAXIMOS
    await sql`
      UPDATE usuarios
      SET fallos = ${bloquear ? 0 : fallos},
          bloqueado_hasta = ${bloquear ? new Date(Date.now() + BLOQUEO_MINUTOS * 60_000) : null}
      WHERE id = ${fila.id}
    `
    return {
      ok: false,
      error: bloquear
        ? `Demasiados intentos. Vuelve a probar en ${BLOQUEO_MINUTOS} minutos.`
        : 'Correo o contraseña incorrectos.',
    }
  }

  /* La contraseña es buena, pero puede estar el acceso retirado. Se comprueba
     DESPUÉS para no revelar quién sigue de alta a quien no acierta la clave. */
  if (!fila.activo) return { ok: false, error: 'Esta cuenta ya no tiene acceso al panel.' }

  await sql`
    UPDATE usuarios SET ultimo_acceso = now(), fallos = 0, bloqueado_hasta = NULL
    WHERE id = ${fila.id}
  `

  return {
    ok: true,
    usuario: {
      id: fila.id,
      email: fila.email,
      nombre: fila.nombre,
      activo: fila.activo,
      creado: fila.creado,
      ultimo_acceso: fila.ultimo_acceso,
    },
  }
}

/** ¿Es esta la contraseña actual de esta persona? Para cambiarse la suya. */
export async function claveActual(id: number, clave: string): Promise<boolean> {
  const sql = conexion()
  const filas = (await sql`SELECT clave_hash FROM usuarios WHERE id = ${id}`) as {
    clave_hash: string
  }[]
  if (!filas[0]) return false
  return coincide(clave, filas[0].clave_hash)
}
