'use server'

import { redirect } from 'next/navigation'
import {
  abrirSesion,
  cerrarSesion,
  comprobarClave,
  haySesion,
  ID_ARRANQUE,
  sinUsuarios,
  usuarioActual,
} from '@/lib/sesion'
import { autenticar } from '@/lib/usuarios'
import type { Usuario } from '@/lib/usuarios'

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

/** La acción necesita saber QUIÉN la hace (cambiarse la contraseña, p. ej.). */
export async function exigirUsuario(): Promise<Usuario> {
  const usuario = await usuarioActual()
  if (!usuario) throw new Error('Sin sesión')
  return usuario
}

export type EstadoLogin = { error?: string }

export async function entrar(
  _previo: EstadoLogin | null,
  datos: FormData,
): Promise<EstadoLogin> {
  const email = String(datos.get('email') ?? '')
  const clave = String(datos.get('clave') ?? '')

  // Un segundo de espera: sin esto el formulario admite miles de intentos por
  // minuto. El bloqueo por fallos de `lib/usuarios` es la otra mitad.
  await new Promise((r) => setTimeout(r, 1000))

  /* Primer arranque: sin nadie dado de alta se entra con ADMIN_CLAVE, y lo
     único que hay que hacer dentro es crear el primer usuario. */
  if (await sinUsuarios()) {
    if (!comprobarClave(clave)) return { error: 'Contraseña incorrecta.' }
    await abrirSesion(ID_ARRANQUE)
    redirect('/admin/equipo')
  }

  const resultado = await autenticar(email, clave)
  if (!resultado.ok) return { error: resultado.error }

  await abrirSesion(resultado.usuario.id)
  redirect('/admin')
}

export async function salir() {
  await cerrarSesion()
  redirect('/admin')
}
