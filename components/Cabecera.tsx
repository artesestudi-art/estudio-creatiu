'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { prefijo, textos, type Idioma } from '@/lib/idioma'
import SelectorIdioma from './SelectorIdioma'
import Logo from '@/components/Logo'

/**
 * Cabecera fija.
 *
 * En móvil el menú es una cortina a pantalla completa con la tipografía
 * grande: seis enlaces apretados en una fila de 360 px no los acierta nadie
 * con el dedo.
 */

type Enlace = { href: string; texto: string }

export default function Cabecera({
  nombre,
  enlaces,
  telefono,
  idioma,
  equivalente,
  invertida = false,
}: {
  nombre: string
  enlaces: Enlace[]
  telefono: string | null
  idioma: Idioma
  /** Rutas equivalentes en el otro idioma, cuando no es un simple prefijo. */
  equivalente?: Partial<Record<Idioma, string>>
  /** La portada arranca sobre fondo tinta: la cabecera nace en claro. */
  invertida?: boolean
}) {
  const t = textos(idioma)
  const p = prefijo(idioma)
  const [abierto, setAbierto] = useState(false)
  const [rodado, setRodado] = useState(false)

  useEffect(() => {
    const alRodar = () => setRodado(window.scrollY > 40)
    alRodar()
    window.addEventListener('scroll', alRodar, { passive: true })
    return () => window.removeEventListener('scroll', alRodar)
  }, [])

  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [abierto])

  // Cerrar con Escape: si no, la cortina atrapa a quien navega con teclado.
  useEffect(() => {
    if (!abierto) return
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [abierto])

  const claro = invertida && !rodado && !abierto

  return (
    <header
      // `env(safe-area-inset-top)`: en un iPhone con muesca, sin esto la
      // cabecera fija queda por debajo del notch y el logo se come la esquina.
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className={`fixed inset-x-0 top-0 z-[var(--z-cabecera)] transition-colors duration-500 ${
        rodado && !abierto ? 'bg-[var(--color-papel)]/88 backdrop-blur-md' : ''
      } ${claro ? 'text-[var(--color-papel)]' : 'text-[var(--color-tinta)]'}`}
    >
      <div
        style={{ height: 'var(--alto-cabecera)' }}
        className="contenedor flex items-center justify-between gap-6"
      >
        <Link href={p || '/'} className="-my-2 flex min-h-11 items-center py-2">
          {/* El logotipo hereda el color del texto de la cabecera, que ya
              alterna marino y crema según la sección de debajo. El nombre va
              en `sr-only`: el SVG está marcado como decorativo para que el
              lector de pantalla lea «Artés Espai Creatiu» y no «imagen». */}
          <Logo className="h-10 w-auto md:h-14" />
          <span className="sr-only">{nombre}</span>
        </Link>

        <nav className="hidden items-center gap-9 text-[0.9375rem] lg:flex">
          {enlaces.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="enlace-linea flex min-h-11 items-center opacity-80 hover:opacity-100"
            >
              {e.texto}
            </Link>
          ))}
          <SelectorIdioma idioma={idioma} equivalente={equivalente} className="ml-1" />
          <Link
            href={`${p}/#inscripcion`}
            // `min-h-11` y no `!min-h-0`: en un iPad, que es táctil aunque mida
            // 1024 px de ancho, este botón se quedaba en 39 px de alto.
            className={`boton !min-h-11 !px-6 !py-3 ${
              claro
                ? 'bg-[var(--color-papel)] text-[var(--color-tinta)] hover:bg-[var(--color-acento)] hover:text-[var(--color-papel)]'
                : 'boton-principal'
            }`}
          >
            {t.pedirPlaza}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          aria-label={abierto ? t.cerrarMenu : t.abrirMenu}
          className="-mr-2 flex h-12 w-12 items-center justify-center lg:hidden"
        >
          <span className="relative block h-3.5 w-7">
            <span
              className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300 ${
                abierto ? 'translate-y-[7px] rotate-45' : ''
              }`}
            />
            <span
              className={`absolute inset-x-0 top-[7px] h-px bg-current transition-opacity duration-200 ${
                abierto ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`absolute inset-x-0 top-[14px] h-px bg-current transition-transform duration-300 ${
                abierto ? '-translate-y-[7px] -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </div>

      {abierto && (
        <div
          id="menu-movil"
          // `100dvh` y no `100vh`: en el móvil la barra del navegador aparece
          // y desaparece, y con `vh` la cortina queda cortada o sobra por abajo.
          style={{
            top: 'calc(var(--alto-cabecera) + env(safe-area-inset-top))',
            height: 'calc(100dvh - var(--alto-cabecera) - env(safe-area-inset-top))',
            paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))',
          }}
          className="fixed inset-x-0 overflow-y-auto overscroll-contain bg-[var(--color-papel)] px-5 pt-6 lg:hidden"
        >
          <nav className="flex flex-col">
            {enlaces.map((e, i) => (
              <Link
                key={e.href}
                href={e.href}
                onClick={() => setAbierto(false)}
                className="border-b border-[var(--color-linea)] py-5 font-[family-name:var(--font-display)] text-[2rem] leading-none tracking-[-0.03em]"
              >
                <span className="t-etiqueta mr-4 align-middle text-[0.7rem]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {e.texto}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={`${p}/#inscripcion`}
              onClick={() => setAbierto(false)}
              className="boton boton-principal"
            >
              {t.pedirPlaza}
            </Link>
            {telefono && (
              <a href={`tel:${telefono.replace(/\s/g, '')}`} className="boton boton-linea">
                {t.llamarAl} {telefono}
              </a>
            )}
            <div className="border-t border-[var(--color-linea)] pt-4">
              <SelectorIdioma idioma={idioma} equivalente={equivalente} />
            </div>
            <p className="text-[0.8125rem] opacity-45">{t.cerrarMenuAviso}</p>
          </div>
        </div>
      )}
    </header>
  )
}
