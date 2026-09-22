import { NextResponse } from 'next/server'
import { contactos, inscripciones, suscriptores } from '@/lib/bd'
import { haySesion } from '@/lib/sesion'

/**
 * Descarga en CSV de cualquiera de las tres tablas.
 *
 * Se comprueba la sesión aquí también: esta ruta es pública para el servidor,
 * y sin esta línea cualquiera con la URL se llevaría la lista de correos.
 */

const TABLAS = ['inscripciones', 'contactos', 'suscriptores'] as const
type Tabla = (typeof TABLAS)[number]

/**
 * Escapa para CSV. La comilla doble se duplica; y un valor que empiece por
 * `=`, `+`, `-` o `@` se prefija con comilla simple: si no, Excel lo ejecuta
 * como fórmula al abrir el fichero y eso es una inyección de verdad.
 */
function celda(valor: unknown): string {
  if (valor === null || valor === undefined) return ''
  let texto = String(valor)
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  return `"${texto.replace(/"/g, '""')}"`
}

function aCsv(filas: Record<string, unknown>[]): string {
  if (filas.length === 0) return ''
  const columnas = Object.keys(filas[0])
  const lineas = [
    columnas.join(';'),
    ...filas.map((f) => columnas.map((c) => celda(f[c])).join(';')),
  ]
  // BOM al principio: sin él, Excel en Windows se come los acentos.
  return `﻿${lineas.join('\r\n')}`
}

export async function GET(_peticion: Request, contexto: { params: Promise<{ que: string }> }) {
  if (!(await haySesion())) {
    return new NextResponse('Sin sesión', { status: 401 })
  }

  const { que } = await contexto.params
  if (!TABLAS.includes(que as Tabla)) {
    return new NextResponse('No existe esa exportación', { status: 404 })
  }

  const filas =
    que === 'inscripciones'
      ? await inscripciones()
      : que === 'contactos'
        ? await contactos()
        : await suscriptores()

  const hoy = new Date().toISOString().slice(0, 10)

  return new NextResponse(aCsv(filas as unknown as Record<string, unknown>[]), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${que}-${hoy}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
