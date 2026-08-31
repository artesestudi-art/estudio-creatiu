/**
 * Aplica el esquema a la base de datos de Neon.
 *
 *   npm run migrar          → contra la base de DATABASE_URL de .env.local
 *
 * Todo el fichero es `CREATE ... IF NOT EXISTS`, así que lanzarlo dos veces no
 * rompe nada ni borra datos. Nunca se llama en caliente desde la web:
 * comprobar el esquema en cada visita cuesta un viaje de red por petición.
 */
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Usa: npm run migrar (lee .env.local)')
  process.exit(1)
}

// Aviso barato pero que salva: el `dev` apuntando a producción escribe en la
// base del cliente sin que nadie se entere hasta que es tarde.
const rama = url.match(/@ep-[^.]*\.([^.]*)\./)?.[1] ?? '¿?'
console.log(`Base de datos: ${url.replace(/:[^:@]*@/, ':****@')}`)
console.log(`Región/rama: ${rama}`)

const sql = neon(url)
const esquema = readFileSync(new URL('../db/esquema.sql', import.meta.url), 'utf8')

// Se trocea por sentencia: el driver serverless de Neon no acepta varias
// sentencias en una sola llamada.
const sentencias = esquema
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s && !s.split('\n').every((l) => l.trim().startsWith('--')))

for (const sentencia of sentencias) {
  const nombre = sentencia.match(/(?:TABLE|INDEX)\s+IF NOT EXISTS\s+(\w+)/i)?.[1] ?? '…'
  // `sql.query` y no sql`…`: aquí la sentencia es texto ya montado, no una
  // plantilla; el driver rechaza la llamada normal para evitar inyecciones.
  await sql.query(sentencia)
  console.log(`  ✓ ${nombre}`)
}

console.log(`\nListo: ${sentencias.length} sentencias aplicadas.`)
