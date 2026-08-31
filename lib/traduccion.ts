import type { Convocatoria, Curso } from './bd'
import { PRINCIPAL, type Idioma } from './idioma'

/**
 * Resuelve un curso en el idioma pedido.
 *
 * Lo que el estudio no haya traducido cae al castellano. La alternativa —no
 * enseñar el curso en catalán hasta traducirlo— deja huecos en el catálogo y
 * al alumno le da igual el motivo: si no ve el curso, no se apunta.
 *
 * Lo que SÍ depende de que haya traducción es el sitemap: una URL catalana
 * que solo repite el castellano es contenido duplicado a ojos de Google, así
 * que solo entra en el sitemap la que tiene título propio (ver `tieneCatalan`).
 */

export type TraduccionCurso = {
  slug?: string
  titulo?: string
  disciplina?: string
  nivel?: string
  resumen?: string
  descripcion?: string
  temario?: string
  duracion?: string
  horario?: string
  precio_texto?: string
  profesor?: string
  imagen_alt?: string
  seo_titulo?: string
  seo_descripcion?: string
}

export type TraduccionConvocatoria = {
  etiqueta?: string
  horario?: string
}

function limpio(valor: unknown): string | null {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : null
}

/** El curso con los textos del idioma pedido ya aplicados. */
export function cursoEn(curso: Curso, idioma: Idioma): Curso {
  if (idioma === PRINCIPAL) return curso

  const t = (curso.ca ?? {}) as TraduccionCurso
  return {
    ...curso,
    slug: limpio(t.slug) ?? curso.slug,
    titulo: limpio(t.titulo) ?? curso.titulo,
    disciplina: limpio(t.disciplina) ?? curso.disciplina,
    nivel: limpio(t.nivel) ?? curso.nivel,
    resumen: limpio(t.resumen) ?? curso.resumen,
    descripcion: limpio(t.descripcion) ?? curso.descripcion,
    temario: limpio(t.temario) ?? curso.temario,
    duracion: limpio(t.duracion) ?? curso.duracion,
    horario: limpio(t.horario) ?? curso.horario,
    precio_texto: limpio(t.precio_texto) ?? curso.precio_texto,
    profesor: limpio(t.profesor) ?? curso.profesor,
    imagen_alt: limpio(t.imagen_alt) ?? curso.imagen_alt,
    seo_titulo: limpio(t.seo_titulo) ?? curso.seo_titulo,
    seo_descripcion: limpio(t.seo_descripcion) ?? curso.seo_descripcion,
  }
}

export function convocatoriaEn(convocatoria: Convocatoria, idioma: Idioma): Convocatoria {
  if (idioma === PRINCIPAL) return convocatoria

  const t = (convocatoria.ca ?? {}) as TraduccionConvocatoria
  return {
    ...convocatoria,
    etiqueta: limpio(t.etiqueta) ?? convocatoria.etiqueta,
    horario: limpio(t.horario) ?? convocatoria.horario,
  }
}

/**
 * ¿Está este curso traducido de verdad?
 *
 * Basta con el título y el resumen: son los dos textos que Google lee para
 * decidir si `/ca/cursos/x` aporta algo distinto de `/cursos/x`.
 */
export function tieneCatalan(curso: Curso): boolean {
  const t = (curso.ca ?? {}) as TraduccionCurso
  return Boolean(limpio(t.titulo) && limpio(t.resumen))
}

/** El slug que toca en cada idioma, para construir los enlaces alternos. */
export function slugEn(curso: Curso, idioma: Idioma): string {
  if (idioma === PRINCIPAL) return curso.slug
  const t = (curso.ca ?? {}) as TraduccionCurso
  return limpio(t.slug) ?? curso.slug
}
