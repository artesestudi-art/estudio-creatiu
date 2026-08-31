import Link from 'next/link'
import { ESTADOS_INSCRIPCION, inscripciones, type EstadoInscripcion } from '@/lib/bd'
import { Titulo, Vacio, claseBotonSuave } from '../ui'
import Ficha from './Ficha'
import { panelBloqueado } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export default async function Inscripciones({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  // Sin sesión no se consulta nada: ver panelBloqueado().
  if (await panelBloqueado()) return null

  const { estado } = await searchParams
  const filtro = ESTADOS_INSCRIPCION.find((e) => e.id === estado)?.id as EstadoInscripcion | undefined
  const lista = await inscripciones(filtro)

  return (
    <>
      <Titulo
        extra={
          <a href="/admin/exportar/inscripciones" className={claseBotonSuave}>
            Descargar en Excel (CSV)
          </a>
        }
      >
        Inscripciones
      </Titulo>

      <nav className="mb-5 flex flex-wrap gap-2 text-[13.5px]">
        <Filtro href="/admin/inscripciones" activo={!filtro}>
          Todas
        </Filtro>
        {ESTADOS_INSCRIPCION.map((e) => (
          <Filtro
            key={e.id}
            href={`/admin/inscripciones?estado=${e.id}`}
            activo={filtro === e.id}
          >
            {e.nombre}
          </Filtro>
        ))}
      </nav>

      {lista.length === 0 ? (
        <Vacio>
          {filtro
            ? 'No hay ninguna inscripción en ese estado.'
            : 'Todavía no ha llegado ninguna inscripción por la web.'}
        </Vacio>
      ) : (
        <div className="space-y-2.5">
          {lista.map((i) => (
            <Ficha key={i.id} i={i} />
          ))}
        </div>
      )}
    </>
  )
}

function Filtro({
  href,
  activo,
  children,
}: {
  href: string
  activo: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 transition ${
        activo
          ? 'border-neutral-900 bg-neutral-900 text-white'
          : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-900'
      }`}
    >
      {children}
    </Link>
  )
}
