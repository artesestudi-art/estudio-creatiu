'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Campo, claseBoton, claseInput } from '../ui'
import { altaUsuario, cambiarMiClave, reiniciarClave, type Estado } from './acciones'
import { CLAVE_MINIMA } from '@/lib/reglas'

function Boton({ texto }: { texto: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={claseBoton}>
      {pending ? 'Guardando…' : texto}
    </button>
  )
}

function Aviso({ estado }: { estado: Estado | null }) {
  if (!estado?.error && !estado?.hecho) return null
  return (
    <p
      role="alert"
      className={`rounded-lg border px-3.5 py-2.5 text-[14px] ${
        estado.error
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
      }`}
    >
      {estado.error ?? estado.hecho}
    </p>
  )
}

export function AltaUsuario({ primero }: { primero: boolean }) {
  const [estado, accion] = useActionState<Estado | null, FormData>(altaUsuario, null)

  return (
    <form action={accion} className="space-y-3">
      <Campo etiqueta="Correo">
        <input name="email" type="email" required autoComplete="off" className={claseInput} />
      </Campo>
      <Campo etiqueta="Nombre" ayuda="Para saber quién es quién en esta lista.">
        <input name="nombre" type="text" className={claseInput} />
      </Campo>
      <Campo
        etiqueta="Contraseña"
        ayuda={`Mínimo ${CLAVE_MINIMA} caracteres.${
          primero ? '' : ' Se la das por un sitio seguro y que se la cambie al entrar.'
        }`}
      >
        <input
          name="clave"
          type="password"
          required
          minLength={CLAVE_MINIMA}
          autoComplete="new-password"
          className={claseInput}
        />
      </Campo>
      <Aviso estado={estado} />
      <Boton texto={primero ? 'Crear mi usuario' : 'Dar de alta'} />
    </form>
  )
}

export function MiClave() {
  const [estado, accion] = useActionState<Estado | null, FormData>(cambiarMiClave, null)

  return (
    <form action={accion} className="space-y-3">
      <Campo etiqueta="Contraseña actual">
        <input
          name="actual"
          type="password"
          required
          autoComplete="current-password"
          className={claseInput}
        />
      </Campo>
      <Campo etiqueta="Contraseña nueva" ayuda={`Mínimo ${CLAVE_MINIMA} caracteres.`}>
        <input
          name="nueva"
          type="password"
          required
          minLength={CLAVE_MINIMA}
          autoComplete="new-password"
          className={claseInput}
        />
      </Campo>
      <Campo etiqueta="Repite la nueva">
        <input
          name="repetida"
          type="password"
          required
          minLength={CLAVE_MINIMA}
          autoComplete="new-password"
          className={claseInput}
        />
      </Campo>
      <Aviso estado={estado} />
      <Boton texto="Cambiar mi contraseña" />
    </form>
  )
}

/** Para cuando alguien la olvida: no hay correo de recuperación, la pone quien
 *  ya está dentro y se la entrega en mano. */
export function ReiniciarClave({ id, email }: { id: number; email: string }) {
  const [estado, accion] = useActionState<Estado | null, FormData>(reiniciarClave, null)

  return (
    <form action={accion} className="mt-2 flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <label className="flex-1">
        <span className="mb-1 block text-[12.5px] text-neutral-500">
          Contraseña nueva para {email}
        </span>
        <input
          name="clave"
          type="text"
          minLength={CLAVE_MINIMA}
          required
          autoComplete="off"
          className={claseInput}
        />
      </label>
      <Boton texto="Poner" />
      {(estado?.error || estado?.hecho) && (
        <p className="w-full text-[13px] text-neutral-600">{estado.error ?? estado.hecho}</p>
      )}
    </form>
  )
}
