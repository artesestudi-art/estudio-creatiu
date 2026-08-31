/**
 * Los dos idiomas de la web.
 *
 * El castellano es el principal y vive en la raíz (`/`). El catalán cuelga de
 * `/ca`. No al revés y no con `/es`: cambiar la URL de una web ya indexada
 * tira por la borda lo posicionado, y el principal es el que más tráfico
 * recibe.
 *
 * Aquí solo están los textos de la INTERFAZ —botones, etiquetas, avisos—, que
 * son nuestros. Lo que escribe el estudio (cursos, portada) se traduce desde
 * el panel: poner aquí una traducción automática de sus textos sería publicar
 * en su nombre algo que no ha escrito.
 */

export const IDIOMAS = ['es', 'ca'] as const
export type Idioma = (typeof IDIOMAS)[number]

export const PRINCIPAL: Idioma = 'es'

/** `es` → ``, `ca` → `/ca`. El principal no lleva prefijo. */
export function prefijo(idioma: Idioma): string {
  return idioma === PRINCIPAL ? '' : `/${idioma}`
}

/** Código completo para el atributo `lang` y para hreflang. */
export const CODIGO: Record<Idioma, string> = {
  es: 'es-ES',
  ca: 'ca-ES',
}

export const NOMBRE_IDIOMA: Record<Idioma, string> = {
  es: 'Castellano',
  ca: 'Català',
}

type Textos = {
  /* Navegación */
  cursos: string
  contacto: string
  elEstudio: string
  comoFunciona: string
  profesorado: string
  pedirPlaza: string
  llamarAl: string
  abrirMenu: string
  cerrarMenu: string
  saltarAlContenido: string
  cerrarMenuAviso: string
  laWeb: string
  legal: string
  avisoLegal: string
  privacidad: string
  cambiarIdioma: string

  /* Cursos */
  verLosCursos: string
  todosLosCursos: string
  otrosCursos: string
  finDelCatalogo: string
  teHasQuedado: string
  deslizaParaVer: (n: number) => string
  sigueBajando: string
  plazasAbiertas: string
  completo: string
  plazas: (n: number) => string
  grupos: string
  queVasATrabajar: string
  duracion: string
  horario: string
  grupo: string
  imparte: string
  modalidad: string
  precio: string
  hastaPersonas: (n: number) => string
  desdeEl: string

  /* Modalidades */
  presencial: string
  online: string
  mixto: string

  /* Formularios */
  pideTuPlaza: string
  queTeInteresa: string
  otraCosa: string
  meDaIgual: string
  nombre: string
  telefono: string
  correo: string
  opcional: string
  telefonoAyuda: string
  talleres: string
  pedirPresupuesto: string
  cookiesTitulo: string
  cookiesTexto: string
  cookiesAceptar: string
  cookiesRechazar: string
  experiencia: string
  esMenor: string
  esMenorAyuda: string
  nombreTutor: string
  nombreAlumno: string
  edadAlumno: string
  edadAlumnoAyuda: string
  prefieroNoDecirlo: string
  nunca: string
  algoSuelto: string
  conFormacion: string
  algoQueSaber: string
  aceptoInscripcion: string
  aceptoContacto: string
  politicaDePrivacidad: string
  seAbreEnPestanaNueva: string
  enviando: string
  noEsMatricula: string
  solicitudRecibida: string
  miraEnSpam: string
  mensaje: string
  asunto: string
  enviarMensaje: string
  apuntarme: string
  apuntando: string
  aceptoNewsletter: string
  tuCorreo: string
  puedesDarteDeBaja: string
  hablamos: string
  elTaller: string
  prefieresHablarlo: string
  rellenaYConfirmamos: string

  /* Errores */
  escribeTuNombre: string
  revisaElCorreo: string
  revisaElCorreoInscripcion: string
  telefonoIncorrecto: string
  necesitamosPermiso: string
  marcaLaCasilla: string
  cuentanosMas: string
  cursoNoDisponible: string
  noSePudoRegistrar: string
  noSePudoEnviar: string
  noSePudoApuntar: string
  mensajeEnviado: string
  yaEstasEnLaLista: string
  apuntado: string

  /* Títulos de respaldo, cuando el estudio no ha escrito el suyo */
  quienDaLasClases: string
  elTallerPorDentro: string
  loQueCuentan: string
  preguntasFrecuentes: string
  llamar: string
  cursosDelEstudio: string

  /* WhatsApp */
  escribirPorWhatsApp: string
  sobreQueCurso: string
  consultaGeneral: string
  cerrar: string
  mensajeCurso: (curso: string) => string
  mensajeGeneral: string

  /* 404 */
  errorTitulo: string
  errorTexto: string
  irALaPortada: string
}

const es: Textos = {
  cursos: 'Cursos',
  contacto: 'Contacto',
  elEstudio: 'El estudio',
  comoFunciona: 'Cómo funciona',
  profesorado: 'Profesorado',
  pedirPlaza: 'Pedir plaza',
  llamarAl: 'Llamar al',
  abrirMenu: 'Abrir el menú',
  cerrarMenu: 'Cerrar el menú',
  saltarAlContenido: 'Saltar al contenido',
  cerrarMenuAviso: 'Toca fuera o pulsa Escape para cerrar.',
  laWeb: 'La web',
  legal: 'Legal',
  avisoLegal: 'Aviso legal',
  privacidad: 'Privacidad',
  cambiarIdioma: 'Canviar a català',

  verLosCursos: 'Ver los cursos',
  todosLosCursos: 'Todos los cursos',
  otrosCursos: 'Otros cursos',
  finDelCatalogo: 'Fin del catálogo',
  teHasQuedado: '¿Te has quedado con alguno?',
  deslizaParaVer: (n) => `Desliza para ver los ${n} cursos`,
  sigueBajando: 'Sigue bajando',
  plazasAbiertas: 'Plazas abiertas',
  completo: 'Completo',
  plazas: (n) => `${n} plaza${n === 1 ? '' : 's'}`,
  grupos: 'Grupos',
  queVasATrabajar: 'Qué vas a trabajar',
  duracion: 'Duración',
  horario: 'Horario',
  grupo: 'Grupo',
  imparte: 'Imparte',
  modalidad: 'Modalidad',
  precio: 'Precio',
  hastaPersonas: (n) => `Hasta ${n} personas`,
  desdeEl: 'desde el',

  presencial: 'Presencial',
  online: 'Online',
  mixto: 'Presencial y online',

  pideTuPlaza: 'Pide tu plaza',
  queTeInteresa: 'Qué te interesa',
  otraCosa: 'Otra cosa / consulta general',
  meDaIgual: 'Me da igual / que me aconsejen',
  nombre: 'Nombre',
  telefono: 'Teléfono',
  correo: 'Correo',
  opcional: '(opcional)',
  telefonoAyuda: 'Opcional, pero acelera la respuesta.',
  talleres: 'Talleres a medida',
  pedirPresupuesto: 'Pedir presupuesto',
  cookiesTitulo: 'Medir las visitas',
  cookiesTexto:
    'Nos ayuda saber qué cursos se miran más, y para eso usaríamos Google Analytics. Si prefieres que no, la web funciona exactamente igual.',
  cookiesAceptar: 'De acuerdo',
  cookiesRechazar: 'No, gracias',
  experiencia: '¿Has hecho algo parecido antes?',
  esMenor: 'La plaza es para un menor de edad',
  esMenorAyuda: 'Entonces los datos de contacto son los tuyos, y nos dices quién es el alumno.',
  nombreTutor: 'Nombre del padre, la madre o el tutor',
  nombreAlumno: 'Nombre del alumno o la alumna',
  edadAlumno: 'Edad o curso',
  edadAlumnoAyuda: 'Por ejemplo: 9 años, o 4.º de primaria.',
  prefieroNoDecirlo: 'Prefiero no decirlo',
  nunca: 'Nunca, empiezo de cero',
  algoSuelto: 'Algo suelto, por mi cuenta',
  conFormacion: 'Tengo formación previa',
  algoQueSaber: '¿Algo que debamos saber?',
  aceptoInscripcion: 'Acepto que me contactéis para gestionar esta solicitud y he leído la',
  aceptoContacto: 'Acepto que me contactéis y he leído la',
  politicaDePrivacidad: 'política de privacidad',
  seAbreEnPestanaNueva: ' (se abre en una pestaña nueva)',
  enviando: 'Enviando…',
  noEsMatricula: 'Esto no es una matrícula todavía: revisamos las plazas y te confirmamos.',
  solicitudRecibida: 'Solicitud recibida',
  miraEnSpam:
    'Te hemos escrito un correo con la confirmación. Si no aparece, mira en la carpeta de spam.',
  mensaje: 'Mensaje',
  asunto: 'Asunto',
  enviarMensaje: 'Enviar mensaje',
  apuntarme: 'Apuntarme',
  apuntando: 'Apuntando…',
  aceptoNewsletter: 'Acepto recibir novedades y he leído la',
  tuCorreo: 'Tu correo',
  puedesDarteDeBaja: 'Puedes darte de baja en cualquier correo.',
  hablamos: 'Hablamos',
  elTaller: 'El taller',
  prefieresHablarlo: '¿Prefieres hablarlo?',
  rellenaYConfirmamos:
    'Rellena el formulario y te confirmamos por correo si queda sitio en el grupo que quieres. Sin pagar nada ahora.',

  escribeTuNombre: 'Escribe tu nombre.',
  revisaElCorreo: 'Revisa el correo.',
  revisaElCorreoInscripcion: 'Revisa el correo: es por donde te contestamos.',
  telefonoIncorrecto: 'Ese teléfono no parece correcto.',
  necesitamosPermiso: 'Necesitamos tu permiso para contactarte.',
  marcaLaCasilla: 'Marca la casilla para poder escribirte.',
  cuentanosMas: 'Cuéntanos algo más para poder ayudarte.',
  cursoNoDisponible: 'Ese curso ya no está disponible.',
  noSePudoRegistrar:
    'No hemos podido registrar tu solicitud. Vuelve a intentarlo en un minuto.',
  noSePudoEnviar: 'No hemos podido enviar el mensaje. Inténtalo en un minuto.',
  noSePudoApuntar: 'No hemos podido apuntarte. Inténtalo en un minuto.',
  mensajeEnviado: 'Mensaje enviado. Te contestamos lo antes posible.',
  yaEstasEnLaLista: 'Ya estás en la lista.',
  apuntado: 'Apuntado. Gracias.',

  quienDaLasClases: 'Quién da las clases',
  elTallerPorDentro: 'El taller por dentro',
  loQueCuentan: 'Lo que cuentan los alumnos',
  preguntasFrecuentes: 'Preguntas frecuentes',
  llamar: 'Llamar',
  cursosDelEstudio: 'Cursos del estudio',

  escribirPorWhatsApp: 'Escribir por WhatsApp',
  sobreQueCurso: '¿Sobre qué curso quieres información?',
  consultaGeneral: 'Otra consulta',
  cerrar: 'Cerrar',
  mensajeCurso: (curso) => `Hola, me gustaría información sobre el curso «${curso}».`,
  mensajeGeneral: 'Hola, me gustaría información sobre vuestros cursos.',

  errorTitulo: 'Esta página ya no existe',
  errorTexto:
    'Puede que el curso que buscabas haya terminado o que la dirección esté mal escrita.',
  irALaPortada: 'Ir a la portada',
}

/**
 * Catalán.
 *
 * Ojo con las preposiciones y el artículo: en catalán «de + el» se contrae en
 * «del» y «a + el» en «al», y los topónimos con artículo («el Masnou») lo
 * arrastran. Artés no lleva artículo, así que «a Artés» es correcto; si algún
 * día se añaden municipios, hay que revisarlo uno a uno.
 */
const ca: Textos = {
  cursos: 'Cursos',
  contacto: 'Contacte',
  elEstudio: "L'estudi",
  comoFunciona: 'Com funciona',
  profesorado: 'Professorat',
  pedirPlaza: 'Demanar plaça',
  llamarAl: 'Trucar al',
  abrirMenu: 'Obrir el menú',
  cerrarMenu: 'Tancar el menú',
  saltarAlContenido: 'Anar al contingut',
  cerrarMenuAviso: 'Toca fora o prem Escapada per tancar.',
  laWeb: 'El web',
  legal: 'Legal',
  avisoLegal: 'Avís legal',
  privacidad: 'Privacitat',
  cambiarIdioma: 'Cambiar a castellano',

  verLosCursos: 'Veure els cursos',
  todosLosCursos: 'Tots els cursos',
  otrosCursos: 'Altres cursos',
  finDelCatalogo: 'Fi del catàleg',
  teHasQuedado: "T'has quedat amb algun?",
  deslizaParaVer: (n) => `Llisca per veure els ${n} cursos`,
  sigueBajando: 'Continua baixant',
  plazasAbiertas: 'Places obertes',
  completo: 'Complet',
  plazas: (n) => `${n} plac${n === 1 ? 'a' : 'es'}`,
  grupos: 'Grups',
  queVasATrabajar: 'Què hi treballaràs',
  duracion: 'Durada',
  horario: 'Horari',
  grupo: 'Grup',
  imparte: 'Imparteix',
  modalidad: 'Modalitat',
  precio: 'Preu',
  hastaPersonas: (n) => `Fins a ${n} persones`,
  desdeEl: 'des del',

  presencial: 'Presencial',
  online: 'En línia',
  mixto: 'Presencial i en línia',

  pideTuPlaza: 'Demana la teva plaça',
  queTeInteresa: "Què t'interessa",
  otraCosa: 'Una altra cosa / consulta general',
  meDaIgual: "M'és igual / que m'aconsellin",
  nombre: 'Nom',
  telefono: 'Telèfon',
  correo: 'Correu',
  opcional: '(opcional)',
  telefonoAyuda: 'Opcional, però accelera la resposta.',
  talleres: 'Tallers a mida',
  pedirPresupuesto: 'Demanar pressupost',
  cookiesTitulo: 'Mesurar les visites',
  cookiesTexto:
    'Ens ajuda saber quins cursos es miren més, i per a això faríem servir Google Analytics. Si prefereixes que no, el web funciona exactament igual.',
  cookiesAceptar: 'D\u2019acord',
  cookiesRechazar: 'No, gràcies',
  experiencia: 'Has fet res semblant abans?',
  esMenor: 'La plaça és per a un menor d\u2019edat',
  esMenorAyuda: 'Llavors les dades de contacte són les teves, i ens dius qui és l\u2019alumne.',
  nombreTutor: 'Nom del pare, la mare o el tutor',
  nombreAlumno: 'Nom de l\u2019alumne o l\u2019alumna',
  edadAlumno: 'Edat o curs',
  edadAlumnoAyuda: 'Per exemple: 9 anys, o 4t de primària.',
  prefieroNoDecirlo: 'Prefereixo no dir-ho',
  nunca: 'Mai, començo de zero',
  algoSuelto: 'Alguna cosa solta, pel meu compte',
  conFormacion: 'Tinc formació prèvia',
  algoQueSaber: 'Hi ha res que hàgim de saber?',
  aceptoInscripcion: 'Accepto que em contacteu per gestionar aquesta sol·licitud i he llegit la',
  aceptoContacto: 'Accepto que em contacteu i he llegit la',
  politicaDePrivacidad: 'política de privacitat',
  seAbreEnPestanaNueva: " (s'obre en una pestanya nova)",
  enviando: 'Enviant…',
  noEsMatricula:
    'Això encara no és una matrícula: revisem les places i te la confirmem.',
  solicitudRecibida: 'Sol·licitud rebuda',
  miraEnSpam:
    "T'hem escrit un correu amb la confirmació. Si no hi apareix, mira a la carpeta de correu brossa.",
  mensaje: 'Missatge',
  asunto: 'Assumpte',
  enviarMensaje: 'Enviar el missatge',
  apuntarme: "Apuntar-m'hi",
  apuntando: 'Apuntant…',
  aceptoNewsletter: 'Accepto rebre novetats i he llegit la',
  tuCorreo: 'El teu correu',
  puedesDarteDeBaja: "Pots donar-te de baixa a qualsevol correu.",
  hablamos: 'En parlem',
  elTaller: 'El taller',
  prefieresHablarlo: 'Prefereixes parlar-ne?',
  rellenaYConfirmamos:
    'Omple el formulari i et confirmem per correu si queda lloc al grup que vols. Sense pagar res ara.',

  escribeTuNombre: 'Escriu el teu nom.',
  revisaElCorreo: 'Revisa el correu.',
  revisaElCorreoInscripcion: 'Revisa el correu: és per on et contestem.',
  telefonoIncorrecto: 'Aquest telèfon no sembla correcte.',
  necesitamosPermiso: 'Necessitem el teu permís per contactar-te.',
  marcaLaCasilla: 'Marca la casella per poder escriure’t.',
  cuentanosMas: 'Explica’ns alguna cosa més per poder ajudar-te.',
  cursoNoDisponible: 'Aquest curs ja no està disponible.',
  noSePudoRegistrar: 'No hem pogut registrar la teva sol·licitud. Torna-ho a provar d’aquí un minut.',
  noSePudoEnviar: 'No hem pogut enviar el missatge. Torna-ho a provar d’aquí un minut.',
  noSePudoApuntar: 'No hem pogut apuntar-te. Torna-ho a provar d’aquí un minut.',
  mensajeEnviado: 'Missatge enviat. Et contestem al més aviat possible.',
  yaEstasEnLaLista: 'Ja ets a la llista.',
  apuntado: 'Apuntat. Gràcies.',

  quienDaLasClases: 'Qui fa les classes',
  elTallerPorDentro: 'El taller per dins',
  loQueCuentan: "El que expliquen els alumnes",
  preguntasFrecuentes: 'Preguntes freqüents',
  llamar: 'Trucar',
  cursosDelEstudio: "Cursos de l'estudi",

  escribirPorWhatsApp: 'Escriure per WhatsApp',
  sobreQueCurso: 'De quin curs vols informació?',
  consultaGeneral: 'Una altra consulta',
  cerrar: 'Tancar',
  mensajeCurso: (curso) => `Hola, m'agradaria informació sobre el curs «${curso}».`,
  mensajeGeneral: "Hola, m'agradaria informació sobre els vostres cursos.",

  errorTitulo: 'Aquesta pàgina ja no existeix',
  errorTexto:
    'Pot ser que el curs que buscaves s’hagi acabat o que l’adreça estigui mal escrita.',
  irALaPortada: 'Anar a la portada',
}

const TEXTOS: Record<Idioma, Textos> = { es, ca }

export function textos(idioma: Idioma): Textos {
  return TEXTOS[idioma] ?? TEXTOS[PRINCIPAL]
}

/** ¿Es un idioma que servimos? Se usa para validar el segmento de la URL. */
export function esIdioma(valor: string): valor is Idioma {
  return (IDIOMAS as readonly string[]).includes(valor)
}
