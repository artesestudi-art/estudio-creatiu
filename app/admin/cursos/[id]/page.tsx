import Link from 'next/link'
import { notFound } from 'next/navigation'
import { convocatoriasDe, cursoPorId, ocupacionPorConvocatoria } from '@/lib/bd'
import { hayAlmacen } from '@/lib/imagenes'
import { Titulo } from '../../ui'
import { accionBorrarCurso } from '../acciones'
import Convocatorias from './Convocatorias'
import Editor from './Editor'
import { panelBloqueado } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export default async function EditarCurso({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ guardado?: string; falta?: string }>
}) {
  // Sin sesión no se consulta nada: ver panelBloqueado().
  if (await panelBloqueado()) return null

  const { id } = await params
  const { guardado, falta } = await searchParams
  const nuevo = id === 'nuevo'

  const curso = nuevo ? null : await cursoPorId(Number(id))
  if (!nuevo && !curso) notFound()

  const [convocatorias, ocupacion] = curso
    ? await Promise.all([convocatoriasDe(curso.id), ocupacionPorConvocatoria()])
    : [[], {}]

  return (
    <>
      <Titulo
        extra={
          <Link href="/admin/cursos" className="text-[14px] text-neutral-500 hover:text-neutral-900">
            ← Volver a cursos
          </Link>
        }
      >
        {nuevo ? 'Nuevo curso' : curso!.titulo}
      </Titulo>

      {guardado && (
        <p className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] text-emerald-800">
          Guardado.{' '}
          {curso?.publicado ? (
            <a href={`/cursos/${curso.slug}`} target="_blank" rel="noreferrer" className="underline">
              Ver en la web
            </a>
          ) : (
            'Sigue en borrador: márcalo como publicado para que se vea en la web.'
          )}
        </p>
      )}

      {falta === 'resumen' && (
        <p className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
          No se puede publicar sin resumen: es el texto que aparece en la tarjeta de la portada y en
          Google, y sin él la tarjeta sale vacía.
        </p>
      )}

      <Editor curso={curso} hayAlmacen={hayAlmacen()} />

      {curso && (
        <div className="mt-5">
          <Convocatorias cursoId={curso.id} lista={convocatorias} ocupacion={ocupacion} />
        </div>
      )}

      {curso && (
        <details className="mt-8">
          <summary className="cursor-pointer text-[13.5px] text-neutral-400">Borrar este curso</summary>
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="mb-3 text-[14px] text-red-800">
              Se borra el curso y sus convocatorias. Las inscripciones <strong>no</strong> se pierden:
              cada una guarda copia del título al que se apuntó esa persona. Si el curso está
              publicado, su dirección pasará a dar 404 en Google.
            </p>
            <form action={accionBorrarCurso}>
              <input type="hidden" name="id" value={curso.id} />
              <button
                type="submit"
                className="rounded-lg border border-red-300 bg-white px-3.5 py-2 text-[14px] font-medium text-red-700"
              >
                Borrar «{curso.titulo}»
              </button>
            </form>
          </div>
        </details>
      )}
    </>
  )
}
