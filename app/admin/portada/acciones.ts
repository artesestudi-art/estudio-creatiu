'use server'

import { revalidatePath } from 'next/cache'
import { guardarPortada } from '@/lib/contenido'
import type { Contenido } from '@/lib/contenido'
import { esIdioma, PRINCIPAL } from '@/lib/idioma'
import { exigirSesion } from '../acciones'

export type EstadoPortada = { ok: boolean; mensaje: string }

/**
 * Guarda los textos de la portada.
 *
 * Llega como JSON en un solo campo porque el editor maneja listas que crecen
 * (pasos, profesores, preguntas) y montar eso con nombres tipo `pasos[3].texto`
 * es una fuente de errores silenciosos.
 */
export async function guardarContenidoPortada(
  _previo: EstadoPortada | null,
  datos: FormData,
): Promise<EstadoPortada> {
  await exigirSesion()

  const bruto = String(datos.get('contenido') ?? '')
  let contenido: Contenido
  try {
    contenido = JSON.parse(bruto) as Contenido
  } catch {
    return { ok: false, mensaje: 'No se han podido leer los cambios. Recarga la página.' }
  }

  const pedido = String(datos.get('idioma') ?? PRINCIPAL)
  const idioma = esIdioma(pedido) ? pedido : PRINCIPAL

  await guardarPortada(contenido, idioma)
  revalidatePath('/')
  revalidatePath('/ca')

  return {
    ok: true,
    mensaje:
      idioma === PRINCIPAL
        ? 'Contenidos guardados. Ya se ven en la web.'
        : 'Contingut desat. Ja es veu al web en català.',
  }
}
