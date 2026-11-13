import type { Obra, Profesor } from '@/lib/contenido'
import type { Idioma } from '@/lib/idioma'

/**
 * La ficha de Sílvia Cano, la fundadora, escrita en el código.
 *
 * Por qué aquí y no solo en la base: el profesorado vive en la base de
 * producción (`artes-datos`), que está en el Vercel de la clienta y solo se
 * toca desde su panel. Para no depender de eso, la web la pone la primera
 * siempre que la base NO tenga ya una ficha con su nombre. Si un día se añade
 * desde el panel, manda la del panel y esta deja de usarse sola.
 *
 * Mismo texto que `scripts/bio-silvia.mjs` (13/11/2026, texto suyo).
 */
const NOMBRE = 'Sílvia Cano'

const FICHAS: Record<Idioma, Profesor> = {
  es: {
    nombre: NOMBRE,
    rol: 'Fundadora · Ilustradora y diseñadora',
    foto: '/obra/silvia-cano.jpg',
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
  ca: {
    nombre: NOMBRE,
    rol: 'Fundadora · Il·lustradora i dissenyadora',
    foto: '/obra/silvia-cano.jpg',
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

/* Sus ilustraciones (13/11/2026, mandadas por WhatsApp), recortadas y
   optimizadas en public/obra/. `ancho`/`alto` = tamaño real del fichero. */
const OBRAS: Record<Idioma, Obra[]> = {
  es: [
    { url: '/obra/silvia-mapa-artes.jpg', ancho: 1600, alto: 1418, alt: 'Mapa ilustrado de Artés con el logotipo de art-és Espai Creatiu', pie: 'Mapa ilustrado de Artés' },
    { url: '/obra/silvia-un-raco-a-artes.jpg', ancho: 1141, alto: 1600, alt: 'Cartel de art-és con personajes haciendo cerámica, costura, crochet y dibujo', pie: '«Un racó a Artés per aturar el temps i crear»' },
    { url: '/obra/silvia-cor.jpg', ancho: 1045, alto: 1343, alt: 'Ilustración de una chica que abraza un gran corazón rojo', pie: 'Ilustración' },
    { url: '/obra/silvia-bones-festes.jpg', ancho: 1164, alto: 1469, alt: 'Felicitación navideña: una niña abraza un caballito rojo de Dalarna bajo una estrella fugaz', pie: 'Felicitación «Bones Festes»' },
  ],
  ca: [
    { url: '/obra/silvia-mapa-artes.jpg', ancho: 1600, alto: 1418, alt: "Mapa il·lustrat d'Artés amb el logotip d'art-és Espai Creatiu", pie: "Mapa il·lustrat d'Artés" },
    { url: '/obra/silvia-un-raco-a-artes.jpg', ancho: 1141, alto: 1600, alt: "Cartell d'art-és amb personatges fent ceràmica, costura, ganxet i dibuix", pie: '«Un racó a Artés per aturar el temps i crear»' },
    { url: '/obra/silvia-cor.jpg', ancho: 1045, alto: 1343, alt: "Il·lustració d'una noia que abraça un gran cor vermell", pie: 'Il·lustració' },
    { url: '/obra/silvia-bones-festes.jpg', ancho: 1164, alto: 1469, alt: 'Felicitació nadalenca: una nena abraça un cavallet vermell de Dalarna sota un estel fugaç', pie: 'Felicitació «Bones Festes»' },
  ],
}

export const esSilvia = (p: { nombre?: string }) => /^s[ií]lvia cano/i.test((p?.nombre ?? '').trim())

export function fichaSilvia(idioma: Idioma): Profesor {
  return { ...FICHAS[idioma], obras: OBRAS[idioma] }
}
