import Link from 'next/link'
import { resumen, inscripcionesPorCurso } from '@/lib/bd'
import { faltan } from '@/data/estudio'
import { Dato, Tarjeta, Titulo, Vacio } from './ui'
import { panelBloqueado } from '@/lib/sesion'

export const dynamic = 'force-dynamic'

export default async function Resumen() {
  // Sin sesión no se consulta nada: ver panelBloqueado().
  if (await panelBloqueado()) return null

  const [r, porCurso, sinRellenar] = await Promise.all([
    resumen(),
    inscripcionesPorCurso(),
    Promise.resolve(faltan()),
  ])

  return (
    <>
      <Titulo>Resumen</Titulo>

      {sinRellenar.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-[14px] text-amber-900">
          <strong>Faltan {sinRellenar.length} datos del estudio</strong> en{' '}
          <code className="rounded bg-amber-100 px-1">data/estudio.ts</code>: {sinRellenar.join(', ')}.
          Hasta que estén, la web no se despliega (el build se para a propósito).
        </div>
      )}

      {r.avisosFallidos > 0 && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-[14px] text-red-800">
          <strong>{r.avisosFallidos} avisos por correo no salieron.</strong> Las peticiones están
          guardadas y las ves abajo, pero nadie recibió el correo. Revisa la clave de Resend.
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Dato valor={r.inscripcionesNuevas} texto="Inscripciones sin atender" aviso={r.inscripcionesNuevas > 0} />
        <Dato valor={r.inscripcionesSemana} texto="Últimos 7 días" />
        <Dato valor={r.inscripcionesTotal} texto="Inscripciones en total" />
        <Dato valor={r.contactosNuevos} texto="Mensajes sin leer" aviso={r.contactosNuevos > 0} />
        <Dato valor={r.suscriptoresActivos} texto="En la newsletter" />
        <Dato valor={`${r.cursosPublicados}/${r.cursosPublicados + r.cursosBorrador}`} texto="Cursos publicados" />
      </div>

      <Tarjeta>
        <h2 className="mb-4 text-[15px] font-semibold">Qué se pide y qué se cierra</h2>
        {porCurso.length === 0 ? (
          <Vacio>
            Todavía no ha llegado ninguna inscripción. Cuando lleguen, aquí se ve qué curso tira y
            cuál no.
          </Vacio>
        ) : (
          <table className="w-full text-[14.5px]">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-[13px] text-neutral-500">
                <th className="pb-2 font-medium">Curso</th>
                <th className="pb-2 text-right font-medium">Solicitudes</th>
                <th className="pb-2 text-right font-medium">Matriculadas</th>
              </tr>
            </thead>
            <tbody>
              {porCurso.map((c) => (
                <tr key={c.curso} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2.5">{c.curso}</td>
                  <td className="py-2.5 text-right tabular-nums">{c.total}</td>
                  <td className="py-2.5 text-right tabular-nums">{c.matriculadas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Tarjeta>

      <p className="mt-6 text-[14px] text-neutral-500">
        <Link href="/admin/inscripciones" className="underline underline-offset-2 hover:text-neutral-900">
          Ver todas las inscripciones
        </Link>
      </p>
    </>
  )
}
