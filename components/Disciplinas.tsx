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
  const pila = useRef<HTMLDivElement>(null)
  const anterior = useRef<string | null>(null)

  /**
   * El cuerpo, medido con las letras ya dibujadas.
   *
   * Contar caracteres no vale: en la misma fuente y al mismo cuerpo,
   * «Manualidades» ocupa un 20 % más por letra que «Multidisciplinar». Y cada
   * renglón arranca más adentro que el anterior, así que el que manda no es el
   * más largo, sino el peor parado de los dos: largo Y metido hacia dentro.
   *
   * Se mide a 100 px y se escala. Se rehace cuando cambia el ancho y cuando
   * termina de cargar Jost, porque con la fuente de respaldo las medidas son
   * otras y el cartel se quedaría con el cuerpo equivocado.
   */
  useEffect(() => {
    const caja = pila.current
    if (!caja) return

    const MIN = 51.2 // 3.2rem
    const MAX = 192 // 12rem
    const BASE = 100

    const ajustar = () => {
      const items = [...caja.querySelectorAll<HTMLElement>('[data-palabra]')]
      /* El ancho ÚTIL, sin los cuarenta píxeles de margen interior del
         contenedor: `clientWidth` los incluye, y contándolos «Manualidades»
         cabía sobre el papel y se salía en la pantalla. */
      const caras = getComputedStyle(caja)
      const ancho =
        caja.clientWidth - (parseFloat(caras.paddingLeft) || 0) - (parseFloat(caras.paddingRight) || 0)
      if (!items.length || ancho <= 0) return

      /* Se miden a un cuerpo conocido y se escala: así da igual en qué tamaño
         estuvieran. */
      for (const item of items) item.style.fontSize = `${BASE}px`

      let cuerpo = MAX
      for (const item of items) {
        /* El margen es un porcentaje del contenedor: no se mueve con el
           cuerpo, así que se descuenta tal cual. El 0.985 es para que la
           última letra no vaya a besar el borde: a ras, la «s» de
           «Manualidades» se comía su propio remate. */
        const margen = parseFloat(getComputedStyle(item).marginLeft) || 0
        const suyo = item.scrollWidth
        if (suyo > 0) cuerpo = Math.min(cuerpo, (BASE * (ancho * 0.985 - margen)) / suyo)
      }
      cuerpo = Math.max(MIN, cuerpo)

      const ahora = `${cuerpo}px`
      for (const item of items) item.style.fontSize = ahora
      /* Si no ha cambiado nada, no se toca el scroll: esto lo llama un
         ResizeObserver y refrescar en cada latido es caro. */
      if (ahora === anterior.current) return
      anterior.current = ahora
      /* La sección cambia de alto al cambiar el cuerpo: si no se refresca, el
         scroll dispara las entradas donde ya no están. */
      ScrollTrigger.refresh()
    }

    ajustar()
    const observador = new ResizeObserver(ajustar)
    observador.observe(caja)
    document.fonts?.ready.then(ajustar)

    return () => observador.disconnect()
  }, [palabras])

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

  /* Esto es solo el ARRANQUE, para quien no tenga JavaScript: una estimación
     ancha —medio cuerpo por carácter— que además descuenta lo que la escalera
     se come por la izquierda. El cuerpo de verdad lo mide `ajustar()` con las
     letras ya dibujadas, porque contar caracteres MIENTE: «Manualidades» ocupa
     0,48 cuerpos por letra y «Multidisciplinar», 0,40. Con la estimación vieja
     de 0,38 y tres disciplinas cabía de milagro; el día que el catálogo pasó a
     cinco, «Manualidades» empezó a salirse por la derecha. */
  const holgura = Math.max(...palabras.map((d, i) => (d.length * 0.5) / (1 - i * 0.06)))
  const cuerpo = `min(clamp(3.2rem, 16vw, 12rem), calc(88vw / ${holgura.toFixed(2)}))`

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
        <div ref={pila} className="contenedor">
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
              className="block w-fit whitespace-nowrap font-[family-name:var(--font-display)] font-medium leading-[0.92] tracking-[-0.03em]"
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
