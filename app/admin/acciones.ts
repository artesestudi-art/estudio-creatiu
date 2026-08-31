'use server'

import { redirect } from 'next/navigation'
import { abrirSesion, cerrarSesion, comprobarClave, haySesion } from '@/lib/sesion'

/**
 * Entrada y salida del panel.
 *
 * `exigirSesion()` se llama en TODAS las acciones del panel, no solo al pintar
 * la página. Una server action es un endpoint HTTP como cualquier otro: se
 * puede invocar con curl sin pasar por la vista, así que proteger la vista no
 * protege los datos.
 */

export async function exigirSesion() {
  if (!(await haySesion())) throw new Error('Sin sesión')
}

export type EstadoLogin = { error?: string }

export async function entrar(
  _previo: EstadoLogin | null,
  datos: FormData,
): Promise<EstadoLogin> {
  const clave = String(datos.get('clave') ?? '')

  // Un segundo de espera: sin esto el formulario admite miles de intentos por
  // minuto y la contraseña se saca a fuerza bruta desde un portátil.
  await new Promise((r) => setTimeout(r, 1000))

  if (!comprobarClave(clave)) return { error: 'Contraseña incorrecta.' }

  await abrirSesion()
  redirect('/admin')
}

export async function salir() {
  await cerrarSesion()
  redirect('/admin')
}
