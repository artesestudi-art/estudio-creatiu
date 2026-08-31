import Link from 'next/link'
import { todosLosCursos, convocatoriasDeVarios, ocupacionPorConvocatoria } from '@/lib/bd'
import { euros } from '@/lib/texto'
import { Titulo, Vacio, claseBoton, claseBotonSuave } from '../ui'
import { accionPublicar } from './acciones'
import { panelBloqueado } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export default async function Cursos() {
  // Sin sesión no se consulta nada: ver panelBloqueado().
  if (await panelBloqueado()) return null

  const cursos = await todosLosCursos()
  const [convocatorias, ocupacion] = await Promise.all([
    convocatoriasDeVarios(cursos.map((c) => c.id)),
    ocupacionPorConvocatoria(),
  ])

  return (
    <>
      <Titulo
        extra={
          <Link href="/admin/cursos/nuevo" className={claseBoton}>
            Nuevo curso
          </Link>
        }
      >
        Cursos
      </Titulo>

      {cursos.length === 0 ? (
        <Vacio>
          Todavía no hay ningún curso. Crea el primero y aparecerá en la web en cuanto lo publiques.
        </Vacio>
      ) : (
        <div className="space-y-2.5">
          {cursos.map((c) => {
            const suyas = convocatorias[c.id] ?? []
            const plazasLibres = suyas
              .filter((v) => v.estado === 'abierta' && v.plazas !== null)
              .reduce((suma, v) => suma + (v.plazas! - (ocupacion[v.id] ?? 0)), 0)

            return (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-neutral-200 bg-white px-4 py-3.5"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    c.publicado ? 'bg-emerald-500' : 'bg-neutral-300'
                  }`}
                  title={c.publicado ? 'Publicado' : 'Borrador'}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/cursos/${c.id}`}
                    className="text-[15px] font-semibold hover:underline"
                  >
                    {c.titulo}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-neutral-500">
                    /cursos/{c.slug}
                    {c.disciplina && ` · ${c.disciplina}`}
                    {' · '}
                    {c.precio_texto || euros(c.precio_centimos) || 'sin precio'}
                    {suyas.length > 0 &&
                      ` · ${suyas.length} convocatoria${suyas.length > 1 ? 's' : ''}`}
                    {plazasLibres > 0 && ` · ${plazasLibres} plazas libres`}
                  </p>
                </div>

                {c.destacado && (
                  <span className="rounded-full border border-neutral-300 px-2 py-0.5 text-[12px] text-neutral-600">
                    destacado
                  </span>
                )}

                <form action={accionPublicar}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className={claseBotonSuave}>
                    {c.publicado ? 'Despublicar' : 'Publicar'}
                  </button>
                </form>

                {c.publicado && (
                  <a
                    href={`/cursos/${c.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13.5px] text-neutral-500 underline underline-offset-2 hover:text-neutral-900"
                  >
                    Ver
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-6 text-[13.5px] text-neutral-500">
        El orden en la web lo marca el campo «Orden» de cada curso: número más bajo, más arriba.
      </p>
    </>
  )
}
