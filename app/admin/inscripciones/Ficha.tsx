'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { ESTUDIO } from '@/data/estudio'
import { ESTADOS_INSCRIPCION, MODALIDADES, type Inscripcion } from '@/lib/bd'
import { Insignia, claseBoton, claseBotonSuave, claseInput, fecha } from '../ui'
import WhatsApp from '../WhatsApp'
import { accionBorrar, accionEditar, accionEstado, accionNotas } from './acciones'

const NOMBRES = Object.fromEntries(ESTADOS_INSCRIPCION.map((e) => [e.id, e.nombre]))
// La modalidad se guarda como `presencial`; en pantalla se lee «Presencial».
const MODALIDAD = Object.fromEntries(MODALIDADES.map((m) => [m.id, m.nombre]))

/** Lo mínimo de cada curso para poder pasar a alguien de grupo. */
export type CursoParaFicha = { id: number; titulo: string; grupos: { id: number; texto: string }[] }

export default function Ficha({ i, cursos }: { i: Inscripcion; cursos: CursoParaFicha[] }) {
  const [abierta, setAbierta] = useState(false)
  const [editando, setEditando] = useState(false)
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)

  const catalan = i.origen.startsWith('/ca')
  const saludo = catalan
    ? `Hola ${i.nombre}, us escrivim de ${ESTUDIO.nombre} per la sol·licitud de plaça a ${i.curso_titulo}.`
    : `Hola ${i.nombre}, te escribimos de ${ESTUDIO.nombre} por tu solicitud de plaza en ${i.curso_titulo}.`
  const ficha = [
    `Inscripción · ${i.curso_titulo}`,
    i.convocatoria_texto && `Grupo: ${i.convocatoria_texto}`,
    i.es_menor && `Alumno: ${i.alumno_nombre}${i.alumno_edad ? ` (${i.alumno_edad})` : ''}`,
    `${i.es_menor ? 'Tutor' : 'Nombre'}: ${i.nombre}`,
    i.telefono && `Teléfono: ${i.telefono}`,
    `Correo: ${i.email}`,
    i.mensaje && `Mensaje: ${i.mensaje}`,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3.5 text-left"
      >
        <Insignia estado={i.estado} texto={NOMBRES[i.estado] ?? i.estado} />
        <span className="text-[15px] font-semibold">{i.alumno_nombre || i.nombre}</span>
        {i.es_menor && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[12px] text-amber-800">
            menor
          </span>
        )}
        <span className="text-[14px] text-neutral-500">{i.curso_titulo}</span>
        {!i.aviso_enviado && (
          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[12px] text-red-700">
            aviso no enviado
          </span>
        )}
        {i.antispam && (
          <span
            title={i.antispam}
            className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[12px] text-amber-800"
          >
            {i.antispam.startsWith('Posible robot') ? 'posible robot' : 'sin verificar'}
          </span>
        )}
        <span className="ml-auto text-[13px] text-neutral-400">{fecha(i.creado)}</span>
        <span aria-hidden className="text-[13px] text-neutral-400">
          {abierta ? '▲' : '▼'}
        </span>
      </button>

      {abierta && (
        <div className="border-t border-neutral-100 px-4 py-4">
          {editando ? (
            <Edicion i={i} cursos={cursos} onHecho={() => setEditando(false)} />
          ) : (
            <>
              <dl className="mb-4 grid gap-x-6 gap-y-2 text-[14.5px] sm:grid-cols-2">
                {i.es_menor && (
                  <Linea etiqueta="Alumno">
                    {i.alumno_nombre}
                    {i.alumno_edad ? ` · ${i.alumno_edad}` : ''}
                  </Linea>
                )}
                <Linea etiqueta={i.es_menor ? 'Tutor' : 'Nombre'}>{i.nombre}</Linea>
                <Linea etiqueta="Correo">
                  <a href={`mailto:${i.email}`} className="underline underline-offset-2">
                    {i.email}
                  </a>
                </Linea>
                {i.telefono && (
                  <Linea etiqueta="Teléfono">
                    <a href={`tel:${i.telefono.replace(/\s/g, '')}`} className="underline underline-offset-2">
                      {i.telefono}
                    </a>
                  </Linea>
                )}
                <Linea etiqueta="Curso">{i.curso_titulo}</Linea>
                {i.convocatoria_texto && <Linea etiqueta="Grupo">{i.convocatoria_texto}</Linea>}
                {i.modalidad && (
                  <Linea etiqueta="Modalidad">{MODALIDAD[i.modalidad] ?? i.modalidad}</Linea>
                )}
                {i.experiencia && <Linea etiqueta="Experiencia">{i.experiencia}</Linea>}
                <Linea etiqueta="Llegó por">{i.origen}</Linea>
                {i.resena_enviada && <Linea etiqueta="Reseña pedida">{fecha(i.resena_enviada)}</Linea>}
              </dl>

              {i.mensaje && (
                <p className="mb-4 whitespace-pre-line rounded-lg bg-neutral-50 px-3.5 py-3 text-[14.5px] leading-relaxed">
                  {i.mensaje}
                </p>
              )}
            </>
          )}

          {i.antispam && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13.5px] text-amber-800">
              {i.antispam}. Se ha guardado igual por si es una persona: reCAPTCHA se equivoca con
              bloqueadores de anuncios y VPN.
            </p>
          )}
          {i.aviso_error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
              El aviso por correo falló: {i.aviso_error}
            </p>
          )}

          {!editando && (
            <div className="mb-4">
              <WhatsApp telefono={i.telefono} nombre={i.nombre} saludo={saludo} ficha={ficha} />
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <form action={accionEstado} className="flex items-end gap-2">
              <input type="hidden" name="id" value={i.id} />
              <select name="estado" defaultValue={i.estado} className={`${claseInput} w-auto`}>
                {ESTADOS_INSCRIPCION.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
              <button type="submit" className={claseBotonSuave}>
                Cambiar estado
              </button>
            </form>

            {!editando && (
              <button type="button" onClick={() => setEditando(true)} className={claseBotonSuave}>
                Editar datos
              </button>
            )}

            <Borrar
              id={i.id}
              accion={accionBorrar}
              confirmando={confirmandoBorrado}
              setConfirmando={setConfirmandoBorrado}
            />
          </div>

          <form action={accionNotas} className="mt-4">
            <input type="hidden" name="id" value={i.id} />
            <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
              Notas internas
            </label>
            <textarea
              name="notas"
              rows={2}
              defaultValue={i.notas ?? ''}
              placeholder="Llamada del martes, pide grupo de tarde…"
              className={claseInput}
            />
            <button type="submit" className={`${claseBotonSuave} mt-2`}>
              Guardar notas
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function Guardar() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={claseBoton}>
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </button>
  )
}

function Edicion({
  i,
  cursos,
  onHecho,
}: {
  i: Inscripcion
  cursos: CursoParaFicha[]
  onHecho: () => void
}) {
  const [estado, accion] = useActionState(async (previo: Awaited<ReturnType<typeof accionEditar>>, datos: FormData) => {
    const r = await accionEditar(previo, datos)
    if (r?.ok) onHecho()
    return r
  }, null)
  const [cursoId, setCursoId] = useState(i.curso_id ? String(i.curso_id) : '')
  const [esMenor, setEsMenor] = useState(i.es_menor)
  const grupos = cursos.find((c) => String(c.id) === cursoId)?.grupos ?? []

  return (
    <form action={accion} className="mb-4 space-y-3 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
      <input type="hidden" name="id" value={i.id} />

      <label className="flex items-center gap-2 text-[14px]">
        <input type="checkbox" name="es_menor" checked={esMenor} onChange={(e) => setEsMenor(e.target.checked)} />
        La plaza es para un menor
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {esMenor && (
          <>
            <Mini etiqueta="Alumno">
              <input name="alumno_nombre" defaultValue={i.alumno_nombre ?? ''} className={claseInput} />
            </Mini>
            <Mini etiqueta="Edad o curso escolar">
              <input name="alumno_edad" defaultValue={i.alumno_edad ?? ''} className={claseInput} />
            </Mini>
          </>
        )}
        <Mini etiqueta={esMenor ? 'Tutor' : 'Nombre'}>
          <input name="nombre" defaultValue={i.nombre} required className={claseInput} />
        </Mini>
        <Mini etiqueta="Teléfono">
          <input name="telefono" type="tel" defaultValue={i.telefono ?? ''} className={claseInput} />
        </Mini>
        <Mini etiqueta="Correo">
          <input name="email" type="email" defaultValue={i.email} required className={claseInput} />
        </Mini>
        <Mini etiqueta="Curso">
          <select
            name="curso_id"
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            className={claseInput}
          >
            <option value="">{i.curso_id ? 'Consulta general' : i.curso_titulo}</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
          </select>
        </Mini>
        {grupos.length > 0 && (
          <Mini etiqueta="Grupo">
            <select
              key={cursoId}
              name="convocatoria_id"
              defaultValue={String(cursoId) === String(i.curso_id) && i.convocatoria_id ? String(i.convocatoria_id) : ''}
              className={claseInput}
            >
              <option value="">Sin grupo concreto</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.texto}
                </option>
              ))}
            </select>
          </Mini>
        )}
      </div>

      <Mini etiqueta="Mensaje">
        <textarea name="mensaje" rows={3} defaultValue={i.mensaje ?? ''} className={claseInput} />
      </Mini>

      {estado && !estado.ok && (
        <p role="alert" className="text-[13.5px] text-red-700">
          {estado.mensaje}
        </p>
      )}

      <div className="flex gap-2">
        <Guardar />
        <button type="button" onClick={onHecho} className={claseBotonSuave}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function Borrar({
  id,
  accion,
  confirmando,
  setConfirmando,
}: {
  id: number
  accion: (datos: FormData) => Promise<void>
  confirmando: boolean
  setConfirmando: (v: boolean) => void
}) {
  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="ml-auto text-[13.5px] text-neutral-400 hover:text-red-600"
      >
        Borrar
      </button>
    )
  }
  return (
    <form action={accion} className="ml-auto flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-[13.5px] text-neutral-600">¿Borrar sin vuelta atrás?</span>
      <button
        type="submit"
        className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[14px] font-medium text-red-700"
      >
        Sí, borrar
      </button>
      <button type="button" onClick={() => setConfirmando(false)} className={claseBotonSuave}>
        No
      </button>
    </form>
  )
}

function Mini({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-semibold text-neutral-600">{etiqueta}</span>
      {children}
    </label>
  )
}

function Linea({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-neutral-500">{etiqueta}:</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}
