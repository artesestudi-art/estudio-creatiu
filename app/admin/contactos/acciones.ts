'use server'

import { revalidatePath } from 'next/cache'
import { borrarContacto, cambiarEstadoContacto, notasContacto, type EstadoContacto } from '@/lib/bd'
import { exigirSesion } from '../acciones'

export async function accionEstado(datos: FormData) {
  await exigirSesion()
  await cambiarEstadoContacto(Number(datos.get('id')), String(datos.get('estado')) as EstadoContacto)
  revalidatePath('/admin/contactos')
  revalidatePath('/admin')
}

export async function accionNotas(datos: FormData) {
  await exigirSesion()
  await notasContacto(Number(datos.get('id')), String(datos.get('notas') ?? '').trim())
  revalidatePath('/admin/contactos')
}

export async function accionBorrar(datos: FormData) {
  await exigirSesion()
  await borrarContacto(Number(datos.get('id')))
  revalidatePath('/admin/contactos')
  revalidatePath('/admin')
}
