/**
 * Carga el catálogo REAL del estudio, el que mandó Silvia.
 *
 *   npm run cursos          → contra la base de DATABASE_URL de .env.local
 *
 * Por qué existe este fichero y no un volcado de la base de pruebas:
 * producción se crea vacía con `migrar.mjs`, y la base de desarrollo llevaba
 * tres cursos inventados. Estos cinco son los de verdad, salidos del Excel
 * «Libro (1).xlsx» del 03/09/2026, y por eso viajan en el repositorio: el día
 * que se enchufe la base del cliente se lanza esto y el catálogo está puesto,
 * sin copiar ni una fila de pruebas.
 *
 * Es idempotente: se reconoce por `slug` y actualiza en vez de duplicar. Lo
 * que Silvia cambie desde el panel se pierde si se relanza, así que en cuanto
 * ella empiece a editar, este script deja de usarse.
 *
 * ⚠️ Lo que NO está aquí porque nadie lo ha dicho todavía:
 *   - Si los 48/50/55/65 € son AL MES. `precio_centimos` se queda en NULL a
 *     propósito: sin esa respuesta el schema.org no declara precio y la web
 *     enseña la frase literal de Silvia, que es verdad, en vez de un «/mes»
 *     inventado.
 *   - Qué edades son «Primaria» y «Secundaria».
 *   - El día exacto de octubre en que empieza cada grupo: las convocatorias
 *     van sin `inicio` ni `fin`.
 */
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Usa: npm run cursos (lee .env.local)')
  process.exit(1)
}

/** Los tres cursos de maqueta que había en la base de desarrollo. */
const DE_PRUEBA = ['ceramica-torno-basico', 'dibujo-del-natural', 'acuarela-para-empezar']

/**
 * El catálogo, tal como lo escribió Silvia.
 *
 * Los textos son suyos. Lo único que se ha tocado:
 *   - los horarios, que venían como «17:15h -18:45h», se han compuesto igual
 *     en los cinco cursos (mismo dato, misma forma);
 *   - dos filas del Excel traían el catalán metido en la columna castellana
 *     («Limitades a 10 alumnes per grup») y aquí van en su idioma;
 *   - las erratas del original: «o vbien», «Di martes», «d'aprendre a
 *     utilitzar», «A Art-ísticexplorarem», «el terràs» (que es una azotea, no
 *     el terrazo) y «la vidriera» (en catalán, «el vitrall»).
 * Todo eso hay que enseñárselo a ella; ninguna corrección cambia un dato.
 */
const CURSOS = [
  {
    slug: 'art-junior',
    titulo: 'Art-Junior',
    disciplina: 'Multidisciplinar',
    nivel: 'Sin experiencia previa',
    resumen: 'Un espacio pensado para explorar, experimentar y pasarlo bien a través del arte.',
    descripcion:
      'En Art-Junior no buscamos resultados perfectos, sino disfrutar del proceso creativo, perder el miedo a la hoja en blanco y descubrir nuevas formas de expresarnos. A lo largo del curso tocaremos disciplinas tan variadas como la pintura, el dibujo, el cómic o las manualidades, probando distintos materiales y técnicas en cada proyecto.\n\nNo es necesario tener experiencia previa, solo ganas de pasarlo bien y crear.\n\nTodo el material está incluido.',
    duracion: 'De octubre a junio',
    horario: 'De lunes a jueves · Primaria 17:15–18:45 h · Secundaria 19:00–20:30 h',
    precio_texto: '48 € un día a la semana',
    plazas: 10,
    profesor: 'Silvia Cano',
    orden: 1,
    ca: {
      slug: 'art-junior',
      titulo: 'Art-Junior',
      disciplina: 'Multidisciplinari',
      nivel: 'Sense experiència prèvia',
      resumen: "Un espai pensat per explorar, experimentar i passar-ho bé a través de l'art.",
      descripcion:
        "A Art-Junior no busquem resultats perfectes, sinó gaudir del procés creatiu, perdre la por a la fulla en blanc i descobrir noves formes d'expressar-nos. Al llarg del curs tocarem disciplines tan variades com la pintura, el dibuix, el còmic o les manualitats, provant diferents materials i tècniques a cada projecte.\n\nNo cal tenir experiència prèvia, només ganes de passar-ho bé i crear.\n\nTot el material està inclòs.",
      duracion: "D'octubre a juny",
      horario: 'De dilluns a dijous · Primària 17:15–18:45 h · Secundària 19:00–20:30 h',
      precio_texto: '48 € un dia a la setmana',
    },
    convocatorias: [
      {
        etiqueta: 'Primaria',
        horario: 'De lunes a jueves, 17:15–18:45 h',
        plazas: 10,
        ca: { etiqueta: 'Primària', horario: 'De dilluns a dijous, 17:15–18:45 h' },
      },
      {
        etiqueta: 'Secundaria',
        horario: 'De lunes a jueves, 19:00–20:30 h',
        plazas: 10,
        ca: { etiqueta: 'Secundària', horario: 'De dilluns a dijous, 19:00–20:30 h' },
      },
    ],
  },

  {
    slug: 'ceramica-junior',
    titulo: 'Cerámica Junior',
    disciplina: 'Cerámica',
    nivel: 'Sin experiencia previa',
    resumen:
      'Un taller diseñado para descubrir el arte de la cerámica y el volumen de forma divertida y cercana.',
    descripcion:
      'En Cerámica Junior los alumnos aprenderán el oficio artesanal desde la experimentación, dando forma a sus propias ideas y creando piezas únicas. A través de diferentes ejercicios, exploraremos el material, sus tiempos y sus posibilidades, disfrutando del contacto con la materia sin presión por el resultado.\n\nNo es necesario tener experiencia previa, solo ganas de pasarlo bien y crear.\n\nEl precio incluye el material y las hornadas.',
    duracion: 'De octubre a junio',
    horario: 'Viernes · Primaria 17:15–18:45 h · Secundaria 19:00–20:30 h',
    precio_texto: '65 € un día a la semana',
    plazas: 10,
    profesor: 'Alicia',
    orden: 2,
    ca: {
      slug: 'ceramica-junior',
      titulo: 'Ceràmica Junior',
      disciplina: 'Ceràmica',
      nivel: 'Sense experiència prèvia',
      resumen:
        "Un taller dissenyat per descobrir l'art de la ceràmica i el volum de manera divertida i propera.",
      descripcion:
        "A Ceràmica Junior els alumnes aprendran l'ofici artesanal des de l'experimentació, donant forma a les seves pròpies idees i creant peces úniques. A través de diferents exercicis, explorarem el material, els seus temps i les seves possibilitats, gaudint del contacte amb la matèria sense pressió pel resultat.\n\nNo cal tenir experiència prèvia, només ganes de passar-ho bé i crear.\n\nEl preu inclou el material i les fornades.",
      duracion: "D'octubre a juny",
      horario: 'Divendres · Primària 17:15–18:45 h · Secundària 19:00–20:30 h',
      precio_texto: '65 € un dia a la setmana',
    },
    convocatorias: [
      {
        etiqueta: 'Primaria',
        horario: 'Viernes, 17:15–18:45 h',
        plazas: 10,
        ca: { etiqueta: 'Primària', horario: 'Divendres, 17:15–18:45 h' },
      },
      {
        etiqueta: 'Secundaria',
        horario: 'Viernes, 19:00–20:30 h',
        plazas: 10,
        ca: { etiqueta: 'Secundària', horario: 'Divendres, 19:00–20:30 h' },
      },
    ],
  },

  {
    slug: 'costura-junior',
    titulo: 'Costura Junior',
    disciplina: 'Costura',
    nivel: 'Desde cero',
    resumen:
      'Un taller práctico y creativo para que los más jóvenes aprendan a utilizar la máquina de coser desde el primer día.',
    descripcion:
      'En Costura Junior perderemos el miedo a la máquina, aprenderemos las técnicas básicas de confección y daremos vida a accesorios únicos y totalmente personalizados. Un espacio donde combinar creatividad, diseño y habilidad manual para crear proyectos propios con orgullo.\n\nNo es necesario tener conocimientos previos: empezamos desde cero.\n\nIncluye el material, excepto los tejidos: en el taller hay una sección de tejidos que se pueden comprar, o bien traerlos de casa.',
    duracion: 'De octubre a junio',
    horario: 'Jueves 18:30–19:30 h',
    precio_texto: '50 € un día a la semana',
    plazas: 6,
    profesor: 'Maria',
    orden: 3,
    ca: {
      slug: 'costura-junior',
      titulo: 'Costura Junior',
      disciplina: 'Costura',
      nivel: 'Des de zero',
      resumen:
        'Un taller pràctic i creatiu perquè els més joves aprenguin a utilitzar la màquina de cosir des del primer dia.',
      descripcion:
        'A Costura Junior perdrem la por a la màquina, aprendrem les tècniques bàsiques de confecció i donarem vida a accessoris únics i totalment personalitzats. Un espai on combinar creativitat, disseny i habilitat manual per crear projectes propis amb orgull.\n\nNo cal tenir coneixements previs: comencem des de zero.\n\nInclou el material, excepte els teixits: al taller hi ha una secció de teixits que es poden comprar, o bé portar-los de casa.',
      duracion: "D'octubre a juny",
      horario: 'Dijous 18:30–19:30 h',
      precio_texto: '50 € un dia a la setmana',
    },
    convocatorias: [
      {
        etiqueta: 'Jueves',
        horario: '18:30–19:30 h',
        plazas: 6,
        ca: { etiqueta: 'Dijous', horario: '18:30–19:30 h' },
      },
    ],
  },

  {
    slug: 'art-istico',
    titulo: 'Art-ístico',
    disciplina: 'Multidisciplinar',
    nivel: 'Sin conocimientos previos',
    resumen:
      'Un espacio pensado para parar el ritmo diario, liberar el estrés y reconectar con tu creatividad.',
    descripcion:
      'En Art-ístico exploraremos el arte desde una perspectiva multidisciplinar y práctica: desde la pintura y el dibujo hasta técnicas artesanales como el terrazo, la vidriera o pequeños proyectos de costura. Cada alumno trabajará a su propio ritmo en proyectos personalizados, probando herramientas y materiales diversos.\n\nNo se necesitan conocimientos previos, solo ganas de regalarte un tiempo para ti.\n\nTodo el material está incluido.',
    duracion: 'De octubre a junio',
    horario: 'Lunes 10:00–11:30 h · Jueves 11:00–12:30 h',
    precio_texto: '55 € un día a la semana',
    plazas: 10,
    profesor: 'Silvia Cano',
    orden: 4,
    ca: {
      slug: 'art-istic',
      titulo: 'Art-ístic',
      disciplina: 'Multidisciplinari',
      nivel: 'Sense coneixements previs',
      resumen:
        "Un espai pensat per aturar el ritme diari, alliberar l'estrès i reconnectar amb la teva creativitat.",
      descripcion:
        "A Art-ístic explorarem l'art des d'una perspectiva multidisciplinària i pràctica: des de la pintura i el dibuix fins a tècniques artesanals com el terratzo, el vitrall o petits projectes de costura. Cada alumne treballarà al seu propi ritme en projectes personalitzats, provant eines i materials diversos.\n\nNo calen coneixements previs, només ganes de regalar-te un temps per a tu.\n\nTot el material està inclòs.",
      duracion: "D'octubre a juny",
      horario: 'Dilluns 10:00–11:30 h · Dijous 11:00–12:30 h',
      precio_texto: '55 € un dia a la setmana',
    },
    convocatorias: [
      {
        etiqueta: 'Lunes',
        horario: '10:00–11:30 h',
        plazas: 10,
        ca: { etiqueta: 'Dilluns', horario: '10:00–11:30 h' },
      },
      {
        etiqueta: 'Jueves',
        horario: '11:00–12:30 h',
        plazas: 10,
        ca: { etiqueta: 'Dijous', horario: '11:00–12:30 h' },
      },
    ],
  },

  {
    slug: 'costura-basica',
    titulo: 'Costura Básica',
    disciplina: 'Costura',
    nivel: 'Desde cero',
    resumen:
      'Un taller práctico diseñado para quienes quieren aprender a coser a máquina desde cero, de forma sencilla, a su ritmo y en un ambiente relajado.',
    descripcion:
      'En este curso aprenderás a dominar la máquina de coser, entender los diferentes tipos de puntadas y confeccionar tus propios accesorios y complementos únicos. Una forma perfecta de desconectar, ejercitar la creatividad manual y crear cosas hechas por ti de principio a fin.\n\nNo se necesitan conocimientos previos: empezamos desde el primer paso.\n\nIncluye el material, excepto los tejidos: en el taller hay una sección de tejidos que se pueden comprar, o bien traerlos de casa.',
    duracion: 'De octubre a junio',
    horario: 'Martes 10:00–11:30 h · Miércoles 17:00–18:30 h',
    precio_texto: '55 € un día a la semana',
    plazas: 6,
    profesor: 'Jordina',
    orden: 5,
    ca: {
      slug: 'costura-basica',
      titulo: 'Costura Bàsica',
      disciplina: 'Costura',
      nivel: 'Des de zero',
      resumen:
        'Un taller pràctic dissenyat per a qui vulgui aprendre a cosir a màquina des de zero, de manera senzilla, al seu ritme i en un ambient relaxat.',
      descripcion:
        'En aquest curs aprendràs a dominar la màquina de cosir, entendre els diferents tipus de puntades i confeccionar els teus propis accessoris i complements únics. Una manera perfecta de desconnectar, exercitar la creativitat manual i crear coses fetes per tu de principi a fi.\n\nNo calen coneixements previs: comencem des del primer pas.\n\nInclou el material, excepte els teixits: al taller hi ha una secció de teixits que es poden comprar, o bé portar-los de casa.',
      duracion: "D'octubre a juny",
      horario: 'Dimarts 10:00–11:30 h · Dimecres 17:00–18:30 h',
      precio_texto: '55 € un dia a la setmana',
    },
    convocatorias: [
      {
        etiqueta: 'Martes',
        horario: '10:00–11:30 h',
        plazas: 6,
        ca: { etiqueta: 'Dimarts', horario: '10:00–11:30 h' },
      },
      {
        etiqueta: 'Miércoles',
        horario: '17:00–18:30 h',
        plazas: 6,
        ca: { etiqueta: 'Dimecres', horario: '17:00–18:30 h' },
      },
    ],
  },
]

const sql = neon(url)
const rama = url.match(/@ep-[^.]*\.([^.]*)\./)?.[1] ?? '¿?'
console.log(`Base de datos: ${url.replace(/:[^:@]*@/, ':****@')}`)
console.log(`Región/rama: ${rama}\n`)

/* ── Fuera los de maqueta ───────────────────────────────────────────────── */
for (const slug of DE_PRUEBA) {
  const borrados = await sql`DELETE FROM cursos WHERE slug = ${slug} RETURNING titulo`
  if (borrados.length) console.log(`  – borrado (maqueta): ${borrados[0].titulo}`)
}

/* ── El catálogo real ───────────────────────────────────────────────────── */
for (const c of CURSOS) {
  const [curso] = await sql`
    INSERT INTO cursos (
      slug, titulo, disciplina, modalidad, nivel, resumen, descripcion,
      duracion, horario, precio_texto, precio_centimos, plazas, profesor,
      orden, publicado, ca
    ) VALUES (
      ${c.slug}, ${c.titulo}, ${c.disciplina}, 'presencial', ${c.nivel},
      ${c.resumen}, ${c.descripcion}, ${c.duracion}, ${c.horario},
      ${c.precio_texto}, NULL, ${c.plazas}, ${c.profesor},
      ${c.orden}, true, ${JSON.stringify(c.ca)}
    )
    ON CONFLICT (slug) DO UPDATE SET
      titulo = EXCLUDED.titulo,
      disciplina = EXCLUDED.disciplina,
      nivel = EXCLUDED.nivel,
      resumen = EXCLUDED.resumen,
      descripcion = EXCLUDED.descripcion,
      duracion = EXCLUDED.duracion,
      horario = EXCLUDED.horario,
      precio_texto = EXCLUDED.precio_texto,
      plazas = EXCLUDED.plazas,
      profesor = EXCLUDED.profesor,
      orden = EXCLUDED.orden,
      publicado = EXCLUDED.publicado,
      ca = EXCLUDED.ca,
      actualizado = now()
    RETURNING id, titulo
  `

  /* Las convocatorias se rehacen enteras: son pocas y no tienen identidad
     propia fuera del curso. Se borran solo las que no tengan a nadie apuntado,
     para no llevarse por delante una inscripción real. */
  const conGente = await sql`
    SELECT DISTINCT convocatoria_id AS id FROM inscripciones
    WHERE convocatoria_id IS NOT NULL
  `
  const protegidas = conGente.map((f) => f.id)
  await sql`
    DELETE FROM convocatorias
    WHERE curso_id = ${curso.id} AND NOT (id = ANY(${protegidas}::int[]))
  `

  let orden = 0
  for (const v of c.convocatorias) {
    await sql`
      INSERT INTO convocatorias (curso_id, etiqueta, horario, plazas, estado, orden, ca)
      VALUES (${curso.id}, ${v.etiqueta ?? null}, ${v.horario}, ${v.plazas},
              'abierta', ${orden++}, ${JSON.stringify(v.ca ?? {})})
    `
  }

  console.log(`  ✓ ${curso.titulo}  (${c.convocatorias.length} grupo/s)`)
}

const [resumen] = await sql`
  SELECT (SELECT COUNT(*) FROM cursos)::int AS cursos,
         (SELECT COUNT(*) FROM convocatorias)::int AS convocatorias
`
console.log(`\nEn la base: ${resumen.cursos} cursos y ${resumen.convocatorias} grupos.`)
