'use client'

import { useState } from 'react'
import { claseBotonSuave } from '../ui'
import { accionBorrarCurso } from './acciones'

/** Borrar desde la lista, con un segundo paso: un curso borrado se lleva sus
 *  grupos y su dirección en Google, y el botón está al lado de «Editar». */
export default function BorrarCurso({ id, titulo }: { id: number; titulo: string }) {
  const [confirmando, setConfirmando] = useState(false)

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="text-[13.5px] text-neutral-400 transition hover:text-red-600"
      >
        Borrar
      </button>
    )
  }

  return (
    <form action={accionBorrarCurso} className="flex basis-full flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-[13.5px] text-red-700">
        ¿Borrar «{titulo}» y sus grupos? Las inscripciones se conservan.
      </span>
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
