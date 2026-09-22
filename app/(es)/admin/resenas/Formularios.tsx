'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { claseBoton, claseBotonSuave, claseInput } from '../ui'
import { accionEnviarPendientes, accionEnviarUna, accionGuardarAjustes, type EstadoResenas } from './acciones'

function Aviso({ estado }: { estado: EstadoResenas }) {
  if (!estado) return null
  return (
    <p
      role="status"
      className={`rounded-lg border px-3.5 py-2.5 text-[14px] ${
        estado.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {estado.mensaje}
    </p>
  )
}

function Enviar({ texto, pendiente, suave }: { texto: string; pendiente: string; suave?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={suave ? claseBotonSuave : claseBoton}>
      {pending ? pendiente : texto}
    </button>
  )
}

export function Ajustes({ url, activo }: { url: string; activo: boolean }) {
  const [estado, accion] = useActionState(accionGuardarAjustes, null)
  return (
    <form action={accion} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">Enlace para dejar la reseña</span>
        <input
          name="url"
          type="url"
          defaultValue={url}
          placeholder="https://g.page/r/…/review"
          className={claseInput}
        />
        <span className="mt-1 block text-[12.5px] text-neutral-500">
          En tu ficha de Google Business: «Pedir reseñas» → copiar el enlace.
        </span>
      </label>
      <label className="flex items-start gap-2.5 text-[14.5px]">
        <input type="checkbox" name="activo" defaultChecked={activo} className="mt-1" />
        <span>
          Enviar el correo <strong>automáticamente</strong> a los matriculados el día después de que acabe
          su curso.
        </span>
      </label>
      <Aviso estado={estado} />
      <Enviar texto="Guardar" pendiente="Guardando…" />
    </form>
  )
}

export function EnviarPendientes({ cuantos }: { cuantos: number }) {
  const [estado, accion] = useActionState(accionEnviarPendientes, null)
  return (
    <form action={accion} className="flex flex-wrap items-center gap-3">
      <Enviar
        texto={cuantos === 1 ? 'Enviar el pendiente ahora' : `Enviar los ${cuantos} pendientes ahora`}
        pendiente="Enviando…"
        suave
      />
      <Aviso estado={estado} />
    </form>
  )
}

export function EnviarUna({ id, repetir }: { id: number; repetir: boolean }) {
  return (
    <form action={accionEnviarUna}>
      <input type="hidden" name="id" value={id} />
      <Enviar texto={repetir ? 'Volver a enviar' : 'Enviar ahora'} pendiente="Enviando…" suave />
    </form>
  )
}
