// ─────────────────────────────────────────────────────────────────────────
// Avisa a los buscadores que aceptan IndexNow de que hay URLs nuevas.
//
// OJO: Google NO participa. Lo aceptan Bing, Yandex, Seznam y Naver. Para
// Google valen el sitemap y «Solicitar indexación» a mano en Search Console,
// que no tiene API para páginas normales.
//
// Cómo funciona: se publica un fichero <clave>.txt en la raíz del dominio con
// la clave dentro, y el buscador lo lee para comprobar que quien avisa manda
// de verdad en ese dominio. ⛔ Si el fichero no está PUBLICADO, la petición se
// acepta con un 200 y luego se descarta EN SILENCIO: por eso este script
// comprueba el fichero antes de enviar nada.
//
//   npm run indexnow             → todas las URLs del sitemap
//   npm run indexnow -- /una     → sólo esas rutas
//
// Aquí el sitemap lo genera Next en caliente (`app/sitemap.ts`), así que las
// URLs se leen del sitemap SERVIDO, no de un fichero del repositorio.
// ─────────────────────────────────────────────────────────────────────────
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

// El dominio se lee de `data/estudio.ts`, que es donde vive y sólo ahí. Se saca
// con una expresión regular en vez de importando el módulo porque esto es un
// `.mjs` y ese fichero es TypeScript.
const fuente = readFileSync(join(RAIZ, 'data/estudio.ts'), 'utf8')
const HOST = fuente.match(/^const DOMINIO = '([^']+)'/m)?.[1]
if (!HOST) throw new Error('No encuentro DOMINIO en data/estudio.ts')
const SITE = `https://${HOST}`

// La clave es el nombre del .txt que hay en public/: una sola fuente, así no
// puede desincronizarse de lo que está publicado.
const claves = readdirSync(join(RAIZ, 'public')).filter((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (claves.length !== 1) {
  throw new Error(`Esperaba UN fichero de clave en public/, encontré ${claves.length}: ${claves}`)
}
const CLAVE = claves[0].replace('.txt', '')

// 1) El fichero de clave tiene que estar publicado y decir la clave.
const comprobacion = await fetch(`${SITE}/${CLAVE}.txt`)
const contenido = comprobacion.ok ? (await comprobacion.text()).trim() : ''
if (contenido !== CLAVE) {
  console.error(`✗ ${SITE}/${CLAVE}.txt devuelve ${comprobacion.status} y dice «${contenido.slice(0, 40)}».`)
  console.error('  Sin ese fichero servido, IndexNow contesta 200 y descarta el aviso. Despliega primero.')
  process.exit(1)
}
console.log(`✓ clave verificada en ${SITE}/${CLAVE}.txt`)

// 2) Las URLs: las del sitemap servido, o las que se pasen por argumento.
const args = process.argv.slice(2)
let urls
if (args.length) {
  urls = args.map((r) => (r.startsWith('http') ? r : `${SITE}${r.startsWith('/') ? r : `/${r}`}`))
} else {
  const mapa = await fetch(`${SITE}/sitemap.xml`)
  if (!mapa.ok) throw new Error(`El sitemap devuelve ${mapa.status}`)
  urls = [...(await mapa.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

const ajenas = urls.filter((u) => !u.startsWith(SITE))
if (ajenas.length) throw new Error(`Estas URLs no son de ${HOST}: ${ajenas.join(', ')}`)
console.log(`  ${urls.length} URLs para enviar`)

// 3) Un solo aviso a api.indexnow.org, que lo reparte.
const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: CLAVE, keyLocation: `${SITE}/${CLAVE}.txt`, urlList: urls }),
})

const cuerpo = await res.text()
/* 200 aceptado · 202 aceptado con clave pendiente · 400 formato · 403 clave
   inválida · 422 URL de otro host · 429 demasiados */
if (res.status === 200 || res.status === 202) {
  console.log(`✓ IndexNow ha aceptado las ${urls.length} URLs (HTTP ${res.status})`)
  console.log('  Lo reciben Bing, Yandex, Seznam y Naver. Google NO participa.')
} else {
  console.error(`✗ IndexNow ha contestado ${res.status}: ${cuerpo.slice(0, 300)}`)
  process.exit(1)
}
