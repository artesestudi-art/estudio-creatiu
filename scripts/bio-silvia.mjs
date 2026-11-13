/**
 * Añade la presentación de Sílvia Cano al profesorado, en castellano y en
 * catalán (13/11/2026, texto suyo). Va la primera: es la fundadora.
 *
 * Toca solo `profesorado.personas` de las filas `portada` y `portada-ca`. Si
 * ya hay una ficha con su nombre, la sustituye; no duplica. Se lanza una vez:
 *   node scripts/bio-silvia.mjs
 * La portada lo coge en ≤5 min (revalidate).
 */
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const env = readFileSync(fileURLToPath(new URL('../.env.local', import.meta.url)), 'utf8')
const url = env.match(/^DATABASE_URL=(.*)$/m)?.[1].trim().replace(/^"|"$/g, '')
if (!url) throw new Error('Falta DATABASE_URL en .env.local')
const sql = neon(url)

const NOMBRE = 'Sílvia Cano'

const FICHAS = {
  portada: {
    nombre: NOMBRE,
    rol: 'Fundadora · Ilustradora y diseñadora',
    foto: '',
    bio: `Soy Sílvia Cano, la persona que está detrás de Art-és Espai Creatiu.

Si miro atrás, la idea de crear este espacio no ha surgido de un día para otro. Viene de lejos: del recuerdo de aquel taller al que, de pequeña, iba a aprender a dibujar, pintar y soñar. Desde entonces, el deseo de tener un espacio propio quedó grabado en mí.

Como ilustradora y diseñadora, me encanta mi profesión, pero el trabajo de estudio puede ser bastante solitario. Echaba de menos un punto de encuentro para artistas y artesanos.

Pero, sobre todo, quería crear un entorno acogedor para todos y todas vosotras. Un rincón donde frenar el ritmo diario y crear cosas bonitas con vuestras propias manos.

Porque no nos engañemos:
El mismo café sabe completamente diferente cuando te lo tomas en una taza hecha por ti.
Ese cuadro que te recibe al llegar a casa tiene otra luz si lo has pintado tú.
Y el neceser que te llevas de viaje tiene una historia especial cuando has cosido cada puntada.

Estoy segura de que, cada vez que miréis una pieza creada en Art-és, reviviréis esa misma sensación de paz y desconexión que sentisteis mientras la hacíais.

¡Yo misma os acompañaré en las clases de Art-Junior, de Art-ístic y en algunos de los monográficos!

Gracias por acompañarme en este sueño. ¡Bienvenidos y bienvenidas a mi casa creativa!`,
  },
  'portada-ca': {
    nombre: NOMBRE,
    rol: 'Fundadora · Il·lustradora i dissenyadora',
    foto: '',
    bio: `Soc la Sílvia Cano, la persona que hi ha darrere d'Art-és Espai Creatiu.

Si miro enrere, la idea de crear aquest espai no ha sorgit d'un dia per l'altre. Ve de lluny: del record d'aquell taller on, de petita, anava a aprendre a dibuixar, pintar i somiar. Des d'aleshores, el desig de tenir un espai propi va quedar gravat dins meu.

Com a il·lustradora i dissenyadora, m'encanta la meva professió, però la feina d'estudi pot ser força solitària. Trobava a faltar un punt de trobada per a artistes i artesans.

Però, sobretot, volia crear un entorn acollidor per a tots i totes vosaltres. Un racó on aturar el ritme diari i crear coses boniques amb les vostres pròpies mans.

Perquè no ens enganyem:
El mateix cafè té un gust completament diferent quan te'l prens en una tassa feta per tu.
Aquell quadre que et rep en arribar a casa té una altra llum si l'has pintat tu.
I el necesser que t'emportes de viatge té una història especial quan n'has cosit cada puntada.

Estic segura que, cada vegada que mireu una peça creada a Art-és, reviureu aquella mateixa sensació de pau i desconnexió que vau tenir mentre la fèieu.

Jo mateixa us acompanyaré a les classes d'Art-Junior, d'Art-ístic i a alguns dels monogràfics!

Gràcies per acompanyar-me en aquest somni. Benvinguts i benvingudes a la meva casa creativa!`,
  },
}

const esElla = (p) => /^s[ií]lvia cano/i.test((p?.nombre ?? '').trim())

for (const [clave, ficha] of Object.entries(FICHAS)) {
  const [fila] = await sql`SELECT valor FROM contenidos WHERE clave = ${clave}`
  if (!fila) {
    console.log(`${clave}: no existe la fila, no se toca`)
    continue
  }
  const valor = fila.valor
  const personas = valor.profesorado?.personas ?? []
  const previa = personas.find(esElla)
  /* Conserva lo que ya tuviera su ficha (foto, Instagram, obras). */
  const nueva = { ...(previa ?? {}), ...ficha, foto: previa?.foto || ficha.foto }
  valor.profesorado = { ...(valor.profesorado ?? {}), personas: [nueva, ...personas.filter((p) => !esElla(p))] }
  await sql`UPDATE contenidos SET valor = ${JSON.stringify(valor)}::jsonb, actualizado = now() WHERE clave = ${clave}`
  console.log(`${clave}: ${previa ? 'sustituida' : 'añadida'} · personas ahora: ${valor.profesorado.personas.map((p) => p.nombre).join(', ')}`)
}
