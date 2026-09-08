/**
 * Carga el catálogo REAL del estudio, el que mandó Silvia.
 *
 *   npm run cursos          → contra la base de DATABASE_URL de .env.local
 *
 * Por qué existe este fichero y no un volcado de la base de pruebas:
 * producción se crea vacía con `migrar.mjs`, y la base de desarrollo llevaba
 * tres cursos inventados. Estos ocho son los de verdad, salidos del Excel
 * «Libro (1) (1).xlsx» del 08/09/2026, que sustituye al del 03/09: la clienta
 * añadió tres cursos y movió los horarios de dos. Por eso viajan en el
 * repositorio: el día que se enchufe la base del cliente se lanza esto y el
 * catálogo está puesto, sin copiar ni una fila de pruebas.
 *
 * Es idempotente: se reconoce por `slug` y actualiza en vez de duplicar. Lo
 * que Silvia cambie desde el panel se pierde si se relanza, así que en cuanto
 * ella empiece a editar, este script deja de usarse.
 *
 * ⚠️ LO QUE HAY QUE PREGUNTARLE ANTES DE PUBLICAR
 *
 * 1. ART-JUNIOR: LOS DÍAS NO CUADRAN ENTRE SUS DOS HOJAS.
 *    La hoja de textos dice «De lunes a miércoles … // jueves». La hoja
 *    HORARIOS —el cuadro de salas— pone Art-Junior en MARTES, MIÉRCOLES y
 *    JUEVES, y el lunes de 19:00 a 20:30 en la Sala A lo ocupa Art-ístico de
 *    adultos, que es exactamente la hora de la Secundaria de Art-Junior. Las
 *    dos cosas no caben en la misma sala. Aquí manda el cuadro de salas, que
 *    es el que reparte el espacio, pero esto lo tiene que confirmar ella.
 *
 * 2. ¿Los 48/50/55/65 € son AL MES? Sigue sin decirlo. El taller de crochet
 *    lo insinúa —trimestral y «un solo pago: 150 €», que son tres meses menos
 *    descuento—, pero insinuar no es decir. `precio_centimos` se queda en NULL
 *    a propósito en los ocho: sin esa respuesta el schema.org no declara
 *    precio y la web enseña la frase literal de Silvia, que es verdad, en vez
 *    de un «/mes» inventado.
 *
 * 3. Qué edades son «Primaria» y «Secundaria». De Costura Junior y de
 *    Pequeños creadores sí lo sabemos: el cuadro de salas dice «a partir de
 *    10 anys», y así va puesto.
 *
 * 4. El día exacto de octubre en que empieza cada grupo: las convocatorias
 *    van sin `inicio` ni `fin`. El Excel solo dice «convocatoria abierta a
 *    partir de septiembre», que ya está en la entradilla de la portada.
 *
 * Correcciones hechas sobre el original, ninguna cambia un dato:
 *   - los horarios se componen igual en los ocho cursos (mismo dato, misma
 *     forma), y los grupos se sacan a `convocatorias`;
 *   - cuatro filas traían el catalán metido en la columna castellana
 *     («Limitades a 10 alumnes per grup») y dos, el castellano en la catalana
 *     («Convocatoria abierta a partir de septiembre»);
 *   - el catalán de los tres cursos nuevos venía pegado de un PDF, con las
 *     palabras del final de renglón unidas a las del siguiente
 *     («perexperimentar», «màquina decosir») y DOS CELDAS CORTADAS A MEDIA
 *     FRASE (crochet: «…adaptar al seu propi» y «…al seu ritme i donar»). Se
 *     han despegado y se han cerrado las dos frases con lo que dice su propio
 *     castellano, que iba al lado;
 *   - erratas del original: «o vbien», «Di martes», «Octurbre», «decembre»,
 *     «d'aprendre a utilitzar», «No es necesario experiencia previa»,
 *     «Este es tu espacio!» sin la abierta, «el terràs» (que es una azotea, no
 *     el terrazo), «la vidriera» (en catalán, «el vitrall») y «bolso» en
 *     catalán, que es «bossa»;
 *   - el reclamo largo de dos títulos («· ¡Imagina, crea y hazlo realidad!»)
 *     va a `seo_titulo`: sale entero en Google y no revienta el titular de la
 *     página, que es de cuerpo enorme.
 *
 * ⚠️ El resumen catalán de Art-ístico dice «sense jutjar-te» y el castellano
 * no dice «sin juzgarte». Se dejan los dos como ella los escribió; que decida
 * cuál de los dos vale.
 */
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta DATABASE_URL. Usa: npm run cursos (lee .env.local)')
  process.exit(1)
}

/** Los tres cursos de maqueta que había en la base de desarrollo. */
const DE_PRUEBA = ['ceramica-torno-basico', 'dibujo-del-natural', 'acuarela-para-empezar']

/* Las dos coletillas que Silvia repite curso a curso, escritas una sola vez:
   si cambia la norma de los tejidos, cambia en los cuatro talleres a la vez. */
const TEJIDOS_ES =
  'Incluye el material, excepto los tejidos: en el taller hay una sección de tejidos que se pueden comprar, o bien traerlos de casa.'
const TEJIDOS_CA =
  'Inclou el material, excepte els teixits: al taller hi ha una secció de teixits que es poden comprar, o bé portar-los de casa.'
const TODO_ES = 'Todo el material está incluido.'
const TODO_CA = 'Tot el material està inclòs.'

/** El catálogo, tal como lo escribió Silvia. */
const CURSOS = [
  /* ─────────────────── Niños y adolescentes ─────────────────── */
  {
    slug: 'art-junior',
    titulo: 'Art-Junior',
    disciplina: 'Multidisciplinar',
    nivel: 'Sin experiencia previa',
    resumen: 'Un espacio pensado para explorar, experimentar y pasarlo bien a través del arte.',
    descripcion: [
      'En Art-Junior no buscamos resultados perfectos, sino disfrutar del proceso creativo, perder el miedo a la hoja en blanco y descubrir nuevas formas de expresarnos. A lo largo del curso tocaremos disciplinas tan variadas como la pintura, el dibujo, el cómic o las manualidades, probando distintos materiales y técnicas en cada proyecto.',
      'No es necesario tener experiencia previa, solo ganas de pasarlo bien y crear.',
      TODO_ES,
    ].join('\n\n'),
    duracion: 'De octubre a junio',
    horario: 'De martes a jueves · Primaria 17:15–18:45 h · Secundaria (martes y miércoles) 19:00–20:30 h',
    precio_texto: '48 € un día a la semana',
    plazas: 10,
    profesor: 'Silvia Cano · @art_esespaicreatiu',
    orden: 1,
    ca: {
      slug: 'art-junior',
      titulo: 'Art-Junior',
      disciplina: 'Multidisciplinari',
      nivel: 'Sense experiència prèvia',
      resumen: "Un espai pensat per explorar, experimentar i passar-ho bé a través de l'art.",
      descripcion: [
        "A Art-Junior no busquem resultats perfectes, sinó gaudir del procés creatiu, perdre la por a la fulla en blanc i descobrir noves formes d'expressar-nos. Al llarg del curs tocarem disciplines tan variades com la pintura, el dibuix, el còmic o les manualitats, provant diferents materials i tècniques a cada projecte.",
        'No cal tenir experiència prèvia, només ganes de passar-ho bé i crear.',
        TODO_CA,
      ].join('\n\n'),
      duracion: "D'octubre a juny",
      horario: 'De dimarts a dijous · Primària 17:15–18:45 h · Secundària (dimarts i dimecres) 19:00–20:30 h',
      precio_texto: '48 € un dia a la setmana',
      profesor: 'Silvia Cano · @art_esespaicreatiu',
    },
    convocatorias: [
      {
        etiqueta: 'Primaria',
        horario: 'Martes, miércoles o jueves, 17:15–18:45 h',
        plazas: 10,
        ca: { etiqueta: 'Primària', horario: 'Dimarts, dimecres o dijous, 17:15–18:45 h' },
      },
      {
        etiqueta: 'Secundaria',
        horario: 'Martes o miércoles, 19:00–20:30 h',
        plazas: 10,
        ca: { etiqueta: 'Secundària', horario: 'Dimarts o dimecres, 19:00–20:30 h' },
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
    descripcion: [
      'En Cerámica Junior los alumnos aprenderán el oficio artesanal desde la experimentación, dando forma a sus propias ideas y creando piezas únicas. A través de diferentes ejercicios, exploraremos el material, sus tiempos y sus posibilidades, disfrutando del contacto con la materia sin presión por el resultado.',
      'No es necesario tener experiencia previa, solo ganas de pasarlo bien y crear.',
      'El precio incluye el material y las hornadas.',
    ].join('\n\n'),
    duracion: 'De octubre a junio',
    horario: 'Viernes · Primaria 17:15–18:45 h · Secundaria 19:00–20:30 h',
    precio_texto: '65 € un día a la semana',
    plazas: 10,
    profesor: 'Alicia · @lispradell',
    orden: 2,
    ca: {
      slug: 'ceramica-junior',
      titulo: 'Ceràmica Junior',
      disciplina: 'Ceràmica',
      nivel: 'Sense experiència prèvia',
      resumen:
        "Un taller dissenyat per descobrir l'art de la ceràmica i el volum de manera divertida i propera.",
      descripcion: [
        "A Ceràmica Junior els alumnes aprendran l'ofici artesanal des de l'experimentació, donant forma a les seves pròpies idees i creant peces úniques. A través de diferents exercicis, explorarem el material, els seus temps i les seves possibilitats, gaudint del contacte amb la matèria sense pressió pel resultat.",
        'No cal tenir experiència prèvia, només ganes de passar-ho bé i crear.',
        'El preu inclou el material i les fornades.',
      ].join('\n\n'),
      duracion: "D'octubre a juny",
      horario: 'Divendres · Primària 17:15–18:45 h · Secundària 19:00–20:30 h',
      precio_texto: '65 € un dia a la setmana',
      profesor: 'Alicia · @lispradell',
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
    /* La edad no está en la hoja de textos: sale del cuadro de salas, que
       para este curso pone «A partir de 10 anys». */
    nivel: 'Desde cero · a partir de 10 años',
    resumen:
      'Un taller práctico y creativo para que los más jóvenes aprendan a utilizar la máquina de coser desde el primer día.',
    descripcion: [
      'En Costura Junior perderemos el miedo a la máquina, aprenderemos las técnicas básicas de confección y daremos vida a accesorios únicos y totalmente personalizados. Un espacio donde combinar creatividad, diseño y habilidad manual para crear proyectos propios.',
      'No es necesario tener conocimientos previos: empezamos desde cero.',
      TEJIDOS_ES,
    ].join('\n\n'),
    duracion: 'De octubre a junio',
    horario: 'Jueves 18:30–19:30 h',
    precio_texto: '50 € un día a la semana',
    plazas: 6,
    profesor: 'Maria · @eltallerdemaresca',
    orden: 3,
    ca: {
      slug: 'costura-junior',
      titulo: 'Costura Junior',
      disciplina: 'Costura',
      nivel: 'Des de zero · a partir de 10 anys',
      resumen:
        'Un taller pràctic i creatiu perquè els més joves aprenguin a utilitzar la màquina de cosir des del primer dia.',
      descripcion: [
        'A Costura Junior perdrem la por a la màquina, aprendrem les tècniques bàsiques de confecció i donarem vida a accessoris únics i totalment personalitzats. Un espai on combinar creativitat, disseny i habilitat manual per crear projectes propis.',
        'No cal tenir coneixements previs: comencem des de zero.',
        TEJIDOS_CA,
      ].join('\n\n'),
      duracion: "D'octubre a juny",
      horario: 'Dijous 18:30–19:30 h',
      precio_texto: '50 € un dia a la setmana',
      profesor: 'Maria · @eltallerdemaresca',
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
    slug: 'pequenos-creadores',
    titulo: 'Pequeños creadores',
    seo_titulo: 'Pequeños creadores · ¡Imagina, crea y hazlo realidad!',
    disciplina: 'Manualidades',
    nivel: 'Sin experiencia previa · a partir de 10 años',
    resumen:
      '¿Te gusta inventar, pintar, coser, hacer manualidades y crear cosas con tus propias manos? ¡Este es tu espacio!',
    descripcion: [
      '¿Qué pasaría si pudieras convertir una idea que tienes en la cabeza en algo que puedes tocar, llevar o regalar?',
      'Durante todo el curso abriremos las puertas a un mundo lleno de colores, hilos, telas, texturas y materiales para experimentar y crear sin límites.',
      'Cada proyecto será diferente y nos permitirá descubrir una técnica nueva. Construiremos nuestro propio telar con cartón reciclado y aprenderemos a tejer con lana y otros materiales. Crearemos animales y personajes con pequeñas bolitas de colores, jugando con formas y combinaciones. Haremos nuestro primer minibolso o estuche de crochet y descubriremos cómo convertir un simple hilo en una pieza creada por nosotros.',
      'También daremos vida a una muñeca de tela, creándole su propia ropa y accesorios, aprenderemos a customizar prendas de ropa y diseñaremos nuestros propios charms, pulseras y piezas de bisutería.',
      '¡Y esto solo será el principio! A lo largo del curso experimentaremos también con costura, bordado, estampación, reciclaje y muchas otras técnicas creativas.',
      'Aquí no hace falta saber dibujar, coser ni hacer manualidades. No hay una manera correcta de crear. Te enseñaremos las técnicas y te daremos las herramientas, pero tú decidirás los colores, las formas y cómo quieres que sea tu creación.',
      'Porque lo más importante no es que todas las piezas sean perfectas o iguales, sino aprender, probar, equivocarse, volverlo a intentar y descubrir todo lo que somos capaces de crear con nuestras manos.',
      'Un curso para niños y niñas con ganas de crear, experimentar, imaginar y pasárselo muy bien.',
      TEJIDOS_ES,
    ].join('\n\n'),
    duracion: 'De octubre a junio',
    horario: 'Viernes 17:30–19:00 h',
    precio_texto: '50 € un día a la semana',
    plazas: 6,
    profesor: 'Alba Selva · @albaselva',
    orden: 4,
    ca: {
      slug: 'petits-creadors',
      titulo: 'Petits creadors',
      seo_titulo: 'Petits creadors · Imagina, crea i fes-ho realitat!',
      disciplina: 'Manualitats',
      nivel: 'Sense experiència prèvia · a partir de 10 anys',
      resumen:
        "T'agrada inventar, pintar, cosir, fer manualitats i crear coses amb les teves pròpies mans? Aquest és el teu espai!",
      descripcion: [
        'Què passaria si poguessis convertir una idea que tens al cap en una cosa que pots tocar, portar o regalar?',
        'Durant tot el curs obrirem les portes a un món ple de colors, fils, teles, textures i materials per experimentar i crear sense límits.',
        'Cada projecte serà diferent i ens permetrà descobrir una tècnica nova. Construirem el nostre propi teler amb cartó reciclat i aprendrem a teixir amb llana i altres materials. Crearem animals i personatges amb petites boletes de colors, jugant amb formes i combinacions. Farem la nostra primera mini bossa o estoig de crochet i descobrirem com convertir un simple fil en una peça creada per nosaltres.',
        'També donarem vida a una nina de roba, creant-li la seva pròpia roba i accessoris, aprendrem a customitzar peces de roba i dissenyarem els nostres propis charms, polseres i peces de bijuteria.',
        'I això només serà el principi! Al llarg del curs experimentarem també amb costura, brodat, estampació, reciclatge i moltes altres tècniques creatives.',
        "Aquí no cal saber dibuixar, cosir ni fer manualitats. No hi ha una manera correcta de crear. T'ensenyarem les tècniques i et donarem les eines, però tu decidiràs els colors, les formes i com vols que sigui la teva creació.",
        'Perquè el més important no és que totes les peces siguin perfectes o iguals, sinó aprendre, provar, equivocar-se, tornar-ho a intentar i descobrir tot el que som capaços de crear amb les nostres mans.',
        "Un curs per a nens i nenes amb ganes de crear, experimentar, imaginar i passar-ho molt bé.",
        TEJIDOS_CA,
      ].join('\n\n'),
      duracion: "D'octubre a juny",
      horario: 'Divendres 17:30–19:00 h',
      precio_texto: '50 € un dia a la setmana',
      profesor: 'Alba Selva · @byalbaselva',
    },
    convocatorias: [
      {
        etiqueta: 'Viernes',
        horario: '17:30–19:00 h',
        plazas: 6,
        ca: { etiqueta: 'Divendres', horario: '17:30–19:00 h' },
      },
    ],
  },

  /* ─────────────────────────── Adultos ─────────────────────────── */
  {
    slug: 'art-istico',
    titulo: 'Art-ístico',
    disciplina: 'Multidisciplinar',
    nivel: 'Sin conocimientos previos',
    resumen:
      'Un espacio pensado para parar el ritmo diario, liberar el estrés y reconectar con tu creatividad.',
    descripcion: [
      'En Art-ístico exploraremos el arte desde una perspectiva multidisciplinar y práctica: desde la pintura y el dibujo hasta técnicas artesanales como el terrazo, la vidriera o pequeños proyectos de costura. Cada alumno trabajará a su propio ritmo en proyectos personalizados, probando herramientas y materiales diversos.',
      'No se necesitan conocimientos previos, solo ganas de regalarte un tiempo para ti.',
      TODO_ES,
    ].join('\n\n'),
    duracion: 'De octubre a junio',
    horario: 'Lunes 19:00–20:30 h · Martes 11:00–12:30 h · Jueves 11:00–12:30 h',
    precio_texto: '55 € un día a la semana',
    plazas: 10,
    profesor: 'Silvia Cano · @art_esespaicreatiu',
    orden: 5,
    ca: {
      slug: 'art-istic',
      titulo: 'Art-ístic',
      disciplina: 'Multidisciplinari',
      nivel: 'Sense coneixements previs',
      /* Ella escribió «sense jutjar-te» solo en catalán: se respeta. */
      resumen:
        "Un espai pensat per aturar el ritme diari, alliberar l'estrès i reconnectar amb la teva creativitat sense jutjar-te.",
      descripcion: [
        "A Art-ístic explorarem l'art des d'una perspectiva multidisciplinària i pràctica: des de la pintura i el dibuix fins a tècniques artesanals com el terratzo, el vitrall o petits projectes de costura. Cada alumne treballarà al seu propi ritme en projectes personalitzats, provant eines i materials diversos.",
        'No calen coneixements previs, només ganes de regalar-te un temps per a tu.',
        TODO_CA,
      ].join('\n\n'),
      duracion: "D'octubre a juny",
      horario: 'Dilluns 19:00–20:30 h · Dimarts 11:00–12:30 h · Dijous 11:00–12:30 h',
      precio_texto: '55 € un dia a la setmana',
      profesor: 'Silvia Cano · @art_esespaicreatiu',
    },
    convocatorias: [
      {
        etiqueta: 'Lunes tarde',
        horario: '19:00–20:30 h',
        plazas: 10,
        ca: { etiqueta: 'Dilluns tarda', horario: '19:00–20:30 h' },
      },
      {
        etiqueta: 'Martes mañana',
        horario: '11:00–12:30 h',
        plazas: 10,
        ca: { etiqueta: 'Dimarts matí', horario: '11:00–12:30 h' },
      },
      {
        etiqueta: 'Jueves mañana',
        horario: '11:00–12:30 h',
        plazas: 10,
        ca: { etiqueta: 'Dijous matí', horario: '11:00–12:30 h' },
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
    descripcion: [
      'En este curso aprenderás a dominar la máquina de coser, entender los diferentes tipos de puntadas y confeccionar tus propios accesorios y complementos únicos. Una forma perfecta de desconectar, ejercitar la creatividad manual y crear cosas hechas por ti de principio a fin.',
      'No se necesitan conocimientos previos: empezamos desde el primer paso.',
      TEJIDOS_ES,
    ].join('\n\n'),
    duracion: 'De octubre a junio',
    horario: 'Martes 10:00–11:30 h · Miércoles 17:00–18:30 h',
    precio_texto: '55 € un día a la semana',
    plazas: 6,
    profesor: 'Jordina · @bunic_handmade',
    orden: 6,
    ca: {
      slug: 'costura-basica',
      titulo: 'Costura Bàsica',
      disciplina: 'Costura',
      nivel: 'Des de zero',
      resumen:
        'Un taller pràctic dissenyat per a qui vulgui aprendre a cosir a màquina des de zero, de manera senzilla, al seu ritme i en un ambient relaxat.',
      descripcion: [
        'En aquest curs aprendràs a dominar la màquina de cosir, entendre els diferents tipus de puntades i confeccionar els teus propis accessoris i complements únics. Una manera perfecta de desconnectar, exercitar la creativitat manual i crear coses fetes per tu de principi a fi.',
        'No calen coneixements previs: comencem pas a pas.',
        TEJIDOS_CA,
      ].join('\n\n'),
      duracion: "D'octubre a juny",
      horario: 'Dimarts 10:00–11:30 h · Dimecres 17:00–18:30 h',
      precio_texto: '55 € un dia a la setmana',
      profesor: 'Jordina · @bunic_handmade',
    },
    convocatorias: [
      {
        etiqueta: 'Martes mañana',
        horario: '10:00–11:30 h',
        plazas: 6,
        ca: { etiqueta: 'Dimarts matí', horario: '10:00–11:30 h' },
      },
      {
        etiqueta: 'Miércoles tarde',
        horario: '17:00–18:30 h',
        plazas: 6,
        ca: { etiqueta: 'Dimecres tarda', horario: '17:00–18:30 h' },
      },
    ],
  },

  {
    slug: 'costura-creativa',
    titulo: 'Costura creativa',
    seo_titulo: 'Costura creativa · Aprende a coser creando',
    disciplina: 'Costura',
    nivel: 'Sin experiencia previa',
    resumen:
      'Un espacio donde aprender, practicar y disfrutar la costura mientras creamos nuestras propias prendas. Cada persona podrá adaptar los proyectos a su nivel y a su estilo propio.',
    descripcion: [
      '¿Te gustaría aprender a coser, recuperar la confianza ante una máquina de coser o simplemente dedicar tiempo a crear tus propias prendas?',
      'En este taller aprenderemos costura de una manera práctica y creativa, trabajando diferentes proyectos a lo largo del trimestre e incorporando nuevas técnicas a medida que avanzamos.',
      'Empezaremos por proyectos más sencillos que nos permitirán familiarizarnos con la máquina de coser y las bases de la confección, y progresivamente iremos incorporando nuevos retos: cremalleras, bolsillos, forros, diferentes tipos de acabados, patrones y otras técnicas que nos ayudarán a construir prendas cada vez más completas.',
      'Podremos crear accesorios, bolsos, prendas de ropa o proyectos de customización y upcycling, siempre buscando que cada proyecto tenga un componente práctico y, sobre todo, que cada uno pueda adaptarlo a su propio estilo.',
      'El taller está pensado para que cada persona pueda avanzar a su ritmo, con proyectos adaptados a su nivel. Tanto si nunca has cogido una máquina de coser como si ya tienes experiencia y quieres seguir aprendiendo, encontrarás un espacio para experimentar, crear y desarrollar tus ideas.',
      'Un taller para perder el miedo a la máquina de coser y descubrir todo lo que puedes llegar a crear con tus propias manos.',
      TEJIDOS_ES,
    ].join('\n\n'),
    duracion: 'De octubre a junio',
    horario: 'Martes 18:30–20:30 h',
    precio_texto: '55 € un día a la semana',
    plazas: 6,
    profesor: 'Alba Selva · @albaselva',
    orden: 7,
    ca: {
      slug: 'costura-creativa',
      titulo: 'Costura creativa',
      seo_titulo: 'Costura creativa · Aprèn a cosir creant',
      disciplina: 'Costura',
      nivel: 'Sense experiència prèvia',
      resumen:
        'Un espai per aprendre, practicar i gaudir de la costura mentre creem les nostres pròpies peces. Cada persona podrà adaptar els projectes al seu nivell i al seu propi estil.',
      descripcion: [
        "T'agradaria aprendre a cosir, recuperar la confiança davant d'una màquina de cosir o simplement dedicar temps a crear les teves pròpies peces?",
        "En aquest taller aprendrem costura d'una manera pràctica i creativa, treballant diferents projectes al llarg del trimestre i incorporant noves tècniques a mesura que avancem.",
        "Començarem per projectes més senzills que ens permetran familiaritzar-nos amb la màquina de cosir i les bases de la confecció, i progressivament anirem incorporant nous reptes: cremalleres, butxaques, folres, diferents tipus d'acabats, patrons i altres tècniques que ens ajudaran a construir peces cada vegada més completes.",
        'Podrem crear accessoris, bosses, peces de roba o projectes de customització i upcycling, sempre buscant que cada projecte tingui un component pràctic i, sobretot, que cadascú pugui adaptar-lo al seu propi estil.',
        'El taller està pensat perquè cada persona pugui avançar al seu ritme, amb projectes adaptats al seu nivell. Tant si no has agafat mai una màquina de cosir com si ja tens experiència i vols continuar aprenent, trobaràs un espai per experimentar, crear i desenvolupar les teves idees.',
        'Un taller per perdre la por a la màquina de cosir i descobrir tot el que pots arribar a crear amb les teves pròpies mans.',
        TEJIDOS_CA,
      ].join('\n\n'),
      duracion: "D'octubre a juny",
      horario: 'Dimarts 18:30–20:30 h',
      precio_texto: '55 € un dia a la setmana',
      profesor: 'Alba Selva · @byalbaselva',
    },
    convocatorias: [
      {
        etiqueta: 'Martes tarde',
        horario: '18:30–20:30 h',
        plazas: 6,
        ca: { etiqueta: 'Dimarts tarda', horario: '18:30–20:30 h' },
      },
    ],
  },

  {
    slug: 'taller-crochet',
    titulo: 'Taller trimestral de crochet',
    disciplina: 'Crochet',
    nivel: 'Sin conocimientos previos',
    resumen:
      'Un espacio para aprender crochet desde cero mientras creamos diferentes proyectos prácticos y originales. Aprenderemos los diferentes puntos que se utilizan en el crochet, trabajaremos con trapillo, descubriremos los granny squares y desarrollaremos diferentes proyectos que cada uno podrá adaptar a su propio estilo.',
    descripcion: [
      '¿Quieres aprender a hacer crochet y crear tus propios diseños? En este taller trimestral aprenderemos los diferentes puntos de manera práctica, a través de proyectos que cada uno podrá adaptar a su propio estilo.',
      'Empezaremos por los puntos básicos del crochet y los pondremos en práctica creando una primera pieza con trapillo, como un bolso, una funda para el ordenador o un estuche. Un proyecto ideal para familiarizarnos con la aguja de ganchillo y empezar a dar forma a nuestras propias piezas.',
      'Después nos adentraremos en el mundo de los granny squares, descubriremos cómo crear estas piezas de diferentes colores y cómo unirlas para convertirlas en nuevos proyectos. En este caso, cada uno podrá decidir qué quiere crear: un bolso, un accesorio, una pieza de decoración o incluso una prenda de ropa.',
      'Para acabar, haremos un último proyecto donde podremos poner en práctica todo lo que hemos aprendido e incorporar nuevos puntos.',
      'Un taller pensado para aprender, experimentar y disfrutar del proceso creativo, sin necesidad de tener conocimientos previos y dejando espacio para que cada persona pueda avanzar a su ritmo y dar vida a sus ideas.',
      'No se necesitan conocimientos previos, solo ganas de regalarte un tiempo para ti.',
      TODO_ES,
      /* El pago único NO va en `precio_texto`: ese campo se pinta a cuerpo de
         titular en la ficha del curso y con las dos cifras dentro se comía
         cuatro renglones y aplastaba al resto de la ficha. */
      'El trimestre completo en un solo pago: 150 €.',
    ].join('\n\n'),
    duracion: 'Trimestral, de octubre a diciembre',
    horario: 'Jueves 19:00–21:00 h',
    precio_texto: '55 € un día a la semana',
    plazas: 10,
    profesor: 'Alba Selva · @albaselva',
    orden: 8,
    ca: {
      slug: 'taller-crochet',
      titulo: 'Taller trimestral de crochet',
      disciplina: 'Crochet',
      nivel: 'Sense coneixements previs',
      resumen:
        "Un espai per aprendre crochet des de zero mentre creem diferents projectes pràctics i originals. Aprendrem els diferents punts que s'utilitzen al crochet, treballarem amb trapillo, descobrirem els granny squares i desenvoluparem diferents projectes que cadascú podrà adaptar al seu propi estil.",
      descripcion: [
        'Vols aprendre a fer crochet i crear els teus propis dissenys? En aquest taller trimestral aprendrem els diferents punts de manera pràctica, a través de projectes que cadascú podrà adaptar al seu propi estil.',
        "Començarem pels punts bàsics del crochet i els posarem en pràctica creant una primera peça amb trapillo, com ara una bossa, una funda per a l'ordinador o un estoig. Un projecte ideal per familiaritzar-nos amb l'agulla de ganxet i començar a donar forma a les nostres pròpies peces.",
        'Després ens endinsarem en el món dels granny squares, descobrirem com crear aquestes peces de diferents colors i com unir-les per convertir-les en nous projectes. En aquest cas, cadascú podrà decidir què vol crear: una bossa, un accessori, una peça de decoració o fins i tot una peça de roba.',
        "Per acabar, farem un últim projecte on podrem posar en pràctica tot allò que hem après i incorporar nous punts.",
        'Un taller pensat per aprendre, experimentar i gaudir del procés creatiu, sense necessitat de tenir coneixements previs i deixant espai perquè cada persona pugui avançar al seu ritme i donar vida a les seves idees.',
        'No calen coneixements previs, només ganes de regalar-te un temps per a tu.',
        TODO_CA,
        'El trimestre sencer en un sol pagament: 150 €.',
      ].join('\n\n'),
      duracion: "Trimestral, d'octubre a desembre",
      horario: 'Dijous 19:00–21:00 h',
      precio_texto: '55 € un dia a la setmana',
      profesor: 'Alba Selva · @byalbaselva',
    },
    convocatorias: [
      {
        etiqueta: 'Jueves',
        horario: '19:00–21:00 h',
        plazas: 10,
        ca: { etiqueta: 'Dijous', horario: '19:00–21:00 h' },
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
      seo_titulo, orden, publicado, ca
    ) VALUES (
      ${c.slug}, ${c.titulo}, ${c.disciplina}, 'presencial', ${c.nivel},
      ${c.resumen}, ${c.descripcion}, ${c.duracion}, ${c.horario},
      ${c.precio_texto}, NULL, ${c.plazas}, ${c.profesor},
      ${c.seo_titulo ?? null}, ${c.orden}, true, ${JSON.stringify(c.ca)}
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
      seo_titulo = EXCLUDED.seo_titulo,
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

/* Aviso, no borrado: si en la base hay un curso que ya no está en el Excel,
   puede ser uno que Silvia haya creado desde el panel. Se dice y se deja. */
const sobrantes = await sql`
  SELECT slug, titulo FROM cursos
  WHERE NOT (slug = ANY(${CURSOS.map((c) => c.slug)}::text[]))
`
for (const s of sobrantes) {
  console.log(`  ⚠️  en la base pero no en el Excel: ${s.titulo} (${s.slug})`)
}

const [resumen] = await sql`
  SELECT (SELECT COUNT(*) FROM cursos)::int AS cursos,
         (SELECT COUNT(*) FROM convocatorias)::int AS convocatorias
`
console.log(`\nEn la base: ${resumen.cursos} cursos y ${resumen.convocatorias} grupos.`)
