'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { enviarContacto, type EstadoFormulario } from '@/app/acciones'
import { prefijo, textos, type Idioma } from '@/lib/idioma'

function Boton({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="boton boton-principal disabled:opacity-60">
      {pending ? t.enviando : t.enviarMensaje}
    </button>
  )
}

export default function FormularioContacto({
  origen,
  idioma,
}: {
  origen: string
  idioma: Idioma
}) {
  const t = textos(idioma)
  const [estado, accion] = useActionState<EstadoFormulario | null, FormData>(enviarContacto, null)
  // Ver el comentario de EstadoFormulario: React vacía el formulario tras cada
  // acción, así que hay que volver a pintar lo que la persona había escrito.
  const previo = estado?.valores ?? {}

  if (estado?.ok) {
    return (
      <p className="t-cuerpo border-t border-[var(--color-linea-fuerte)] pt-8">{estado.mensaje}</p>
    )
  }

  return (
    <form action={accion} className="space-y-7">
      <input type="hidden" name="origen" value={origen} />
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="empresa-contacto">Empresa</label>
        <input id="empresa-contacto" name="empresa" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="c-nombre" className="etiqueta">
            {t.nombre}
          </label>
          <input
            id="c-nombre"
            name="nombre"
            required
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            defaultValue={previo.nombre ?? ''}
            className="campo"
          />
          {estado?.campo === 'nombre' && (
            <p role="alert" className="mt-1 text-[0.8125rem] text-[var(--color-acento)]">
              {estado.mensaje}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="c-email" className="etiqueta">
            {t.correo}
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="next"
            defaultValue={previo.email ?? ''}
            className="campo"
          />
          {estado?.campo === 'email' && (
            <p role="alert" className="mt-1 text-[0.8125rem] text-[var(--color-acento)]">
              {estado.mensaje}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="c-telefono" className="etiqueta">
          {t.telefono} <span className="font-normal opacity-55">{t.opcional}</span>
        </label>
        <input
          id="c-telefono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          enterKeyHint="next"
          defaultValue={previo.telefono ?? ''}
          className="campo"
        />
        {estado?.campo === 'telefono' && (
          <p role="alert" className="mt-1 text-[0.8125rem] text-[var(--color-acento)]">
            {estado.mensaje}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="c-mensaje" className="etiqueta">
          {t.mensaje}
        </label>
        <textarea
          id="c-mensaje"
          name="mensaje"
          rows={4}
          required
          enterKeyHint="done"
          defaultValue={previo.mensaje ?? ''}
          className="campo"
        />
        {estado?.campo === 'mensaje' && (
          <p role="alert" className="mt-1 text-[0.8125rem] text-[var(--color-acento)]">
            {estado.mensaje}
          </p>
        )}
      </div>

      <label className="consentimiento text-[0.9rem] leading-relaxed opacity-80">
        <input
          type="checkbox"
          name="consentimiento"
          defaultChecked={previo.consentimiento === 'si'}
          className="casilla"
        />
        <span>
          {t.aceptoContacto}{' '}
          <a
            href={`${prefijo(idioma)}/privacidad`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {t.politicaDePrivacidad}
            {/* Quien navega con lector de pantalla debe saber que se le abre
                otra pestaña antes de pulsar, no después. */}
            <span className="sr-only">{t.seAbreEnPestanaNueva}</span>
          </a>
          .
        </span>
      </label>
      {estado?.campo === 'consentimiento' && (
        <p role="alert" className="text-[0.875rem] text-[var(--color-acento)]">
          {estado.mensaje}
        </p>
      )}

      {estado && !estado.ok && !estado.campo && (
        <p role="alert" className="border-l-2 border-[var(--color-acento)] pl-4 text-[0.9rem]">
          {estado.mensaje}
        </p>
      )}

      <Boton idioma={idioma} />
    </form>
  )
}
