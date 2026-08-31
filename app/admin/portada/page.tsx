import Link from 'next/link'
import { cargarContenidoCrudo } from '@/lib/contenido'
import { esIdioma, NOMBRE_IDIOMA, PRINCIPAL, IDIOMAS } from '@/lib/idioma'
import { hayAlmacen } from '@/lib/imagenes'
import { Titulo } from '../ui'
import Editor from './Editor'
import { panelBloqueado } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export default async function Portada({
  searchParams,
}: {
  searchParams: Promise<{ idioma?: string }>
}) {
  // Sin sesión no se consulta nada: ver panelBloqueado().
  if (await panelBloqueado()) return null

  const { idioma: pedido } = await searchParams
  const idioma = pedido && esIdioma(pedido) ? pedido : PRINCIPAL

  // Se carga lo GUARDADO en ese idioma, sin respaldo del castellano: si aquí
  // apareciera el texto castellano, el cliente lo guardaría como si fuera la
  // traducción y la web catalana quedaría en castellano para siempre.
  const contenido = await cargarContenidoCrudo(idioma)

  return (
    <>
      <Titulo
        extra={
          <nav className="flex gap-2 text-[13.5px]">
            {IDIOMAS.map((codigo) => (
              <Link
                key={codigo}
                href={`/admin/portada${codigo === PRINCIPAL ? '' : `?idioma=${codigo}`}`}
                className={`rounded-full border px-3.5 py-1.5 transition ${
                  codigo === idioma
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-900'
                }`}
              >
                {NOMBRE_IDIOMA[codigo]}
              </Link>
            ))}
          </nav>
        }
      >
        Contenidos de la web
      </Titulo>
      <p className="mb-6 max-w-2xl text-[14.5px] text-neutral-600">
        Todo lo que se escribe aquí sale en la portada al guardar. Lo que se deja en blanco
        sencillamente no se pinta: es preferible una web con menos secciones que una con huecos
        rellenos de texto de relleno.
      </p>
      {idioma !== PRINCIPAL && (
        <p className="mb-6 rounded-xl border border-neutral-300 bg-white p-4 text-[14px] text-neutral-600">
          Estás editando la versión <strong>en català</strong>. Lo que dejes en blanco se enseñará
          en castellano, campo a campo: no hace falta traducirlo todo de golpe.
        </p>
      )}

      <Editor key={idioma} inicial={contenido} hayAlmacen={hayAlmacen()} idioma={idioma} />
    </>
  )
}
