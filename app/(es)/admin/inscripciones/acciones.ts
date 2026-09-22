'use server'

import { revalidatePath } from 'next/cache'
import {
  borrarInscripcion,
  cambiarEstadoInscripcion,
  convocatoriaPorId,
  cursoPorId,
  editarInscripcion,
  inscripcionPorId,
  notasInscripcion,
  type EstadoInscripcion,
} from '@/lib/bd'
import { exigirSesion } from '../acciones'

export async function accionEstado(datos: FormData) {
  await exigirSesion()
  await cambiarEstadoInscripcion(
    Number(datos.get('id')),
    String(datos.get('estado')) as EstadoInscripcion,
  )
  revalidatePath('/admin/inscripciones')
  revalidatePath('/admin/resenas')
  revalidatePath('/admin')
}

export async function accionNotas(datos: FormData) {
  await exigirSesion()
  await notasInscripcion(Number(datos.get('id')), String(datos.get('notas') ?? '').trim())
  revalidatePath('/admin/inscripciones')
}

export async function accionBorrar(datos: FormData) {
  await exigirSesion()
  await borrarInscripcion(Number(datos.get('id')))
  revalidatePath('/admin/inscripciones')
  revalidatePath('/admin/resenas')
  revalidatePath('/admin')
}

export type EstadoEdicion = { ok: boolean; mensaje: string } | null

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/

function texto(datos: FormData, campo: string): string {
  return String(datos.get(campo) ?? '').trim()
}

export async function accionEditar(_previo: EstadoEdicion, datos: FormData): Promise<EstadoEdicion> {
  await exigirSesion()
  const id = Number(datos.get('id'))
  const actual = await inscripcionPorId(id)
  if (!actual) return { ok: false, mensaje: 'Esa inscripción ya no existe.' }

  const nombre = texto(datos, 'nombre')
  const email = texto(datos, 'email').toLowerCase()
  const esMenor = datos.get('es_menor') === 'on'
  const alumnoNombre = texto(datos, 'alumno_nombre')

  if (nombre.length < 2) return { ok: false, mensaje: 'Falta el nombre.' }
  if (!EMAIL.test(email)) return { ok: false, mensaje: 'Ese correo no es válido.' }
  if (esMenor && alumnoNombre.length < 2) return { ok: false, mensaje: 'Falta el nombre del alumno.' }

  // El título y el grupo se leen de la base, como en el formulario público: la
  // ficha guarda una COPIA del texto, y tiene que ser el del curso de verdad.
  // Sin curso elegido se conserva lo que había («Consulta general», o el
  // título de un curso que ya se borró).
  const cursoId = Number(texto(datos, 'curso_id')) || null
  const curso = cursoId ? await cursoPorId(cursoId) : null
  const convocatoriaId = Number(texto(datos, 'convocatoria_id')) || null
  const convocatoria = convocatoriaId ? await convocatoriaPorId(convocatoriaId) : null
  const convocatoriaValida = convocatoria && curso && convocatoria.curso_id === curso.id ? convocatoria : null

  await editarInscripcion(id, {
    nombre,
    email,
    telefono: texto(datos, 'telefono') || null,
    es_menor: esMenor,
    alumno_nombre: esMenor ? alumnoNombre : null,
    alumno_edad: esMenor ? texto(datos, 'alumno_edad') || null : null,
    curso_id: curso?.id ?? null,
    convocatoria_id: convocatoriaValida?.id ?? null,
    curso_titulo: curso?.titulo ?? (cursoId === null && actual.curso_id === null ? actual.curso_titulo : 'Consulta general'),
    convocatoria_texto: convocatoriaValida
      ? [convocatoriaValida.etiqueta, convocatoriaValida.horario].filter(Boolean).join(' · ') || null
      : null,
    mensaje: texto(datos, 'mensaje') || null,
  })

  revalidatePath('/admin/inscripciones')
  revalidatePath('/admin/resenas')
  return { ok: true, mensaje: 'Guardado.' }
}
