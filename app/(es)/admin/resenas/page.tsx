import Link from 'next/link'
import { matriculasConFin } from '@/lib/bd'
import { hoyEnMadrid, leerAjustesResenas, situacion, VENTANA_DIAS, type SituacionResena } from '@/lib/resenas'
import { panelBloqueado } from '@/lib/sesion'
import { Tarjeta, Titulo, Vacio, dia, fecha } from '../ui'
import { Ajustes, EnviarPendientes, EnviarUna } from './Formularios'

export const dynamic = 'force-dynamic'

const SITUACION: Record<SituacionResena, { texto: string; clase: string }> = {
  enviada: { texto: 'Enviada', clase: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  pendiente: { texto: 'Le toca', clase: 'border-blue-200 bg-blue-50 text-blue-700' },
  en_curso: { texto: 'Curso en marcha', clase: 'border-neutral-300 bg-neutral-100 text-neutral-600' },
  sin_fecha: { texto: 'Sin fecha de fin', clase: 'border-amber-200 bg-amber-50 text-amber-800' },
  caducada: { texto: `Acabó hace más de ${VENTANA_DIAS} días`, clase: 'border-neutral-200 bg-neutral-50 text-neutral-400' },
}

export default async function Resenas() {
  // Sin sesión no se consulta nada: ver panelBloqueado().
  if (await panelBloqueado()) return null

  const [ajustes, matriculas] = await Promise.all([leerAjustesResenas(), matriculasConFin()])
  const hoy = hoyEnMadrid()
  const filas = matriculas.map((m) => ({ m, s: situacion(m, hoy) }))
  const pendientes = filas.filter((f) => f.s === 'pendiente').length
  const sinFecha = filas.filter((f) => f.s === 'sin_fecha').length
  const sinResend = !process.env.RESEND_API_KEY

  return (
    <>
      <Titulo>Reseñas</Titulo>

      <p className="mb-6 max-w-3xl text-[14.5px] leading-relaxed text-neutral-600">
        Cuando termina un curso, a cada persona <strong>matriculada</strong> le llega un correo dándole las
        gracias y con un botón para dejar una reseña. Se envía el día después de la fecha de fin de su grupo o,
        si el grupo no tiene, la del curso. Se escribe en el idioma en que se apuntó.
      </p>

      {sinResend && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-[14px] text-red-800">
          <strong>Los correos todavía no pueden salir</strong>: falta conectar la cuenta de envío (Resend). Puedes
          dejarlo todo preparado; los que toquen se enviarán en cuanto esté.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Tarjeta>
          <h2 className="mb-4 text-[15px] font-semibold">Ajustes</h2>
          <Ajustes url={ajustes.url} activo={ajustes.activo} />
        </Tarjeta>

        <Tarjeta>
          <h2 className="mb-3 text-[15px] font-semibold">Así lo recibe</h2>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-[14px] leading-relaxed text-neutral-700">
            <p className="mb-1 text-[12.5px] text-neutral-500">Asunto: ¿Qué tal Art-ístico? Nos ayudas con una reseña</p>
            <p className="mb-2">Hola Marta,</p>
            <p className="mb-2">
              Ya ha terminado <strong>Art-ístico</strong> y queremos darte las gracias por venir al taller.
            </p>
            <p className="mb-3">
              Somos un estudio pequeño y lo que más nos ayuda es que otras personas lean cómo ha ido. Si tienes un
              minuto, ¿nos dejas una reseña?
            </p>
            <span className="mb-3 inline-block rounded-full bg-[#14488b] px-4 py-2 text-[13.5px] font-semibold text-white">
              Dejar una reseña
            </span>
            <p>Y si algo no fue como esperabas, respóndenos a este correo: lo leemos.</p>
          </div>
          <p className="mt-2 text-[12.5px] text-neutral-500">
            Si la plaza era de un menor, se escribe al tutor y se nombra al alumno.
          </p>
        </Tarjeta>
      </div>

      <div className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[17px] font-semibold">Matriculados</h2>
        {pendientes > 0 && ajustes.url && <EnviarPendientes cuantos={pendientes} />}
      </div>

      {sinFecha > 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
          {sinFecha === 1 ? 'Una persona está' : `${sinFecha} personas están`} en un curso sin fecha de fin: a
          ellas no les llegará nunca. Pon la fecha en{' '}
          <Link href="/admin/cursos" className="font-semibold underline">
            Cursos
          </Link>
          .
        </p>
      )}

      {filas.length === 0 ? (
        <Vacio>
          Nadie está en estado «Matriculada» todavía. Cambia el estado en{' '}
          <Link href="/admin/inscripciones" className="underline">
            Inscripciones
          </Link>{' '}
          cuando alguien formalice la plaza.
        </Vacio>
      ) : (
        <div className="space-y-2.5">
          {filas.map(({ m, s }) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-neutral-200 bg-white px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">
                  {m.alumno_nombre || m.nombre}
                  <span className="ml-2 font-normal text-neutral-500">{m.curso_titulo}</span>
                </p>
                <p className="mt-0.5 text-[13px] text-neutral-500">
                  {m.email}
                  {m.termina && ` · termina el ${dia(m.termina)}`}
                  {m.resena_enviada && ` · enviada el ${fecha(m.resena_enviada)}`}
                </p>
                {m.resena_error && !m.resena_enviada && (
                  <p className="mt-1 text-[13px] text-red-700">No salió: {m.resena_error}</p>
                )}
              </div>
              <span className={`rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${SITUACION[s].clase}`}>
                {SITUACION[s].texto}
              </span>
              {ajustes.url && <EnviarUna id={m.id} repetir={s === 'enviada'} />}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
