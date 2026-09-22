import { contactos } from '@/lib/bd'
import { Titulo, Vacio, claseBotonSuave } from '../ui'
import Ficha from './Ficha'
import { panelBloqueado } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export default async function Contactos() {
  // Sin sesión no se consulta nada: ver panelBloqueado().
  if (await panelBloqueado()) return null

  const lista = await contactos()

  return (
    <>
      <Titulo
        extra={
          <a href="/admin/exportar/contactos" className={claseBotonSuave}>
            Descargar en Excel (CSV)
          </a>
        }
      >
        Mensajes de contacto
      </Titulo>

      {lista.length === 0 ? (
        <Vacio>Todavía no ha escrito nadie por el formulario de contacto.</Vacio>
      ) : (
        <div className="space-y-2.5">
          {lista.map((c) => (
            <Ficha key={c.id} c={c} />
          ))}
        </div>
      )}
    </>
  )
}
