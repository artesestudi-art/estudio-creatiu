import { suscriptores } from '@/lib/bd'
import { Titulo, Vacio, claseBotonSuave, fecha } from '../ui'
import { accionBorrar } from './acciones'
import { panelBloqueado } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export default async function Suscriptores() {
  // Sin sesión no se consulta nada: ver panelBloqueado().
  if (await panelBloqueado()) return null

  const lista = await suscriptores()
  const activos = lista.filter((s) => !s.baja).length

  return (
    <>
      <Titulo
        extra={
          <a href="/admin/exportar/suscriptores" className={claseBotonSuave}>
            Descargar en Excel (CSV)
          </a>
        }
      >
        Newsletter
      </Titulo>

      <p className="mb-5 text-[14.5px] text-neutral-600">
        {activos} apuntados{lista.length !== activos && ` · ${lista.length - activos} de baja`}. La
        lista se descarga en CSV para importarla en la herramienta de envío. Quien se da de baja
        desde el enlace del correo <strong>no se borra</strong>: se marca, porque volver a
        escribirle sería ilegal y la única forma de saberlo es que quede constancia.
      </p>

      {lista.length === 0 ? (
        <Vacio>Todavía no se ha apuntado nadie.</Vacio>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-[14.5px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-[13px] text-neutral-500">
                <th className="px-4 py-2.5 font-medium">Correo</th>
                <th className="px-4 py-2.5 font-medium">Nombre</th>
                <th className="px-4 py-2.5 font-medium">Alta</th>
                <th className="px-4 py-2.5 font-medium">Origen</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2.5">{s.email}</td>
                  <td className="px-4 py-2.5 text-neutral-600">{s.nombre || '—'}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{fecha(s.creado)}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{s.origen}</td>
                  <td className="px-4 py-2.5">
                    {s.baja ? (
                      <span className="text-neutral-400">De baja</span>
                    ) : (
                      <span className="text-emerald-700">Activo</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <form action={accionBorrar}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="text-[13px] text-neutral-400 hover:text-red-600"
                        title="Borrado definitivo (derecho de supresión del RGPD)"
                      >
                        Borrar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
