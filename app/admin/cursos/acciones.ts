'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  actualizarConvocatoria,
  actualizarCurso,
  borrarConvocatoria,
  borrarCurso,
  crearConvocatoria,
  crearCurso,
  cursoPorId,
  slugLibre,
  type DatosCurso,
  type EstadoConvocatoria,
  type Modalidad,
} from '@/lib/bd'
import { borrarImagen, subirImagen } from '@/lib/imagenes'
import { aSlug } from '@/lib/texto'
import { exigirSesion } from '../acciones'

/**
 * Alta y edición de cursos.
 *
 * Cada curso es una URL propia (`/cursos/<slug>`), así que el slug se trata con
 * cuidado: cambiarlo en un curso ya publicado rompe el enlace que Google tiene
 * indexado y lo que estaba posicionado se cae. Por eso se avisa en el editor.
 */

export type EstadoCurso = {
  ok: boolean
  mensaje?: string
  campo?: string
  /**
   * Lo que el cliente tenía escrito.
   *
   * React 19 vacía el formulario al terminar la acción, también cuando
   * devuelve error. Sin devolver esto, equivocarse en el slug borraba de golpe
   * la descripción y el temario que se acababan de escribir.
   */
  valores?: Record<string, string>
}

function texto(datos: FormData, campo: string): string {
  return String(datos.get(campo) ?? '').trim()
}

function opcional(datos: FormData, campo: string): string | null {
  return texto(datos, campo) || null
}

function entero(datos: FormData, campo: string): number | null {
  const valor = texto(datos, campo)
  if (!valor) return null
  const n = Number(valor.replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n) : null
}

/** El precio se guarda en céntimos: en euros con decimales, 19,99 + 0,01 deja
 *  de ser 20 y las sumas del panel empiezan a mentir. */
function precioACentimos(valor: string): number | null {
  if (!valor.trim()) return null
  const n = Number(valor.replace(/[^\d,.-]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? Math.round(n * 100) : null
}

export async function guardarCurso(
  _previo: EstadoCurso | null,
  datos: FormData,
): Promise<EstadoCurso> {
  await exigirSesion()

  const id = Number(datos.get('id')) || null

  // Todo lo tecleado, para repintarlo si algo falla. El fichero de la imagen
  // se queda fuera: no es texto y no se puede devolver al navegador.
  const valores = Object.fromEntries(
    [...datos.entries()].filter(([, v]) => typeof v === 'string'),
  ) as Record<string, string>

  const titulo = texto(datos, 'titulo')
  if (titulo.length < 3) {
    return { ok: false, mensaje: 'El curso necesita un título.', campo: 'titulo', valores }
  }

  const slug = aSlug(texto(datos, 'slug') || titulo)
  if (!slug) return { ok: false, mensaje: 'Ese título no da una dirección válida.', campo: 'slug', valores }
  if (!(await slugLibre(slug, id ?? undefined))) {
    return { ok: false, mensaje: 'Ya hay otro curso con esa dirección.', campo: 'slug', valores }
  }

  // La imagen puede venir de una subida nueva o de la URL que ya tenía.
  let imagen = opcional(datos, 'imagen_url')
  const fichero = datos.get('imagen_fichero')
  if (fichero instanceof File && fichero.size > 0) {
    const subida = await subirImagen(fichero)
    if (!subida.ok) return { ok: false, mensaje: subida.motivo, campo: 'imagen', valores }
    // Si había otra imagen subida por nosotros, se retira para no dejar basura.
    if (imagen) await borrarImagen(imagen)
    imagen = subida.url
  }

  /**
   * Traducción al catalán.
   *
   * Solo se guardan los campos que el cliente ha escrito: un campo vacío no
   * entra en el JSON, y así `traduccion.ts` sabe que tiene que caer al
   * castellano en vez de pintar una cadena vacía.
   */
  const ca: Record<string, string> = {}
  for (const campo of [
    'slug', 'titulo', 'disciplina', 'nivel', 'resumen', 'descripcion', 'temario',
    'duracion', 'horario', 'precio_texto', 'profesor', 'imagen_alt',
    'seo_titulo', 'seo_descripcion',
  ]) {
    const valor = texto(datos, `ca_${campo}`)
    if (valor) ca[campo] = campo === 'slug' ? aSlug(valor) : valor
  }
  // Si hay título catalán pero no dirección propia, se deriva del título: el
  // curso tendrá URL catalana de verdad y no repetirá la castellana.
  if (ca.titulo && !ca.slug) ca.slug = aSlug(ca.titulo)

  const curso: DatosCurso = {
    slug,
    ca,
    titulo,
    disciplina: opcional(datos, 'disciplina'),
    modalidad: (texto(datos, 'modalidad') || 'presencial') as Modalidad,
    nivel: opcional(datos, 'nivel'),
    resumen: opcional(datos, 'resumen'),
    descripcion: opcional(datos, 'descripcion'),
    temario: opcional(datos, 'temario'),
    duracion: opcional(datos, 'duracion'),
    horario: opcional(datos, 'horario'),
    precio_texto: opcional(datos, 'precio_texto'),
    precio_centimos: precioACentimos(texto(datos, 'precio')),
    plazas: entero(datos, 'plazas'),
    profesor: opcional(datos, 'profesor'),
    imagen,
    imagen_alt: opcional(datos, 'imagen_alt'),
    seo_titulo: opcional(datos, 'seo_titulo'),
    seo_descripcion: opcional(datos, 'seo_descripcion'),
    orden: entero(datos, 'orden') ?? 0,
    publicado: datos.get('publicado') === 'on',
    destacado: datos.get('destacado') === 'on',
  }

  if (curso.publicado && !curso.resumen) {
    return {
      ok: false,
      mensaje: 'Para publicarlo necesita al menos un resumen: es lo que se ve en la portada.',
      campo: 'resumen',
      valores,
    }
  }

  let destino: number
  if (id) {
    await actualizarCurso(id, curso)
    destino = id
  } else {
    destino = await crearCurso(curso)
  }

  revalidatePath('/admin/cursos')
  revalidatePath('/')
  revalidatePath(`/cursos/${slug}`)
  redirect(`/admin/cursos/${destino}?guardado=1`)
}

export async function accionPublicar(datos: FormData) {
  await exigirSesion()
  const id = Number(datos.get('id'))
  const curso = await cursoPorId(id)
  if (!curso) return

  if (!curso.publicado && !curso.resumen) {
    // Sin resumen la tarjeta del curso sale vacía en la portada.
    redirect(`/admin/cursos/${id}?falta=resumen`)
  }

  await actualizarCurso(id, { ...curso, publicado: !curso.publicado })
  revalidatePath('/admin/cursos')
  revalidatePath('/')
  revalidatePath(`/cursos/${curso.slug}`)
}

export async function accionBorrarCurso(datos: FormData) {
  await exigirSesion()
  const id = Number(datos.get('id'))
  const curso = await cursoPorId(id)
  if (!curso) return

  if (curso.imagen) await borrarImagen(curso.imagen)
  // Las inscripciones NO se van con el curso: la fila guarda una copia del
  // título, así que se quedan y siguen contando quién se apuntó a qué.
  await borrarCurso(id)

  revalidatePath('/admin/cursos')
  revalidatePath('/')
  redirect('/admin/cursos')
}

/* ────────────────────── Convocatorias ────────────────────── */

export async function accionGuardarConvocatoria(datos: FormData) {
  await exigirSesion()
  const id = Number(datos.get('id')) || null
  const cursoId = Number(datos.get('curso_id'))
  if (!cursoId) return

  const ca: Record<string, string> = {}
  for (const campo of ['etiqueta', 'horario']) {
    const valor = texto(datos, `ca_${campo}`)
    if (valor) ca[campo] = valor
  }

  const convocatoria = {
    curso_id: cursoId,
    ca,
    etiqueta: opcional(datos, 'etiqueta'),
    inicio: opcional(datos, 'inicio'),
    fin: opcional(datos, 'fin'),
    horario: opcional(datos, 'horario'),
    modalidad: (opcional(datos, 'modalidad') as Modalidad | null) ?? null,
    plazas: entero(datos, 'plazas'),
    estado: (texto(datos, 'estado') || 'abierta') as EstadoConvocatoria,
    orden: entero(datos, 'orden') ?? 0,
  }

  if (id) await actualizarConvocatoria(id, convocatoria)
  else await crearConvocatoria(convocatoria)

  revalidatePath(`/admin/cursos/${cursoId}`)
  revalidatePath('/')
}

export async function accionBorrarConvocatoria(datos: FormData) {
  await exigirSesion()
  await borrarConvocatoria(Number(datos.get('id')))
  revalidatePath(`/admin/cursos/${Number(datos.get('curso_id'))}`)
  revalidatePath('/')
}
