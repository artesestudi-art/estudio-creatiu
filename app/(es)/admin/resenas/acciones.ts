'use server'

import { revalidatePath } from 'next/cache'
import { enviarResenaA, enviarResenasPendientes, guardarAjustesResenas } from '@/lib/resenas'
import { exigirSesion } from '../acciones'

export type EstadoResenas = { ok: boolean; mensaje: string } | null

export async function accionGuardarAjustes(_previo: EstadoResenas, datos: FormData): Promise<EstadoResenas> {
  await exigirSesion()
  const url = String(datos.get('url') ?? '').trim()
  const activo = datos.get('activo') === 'on'

  if (url && !/^https:\/\/\S+$/.test(url)) {
    return { ok: false, mensaje: 'El enlace tiene que empezar por https://' }
  }
  if (activo && !url) {
    return { ok: false, mensaje: 'Para activarlo hace falta el enlace de reseñas.' }
  }

  await guardarAjustesResenas({ url, activo })
  revalidatePath('/admin/resenas')
  return { ok: true, mensaje: activo ? 'Guardado. El envío automático está activado.' : 'Guardado.' }
}

export async function accionEnviarPendientes(
  _previo: EstadoResenas,
  _datos: FormData,
): Promise<EstadoResenas> {
  await exigirSesion()
  const r = await enviarResenasPendientes()
  revalidatePath('/admin/resenas')
  if (r.enviadas === 0 && r.fallidas === 0) {
    return { ok: !r.motivo, mensaje: r.motivo ?? 'No había ningún correo pendiente.' }
  }
  if (r.fallidas > 0) {
    return { ok: false, mensaje: `Enviados ${r.enviadas}, fallaron ${r.fallidas}: ${r.motivo}` }
  }
  return { ok: true, mensaje: `Enviados ${r.enviadas}.` }
}

export async function accionEnviarUna(datos: FormData) {
  await exigirSesion()
  await enviarResenaA(Number(datos.get('id')))
  revalidatePath('/admin/resenas')
  revalidatePath('/admin/inscripciones')
}
