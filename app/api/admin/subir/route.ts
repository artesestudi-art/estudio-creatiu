import { NextResponse } from 'next/server'
import { subirImagen } from '@/lib/imagenes'
import { haySesion } from '@/lib/sesion'

/**
 * Subida de imágenes desde el editor de contenidos.
 *
 * Existe como ruta y no como server action porque el editor sube la foto
 * ANTES de guardar el resto: así el cliente ve la miniatura al momento y no
 * descubre que la imagen pesaba demasiado después de rellenar diez campos.
 */

export async function POST(peticion: Request) {
  if (!(await haySesion())) {
    return NextResponse.json({ ok: false, motivo: 'Sin sesión' }, { status: 401 })
  }

  const datos = await peticion.formData()
  const fichero = datos.get('fichero')
  if (!(fichero instanceof File) || fichero.size === 0) {
    return NextResponse.json({ ok: false, motivo: 'No llegó ningún fichero' }, { status: 400 })
  }

  const carpeta = String(datos.get('carpeta') ?? 'portada').replace(/[^a-z0-9-]/gi, '') || 'portada'
  const resultado = await subirImagen(fichero, carpeta)

  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 400 })
}
