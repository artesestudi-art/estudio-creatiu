'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { enviarInscripcion, type EstadoFormulario } from '@/app/acciones'
import { prefijo, textos, type Idioma } from '@/lib/idioma'

/**
 * Formulario de solicitud de plaza.
 *
 * De momento no cobra: recoge la petición y el estudio confirma a mano. Por
 * eso el texto no dice «matricúlate» sino «pide plaza»: prometer una matrícula
 * que luego hay que confirmar por teléfono decepciona a quien la rellena.
 *
 * Los errores se enseñan bajo el campo que falla y el foco no se pierde: el
 * mensaje global arriba del todo, en móvil, se queda fuera de pantalla.
 */

export type CursoElegible = {
  id: number
  titulo: string
  convocatorias: { id: number; texto: string; completa: boolean }[]
}

function Boton({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="boton boton-principal w-full disabled:opacity-55"
    >
      {pending ? t.enviando : t.pedirPlaza}
    </button>
  )
}

export default function FormularioInscripcion({
  cursos,
  cursoFijo,
  origen,
  idioma,
}: {
  cursos: CursoElegible[]
  cursoFijo?: number
  origen: string
  idioma: Idioma
}) {
  const t = textos(idioma)
  const [estado, accion] = useActionState<EstadoFormulario | null, FormData>(enviarInscripcion, null)
  const [cursoId, setCursoId] = useState(String(cursoFijo ?? cursos[0]?.id ?? ''))

  // React 19 vacía el formulario en cuanto termina la acción, incluso si
  // devolvió un error. Repintar los campos con lo que la acción nos devuelve
  // es lo que evita que alguien pierda el mensaje que acababa de escribir.
  const previo = estado?.valores ?? {}

  const curso = cursos.find((c) => String(c.id) === cursoId)

  if (estado?.ok) {
    return (
      <div className="border-t border-current/25 pt-8">
        <p className="t-media mb-4">{t.solicitudRecibida}</p>
        <p className="t-cuerpo">{estado.mensaje}</p>
        <p className="mt-5 text-[0.9rem] opacity-55">
          {t.miraEnSpam}
        </p>
      </div>
    )
  }

  return (
    <form action={accion} className="space-y-7">
      <input type="hidden" name="origen" value={origen} />

      {/* Trampa para robots: invisible para las personas, irresistible para los
          formularios automáticos. No se usa reCAPTCHA porque cuando su token
          caduca o no carga, el formulario deja de enviar y se pierden alumnos
          sin que nadie se entere. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="empresa">Empresa</label>
        <input id="empresa" name="empresa" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {cursoFijo ? (
        <input type="hidden" name="curso_id" value={cursoFijo} />
      ) : (
        <div>
          <label htmlFor="curso_id" className="etiqueta">
            {t.queTeInteresa}
          </label>
          <select
            id="curso_id"
            name="curso_id"
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            className="campo"
          >
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.titulo}
              </option>
            ))}
            <option value="">{t.otraCosa}</option>
          </select>
        </div>
      )}

      {curso && curso.convocatorias.length > 0 && (
        <div>
          <label htmlFor="convocatoria_id" className="etiqueta">
            {t.grupo}
          </label>
          <select
            id="convocatoria_id"
            name="convocatoria_id"
            className="campo"
            defaultValue={previo.convocatoria_id ?? ''}
          >
            <option value="">{t.meDaIgual}</option>
            {curso.convocatorias.map((v) => (
              <option key={v.id} value={v.id} disabled={v.completa}>
                {v.texto}
                {v.completa ? ` — ${t.completo.toLowerCase()}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-7 sm:grid-cols-2">
        <Campo
          id="nombre"
          etiqueta={t.nombre}
          idioma={idioma}
          requerido
          autoComplete="name"
          mayusculas="words"
          siguiente="next"
          valor={previo.nombre}
          error={estado?.campo === 'nombre' ? estado.mensaje : undefined}
        />
        <Campo
          id="telefono"
          etiqueta={t.telefono}
          idioma={idioma}
          tipo="tel"
          autoComplete="tel"
          modo="tel"
          siguiente="next"
          ayuda={t.telefonoAyuda}
          valor={previo.telefono}
          error={estado?.campo === 'telefono' ? estado.mensaje : undefined}
        />
      </div>

      <Campo
        id="email"
        etiqueta={t.correo}
        idioma={idioma}
        tipo="email"
        requerido
        autoComplete="email"
        modo="email"
        mayusculas="none"
        siguiente="done"
        valor={previo.email}
        error={estado?.campo === 'email' ? estado.mensaje : undefined}
      />

      <div>
        <label htmlFor="experiencia" className="etiqueta">
          {t.experiencia}
        </label>
        <select
          id="experiencia"
          name="experiencia"
          className="campo"
          defaultValue={previo.experiencia ?? ''}
        >
          <option value="">{t.prefieroNoDecirlo}</option>
          <option value="Nunca">{t.nunca}</option>
          <option value="Algo suelto">{t.algoSuelto}</option>
          <option value="Con formación">{t.conFormacion}</option>
        </select>
      </div>

      <div>
        <label htmlFor="mensaje" className="etiqueta">
          {t.algoQueSaber}
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={3}
          defaultValue={previo.mensaje ?? ''}
          className="campo"
        />
      </div>

      <label className="consentimiento text-[0.9rem] leading-relaxed opacity-80">
        <input
          type="checkbox"
          name="consentimiento"
          defaultChecked={previo.consentimiento === 'si'}
          className="casilla"
        />
        <span>
          {t.aceptoInscripcion}{' '}
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

      <p className="text-[0.8125rem] opacity-55">
        {t.noEsMatricula}
      </p>
    </form>
  )
}

function Campo({
  id,
  etiqueta,
  tipo = 'text',
  requerido,
  autoComplete,
  ayuda,
  valor,
  error,
  modo,
  mayusculas,
  siguiente,
  idioma,
}: {
  id: string
  etiqueta: string
  tipo?: string
  requerido?: boolean
  autoComplete?: string
  ayuda?: string
  valor?: string
  error?: string
  /** Qué teclado abre el móvil. */
  modo?: 'text' | 'tel' | 'email'
  /** `words` pone mayúscula inicial en nombres; `none` la quita en correos. */
  mayusculas?: 'none' | 'words'
  /** Qué pone en la tecla de retorno del teclado del móvil. */
  siguiente?: 'next' | 'send' | 'done'
  idioma: Idioma
}) {
  const t = textos(idioma)
  return (
    <div>
      <label htmlFor={id} className="etiqueta">
        {etiqueta}
        {!requerido && <span className="font-normal opacity-55"> {t.opcional}</span>}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        required={requerido}
        autoComplete={autoComplete}
        inputMode={modo}
        autoCapitalize={mayusculas}
        autoCorrect={tipo === 'email' ? 'off' : undefined}
        enterKeyHint={siguiente}
        defaultValue={valor ?? ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : ayuda ? `${id}-ayuda` : undefined}
        className="campo"
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[0.8125rem] text-[var(--color-acento)]">
          {error}
        </p>
      ) : (
        ayuda && (
          <p id={`${id}-ayuda`} className="mt-1 text-[0.8125rem] opacity-55">
            {ayuda}
          </p>
        )
      )}
    </div>
  )
}
