'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Los colores del kit, uno por disciplina. Si hay más de cinco disciplinas la
 * lista vuelve a empezar; no se inventa un sexto color que no esté en el .ai.
 */
const COLORES = [
  'var(--color-marca-terracota)',
  'var(--color-marca-mostaza)',
  'var(--color-marca-malva)',
  'var(--color-marca-azul)',
  'var(--color-marca-salmon)',
]

/**
 * Las disciplinas del estudio, a tamaño de cartel.
 *
 * Antes esto era una cinta corriendo en bucle: una franja estrecha con las
 * palabras pequeñas, el recurso que tiene media internet.
 *
 * Después, las palabras acababan **superpuestas** con `mix-blend-mode:
 * multiply`, para que donde se cruzaran saliera un color que no estaba en el
 * kit —la mezcla de pigmentos de un taller—. La idea era buena y el resultado
 * no: con una palabra larga encima de otra no se leía ninguna de las dos, y lo
 * que se veía era un enredo. **Un recurso que estropea la lectura no es un
 * recurso, es un fallo con coartada.**
 *
 * Ahora cada disciplina va en su renglón, cada una de un color del logotipo, y
 * cada renglón entra un poco más adentro que el anterior: la escalera es lo
 * que hace que tres palabras apiladas se lean como una composición y no como
 * una lista. **Ninguna pisa a ninguna.**
 *
 * El movimiento va atado al scroll (`scrub`), no a un temporizador: quien sube
 * las deshace y quien baja las coloca. Nadie se queda esperando a que termine
 * una animación.
 */
export default function Disciplinas({ palabras }: { palabras: string[] }) {
  const raiz = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = raiz.current
    if (!el) return

    const ctx = gsap.context(() => {
      /* Quien pide menos movimiento ve las palabras ya posadas: la sección
         cuenta lo mismo sin que nada se mueva. */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const items = gsap.utils.toArray<HTMLElement>('[data-palabra]')
      if (!items.length) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })

      items.forEach((item, i) => {
        const desde = i % 2 === 0 ? -1 : 1
        tl.fromTo(
          item,
          {
            /* Entra por un lado u otro, alternando. El sitio de reposo lo pone
               el flujo del documento, así que el `transform` queda libre para
               GSAP: sin JavaScript o con movimiento reducido, las palabras ya
               están donde deben. */
            x: `${desde * 70}vw`,
            rotate: desde * 5,
            opacity: 0,
            scale: 0.92,
          },
          {
            /* Rectas: cualquier giro en reposo acerca los extremos de un
               renglón al de al lado, y volveríamos a tener letras encima de
               letras. */
            x: 0,
            rotate: 0,
            opacity: 1,
            scale: 1,
            ease: 'none',
          },
          i * 0.55,
        )
      })
    }, el)

    return () => ctx.revert()
  }, [palabras])

  if (!palabras.length) return null

  /* El tamaño lo manda la palabra MÁS LARGA, y las tres van a la misma medida:
     es un cartel, no tres carteles. Sin esto, `19vw` era ciego a lo que
     escribiera el estudio en el panel y «Multidisciplinar» medía 403 px en una
     pantalla de 390 —se salía por los dos lados—, mientras que «Costura» se
     quedaba corta. El 0.38 es el ancho de un carácter de la geométrica medido
     en cuerpos (0.34 real, más margen): si mañana se cambia la fuente de
     titulares, este número se vuelve a medir. */
  const largo = Math.max(...palabras.map((d) => d.length))
  const cuerpo = `min(clamp(3.2rem, 16vw, 12rem), calc(88vw / ${largo} / 0.38))`

  return (
    <section
      ref={raiz}
      /* Un tramo de scroll por palabra, más la pantalla que se queda quieta.
         En un móvil tumbado la altura de pantalla es poca cosa, así que el
         tramo va en `vh` y se encoge con ella. */
      style={{ height: `calc(100vh + ${palabras.length * 55}vh)` }}
      className="relative bg-[var(--color-papel)]"
    >
      {/* Las palabras son un dibujo: quien va con lector de pantalla las oye
          aquí, en una lista de verdad, y se salta el montaje. */}
      <ul className="sr-only">
        {palabras.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>

      <div
        aria-hidden
        className="sticky top-0 flex h-[100svh] items-center overflow-hidden"
      >
        <div className="contenedor">
          {palabras.map((d, i) => (
            <span
              key={d}
              data-palabra
              style={{
                color: COLORES[i % COLORES.length],
                fontSize: cuerpo,
                /* Cada renglón entra un poco más adentro que el anterior: la
                   escalera es lo que hace que tres palabras apiladas se lean
                   como una composición y no como una lista. */
                marginLeft: `${i * 6}%`,
              }}
              className="block whitespace-nowrap font-[family-name:var(--font-display)] font-medium leading-[0.92] tracking-[-0.03em]"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
