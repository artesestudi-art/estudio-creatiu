'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Formas from '@/components/Formas'
import { entrar, type EstadoLogin } from './acciones'

/**
 * La puerta del panel, con la ropa de la marca.
 *
 * La insignia va ENTERA y tal cual, del SVG sacado del `.ai`: ni recortada ni
 * de fondo. La rueda de color es la de la portada de la web, así el panel y la
 * web se reconocen. Texto siempre en marino: la paleta es pastel y es el único
 * color del kit que aguanta letra encima (8,19:1 sobre el crema).
 */

function Boton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-[var(--color-marca-marino)] px-5 py-3 text-[15px] font-semibold tracking-wide text-[var(--color-marca-crema)] transition hover:bg-[#0f3a70] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-marca-mostaza)] disabled:opacity-60"
    >
      {pending ? 'Comprobando…' : 'Entrar'}
    </button>
  )
}

const claseCampo =
  'w-full rounded-xl border border-[var(--color-marca-arena)] bg-white px-4 py-3 text-[15px] text-[var(--color-marca-marino)] outline-none transition focus:border-[var(--color-marca-marino)] focus:ring-4 focus:ring-[var(--color-marca-mostaza)]/35'

const claseEtiqueta =
  'mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--color-tinta-60)]'

/** Las cuatro manchas de la lámina, en fila. */
function Franja({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex h-1.5 ${className}`}>
      <span className="flex-1 bg-[var(--color-marca-mostaza)]" />
      <span className="flex-1 bg-[var(--color-marca-salmon)]" />
      <span className="flex-1 bg-[var(--color-marca-malva)]" />
      <span className="flex-1 bg-[var(--color-marca-azul)]" />
    </div>
  )
}

/**
 * `arranque`: todavía no hay nadie dado de alta y se entra con la contraseña
 * de las variables de entorno. Entonces el campo del correo sobra y decirlo
 * ahorra el «pero qué correo pongo».
 */
export default function Login({ titulo, arranque }: { titulo: string; arranque: boolean }) {
  const [estado, accion] = useActionState<EstadoLogin | null, FormData>(entrar, null)

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--color-marca-crema)] text-[var(--color-marca-marino)]">
      <Franja />

      {/* La rueda asoma por la esquina, girando despacio como en la portada. */}
      <Formas className="pointer-events-none absolute -right-24 -bottom-20 w-[26rem] opacity-90 max-lg:hidden" />

      <div className="relative mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG vectorial del logo: next/image no aporta nada aquí */}
          <img
            src="/insignia-artes.svg"
            alt="Artés Espai Creatiu"
            className="w-36 sm:w-44 lg:w-64"
          />
          <p className="mt-6 font-[family-name:var(--font-display)] text-[13px] uppercase tracking-[0.32em] text-[var(--color-tinta-60)] lg:mt-8">
            Panel de gestión
          </p>
          <p className="mt-2 max-w-sm font-[family-name:var(--font-display)] text-[1.6rem] leading-tight lg:text-[2.1rem]">
            Cursos, inscripciones y mensajes, en un solo sitio.
          </p>
        </div>

        <div className="w-full max-w-md justify-self-center rounded-[1.75rem] border border-[var(--color-linea)] bg-white/80 p-7 shadow-[0_24px_60px_-28px_rgba(20,72,139,0.35)] backdrop-blur sm:p-9 lg:justify-self-end">
          <h1 className="text-[1.5rem] leading-tight">{titulo}</h1>
          <p className="mt-1.5 mb-7 text-[14.5px] text-[var(--color-tinta-80)]">
            {arranque
              ? 'Primer acceso: entra con la contraseña de instalación y crea tu usuario.'
              : 'Entra con tu correo y tu contraseña.'}
          </p>

          <form action={accion} className="space-y-4">
            {!arranque && (
              <div>
                <label htmlFor="email" className={claseEtiqueta}>
                  Correo
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  className={claseCampo}
                />
              </div>
            )}
            <div>
              <label htmlFor="clave" className={claseEtiqueta}>
                Contraseña
              </label>
              <input
                id="clave"
                name="clave"
                type="password"
                required
                autoFocus={arranque}
                autoComplete="current-password"
                className={claseCampo}
              />
            </div>
            {estado?.error && (
              <p
                role="alert"
                className="rounded-xl border border-[var(--color-acento)]/30 bg-[var(--color-marca-crema)] px-4 py-2.5 text-[14px] text-[var(--color-acento)]"
              >
                {estado.error}
              </p>
            )}
            <div className="pt-2">
              <Boton />
            </div>
          </form>
        </div>
      </div>

      <p className="relative pb-6 text-center text-[12.5px] text-[var(--color-tinta-60)]">
        Passeig Diagonal, 71 · Artés
      </p>
    </div>
  )
}
