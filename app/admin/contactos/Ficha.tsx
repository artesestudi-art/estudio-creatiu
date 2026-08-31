'use client'

import { useState } from 'react'
import { ESTADOS_CONTACTO, type Contacto } from '@/lib/bd'
import { Insignia, claseBotonSuave, claseInput, fecha } from '../ui'
import { accionBorrar, accionEstado, accionNotas } from './acciones'

const NOMBRES = Object.fromEntries(ESTADOS_CONTACTO.map((e) => [e.id, e.nombre]))

export default function Ficha({ c }: { c: Contacto }) {
  const [abierta, setAbierta] = useState(false)

  return (
    <div className="rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3.5 text-left"
      >
        <Insignia estado={c.estado} texto={NOMBRES[c.estado] ?? c.estado} />
        <span className="text-[15px] font-semibold">{c.nombre}</span>
        <span className="truncate text-[14px] text-neutral-500">{c.asunto || c.mensaje.slice(0, 60)}</span>
        {!c.aviso_enviado && (
          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[12px] text-red-700">
            aviso no enviado
          </span>
        )}
        <span className="ml-auto text-[13px] text-neutral-400">{fecha(c.creado)}</span>
      </button>

      {abierta && (
        <div className="border-t border-neutral-100 px-4 py-4">
          <p className="mb-3 text-[14.5px]">
            <a href={`mailto:${c.email}`} className="underline underline-offset-2">
              {c.email}
            </a>
            {c.telefono && (
              <>
                {' · '}
                <a href={`tel:${c.telefono.replace(/\s/g, '')}`} className="underline underline-offset-2">
                  {c.telefono}
                </a>
              </>
            )}
            <span className="text-neutral-400"> · desde {c.origen}</span>
          </p>

          <p className="mb-4 whitespace-pre-line rounded-lg bg-neutral-50 px-3.5 py-3 text-[14.5px] leading-relaxed">
            {c.mensaje}
          </p>

          {c.aviso_error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
              El aviso por correo falló: {c.aviso_error}
            </p>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <form action={accionEstado} className="flex items-end gap-2">
              <input type="hidden" name="id" value={c.id} />
              <select name="estado" defaultValue={c.estado} className={`${claseInput} w-auto`}>
                {ESTADOS_CONTACTO.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
              <button type="submit" className={claseBotonSuave}>
                Cambiar estado
              </button>
            </form>
            <form action={accionBorrar} className="ml-auto">
              <input type="hidden" name="id" value={c.id} />
              <button type="submit" className="text-[13.5px] text-neutral-400 hover:text-red-600">
                Borrar
              </button>
            </form>
          </div>

          <form action={accionNotas} className="mt-4">
            <input type="hidden" name="id" value={c.id} />
            <label className="mb-1.5 block text-[13px] font-semibold text-neutral-700">Notas internas</label>
            <textarea name="notas" rows={2} defaultValue={c.notas ?? ''} className={claseInput} />
            <button type="submit" className={`${claseBotonSuave} mt-2`}>
              Guardar notas
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
