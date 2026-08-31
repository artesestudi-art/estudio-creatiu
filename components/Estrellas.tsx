'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Las dos estrellas del logotipo, sacadas del vector del `.ai` igual que el
 * resto ([[Logo]]): la grande de siete puntas que va sobre la «s» y la pequeña
 * de la esquina. No son un icono de una librería ni un asterisco de una
 * tipografía; son el mismo dibujo que firma la marca.
 */
const TRAZOS = {
  1: {
    caja: '0 0 37.84 34.65',
    d: 'M37.80 14.18 C33.10 16.48 28.00 18.28 22.90 19.58 C26.60 23.88 29.90 28.48 32.80 33.28 C28.40 31.28 24.30 28.48 21.00 24.88 C18.00 28.18 15.10 31.48 12.10 34.68 L14.40 20.28 C9.80 22.18 4.90 23.38 0.00 23.88 C4.00 20.58 8.50 17.88 13.30 15.88 C9.00 13.58 5.00 10.78 1.20 7.68 C6.60 9.38 11.80 11.58 16.70 14.28 C17.60 8.98 20.10 3.98 23.60 -0.02 C24.30 5.08 23.90 10.38 22.70 15.38 C22.70 15.38 22.60 15.38 22.60 15.38 C22.80 14.88 32.30 14.18 37.80 14.18',
  },
  2: {
    caja: '0 0 22.97 25.61',
    d: 'M12.26 0.05 C12.66 3.45 12.66 7.05 12.16 10.45 C15.66 9.15 19.26 8.15 22.96 7.45 C20.76 9.75 18.06 11.55 15.06 12.85 C16.46 15.45 17.86 17.95 19.16 20.55 L10.76 15.85 C10.96 19.15 10.56 22.45 9.76 25.65 C8.66 22.35 7.96 19.05 7.76 15.65 C5.36 17.75 2.76 19.65 -0.04 21.25 C2.26 18.25 4.76 15.55 7.56 13.05 C4.46 11.35 1.96 8.75 0.26 5.65 C3.56 6.35 6.76 7.75 9.56 9.65 C9.56 9.65 9.56 9.75 9.56 9.65 C9.26 9.45 11.06 3.45 12.26 0.05',
  },
} as const

export type Estrella = {
  /** Posición dentro de la sección, en porcentaje. */
  y: string
  x: string
  /** Ancho en píxeles. */
  tam: number
  /** Un color del kit: `var(--color-marca-…)`. */
  color: string
  variante?: 1 | 2
  /** Cuánto se adelanta o se retrasa al hacer scroll, en píxeles. */
  deriva?: number
}

/**
 * Una lluvia de estrellas de marca sobre una sección.
 *
 * Es la única licencia decorativa que se permite la web, y es del cliente: la
 * lámina de color del logotipo está sembrada de estrellas. Aquí van a los
 * márgenes, nunca debajo de un texto, y con `pointer-events: none` para que no
 * roben un clic.
 *
 * Se mueven con el scroll a distinta velocidad cada una —de ahí `deriva`— y
 * giran despacio. No es decoración quieta pegada al fondo: al bajar, la sección
 * respira.
 *
 * La sección que las lleva tiene que ser `relative`. **No hace falta que sea
 * `overflow-hidden`** —y en varias no puede serlo, porque romperia el `sticky`
 * de las columnas—, así que van colocadas dentro del área de la sección y no
 * asomando por los bordes.
 */
export default function Estrellas({ estrellas }: { estrellas: Estrella[] }) {
  const raiz = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = raiz.current
    if (!el) return

    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.utils.toArray<HTMLElement>('[data-estrella]').forEach((estrella) => {
        const deriva = Number(estrella.dataset.deriva || 0)
        gsap.to(estrella, {
          y: deriva,
          rotate: deriva > 0 ? 24 : -24,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        })
      })
    }, el)

    return () => ctx.revert()
  }, [estrellas])

  return (
    <div ref={raiz} aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {estrellas.map((e, i) => {
        const trazo = TRAZOS[e.variante ?? 1]
        return (
          <svg
            key={i}
            data-estrella
            data-deriva={e.deriva ?? 0}
            viewBox={trazo.caja}
            style={{ top: e.y, left: e.x, width: e.tam, color: e.color }}
            className="absolute h-auto"
          >
            <path fill="currentColor" d={trazo.d} />
          </svg>
        )
      })}
    </div>
  )
}
