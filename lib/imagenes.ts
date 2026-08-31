import { put, del } from '@vercel/blob'

/**
 * Subida de imágenes del panel.
 *
 * Se usa Vercel Blob y no la carpeta `public/`: en Vercel el disco es efímero,
 * así que un fichero escrito en caliente desaparece en el siguiente despliegue
 * y el cliente ve sus fotos rotas sin saber por qué.
 *
 * Si no hay token configurado, el panel lo dice y ofrece pegar una URL. Lo que
 * no hace es fingir que la subida ha funcionado.
 */

export const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const
export const MAXIMO_BYTES = 6 * 1024 * 1024

export function hayAlmacen(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export type ResultadoSubida = { ok: true; url: string } | { ok: false; motivo: string }

export async function subirImagen(fichero: File, carpeta = 'cursos'): Promise<ResultadoSubida> {
  if (!hayAlmacen()) {
    return {
      ok: false,
      motivo: 'No hay almacén de imágenes configurado (falta BLOB_READ_WRITE_TOKEN).',
    }
  }
  if (!TIPOS.includes(fichero.type as (typeof TIPOS)[number])) {
    return { ok: false, motivo: 'Solo se admiten JPG, PNG, WebP o AVIF.' }
  }
  if (fichero.size > MAXIMO_BYTES) {
    return {
      ok: false,
      motivo: `La imagen pesa ${(fichero.size / 1024 / 1024).toFixed(1)} MB y el máximo son 6 MB.`,
    }
  }

  try {
    // `addRandomSuffix` evita que dos fotos con el mismo nombre se pisen.
    const { url } = await put(`${carpeta}/${fichero.name}`, fichero, {
      access: 'public',
      addRandomSuffix: true,
    })
    return { ok: true, url }
  } catch (e) {
    return { ok: false, motivo: e instanceof Error ? e.message : 'No se pudo subir la imagen.' }
  }
}

/** Borra del almacén. Falla en silencio: que no se pueda borrar un fichero
 *  huérfano no debe impedir guardar el curso. */
export async function borrarImagen(url: string): Promise<void> {
  if (!hayAlmacen() || !url.includes('.public.blob.vercel-storage.com')) return
  try {
    await del(url)
  } catch (e) {
    console.error('[imagenes] no se pudo borrar', url, e)
  }
}
