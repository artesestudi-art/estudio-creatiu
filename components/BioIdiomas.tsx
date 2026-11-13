'use client'

import { useState } from 'react'
import { IDIOMAS, NOMBRE_IDIOMA, type Idioma } from '@/lib/idioma'

/**
 * La biografía de una profesora, con un botón para leerla en la otra lengua
 * sin cambiar de página: Silvia la escribió en catalán y en castellano, y hay
 * quien entra por la portada castellana pero prefiere leerla en catalán (o al
 * revés). Por defecto sale en la lengua de la página.
 *
 * Los párrafos se respetan: una línea en blanco separa párrafos y un salto
 * simple es un salto de renglón (las tres frases del café, el cuadro y el
 * neceser van una por renglón).
 *
 * Si solo hay una versión, o las dos son iguales (lo que pasa cuando el catalán
 * cae al castellano de respaldo), no hay botón: un selector que no cambia nada
 * es un engaño.
 */
export default function BioIdiomas({
  idioma,
  bios,
  className = '',
}: {
  idioma: Idioma
  bios: Partial<Record<Idioma, string>>
  className?: string
}) {
  const [actual, setActual] = useState<Idioma>(idioma)
  const disponibles = IDIOMAS.filter((i) => bios[i]?.trim())
  const distintas = new Set(disponibles.map((i) => bios[i]!.trim())).size > 1
  const texto = (bios[actual] ?? bios[idioma] ?? '').trim()
  if (!texto) return null

  const parrafos = texto.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

  return (
    <div className={className}>
      {distintas && (
        <div
          role="group"
          aria-label={idioma === 'ca' ? 'Idioma de la presentació' : 'Idioma de la presentación'}
          className="mb-5 inline-flex rounded-full border border-[var(--color-tinta)]/20 p-1 text-[0.85rem]"
        >
          {disponibles.map((i) => (
            <button
              key={i}
              type="button"
              lang={i}
              aria-pressed={actual === i}
              onClick={() => setActual(i)}
              className={`min-h-9 rounded-full px-4 transition-colors ${
                actual === i
                  ? 'bg-[var(--color-tinta)] text-[var(--color-papel)]'
                  : 'text-[var(--color-tinta-60)] hover:text-[var(--color-tinta)]'
              }`}
            >
              {NOMBRE_IDIOMA[i]}
            </button>
          ))}
        </div>
      )}
      <div lang={actual} className="max-w-[60ch] space-y-4">
        {parrafos.map((p, i) => (
          <p key={i} className="t-cuerpo whitespace-pre-line text-[var(--color-tinta-80)]">
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}
