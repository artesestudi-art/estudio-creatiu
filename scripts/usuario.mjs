/**
 * Da de alta a alguien en el panel, o le pone una contraseña nueva.
 *
 *   npm run usuario -- silvia@artesespaicreatiu.com "Silvia Cano"
 *   CLAVE='la que sea' npm run usuario -- silvia@… "Silvia Cano"
 *
 * Sin `CLAVE` se genera una contraseña y se imprime UNA vez: se copia, se
 * entrega en mano o por un canal seguro y se cambia desde el panel. No se
 * manda por correo desde aquí a propósito; un correo con una contraseña dentro
 * se queda para siempre en dos buzones.
 *
 * Para qué existe habiendo panel: para el primer acceso a la base del CLIENTE,
 * donde todavía no hay nadie dado de alta y no se quiere dejar `ADMIN_CLAVE`
 * viva más tiempo del necesario. Después, las altas se hacen en /admin/equipo.
 *
 * ⚠️ El formato del hash tiene que ser el mismo que el de `lib/usuarios.ts`
 * (`scrypt$coste$sal$hash`, N=16384 r=8 p=1, 64 bytes). Si allí cambia, aquí
 * también.
 */
import { neon } from '@neondatabase/serverless'
import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const COSTE = 16384
const OPCIONES = { N: COSTE, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }
const CLAVE_MINIMA = 10

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Usa: npm run usuario -- correo@ejemplo.com "Nombre"')
  process.exit(1)
}

const [email, nombre] = process.argv.slice(2)
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  console.error('Uso: npm run usuario -- correo@ejemplo.com "Nombre"')
  process.exit(1)
}

/* Sin ambigüedades: nada de l/1/I ni O/0 en una contraseña que alguien va a
   copiar de una pantalla a un papel. */
function generar(largo = 16) {
  const alfabeto = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(randomBytes(largo), (b) => alfabeto[b % alfabeto.length]).join('')
}

const clave = process.env.CLAVE || generar()
if (clave.length < CLAVE_MINIMA) {
  console.error(`La contraseña necesita al menos ${CLAVE_MINIMA} caracteres.`)
  process.exit(1)
}

const sal = randomBytes(16).toString('hex')
const dk = await scryptAsync(clave.normalize('NFKC'), sal, 64, OPCIONES)
const hash = `scrypt$${COSTE}$${sal}$${dk.toString('hex')}`

const sql = neon(url)
console.log(`Base de datos: ${url.replace(/:[^:@]*@/, ':****@')}`)

const [fila] = await sql`
  INSERT INTO usuarios (email, nombre, clave_hash)
  VALUES (${email.trim().toLowerCase()}, ${nombre?.trim() || null}, ${hash})
  ON CONFLICT (email) DO UPDATE SET
    clave_hash = EXCLUDED.clave_hash,
    nombre = COALESCE(EXCLUDED.nombre, usuarios.nombre),
    activo = true,
    fallos = 0,
    bloqueado_hasta = NULL
  RETURNING id, email, (xmax = 0) AS nuevo
`

console.log(`\n  ${fila.nuevo ? 'Alta' : 'Contraseña cambiada'}: ${fila.email}`)
if (!process.env.CLAVE) {
  console.log(`  Contraseña: ${clave}`)
  console.log('\n  Se imprime una sola vez. Entrégala en mano y que se la cambie al entrar.')
}
