/**
 * Corta el build si quedan datos del estudio sin rellenar.
 *
 * El motivo: un `PENDIENTE` en el teléfono o en la dirección no da error en
 * ningún sitio, se despliega tan tranquilo y acaba indexado en Google. Más
 * vale que reviente aquí, en tu Mac, que en la ficha de Google Business del
 * cliente.
 *
 * Para saltárselo a propósito (una previsualización, una demo interna):
 *   PERMITIR_PENDIENTES=1 npm run build
 */
import { readFileSync } from 'node:fs'

const fuente = readFileSync(new URL('../data/estudio.ts', import.meta.url), 'utf8')

// Se cuentan solo los PENDIENTE que son VALOR (`campo: PENDIENTE,`), no los
// que aparecen en los comentarios ni la constante que lo define.
const pendientes = [...fuente.matchAll(/^\s*(\w+):\s*PENDIENTE,/gm)].map((m) => m[1])

if (pendientes.length === 0) {
  console.log('✓ Datos del estudio completos.')
  process.exit(0)
}

const permitido = process.env.PERMITIR_PENDIENTES === '1'
const aviso = permitido ? '⚠️  ' : '⛔ '

console.error(`\n${aviso}Faltan ${pendientes.length} datos del estudio en data/estudio.ts:\n`)
for (const campo of pendientes) console.error(`   · ${campo}`)

if (permitido) {
  console.error('\nPERMITIR_PENDIENTES=1: se sigue adelante. Esto NO debe subir a producción.\n')
  process.exit(0)
}

console.error('\nRellénalos con los datos REALES del cliente. No los inventes:')
console.error('un teléfono inventado son llamadas a un desconocido y una ficha de')
console.error('Google suspendida por datos incoherentes.\n')
console.error('Para una previsualización interna: PERMITIR_PENDIENTES=1 npm run build\n')
process.exit(1)
