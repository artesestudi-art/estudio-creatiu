'use server'

import { revalidatePath } from 'next/cache'
import { exigirSesion, exigirUsuario } from '../acciones'
import { abrirSesion, ID_ARRANQUE } from '@/lib/sesion'
import {
  borrarUsuario,
  cambiarActivo,
  cambiarClave,
  claveActual,
  contarUsuarios,
  crearUsuario,
  listarUsuarios,
} from '@/lib/usuarios'

export type Estado = { error?: string; hecho?: string }

/**
 * Alta de una persona.
 *
 * Si quien la da de alta entró por la puerta de instalación (sin usuario
 * propio), lo que acaba de crear es SU cuenta: se le abre la sesión con ella
 * en el mismo gesto, porque la puerta de instalación se cierra en cuanto
 * existe el primer usuario y si no se quedaría fuera al recargar.
 */
export async function altaUsuario(_previo: Estado | null, datos: FormData): Promise<Estado> {
  const yo = await exigirUsuario()

  const email = String(datos.get('email') ?? '')
  const nombre = String(datos.get('nombre') ?? '')
  const clave = String(datos.get('clave') ?? '')

  const resultado = await crearUsuario({ email, nombre, clave })
  if (!resultado.ok) return { error: resultado.error }

  if (yo.id === ID_ARRANQUE) {
    const alta = (await listarUsuarios()).find((u) => u.email === email.trim().toLowerCase())
    if (alta) await abrirSesion(alta.id)
  }

  revalidatePath('/admin/equipo')
  return { hecho: `${email.trim().toLowerCase()} ya puede entrar.` }
}

/** Cambiarse la contraseña de uno mismo. Pide la actual: una sesión olvidada
 *  en un ordenador ajeno no debe poder dejarte fuera de tu propio panel. */
export async function cambiarMiClave(_previo: Estado | null, datos: FormData): Promise<Estado> {
  const yo = await exigirUsuario()
  if (yo.id === ID_ARRANQUE) {
    return { error: 'Todavía no tienes usuario propio: créalo aquí abajo.' }
  }

  const actual = String(datos.get('actual') ?? '')
  const nueva = String(datos.get('nueva') ?? '')
  const repetida = String(datos.get('repetida') ?? '')

  if (nueva !== repetida) return { error: 'Las dos contraseñas nuevas no coinciden.' }
  if (!(await claveActual(yo.id, actual))) return { error: 'La contraseña actual no es esa.' }

  const resultado = await cambiarClave(yo.id, nueva)
  if (!resultado.ok) return { error: resultado.error }

  return { hecho: 'Contraseña cambiada.' }
}

/** Ponerle una contraseña nueva a otra persona (la ha olvidado). */
export async function reiniciarClave(_previo: Estado | null, datos: FormData): Promise<Estado> {
  await exigirSesion()
  const id = Number(datos.get('id'))
  const clave = String(datos.get('clave') ?? '')
  if (!Number.isFinite(id)) return { error: 'Usuario desconocido.' }

  const resultado = await cambiarClave(id, clave)
  if (!resultado.ok) return { error: resultado.error }

  revalidatePath('/admin/equipo')
  return { hecho: 'Contraseña nueva puesta. Hay que dársela por un sitio seguro.' }
}

export async function alternarAcceso(datos: FormData) {
  const yo = await exigirUsuario()
  const id = Number(datos.get('id'))
  const activo = datos.get('activo') === 'si'

  // Quitarse el acceso a uno mismo es cerrarse la puerta desde dentro.
  if (id === yo.id) throw new Error('No puedes retirarte el acceso a ti mismo')

  // Y dejar la tabla sin nadie activo devuelve el panel a la contraseña de
  // instalación, que es justo lo que se quería dejar atrás.
  if (!activo) {
    const activos = (await listarUsuarios()).filter((u) => u.activo)
    if (activos.length <= 1) throw new Error('Tiene que quedar al menos una persona con acceso')
  }

  await cambiarActivo(id, activo)
  revalidatePath('/admin/equipo')
}

export async function eliminar(datos: FormData) {
  const yo = await exigirUsuario()
  const id = Number(datos.get('id'))

  if (id === yo.id) throw new Error('No puedes borrarte a ti mismo')
  if ((await contarUsuarios()) <= 1) throw new Error('No puede quedarse el panel sin usuarios')

  await borrarUsuario(id)
  revalidatePath('/admin/equipo')
}
