/**
 * Escribe los textos de la portada, en castellano y en catalán.
 *
 *   npm run portada
 *
 * Igual que `cargar-cursos.mjs`, esto existe para que producción se pueda
 * crear vacía y quedar escrita sin volcar la base de pruebas.
 *
 * Lo que había antes era la maqueta, y con el catálogo real delante MENTÍA:
 * juraba que el material estaba incluido cuando en las dos costuras los
 * tejidos van aparte, prometía «horario de tarde» habiendo tres cursos de
 * mañana, y hablaba de «barro, herramientas y horno» como si el taller fuera
 * solo de cerámica. Cada frase de aquí se puede comprobar contra los cursos
 * que hay en la base o contra lo que dijo Silvia en la reunión del 31/08/2026.
 *
 * ⚠️ Lo que sigue VACÍO, y vacío no se pinta:
 *   - `profesorado`: hay cuatro nombres (Silvia Cano, Alicia, Maria y Jordina)
 *     y de tres no se sabe ni el apellido, ni la trayectoria, ni si quieren
 *     salir. Una ficha de profesora inventada es lo peor que puede llevar esta
 *     web.
 *   - `galeria`: no hay una sola foto del taller.
 *   - `testimonios`: no hay ninguna opinión real. Ni una.
 *   - `talleres` a medida (cumpleaños, empresas, despedidas): Silvia dijo que
 *     los hace, pero no dijo qué incluyen ni a qué precio.
 */
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Usa: npm run portada (lee .env.local)')
  process.exit(1)
}

const VACIO = {
  talleres: { titulo: '', entradilla: '', lista: [] },
  profesorado: { titulo: '', entradilla: '', personas: [] },
  galeria: { titulo: '', entradilla: '', imagenes: [] },
  testimonios: { titulo: '', opiniones: [] },
}

const ES = {
  hero: {
    antetitulo: 'Taller de artes · Artés',
    titular: 'Cerámica, pintura y costura en un taller de Artés',
    entradilla:
      'Cursos de octubre a junio, un día a la semana, en grupos de seis a diez personas. Para niños desde primaria y para adultos que empiezan de cero. La primera clase es de prueba y no se paga.',
    cta: 'Ver los cursos',
    imagen: '',
    imagenAlt: '',
  },
  sobre: {
    titulo: 'El estudio',
    texto:
      'art-és es un taller de artes en Artés donde se aprende con las manos: pintura, dibujo, cómic, cerámica, costura y técnicas artesanales como el terrazo o la vidriera emplomada.\n\nLos grupos son pequeños y cada alumno avanza en su propio proyecto, a su ritmo, en lugar de hacer todos el mismo ejercicio. Los cursos van de octubre a junio, un día a la semana, y hay grupos de primaria, de secundaria y de adultos.',
    imagen: '',
    imagenAlt: '',
    puntos: [
      {
        titulo: 'Grupos pequeños',
        texto:
          'De seis a diez personas. Suficientes para que haya ambiente, pocas para que nadie se quede atrás.',
      },
      {
        titulo: 'Material incluido',
        texto:
          'Se viene con las manos vacías. En cerámica entran también las hornadas; en costura, los tejidos van aparte y hay una sección donde comprarlos.',
      },
      {
        titulo: 'Se empieza de cero',
        texto:
          'Ningún curso pide experiencia previa. No hace falta haber tocado nunca un pincel, el barro ni una máquina de coser.',
      },
      {
        titulo: 'Mañanas y tardes',
        texto:
          'Los grupos de primaria y secundaria empiezan a las 17:15. Los de adultos, entre semana por la mañana y también un día por la tarde.',
      },
    ],
  },
  cursos: {
    titulo: 'Cursos',
    entradilla:
      'De octubre a junio, un día a la semana. Cada curso tiene su página con el horario, el precio y las plazas de cada grupo. La convocatoria está abierta desde septiembre.',
  },
  metodo: {
    titulo: 'Cómo funciona',
    entradilla: 'De la primera duda a la primera clase, sin sorpresas.',
    pasos: [
      {
        titulo: 'Pides plaza',
        texto: 'Rellenas el formulario del curso que te interesa. No pagas nada todavía.',
      },
      {
        titulo: 'Te confirmamos',
        texto: 'Miramos las plazas del grupo y te escribimos para decirte si hay sitio.',
      },
      {
        titulo: 'Vienes a probar',
        texto: 'La primera clase es de prueba y es gratuita. Si no encaja, ahí se queda.',
      },
      {
        titulo: 'Te matriculas',
        texto:
          'Se acuerda la forma de pago —recibo domiciliado, transferencia o tarjeta— y ya tienes tu sitio en el grupo.',
      },
    ],
  },
  faq: {
    titulo: 'Preguntas frecuentes',
    preguntas: [
      {
        pregunta: '¿Hace falta saber dibujar?',
        respuesta:
          'No. Ninguno de los cursos pide experiencia previa: todos empiezan de cero, tanto los de niños como los de adultos.',
      },
      {
        pregunta: '¿El material está incluido?',
        respuesta:
          'Sí, y en cerámica entran también las hornadas. La única excepción son los tejidos de los talleres de costura: se compran en la sección de tejidos del taller o se traen de casa.',
      },
      {
        pregunta: '¿Cuántos días a la semana hay que venir?',
        respuesta:
          'Uno. Cada curso es de un día a la semana, de octubre a junio, y ese es el precio que aparece en su página.',
      },
      {
        pregunta: '¿Puedo probar antes de apuntarme?',
        respuesta: 'Sí. La primera clase es de prueba y no se paga.',
      },
      {
        pregunta: '¿Y si quiero dejarlo a mitad de curso?',
        respuesta:
          'Se avisa con quince días de antelación. Si el aviso llega más tarde, se cobra el mes siguiente.',
      },
      {
        pregunta: '¿Los cursos son para niños o para adultos?',
        respuesta:
          'Para los dos. Art-Junior, Cerámica Junior y Costura Junior son de primaria y secundaria; Art-ístico y Costura Básica, de adultos.',
      },
    ],
  },
  contacto: {
    titulo: 'Hablamos',
    entradilla:
      'Si dudas entre dos cursos o no sabes por dónde empezar, cuéntanoslo y te orientamos.',
  },
  newsletter: {
    titulo: 'Entérate de las nuevas convocatorias',
    entradilla: 'Un correo cuando se abren grupos nuevos. Ni uno más.',
  },
  ...VACIO,
}

const CA = {
  hero: {
    antetitulo: "Taller d'arts · Artés",
    titular: 'Ceràmica, pintura i costura en un taller a Artés',
    entradilla:
      "Cursos d'octubre a juny, un dia a la setmana, en grups de sis a deu persones. Per a infants des de primària i per a adults que comencen de zero. La primera classe és de prova i no es paga.",
    cta: 'Veure els cursos',
    imagen: '',
    imagenAlt: '',
  },
  sobre: {
    titulo: "L'estudi",
    texto:
      "art-és és un taller d'arts a Artés on s'aprèn amb les mans: pintura, dibuix, còmic, ceràmica, costura i tècniques artesanals com el terratzo o el vitrall emplomat.\n\nEls grups són petits i cada alumne avança en el seu propi projecte, al seu ritme, en comptes de fer tothom el mateix exercici. Els cursos van d'octubre a juny, un dia a la setmana, i hi ha grups de primària, de secundària i d'adults.",
    imagen: '',
    imagenAlt: '',
    puntos: [
      {
        titulo: 'Grups petits',
        texto:
          'De sis a deu persones. Prou perquè hi hagi ambient, poques perquè ningú no es quedi enrere.',
      },
      {
        titulo: 'Material inclòs',
        texto:
          "S'hi ve amb les mans buides. A ceràmica hi entren també les fornades; a costura, els teixits van a part i hi ha una secció on comprar-los.",
      },
      {
        titulo: 'Es comença de zero',
        texto:
          'Cap curs demana experiència prèvia. No cal haver tocat mai un pinzell, el fang ni una màquina de cosir.',
      },
      {
        titulo: 'Matins i tardes',
        texto:
          "Els grups de primària i secundària comencen a les 17:15. Els d'adults, entre setmana al matí i també un dia a la tarda.",
      },
    ],
  },
  cursos: {
    titulo: 'Cursos',
    entradilla:
      "D'octubre a juny, un dia a la setmana. Cada curs té la seva pàgina amb l'horari, el preu i les places de cada grup. La convocatòria és oberta des del setembre.",
  },
  metodo: {
    titulo: 'Com funciona',
    entradilla: 'Del primer dubte a la primera classe, sense sorpreses.',
    pasos: [
      {
        titulo: 'Demanes plaça',
        texto: "Omples el formulari del curs que t'interessa. Encara no pagues res.",
      },
      {
        titulo: 'Et confirmem',
        texto: "Mirem les places del grup i t'escrivim per dir-te si hi ha lloc.",
      },
      {
        titulo: 'Véns a provar',
        texto: 'La primera classe és de prova i és gratuïta. Si no encaixa, aquí es queda.',
      },
      {
        titulo: "T'hi matricules",
        texto:
          "S'acorda la forma de pagament —rebut domiciliat, transferència o targeta— i ja tens el teu lloc al grup.",
      },
    ],
  },
  faq: {
    titulo: 'Preguntes freqüents',
    preguntas: [
      {
        pregunta: 'Cal saber dibuixar?',
        respuesta:
          "No. Cap dels cursos demana experiència prèvia: tots comencen de zero, tant els d'infants com els d'adults.",
      },
      {
        pregunta: 'El material està inclòs?',
        respuesta:
          "Sí, i a ceràmica hi entren també les fornades. L'única excepció són els teixits dels tallers de costura: es compren a la secció de teixits del taller o es porten de casa.",
      },
      {
        pregunta: 'Quants dies a la setmana cal venir?',
        respuesta:
          "Un. Cada curs és d'un dia a la setmana, d'octubre a juny, i aquest és el preu que surt a la seva pàgina.",
      },
      {
        pregunta: 'Puc provar abans d’apuntar-m’hi?',
        respuesta: 'Sí. La primera classe és de prova i no es paga.',
      },
      {
        pregunta: 'I si ho vull deixar a mig curs?',
        respuesta:
          "S'avisa amb quinze dies d'antelació. Si l'avís arriba més tard, es cobra el mes següent.",
      },
      {
        pregunta: "Els cursos són per a infants o per a adults?",
        respuesta:
          'Per als dos. Art-Junior, Ceràmica Junior i Costura Junior són de primària i secundària; Art-ístic i Costura Bàsica, d’adults.',
      },
    ],
  },
  contacto: {
    titulo: 'Parlem-ne',
    entradilla:
      "Si dubtes entre dos cursos o no saps per on començar, explica'ns-ho i t'orientem.",
  },
  newsletter: {
    titulo: "Assabenta't de les noves convocatòries",
    entradilla: "Un correu quan s'obren grups nous. Ni un més.",
  },
  ...VACIO,
}

const sql = neon(url)
console.log(`Base de datos: ${url.replace(/:[^:@]*@/, ':****@')}\n`)

for (const [clave, valor] of [
  ['portada', ES],
  ['portada-ca', CA],
]) {
  await sql`
    INSERT INTO contenidos (clave, valor) VALUES (${clave}, ${JSON.stringify(valor)})
    ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado = now()
  `
  console.log(`  ✓ ${clave}`)
}

console.log('\nProfesorado, galería, testimonios y talleres a medida siguen vacíos a propósito.')
