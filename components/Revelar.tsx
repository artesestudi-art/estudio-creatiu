'use client'

import { useEffect } from 'react'

/**
 * Enciende las entradas escalonadas.
 *
 * Un IntersectionObserver y nada más: no hace falta una librería de animación
 * de 70 KB para bajar una opacidad. Se desconecta de cada elemento en cuanto
 * aparece, así que no queda ningún observador vivo haciendo trabajo.
 *
 * Los elementos ya son visibles por CSS si el visitante pide menos movimiento
 * o si el JavaScript no llega a cargar: el contenido nunca depende de esto
 * para existir.
 */
export default function Revelar() {
  useEffect(() => {
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elementos = document.querySelectorAll<HTMLElement>('.revela')

    if (menosMovimiento) {
      elementos.forEach((e) => e.classList.add('visible'))
      return
    }

    /**
     * Lo que ya está en pantalla al cargar se enseña de inmediato.
     *
     * Sin esto, el margen negativo del observador dejaba invisible todo lo que
     * cae en el 12% inferior de la ventana, y ahí es justo donde está el botón
     * de «Pedir plaza» de la portada: se cargaba la web con el botón principal
     * en opacidad cero hasta que alguien hacía scroll.
     */
    const yaVisibles = new Set<Element>()
    elementos.forEach((e) => {
      const caja = e.getBoundingClientRect()
      if (caja.top < window.innerHeight && caja.bottom > 0) {
        e.classList.add('visible')
        yaVisibles.add(e)
      }
    })

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          entrada.target.classList.add('visible')
          observador.unobserve(entrada.target)
        }
      },
      // Se dispara cuando al elemento le falta un 12% de pantalla para entrar:
      // así termina de aparecer justo cuando el ojo llega, no después.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
    )

    elementos.forEach((e) => {
      if (!yaVisibles.has(e)) observador.observe(e)
    })
    return () => observador.disconnect()
  }, [])

  return null
}
