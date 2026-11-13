'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Obra } from '@/lib/contenido'
import type { Idioma } from '@/lib/idioma'

/**
 * La obra de una profesora: tira deslizable en el móvil, mosaico a cuatro
 * columnas en pantalla grande, y cada pieza se abre a pantalla completa.
 *
 * Ampliar no es un capricho: el mapa ilustrado de Artés de Sílvia tiene
 * decenas de detalles (la torre, la ampolla, la ciclista) que en una
 * miniatura de 22vw no se ven. En el visor se pasa con las flechas del
 * teclado o los botones, y se cierra con Esc, con la X o tocando fuera.
 *
 * Va con `<dialog>` nativo: el navegador ya se encarga de atrapar el foco,
 * de devolverlo al cerrar y de que el lector de pantalla lo anuncie.
 */
export default function GaleriaObras({
  obras,
  nombre,
  idioma,
}: {
  obras: Obra[]
  nombre: string
  idioma: Idioma
}) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const [abierta, setAbierta] = useState<number | null>(null)
  const ca = idioma === 'ca'

  const abrir = (i: number) => {
    setAbierta(i)
    dialogo.current?.showModal()
  }
  const cerrar = useCallback(() => dialogo.current?.close(), [])
  const mover = useCallback(
    (paso: number) => setAbierta((i) => (i === null ? i : (i + paso + obras.length) % obras.length)),
    [obras.length],
  )

  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') mover(1)
      if (e.key === 'ArrowLeft') mover(-1)
    }
    const alCerrar = () => setAbierta(null)
    d.addEventListener('keydown', tecla)
    d.addEventListener('close', alCerrar)
    return () => {
      d.removeEventListener('keydown', tecla)
      d.removeEventListener('close', alCerrar)
    }
  }, [mover])

  const obra = abierta === null ? null : obras[abierta]

  return (
    <>
      <ul className="-mx-5 flex snap-x scroll-px-5 gap-4 overflow-x-auto px-5 pb-4 md:-mx-10 md:scroll-px-10 md:px-10 lg:mx-0 lg:block lg:columns-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0">
        {obras.map((o, j) => (
          <li key={j} className="shrink-0 snap-start lg:mb-5 lg:break-inside-avoid">
            <button
              type="button"
              onClick={() => abrir(j)}
              aria-label={`${ca ? 'Ampliar' : 'Ampliar'}: ${o.alt}`}
              className="group block cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-tinta)]"
            >
              <Image
                src={o.url}
                alt={o.alt}
                width={o.ancho ?? 1200}
                height={o.alto ?? 1200}
                sizes="(min-width: 1024px) 22vw, 80vw"
                className="h-56 w-auto max-w-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] lg:h-auto lg:w-full lg:max-w-full"
              />
            </button>
            {o.pie && <p className="mt-2 text-[0.85rem] text-[var(--color-tinta-60)]">{o.pie}</p>}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogo}
        aria-label={`${ca ? 'Obra de' : 'Obra de'} ${nombre}`}
        onClick={(e) => {
          /* Tocar el fondo cierra; tocar la imagen o los botones, no. */
          if (e.target === e.currentTarget) cerrar()
        }}
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-[#0f1f33]/92 backdrop:backdrop-blur-sm"
      >
        {obra && (
          <div
            className="flex h-full flex-col items-center justify-center gap-4 px-4 py-16 md:px-20"
            onClick={(e) => {
              if (e.target === e.currentTarget) cerrar()
            }}
          >
            <Image
              key={obra.url}
              src={obra.url}
              alt={obra.alt}
              width={obra.ancho ?? 1600}
              height={obra.alto ?? 1600}
              sizes="100vw"
              className="h-auto max-h-[78dvh] w-auto max-w-full object-contain shadow-2xl"
            />
            <p className="text-center text-[0.95rem] text-white/85">
              {obra.pie || obra.alt}
              {obras.length > 1 && (
                <span className="ml-3 text-white/50">
                  {abierta! + 1} / {obras.length}
                </span>
              )}
            </p>

            <button
              type="button"
              onClick={cerrar}
              aria-label={ca ? 'Tancar' : 'Cerrar'}
              className="absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full text-3xl leading-none text-white/80 hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
            {obras.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => mover(-1)}
                  aria-label={ca ? 'Anterior' : 'Anterior'}
                  className="absolute top-1/2 left-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-2xl text-white/80 hover:bg-white/10 hover:text-white md:left-6"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => mover(1)}
                  aria-label={ca ? 'Següent' : 'Siguiente'}
                  className="absolute top-1/2 right-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-2xl text-white/80 hover:bg-white/10 hover:text-white md:right-6"
                >
                  →
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  )
}
