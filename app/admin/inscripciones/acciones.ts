'use server'

import { revalidatePath } from 'next/cache'
import {
  borrarInscripcion,
  cambiarEstadoInscripcion,
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
  revalidatePath('/admin')
}
