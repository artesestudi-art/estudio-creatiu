'use server'

import { revalidatePath } from 'next/cache'
import {
  borrarContacto,
  cambiarEstadoContacto,
  editarContacto,
  notasContacto,
  type EstadoContacto,
} from '@/lib/bd'
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

export type EstadoEdicion = { ok: boolean; mensaje: string } | null

export async function accionEditar(_previo: EstadoEdicion, datos: FormData): Promise<EstadoEdicion> {
  await exigirSesion()
  const campo = (c: string) => String(datos.get(c) ?? '').trim()
  const nombre = campo('nombre')
  const email = campo('email').toLowerCase()
  const mensaje = campo('mensaje')

  if (nombre.length < 2) return { ok: false, mensaje: 'Falta el nombre.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) return { ok: false, mensaje: 'Ese correo no es válido.' }
  if (!mensaje) return { ok: false, mensaje: 'El mensaje no puede quedar vacío.' }

  await editarContacto(Number(datos.get('id')), { nombre, email, telefono: campo('telefono') || null, mensaje })
  revalidatePath('/admin/contactos')
  return { ok: true, mensaje: 'Guardado.' }
}
