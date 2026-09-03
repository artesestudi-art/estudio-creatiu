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
 * Las disciplinas del estudio, mezclándose como pigmentos.
 *
 * Antes esto era una cinta corriendo en bucle: una franja estrecha con las
 * palabras pequeñas, el recurso que tiene media internet. Aquí las palabras
 * entran a tamaño de cartel, cada una de un color del logotipo, y acaban
 * apiladas con `mix-blend-mode: multiply`: **donde dos se cruzan, los dos
 * colores se multiplican y sale un tercero**. Es literalmente lo que pasa en
 * un taller cuando se superponen dos capas de pigmento, y es lo que hace que
 * la sección no se pueda copiar de una plantilla: el color de los cruces no
 * está escrito en ningún sitio, sale de la mezcla.
 *
 * No quedan del todo encajadas: cada una se posa un poco desplazada de la
 * anterior, como una serigrafía mal registrada. Así se siguen leyendo las tres
 * palabras y aun así se ven los cruces.
 *
 * El movimiento va atado al scroll (`scrub`), no a un temporizador: quien sube
 * las deshace y quien baja las junta. Nadie se queda esperando a que termine
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

      const centro = (items.length - 1) / 2

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
            /* El desplazamiento de reposo va en `left`/`top`, no aquí: así el
               `transform` queda libre para GSAP y, sin JavaScript o con
               movimiento reducido, las palabras ya están donde deben. */
            xPercent: -50,
            yPercent: -50,
            x: `${desde * 78}vw`,
            y: `${desde * 12}vh`,
            rotate: desde * 9,
            opacity: 0,
            scale: 0.86,
          },
          {
            x: 0,
            y: 0,
            rotate: (i - centro) * -1.6,
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
     titulares, este número se vuelve a medir. Y el ancho disponible es 84vw,
     no 100: las palabras no están centradas, cada una se posa desplazada un
     tercio de cuerpo, y la primera se salía por la izquierda con el hueco
     justo. */
  const largo = Math.max(...palabras.map((d) => d.length))
  const cuerpo = `min(clamp(3.6rem, 19vw, 15rem), calc(84vw / ${largo} / 0.38))`

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
        className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden"
      >
        {palabras.map((d, i) => {
          const desvio = i - (palabras.length - 1) / 2
          return (
            <span
              key={d}
              data-palabra
              style={{
                color: COLORES[i % COLORES.length],
                /* `multiply` sobre el crema: el papel no se ensucia y el color
                   de los cruces sale de las dos palabras, no de un tercero
                   elegido a mano. */
                mixBlendMode: 'multiply',
                /* El reposo NO es el centro exacto: cada palabra se posa un
                   poco desplazada, como una serigrafía mal registrada, para
                   que se lean las tres y aun así se vean los cruces.
                   El desplazamiento va en `em`, no en `vw`/`vh`: medido contra
                   la pantalla, en un móvil las palabras se separaban más que
                   su propia altura y quedaban en tres renglones sueltos, sin
                   cruce y sin mezcla. En `em` el desajuste es siempre el mismo
                   trozo de letra, mida lo que mida la pantalla. */
                left: `calc(50% + ${desvio * 0.34}em)`,
                top: `calc(50% + ${desvio * 0.46}em)`,
                fontSize: cuerpo,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-[family-name:var(--font-display)] font-medium leading-none tracking-[-0.03em]"
            >
              {d}
            </span>
          )
        })}
      </div>
    </section>
  )
}
