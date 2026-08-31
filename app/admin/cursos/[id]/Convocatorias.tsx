'use client'

import { useState } from 'react'
import { MODALIDADES, type Convocatoria } from '@/lib/bd'
import { Tarjeta, claseBotonSuave, claseInput } from '../../ui'
import { accionBorrarConvocatoria, accionGuardarConvocatoria } from '../acciones'

const ESTADOS = [
  { id: 'abierta', nombre: 'Abierta' },
  { id: 'completa', nombre: 'Completa' },
  { id: 'cerrada', nombre: 'Cerrada' },
]

export default function Convocatorias({
  cursoId,
  lista,
  ocupacion,
}: {
  cursoId: number
  lista: Convocatoria[]
  ocupacion: Record<number, number>
}) {
  const [anadiendo, setAnadiendo] = useState(false)

  return (
    <Tarjeta className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold">Convocatorias</h2>
        <button type="button" onClick={() => setAnadiendo((v) => !v)} className={claseBotonSuave}>
          {anadiendo ? 'Cancelar' : 'Añadir convocatoria'}
        </button>
      </div>

      <p className="text-[13.5px] text-neutral-500">
        Cada convocatoria es un grupo con sus fechas y su aforo. El alumno elige una al inscribirse.
        Las plazas ocupadas cuentan solo inscripciones <strong>aceptadas o matriculadas</strong>: una
        solicitud nueva todavía no reserva sitio.
      </p>

      {anadiendo && <Formulario cursoId={cursoId} onHecho={() => setAnadiendo(false)} />}

      {lista.length === 0 && !anadiendo ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-[14px] text-neutral-500">
          Sin convocatorias. El curso se puede publicar igual: el formulario recogerá el interés sin
          fecha concreta.
        </p>
      ) : (
        <div className="space-y-2.5">
          {lista.map((c) => (
            <Fila key={c.id} c={c} ocupadas={ocupacion[c.id] ?? 0} />
          ))}
        </div>
      )}
    </Tarjeta>
  )
}

function Fila({ c, ocupadas }: { c: Convocatoria; ocupadas: number }) {
  const [editando, setEditando] = useState(false)
  const libres = c.plazas === null ? null : c.plazas - ocupadas

  if (editando) {
    return <Formulario cursoId={c.curso_id} convocatoria={c} onHecho={() => setEditando(false)} />
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-neutral-200 px-3.5 py-2.5 text-[14px]">
      <span className="font-semibold">{c.etiqueta || 'Sin nombre'}</span>
      {c.inicio && (
        <span className="text-neutral-600">
          {new Date(c.inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
          {c.fin &&
            ` – ${new Date(c.fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`}
        </span>
      )}
      {c.horario && <span className="text-neutral-500">{c.horario}</span>}
      {libres !== null && (
        <span className={libres <= 0 ? 'text-red-600' : 'text-neutral-600'}>
          {ocupadas}/{c.plazas} plazas
        </span>
      )}
      <span className="text-neutral-400">{ESTADOS.find((e) => e.id === c.estado)?.nombre}</span>
      <div className="ml-auto flex items-center gap-3">
        <button type="button" onClick={() => setEditando(true)} className="text-[13px] underline underline-offset-2">
          Editar
        </button>
        <form action={accionBorrarConvocatoria}>
          <input type="hidden" name="id" value={c.id} />
          <input type="hidden" name="curso_id" value={c.curso_id} />
          <button type="submit" className="text-[13px] text-neutral-400 hover:text-red-600">
            Borrar
          </button>
        </form>
      </div>
    </div>
  )
}

function Formulario({
  cursoId,
  convocatoria,
  onHecho,
}: {
  cursoId: number
  convocatoria?: Convocatoria
  onHecho: () => void
}) {
  // Lo que no se traduzca cae al castellano, igual que en el curso.
  const ca = (convocatoria?.ca ?? {}) as { etiqueta?: string; horario?: string }

  return (
    <form
      action={async (datos: FormData) => {
        await accionGuardarConvocatoria(datos)
        onHecho()
      }}
      className="rounded-lg border border-neutral-300 bg-neutral-50 p-4"
    >
      <input type="hidden" name="curso_id" value={cursoId} />
      {convocatoria && <input type="hidden" name="id" value={convocatoria.id} />}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Mini etiqueta="Nombre del grupo">
          <input
            name="etiqueta"
            defaultValue={convocatoria?.etiqueta ?? ''}
            placeholder="Grupo de tarde · otoño"
            className={claseInput}
          />
        </Mini>
        <Mini etiqueta="Empieza">
          <input type="date" name="inicio" defaultValue={convocatoria?.inicio ?? ''} className={claseInput} />
        </Mini>
        <Mini etiqueta="Termina">
          <input type="date" name="fin" defaultValue={convocatoria?.fin ?? ''} className={claseInput} />
        </Mini>
        <Mini etiqueta="Horario">
          <input
            name="horario"
            defaultValue={convocatoria?.horario ?? ''}
            placeholder="Martes de 18 a 20 h"
            className={claseInput}
          />
        </Mini>
        <Mini etiqueta="Modalidad">
          <select name="modalidad" defaultValue={convocatoria?.modalidad ?? ''} className={claseInput}>
            <option value="">La del curso</option>
            {MODALIDADES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </Mini>
        <Mini etiqueta="Plazas">
          <input
            name="plazas"
            inputMode="numeric"
            defaultValue={convocatoria?.plazas ?? ''}
            className={claseInput}
          />
        </Mini>
        <Mini etiqueta="Estado">
          <select name="estado" defaultValue={convocatoria?.estado ?? 'abierta'} className={claseInput}>
            {ESTADOS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </Mini>
        <Mini etiqueta="Orden">
          <input
            name="orden"
            inputMode="numeric"
            defaultValue={convocatoria?.orden ?? 0}
            className={claseInput}
          />
        </Mini>
        <Mini etiqueta="Nom del grup (català)">
          <input
            name="ca_etiqueta"
            defaultValue={ca.etiqueta ?? ''}
            placeholder={convocatoria?.etiqueta ?? ''}
            className={claseInput}
          />
        </Mini>
        <Mini etiqueta="Horari (català)">
          <input
            name="ca_horario"
            defaultValue={ca.horario ?? ''}
            placeholder={convocatoria?.horario ?? ''}
            className={claseInput}
          />
        </Mini>
      </div>

      <div className="mt-3 flex gap-2">
        <button type="submit" className="rounded-lg bg-neutral-900 px-4 py-2 text-[14px] font-semibold text-white">
          Guardar
        </button>
        <button type="button" onClick={onHecho} className={claseBotonSuave}>
          Cancelar
        </button>
      </div>
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
