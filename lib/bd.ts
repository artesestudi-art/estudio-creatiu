import { neon } from '@neondatabase/serverless'

/**
 * Base de datos del estudio (Neon Postgres).
 *
 * Aquí vive TODO lo que el cliente puede tocar desde el panel: los cursos, sus
 * convocatorias, los textos de la portada y las peticiones que llegan por los
 * formularios. Nada de esto está escrito en el código a propósito: si los
 * precios o los títulos vivieran en un fichero `.ts`, cambiar «180 €» por
 * «195 €» exigiría un despliegue, y el presupuesto promete que el cliente lo
 * haga solo.
 *
 * Regla que no se rompe: **la petición se guarda antes de avisar por correo**.
 * Si el correo falla, la inscripción sigue aquí y el panel la marca como no
 * avisada. Al revés se pierden alumnos en silencio.
 */

export function conexion() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('Falta DATABASE_URL')
  return neon(url)
}

/* ───────────────────────────── Tipos ───────────────────────────── */

export type Modalidad = 'presencial' | 'online' | 'mixto'

export const MODALIDADES: { id: Modalidad; nombre: string }[] = [
  { id: 'presencial', nombre: 'Presencial' },
  { id: 'online', nombre: 'Online' },
  { id: 'mixto', nombre: 'Presencial y online' },
]

export type Curso = {
  id: number
  slug: string
  titulo: string
  disciplina: string | null
  modalidad: Modalidad
  nivel: string | null
  resumen: string | null
  descripcion: string | null
  temario: string | null
  duracion: string | null
  horario: string | null
  precio_texto: string | null
  precio_centimos: number | null
  plazas: number | null
  profesor: string | null
  imagen: string | null
  imagen_alt: string | null
  seo_titulo: string | null
  seo_descripcion: string | null
  orden: number
  publicado: boolean
  destacado: boolean
  /** Traducción al catalán. Lo que falte cae al castellano (ver lib/traduccion). */
  ca: Record<string, string>
  creado: string
  actualizado: string
}

export type EstadoConvocatoria = 'abierta' | 'completa' | 'cerrada'

export type Convocatoria = {
  id: number
  curso_id: number
  etiqueta: string | null
  inicio: string | null
  fin: string | null
  horario: string | null
  modalidad: Modalidad | null
  plazas: number | null
  estado: EstadoConvocatoria
  orden: number
  ca: Record<string, string>
}

export type EstadoInscripcion =
  | 'nueva'
  | 'contactada'
  | 'aceptada'
  | 'matriculada'
  | 'lista_espera'
  | 'descartada'

export const ESTADOS_INSCRIPCION: { id: EstadoInscripcion; nombre: string }[] = [
  { id: 'nueva', nombre: 'Nueva' },
  { id: 'contactada', nombre: 'Contactada' },
  { id: 'aceptada', nombre: 'Aceptada' },
  { id: 'matriculada', nombre: 'Matriculada' },
  { id: 'lista_espera', nombre: 'Lista de espera' },
  { id: 'descartada', nombre: 'Descartada' },
]

export type Inscripcion = {
  id: number
  creado: string
  nombre: string
  email: string
  telefono: string | null
  curso_id: number | null
  convocatoria_id: number | null
  /**
   * Cuando la plaza es para un menor, `nombre`/`email`/`telefono` son los del
   * padre, la madre o el tutor —quien puede dar el consentimiento— y el
   * alumno es este otro.
   */
  es_menor: boolean
  alumno_nombre: string | null
  alumno_edad: string | null
  /** Copia del título en el momento de inscribirse. Si el cliente borra el
   *  curso, la petición no se queda huérfana ni miente sobre a qué se apuntó. */
  curso_titulo: string
  convocatoria_texto: string | null
  modalidad: string | null
  experiencia: string | null
  mensaje: string | null
  origen: string
  estado: EstadoInscripcion
  notas: string | null
  aviso_enviado: boolean
  aviso_error: string | null
}

export type EstadoContacto = 'nuevo' | 'contestado' | 'cerrado' | 'descartado'

export const ESTADOS_CONTACTO: { id: EstadoContacto; nombre: string }[] = [
  { id: 'nuevo', nombre: 'Nuevo' },
  { id: 'contestado', nombre: 'Contestado' },
  { id: 'cerrado', nombre: 'Cerrado' },
  { id: 'descartado', nombre: 'Descartado' },
]

export type Contacto = {
  id: number
  creado: string
  nombre: string
  email: string
  telefono: string | null
  asunto: string | null
  mensaje: string
  origen: string
  estado: EstadoContacto
  notas: string | null
  aviso_enviado: boolean
  aviso_error: string | null
}

export type Suscriptor = {
  id: number
  creado: string
  email: string
  nombre: string | null
  origen: string
  baja: boolean
  baja_fecha: string | null
  token: string
}

/* ─────────────────────────── Cursos ─────────────────────────── */

export async function cursosPublicados(): Promise<Curso[]> {
  const sql = conexion()
  return (await sql`
    SELECT * FROM cursos WHERE publicado = true
    ORDER BY orden ASC, titulo ASC
  `) as Curso[]
}

export async function todosLosCursos(): Promise<Curso[]> {
  const sql = conexion()
  return (await sql`
    SELECT * FROM cursos ORDER BY orden ASC, titulo ASC
  `) as Curso[]
}

export async function cursoPorSlug(slug: string): Promise<Curso | null> {
  const sql = conexion()
  const filas = (await sql`SELECT * FROM cursos WHERE slug = ${slug} LIMIT 1`) as Curso[]
  return filas[0] ?? null
}

/**
 * Busca por el slug catalán y, si no lo encuentra, por el castellano.
 *
 * La vuelta al castellano importa: un curso sin traducir se sirve igual en
 * `/ca/cursos/<slug-castellano>` en vez de dar un 404 a quien navega en catalán.
 */
export async function cursoPorSlugCatalan(slug: string): Promise<Curso | null> {
  const sql = conexion()
  const filas = (await sql`
    SELECT * FROM cursos
    WHERE ca->>'slug' = ${slug} OR slug = ${slug}
    ORDER BY (ca->>'slug' = ${slug}) DESC
    LIMIT 1
  `) as Curso[]
  return filas[0] ?? null
}

export async function cursoPorId(id: number): Promise<Curso | null> {
  const sql = conexion()
  const filas = (await sql`SELECT * FROM cursos WHERE id = ${id} LIMIT 1`) as Curso[]
  return filas[0] ?? null
}

export type DatosCurso = Omit<Curso, 'id' | 'creado' | 'actualizado'>

export async function crearCurso(d: DatosCurso): Promise<number> {
  const sql = conexion()
  const filas = (await sql`
    INSERT INTO cursos (
      slug, titulo, disciplina, modalidad, nivel, resumen, descripcion, temario,
      duracion, horario, precio_texto, precio_centimos, plazas, profesor,
      imagen, imagen_alt, seo_titulo, seo_descripcion, orden, publicado, destacado, ca
    ) VALUES (
      ${d.slug}, ${d.titulo}, ${d.disciplina}, ${d.modalidad}, ${d.nivel},
      ${d.resumen}, ${d.descripcion}, ${d.temario}, ${d.duracion}, ${d.horario},
      ${d.precio_texto}, ${d.precio_centimos}, ${d.plazas}, ${d.profesor},
      ${d.imagen}, ${d.imagen_alt}, ${d.seo_titulo}, ${d.seo_descripcion},
      ${d.orden}, ${d.publicado}, ${d.destacado}, ${JSON.stringify(d.ca ?? {})}::jsonb
    ) RETURNING id
  `) as { id: number }[]
  return filas[0].id
}

export async function actualizarCurso(id: number, d: DatosCurso): Promise<void> {
  const sql = conexion()
  await sql`
    UPDATE cursos SET
      slug = ${d.slug}, titulo = ${d.titulo}, disciplina = ${d.disciplina},
      modalidad = ${d.modalidad}, nivel = ${d.nivel}, resumen = ${d.resumen},
      descripcion = ${d.descripcion}, temario = ${d.temario},
      duracion = ${d.duracion}, horario = ${d.horario},
      precio_texto = ${d.precio_texto}, precio_centimos = ${d.precio_centimos},
      plazas = ${d.plazas}, profesor = ${d.profesor}, imagen = ${d.imagen},
      imagen_alt = ${d.imagen_alt}, seo_titulo = ${d.seo_titulo},
      seo_descripcion = ${d.seo_descripcion}, orden = ${d.orden},
      publicado = ${d.publicado}, destacado = ${d.destacado},
      ca = ${JSON.stringify(d.ca ?? {})}::jsonb,
      actualizado = now()
    WHERE id = ${id}
  `
}

export async function borrarCurso(id: number): Promise<void> {
  const sql = conexion()
  await sql`DELETE FROM cursos WHERE id = ${id}`
}

/** ¿Está el slug libre? Se comprueba antes de guardar para no romper URLs. */
export async function slugLibre(slug: string, exceptoId?: number): Promise<boolean> {
  const sql = conexion()
  const filas = (await sql`
    SELECT id FROM cursos WHERE slug = ${slug} AND id <> ${exceptoId ?? -1} LIMIT 1
  `) as { id: number }[]
  return filas.length === 0
}

/* ────────────────────── Convocatorias ────────────────────── */

export async function convocatoriasDe(cursoId: number): Promise<Convocatoria[]> {
  const sql = conexion()
  return (await sql`
    SELECT * FROM convocatorias WHERE curso_id = ${cursoId}
    ORDER BY orden ASC, inicio ASC NULLS LAST, id ASC
  `) as Convocatoria[]
}

export async function convocatoriasDeVarios(
  cursoIds: number[],
): Promise<Record<number, Convocatoria[]>> {
  if (cursoIds.length === 0) return {}
  const sql = conexion()
  const filas = (await sql`
    SELECT * FROM convocatorias WHERE curso_id = ANY(${cursoIds}::int[])
    ORDER BY orden ASC, inicio ASC NULLS LAST, id ASC
  `) as Convocatoria[]
  const mapa: Record<number, Convocatoria[]> = {}
  for (const c of filas) (mapa[c.curso_id] ??= []).push(c)
  return mapa
}

export type DatosConvocatoria = Omit<Convocatoria, 'id'>

export async function crearConvocatoria(d: DatosConvocatoria): Promise<number> {
  const sql = conexion()
  const filas = (await sql`
    INSERT INTO convocatorias (curso_id, etiqueta, inicio, fin, horario, modalidad, plazas, estado, orden, ca)
    VALUES (${d.curso_id}, ${d.etiqueta}, ${d.inicio}, ${d.fin}, ${d.horario},
            ${d.modalidad}, ${d.plazas}, ${d.estado}, ${d.orden},
            ${JSON.stringify(d.ca ?? {})}::jsonb)
    RETURNING id
  `) as { id: number }[]
  return filas[0].id
}

export async function actualizarConvocatoria(id: number, d: DatosConvocatoria): Promise<void> {
  const sql = conexion()
  await sql`
    UPDATE convocatorias SET
      etiqueta = ${d.etiqueta}, inicio = ${d.inicio}, fin = ${d.fin},
      horario = ${d.horario}, modalidad = ${d.modalidad}, plazas = ${d.plazas},
      estado = ${d.estado}, orden = ${d.orden}, ca = ${JSON.stringify(d.ca ?? {})}::jsonb
    WHERE id = ${id}
  `
}

export async function borrarConvocatoria(id: number): Promise<void> {
  const sql = conexion()
  await sql`DELETE FROM convocatorias WHERE id = ${id}`
}

export async function convocatoriaPorId(id: number): Promise<Convocatoria | null> {
  const sql = conexion()
  const filas = (await sql`SELECT * FROM convocatorias WHERE id = ${id} LIMIT 1`) as Convocatoria[]
  return filas[0] ?? null
}

/**
 * Plazas ocupadas por convocatoria, contando solo lo que de verdad ocupa sitio:
 * aceptadas y matriculadas. Una petición nueva todavía no reserva nada, y
 * contarla haría que el curso saliera «completo» por gente que nunca contestó.
 */
export async function ocupacionPorConvocatoria(): Promise<Record<number, number>> {
  const sql = conexion()
  const filas = (await sql`
    SELECT convocatoria_id, COUNT(*)::int AS n
    FROM inscripciones
    WHERE convocatoria_id IS NOT NULL AND estado IN ('aceptada', 'matriculada')
    GROUP BY convocatoria_id
  `) as { convocatoria_id: number; n: number }[]
  return Object.fromEntries(filas.map((f) => [f.convocatoria_id, f.n]))
}

/* ────────────────────── Inscripciones ────────────────────── */

export type NuevaInscripcion = {
  nombre: string
  email: string
  telefono: string | null
  es_menor: boolean
  alumno_nombre: string | null
  alumno_edad: string | null
  curso_id: number | null
  convocatoria_id: number | null
  curso_titulo: string
  convocatoria_texto: string | null
  modalidad: string | null
  experiencia: string | null
  mensaje: string | null
  origen: string
}

export async function guardarInscripcion(d: NuevaInscripcion): Promise<number> {
  const sql = conexion()
  const filas = (await sql`
    INSERT INTO inscripciones (
      nombre, email, telefono, es_menor, alumno_nombre, alumno_edad,
      curso_id, convocatoria_id, curso_titulo,
      convocatoria_texto, modalidad, experiencia, mensaje, origen
    ) VALUES (
      ${d.nombre}, ${d.email}, ${d.telefono}, ${d.es_menor}, ${d.alumno_nombre},
      ${d.alumno_edad}, ${d.curso_id}, ${d.convocatoria_id},
      ${d.curso_titulo}, ${d.convocatoria_texto}, ${d.modalidad}, ${d.experiencia},
      ${d.mensaje}, ${d.origen}
    ) RETURNING id
  `) as { id: number }[]
  return filas[0].id
}

export async function inscripciones(estado?: EstadoInscripcion): Promise<Inscripcion[]> {
  const sql = conexion()
  if (estado) {
    return (await sql`
      SELECT * FROM inscripciones WHERE estado = ${estado} ORDER BY creado DESC
    `) as Inscripcion[]
  }
  return (await sql`SELECT * FROM inscripciones ORDER BY creado DESC`) as Inscripcion[]
}

export async function cambiarEstadoInscripcion(
  id: number,
  estado: EstadoInscripcion,
): Promise<void> {
  const sql = conexion()
  await sql`UPDATE inscripciones SET estado = ${estado} WHERE id = ${id}`
}

export async function notasInscripcion(id: number, notas: string): Promise<void> {
  const sql = conexion()
  await sql`UPDATE inscripciones SET notas = ${notas || null} WHERE id = ${id}`
}

export async function borrarInscripcion(id: number): Promise<void> {
  const sql = conexion()
  await sql`DELETE FROM inscripciones WHERE id = ${id}`
}

/* ─────────────────────── Contactos ─────────────────────── */

export type NuevoContacto = {
  nombre: string
  email: string
  telefono: string | null
  asunto: string | null
  mensaje: string
  origen: string
}

export async function guardarContacto(d: NuevoContacto): Promise<number> {
  const sql = conexion()
  const filas = (await sql`
    INSERT INTO contactos (nombre, email, telefono, asunto, mensaje, origen)
    VALUES (${d.nombre}, ${d.email}, ${d.telefono}, ${d.asunto}, ${d.mensaje}, ${d.origen})
    RETURNING id
  `) as { id: number }[]
  return filas[0].id
}

export async function contactos(): Promise<Contacto[]> {
  const sql = conexion()
  return (await sql`SELECT * FROM contactos ORDER BY creado DESC`) as Contacto[]
}

export async function cambiarEstadoContacto(id: number, estado: EstadoContacto): Promise<void> {
  const sql = conexion()
  await sql`UPDATE contactos SET estado = ${estado} WHERE id = ${id}`
}

export async function notasContacto(id: number, notas: string): Promise<void> {
  const sql = conexion()
  await sql`UPDATE contactos SET notas = ${notas || null} WHERE id = ${id}`
}

export async function borrarContacto(id: number): Promise<void> {
  const sql = conexion()
  await sql`DELETE FROM contactos WHERE id = ${id}`
}

/* ────────────────────── Aviso enviado ────────────────────── */

export async function marcarAviso(
  tabla: 'inscripciones' | 'contactos',
  id: number,
  ok: boolean,
  error?: string,
): Promise<void> {
  const sql = conexion()
  // El nombre de la tabla no puede ir parametrizado, por eso llega como unión
  // cerrada de dos literales y no como string libre.
  if (tabla === 'inscripciones') {
    await sql`UPDATE inscripciones SET aviso_enviado = ${ok}, aviso_error = ${error ?? null} WHERE id = ${id}`
  } else {
    await sql`UPDATE contactos SET aviso_enviado = ${ok}, aviso_error = ${error ?? null} WHERE id = ${id}`
  }
}

/* ────────────────────── Suscriptores ────────────────────── */

export async function guardarSuscriptor(
  email: string,
  nombre: string | null,
  origen: string,
  token: string,
): Promise<'alta' | 'ya_estaba' | 'rehabilitado'> {
  const sql = conexion()
  const previos = (await sql`
    SELECT id, baja FROM suscriptores WHERE email = ${email} LIMIT 1
  `) as { id: number; baja: boolean }[]

  if (previos.length > 0) {
    if (!previos[0].baja) return 'ya_estaba'
    await sql`UPDATE suscriptores SET baja = false, baja_fecha = NULL WHERE id = ${previos[0].id}`
    return 'rehabilitado'
  }

  await sql`
    INSERT INTO suscriptores (email, nombre, origen, token)
    VALUES (${email}, ${nombre}, ${origen}, ${token})
  `
  return 'alta'
}

export async function suscriptores(): Promise<Suscriptor[]> {
  const sql = conexion()
  return (await sql`SELECT * FROM suscriptores ORDER BY creado DESC`) as Suscriptor[]
}

/** Baja por enlace del propio correo. Exigir el token evita que cualquiera
 *  dé de baja a otro con solo saber su dirección. */
export async function darDeBaja(token: string): Promise<boolean> {
  const sql = conexion()
  const filas = (await sql`
    UPDATE suscriptores SET baja = true, baja_fecha = now()
    WHERE token = ${token} AND baja = false
    RETURNING id
  `) as { id: number }[]
  return filas.length > 0
}

export async function borrarSuscriptor(id: number): Promise<void> {
  const sql = conexion()
  await sql`DELETE FROM suscriptores WHERE id = ${id}`
}

/* ─────────────────────── Contenidos ─────────────────────── */

export async function leerContenido<T>(clave: string, porDefecto: T): Promise<T> {
  const sql = conexion()
  const filas = (await sql`SELECT valor FROM contenidos WHERE clave = ${clave} LIMIT 1`) as {
    valor: T
  }[]
  return filas[0]?.valor ?? porDefecto
}

export async function guardarContenido(clave: string, valor: unknown): Promise<void> {
  const sql = conexion()
  await sql`
    INSERT INTO contenidos (clave, valor, actualizado)
    VALUES (${clave}, ${JSON.stringify(valor)}::jsonb, now())
    ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado = now()
  `
}

/* ─────────────────────────── Resumen ─────────────────────────── */

export type Resumen = {
  inscripcionesNuevas: number
  inscripcionesTotal: number
  inscripcionesSemana: number
  contactosNuevos: number
  suscriptoresActivos: number
  cursosPublicados: number
  cursosBorrador: number
  avisosFallidos: number
}

export async function resumen(): Promise<Resumen> {
  const sql = conexion()
  const [f] = (await sql`
    SELECT
      (SELECT COUNT(*) FROM inscripciones WHERE estado = 'nueva')::int              AS "inscripcionesNuevas",
      (SELECT COUNT(*) FROM inscripciones)::int                                     AS "inscripcionesTotal",
      (SELECT COUNT(*) FROM inscripciones WHERE creado > now() - interval '7 days')::int AS "inscripcionesSemana",
      (SELECT COUNT(*) FROM contactos WHERE estado = 'nuevo')::int                  AS "contactosNuevos",
      (SELECT COUNT(*) FROM suscriptores WHERE baja = false)::int                   AS "suscriptoresActivos",
      (SELECT COUNT(*) FROM cursos WHERE publicado = true)::int                     AS "cursosPublicados",
      (SELECT COUNT(*) FROM cursos WHERE publicado = false)::int                    AS "cursosBorrador",
      (SELECT COUNT(*) FROM inscripciones WHERE aviso_enviado = false)::int
        + (SELECT COUNT(*) FROM contactos WHERE aviso_enviado = false)::int         AS "avisosFallidos"
  `) as Resumen[]
  return f
}

/** Inscripciones por curso, para saber qué se vende y qué no. */
export async function inscripcionesPorCurso(): Promise<
  { curso: string; total: number; matriculadas: number }[]
> {
  const sql = conexion()
  return (await sql`
    SELECT curso_titulo AS curso,
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE estado = 'matriculada')::int AS matriculadas
    FROM inscripciones
    GROUP BY curso_titulo
    ORDER BY total DESC
  `) as { curso: string; total: number; matriculadas: number }[]
}

/**
 * Fecha del último cambio real de contenido.
 *
 * Se usa en el `lastmod` del sitemap. Poner ahí la fecha del build es lo fácil
 * y lo que hace todo el mundo, pero significa que cada despliegue le dice a
 * Google que TODA la web ha cambiado; Google aprende que ese dato miente y
 * deja de hacerle caso justo cuando algo cambia de verdad.
 */
export async function ultimaActualizacion(): Promise<Date | null> {
  const sql = conexion()
  const [f] = (await sql`
    SELECT GREATEST(
      COALESCE((SELECT MAX(actualizado) FROM cursos), 'epoch'::timestamptz),
      COALESCE((SELECT MAX(actualizado) FROM contenidos), 'epoch'::timestamptz)
    ) AS fecha
  `) as { fecha: string | null }[]
  if (!f?.fecha) return null
  const fecha = new Date(f.fecha)
  return fecha.getTime() > 0 ? fecha : null
}
