'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { ESTUDIO } from '@/data/estudio'
import { ESTADOS_CONTACTO, type Contacto } from '@/lib/bd'
import { Insignia, claseBoton, claseBotonSuave, claseInput, fecha } from '../ui'
import WhatsApp from '../WhatsApp'
import { Borrar } from '../inscripciones/Ficha'
import { accionBorrar, accionEditar, accionEstado, accionNotas } from './acciones'

const NOMBRES = Object.fromEntries(ESTADOS_CONTACTO.map((e) => [e.id, e.nombre]))

export default function Ficha({ c }: { c: Contacto }) {
  const [abierta, setAbierta] = useState(false)
  const [editando, setEditando] = useState(false)
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)

  const saludo = c.origen.startsWith('/ca')
    ? `Hola ${c.nombre}, t'escrivim de ${ESTUDIO.nombre} pel missatge que ens vas enviar.`
    : `Hola ${c.nombre}, te escribimos de ${ESTUDIO.nombre} por el mensaje que nos enviaste.`
  const ficha = [
    `Mensaje de la web · ${c.nombre}`,
    c.telefono && `Teléfono: ${c.telefono}`,
    `Correo: ${c.email}`,
    c.asunto && `Asunto: ${c.asunto}`,
    c.mensaje,
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
        <Insignia estado={c.estado} texto={NOMBRES[c.estado] ?? c.estado} />
        <span className="text-[15px] font-semibold">{c.nombre}</span>
        <span className="truncate text-[14px] text-neutral-500">{c.asunto || c.mensaje.slice(0, 60)}</span>
        {!c.aviso_enviado && (
          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[12px] text-red-700">
            aviso no enviado
          </span>
        )}
        {c.antispam && (
          <span
            title={c.antispam}
            className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[12px] text-amber-800"
          >
            {c.antispam.startsWith('Posible robot') ? 'posible robot' : 'sin verificar'}
          </span>
        )}
        <span className="ml-auto text-[13px] text-neutral-400">{fecha(c.creado)}</span>
        <span aria-hidden className="text-[13px] text-neutral-400">
          {abierta ? '▲' : '▼'}
        </span>
      </button>

      {abierta && (
        <div className="border-t border-neutral-100 px-4 py-4">
          {editando ? (
            <Edicion c={c} onHecho={() => setEditando(false)} />
          ) : (
            <>
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
            </>
          )}

          {c.antispam && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13.5px] text-amber-800">
              {c.antispam}. Se ha guardado igual por si es una persona: reCAPTCHA se equivoca con
              bloqueadores de anuncios y VPN.
            </p>
          )}
          {c.aviso_error && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13.5px] text-red-700">
              El aviso por correo falló: {c.aviso_error}
            </p>
          )}

          {!editando && (
            <div className="mb-4">
              <WhatsApp telefono={c.telefono} nombre={c.nombre} saludo={saludo} ficha={ficha} />
            </div>
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
            {!editando && (
              <button type="button" onClick={() => setEditando(true)} className={claseBotonSuave}>
                Editar
              </button>
            )}
            <Borrar
              id={c.id}
              accion={accionBorrar}
              confirmando={confirmandoBorrado}
              setConfirmando={setConfirmandoBorrado}
            />
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

function Guardar() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={claseBoton}>
      {pending ? 'Guardando…' : 'Guardar cambios'}
    </button>
  )
}

function Edicion({ c, onHecho }: { c: Contacto; onHecho: () => void }) {
  const [estado, accion] = useActionState(async (previo: Awaited<ReturnType<typeof accionEditar>>, datos: FormData) => {
    const r = await accionEditar(previo, datos)
    if (r?.ok) onHecho()
    return r
  }, null)

  return (
    <form action={accion} className="mb-4 space-y-3 rounded-lg border border-neutral-300 bg-neutral-50 p-4">
      <input type="hidden" name="id" value={c.id} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Mini etiqueta="Nombre">
          <input name="nombre" defaultValue={c.nombre} required className={claseInput} />
        </Mini>
        <Mini etiqueta="Correo">
          <input name="email" type="email" defaultValue={c.email} required className={claseInput} />
        </Mini>
        <Mini etiqueta="Teléfono">
          <input name="telefono" type="tel" defaultValue={c.telefono ?? ''} className={claseInput} />
        </Mini>
      </div>
      <Mini etiqueta="Mensaje">
        <textarea name="mensaje" rows={4} defaultValue={c.mensaje} required className={claseInput} />
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

function Mini({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12.5px] font-semibold text-neutral-600">{etiqueta}</span>
      {children}
    </label>
  )
}
