'use client'

import { useEffect, useState } from 'react'

/**
 * El fondo de la portada: el taller de verdad (13/11/2026), desenfocado.
 *
 * Dos fotos —el interior y la fachada— que se relevan despacio, con un
 * acercamiento muy lento. Van desenfocadas DESDE EL FICHERO (blur en Python),
 * no con `filter: blur()`: desenfocar una imagen grande en CSS y además
 * escalarla cada fotograma es justo lo que hace ir a tirones a un móvil. Así
 * solo se anima `opacity` y `transform`, que van por la GPU.
 *
 * Encima, un velo crema: el titular es marino sobre crema (8,19:1) y tiene que
 * seguir leyéndose igual con una foto detrás. En escritorio el velo es más
 * denso a la izquierda, donde va el texto, y deja respirar la foto a la
 * derecha; en móvil el texto ocupa todo el ancho y el velo es parejo.
 *
 * Con «menos movimiento» se queda quieta en la primera foto.
 */
const FOTOS = [
  { src: '/obra/fondo-taller-2.jpg', posicion: '50% 45%' },
  { src: '/obra/fondo-fachada-2.jpg', posicion: '50% 30%' },
]

export default function FondoPortada() {
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setActual((i) => (i + 1) % FOTOS.length), 7000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {FOTOS.map((f, i) => (
        <div
          key={f.src}
          className="fondo-portada-foto absolute inset-[-4%] bg-cover"
          style={{
            backgroundImage: `url(${f.src})`,
            backgroundPosition: f.posicion,
            opacity: i === actual ? 1 : 0,
            transform: i === actual ? 'scale(1.06)' : 'scale(1)',
          }}
        />
      ))}
      {/* El velo: parejo en móvil, más denso a la izquierda en escritorio. */}
      <div className="absolute inset-0 bg-[var(--color-papel)]/58 md:bg-transparent md:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-papel)_80%,transparent)_0%,color-mix(in_srgb,var(--color-papel)_62%,transparent)_45%,color-mix(in_srgb,var(--color-papel)_22%,transparent)_100%)]" />
      {/* Bajo la cabecera, crema: el menú y el selector de idioma son finos
          y sobre el granito gris de la fachada no se leían. */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--color-papel)]/90 to-transparent" />
      {/* Funde el borde de abajo con la sección siguiente, que es crema liso. */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[var(--color-papel)]" />
    </div>
  )
}
