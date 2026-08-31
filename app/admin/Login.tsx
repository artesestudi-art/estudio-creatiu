'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { entrar, type EstadoLogin } from './acciones'

function Boton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-60"
    >
      {pending ? 'Comprobando…' : 'Entrar'}
    </button>
  )
}

export default function Login({ titulo }: { titulo: string }) {
  const [estado, accion] = useActionState<EstadoLogin | null, FormData>(entrar, null)

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">{titulo}</h1>
      <p className="mt-1 mb-7 text-[14.5px] text-neutral-500">
        Cursos, inscripciones y contenidos de la web.
      </p>
      <form action={accion} className="space-y-3">
        <div>
          <label htmlFor="clave" className="mb-1.5 block text-[13px] font-semibold text-neutral-700">
            Contraseña
          </label>
          <input
            id="clave"
            name="clave"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-neutral-900"
          />
        </div>
        {estado?.error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[14px] text-red-700"
          >
            {estado.error}
          </p>
        )}
        <Boton />
      </form>
    </div>
  )
}
