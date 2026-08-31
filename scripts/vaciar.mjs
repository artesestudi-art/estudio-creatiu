/**
 * Vacía las tablas de peticiones antes de poner la web en producción.
 *
 *   npm run vaciar
 *
 * Se usa una sola vez: al pasar de la base de pruebas a la del cliente. Todo
 * lo que se haya escrito probando (inscripciones falsas, mensajes de prueba)
 * tiene que desaparecer antes de que entre gente real, o el cliente abrirá su
 * panel y llamará a un tal «Prueba Prueba».
 *
 * NO toca cursos ni contenidos: eso es trabajo del cliente y se conserva.
 */
import { neon } from '@neondatabase/serverless'
import { createInterface } from 'node:readline/promises'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL.')
  process.exit(1)
}

const sql = neon(url)
const [conteo] = await sql`
  SELECT
    (SELECT COUNT(*) FROM inscripciones)::int AS inscripciones,
    (SELECT COUNT(*) FROM contactos)::int     AS contactos,
    (SELECT COUNT(*) FROM suscriptores)::int  AS suscriptores
`

console.log(`Base: ${url.replace(/:[^:@]*@/, ':****@')}`)
console.log(
  `Se van a borrar: ${conteo.inscripciones} inscripciones, ${conteo.contactos} mensajes, ${conteo.suscriptores} suscriptores.`,
)

const consola = createInterface({ input: process.stdin, output: process.stdout })
const respuesta = await consola.question('Escribe BORRAR para confirmar: ')
consola.close()

if (respuesta.trim() !== 'BORRAR') {
  console.log('Cancelado. No se ha tocado nada.')
  process.exit(0)
}

await sql`TRUNCATE inscripciones RESTART IDENTITY`
await sql`TRUNCATE contactos RESTART IDENTITY`
await sql`TRUNCATE suscriptores RESTART IDENTITY`

console.log('Hecho. Cursos y contenidos siguen intactos.')
