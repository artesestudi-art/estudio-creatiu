'use client'

import { useState } from 'react'
import { ESTADOS_INSCRIPCION, MODALIDADES, type Inscripcion } from '@/lib/bd'
import { Insignia, claseBotonSuave, claseInput, fecha } from '../ui'
import { accionBorrar, accionEstado, accionNotas } from './acciones'

const NOMBRES = Object.fromEntries(ESTADOS_INSCRIPCION.map((e) => [e.id, e.nombre]))
// La modalidad se guarda como `presencial`; en pantalla se lee «Presencial».
const MODALIDAD = Object.fromEntries(MODALIDADES.map((m) => [m.id, m.nombre]))

export default function Ficha({ i }: { i: Inscripcion }) {
  const [abierta, setAbierta] = useState(false)
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
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
        <span className="ml-auto text-[13px] text-neutral-400">{fecha(i.creado)}</span>
      </button>

      {abierta && (
        <div className="border-t border-neutral-100 px-4 py-4">
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
            {i.convocatoria_texto && <Linea etiqueta="Convocatoria">{i.convocatoria_texto}</Linea>}
            {i.modalidad && (
              <Linea etiqueta="Modalidad">{MODALIDAD[i.modalidad] ?? i.modalidad}</Linea>
            )}
            {i.experiencia && <Linea etiqueta="Experiencia">{i.experiencia}</Linea>}
            <Linea etiqueta="Llegó por">{i.origen}</Linea>
          </dl>

          {i.mensaje && (
            <p className="mb-4 whitespace-pre-line rounded-lg bg-neutral-50 px-3.5 py-3 text-[14.5px] leading-relaxed">
              {i.mensaje}
            </p>
          )}

          {i.aviso_error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
              El aviso por correo falló: {i.aviso_error}
            </p>
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

            {confirmandoBorrado ? (
              <form action={accionBorrar} className="flex items-center gap-2">
                <input type="hidden" name="id" value={i.id} />
                <span className="text-[13.5px] text-neutral-600">¿Borrar sin vuelta atrás?</span>
                <button
                  type="submit"
                  className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-[14px] font-medium text-red-700"
                >
                  Sí, borrar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmandoBorrado(false)}
                  className={claseBotonSuave}
                >
                  No
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoBorrado(true)}
                className="ml-auto text-[13.5px] text-neutral-400 hover:text-red-600"
              >
                Borrar
              </button>
            )}
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

function Linea({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-neutral-500">{etiqueta}:</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}
