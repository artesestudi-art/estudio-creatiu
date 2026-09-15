import { numeroWhatsApp } from './ui'

/**
 * Los dos botones de WhatsApp de una ficha.
 *
 * - «WhatsApp a …» abre el chat con esa persona y un saludo ya escrito, en el
 *   idioma en que llegó (se cambia en WhatsApp antes de enviar).
 * - «Reenviar» abre WhatsApp con la ficha entera como texto y deja elegir a
 *   quién mandarla: a la profesora del grupo, por ejemplo.
 *
 * Son enlaces `wa.me`, no una API: no hay cuenta que conectar ni nada sale
 * sin que el estudio pulse «enviar» en su propio WhatsApp.
 */
export default function WhatsApp({
  telefono,
  nombre,
  saludo,
  ficha,
}: {
  telefono: string | null
  nombre: string
  saludo: string
  ficha: string
}) {
  const numero = numeroWhatsApp(telefono)
  const clase =
    'inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[14px] font-medium transition'

  return (
    <div className="flex flex-wrap gap-2">
      {numero ? (
        <a
          href={`https://wa.me/${numero}?text=${encodeURIComponent(saludo)}`}
          target="_blank"
          rel="noreferrer"
          className={`${clase} border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-600`}
        >
          <Icono />
          WhatsApp a {nombre.split(' ')[0]}
        </a>
      ) : (
        <span className="self-center text-[13px] text-neutral-400">
          {telefono ? 'El teléfono no vale para WhatsApp' : 'Sin teléfono'}
        </span>
      )}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(ficha)}`}
        target="_blank"
        rel="noreferrer"
        className={`${clase} border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900`}
      >
        Reenviar por WhatsApp
      </a>
    </div>
  )
}

function Icono() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  )
}
