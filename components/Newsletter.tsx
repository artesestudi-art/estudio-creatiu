'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { suscribirse, type EstadoFormulario } from '@/app/acciones'
import { prefijo, textos, type Idioma } from '@/lib/idioma'

function Boton({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="boton boton-principal shrink-0 disabled:opacity-60">
      {pending ? t.apuntando : t.apuntarme}
    </button>
  )
}

export default function Newsletter({ origen, idioma }: { origen: string; idioma: Idioma }) {
  const t = textos(idioma)
  const [estado, accion] = useActionState<EstadoFormulario | null, FormData>(suscribirse, null)
  const previo = estado?.valores ?? {}

  if (estado?.ok) {
    return <p className="t-cuerpo">{estado.mensaje}</p>
  }

  return (
    <form action={accion} className="space-y-3">
      <input type="hidden" name="origen" value={origen} />
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="empresa-boletin">Empresa</label>
        <input id="empresa-boletin" name="empresa" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="n-email" className="sr-only">
          {t.tuCorreo}
        </label>
        <input
          id="n-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          enterKeyHint="send"
          placeholder="tu@correo.com"
          defaultValue={previo.email ?? ''}
          className="campo"
        />
        <Boton idioma={idioma} />
      </div>

      <label className="consentimiento text-[0.85rem] leading-relaxed opacity-60">
        <input
          type="checkbox"
          name="consentimiento"
          defaultChecked={previo.consentimiento === 'si'}
          className="casilla"
        />
        <span>
          {t.aceptoNewsletter}{' '}
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
          . {t.puedesDarteDeBaja}
        </span>
      </label>

      {estado && !estado.ok && (
        <p role="alert" className="text-[0.875rem] text-[var(--color-acento)]">
          {estado.mensaje}
        </p>
      )}
    </form>
  )
}
