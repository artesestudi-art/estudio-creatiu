import { ID_ARRANQUE, panelBloqueado, usuarioActual } from '@/lib/sesion'
import { listarUsuarios } from '@/lib/usuarios'
import { Tarjeta, Titulo, Vacio, fecha } from '../ui'
import { AltaUsuario, MiClave, ReiniciarClave } from './Formularios'
import { alternarAcceso, eliminar } from './acciones'

export const dynamic = 'force-dynamic'

export default async function Equipo() {
  // Sin sesión no se consulta nada: ver panelBloqueado().
  if (await panelBloqueado()) return null

  const yo = (await usuarioActual())!
  const lista = await listarUsuarios()
  const primero = lista.length === 0
  const activos = lista.filter((u) => u.activo).length

  return (
    <>
      <Titulo>Equipo</Titulo>

      <p className="mb-6 max-w-[70ch] text-[14.5px] text-neutral-600">
        Quien tenga acceso aquí ve las inscripciones y los datos de contacto de los alumnos, y en
        los cursos de niños eso incluye el nombre y la edad de un menor. Se da de alta a quien haga
        falta, y <strong>se le retira el acceso el día que deja de hacer falta</strong>: no se
        comparte una contraseña.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {primero ? (
            <Vacio>Todavía no hay nadie dado de alta.</Vacio>
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <table className="w-full text-[14.5px]">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-[13px] text-neutral-500">
                    <th className="px-4 py-2.5 font-medium">Correo</th>
                    <th className="px-4 py-2.5 font-medium">Nombre</th>
                    <th className="px-4 py-2.5 font-medium">Último acceso</th>
                    <th className="px-4 py-2.5 font-medium">Acceso</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {lista.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-100 align-top last:border-0">
                      <td className="px-4 py-3">
                        {u.email}
                        {u.id === yo.id && (
                          <span className="ml-2 text-[12.5px] text-neutral-400">(tú)</span>
                        )}
                        <ReiniciarClave id={u.id} email={u.email} />
                      </td>
                      <td className="px-4 py-3 text-neutral-600">{u.nombre || '—'}</td>
                      <td className="px-4 py-3 text-neutral-500">
                        {u.ultimo_acceso ? fecha(u.ultimo_acceso) : 'Nunca ha entrado'}
                      </td>
                      <td className="px-4 py-3">
                        {u.activo ? (
                          <span className="text-emerald-700">Activo</span>
                        ) : (
                          <span className="text-neutral-400">Retirado</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {u.id !== yo.id && (
                          <>
                            <form action={alternarAcceso} className="inline">
                              <input type="hidden" name="id" value={u.id} />
                              <input type="hidden" name="activo" value={u.activo ? 'no' : 'si'} />
                              <button
                                type="submit"
                                className="text-[13px] text-neutral-500 hover:text-neutral-900"
                              >
                                {u.activo ? 'Retirar acceso' : 'Devolver acceso'}
                              </button>
                            </form>
                            <form action={eliminar} className="ml-3 inline">
                              <input type="hidden" name="id" value={u.id} />
                              <button
                                type="submit"
                                className="text-[13px] text-neutral-400 hover:text-red-600"
                              >
                                Borrar
                              </button>
                            </form>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!primero && (
            <p className="mt-3 text-[13px] text-neutral-500">
              {activos} con acceso
              {lista.length !== activos && ` · ${lista.length - activos} retirado/s`}. Retirar el
              acceso cierra su sesión en cuanto recargue, aunque la tuviera abierta.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <Tarjeta>
            <h2 className="mb-4 text-[15px] font-semibold">
              {primero ? 'Crea tu usuario' : 'Dar de alta a alguien'}
            </h2>
            <AltaUsuario primero={primero} />
          </Tarjeta>

          {yo.id !== ID_ARRANQUE && (
            <Tarjeta>
              <h2 className="mb-4 text-[15px] font-semibold">Mi contraseña</h2>
              <MiClave />
            </Tarjeta>
          )}
        </div>
      </div>
    </>
  )
}
