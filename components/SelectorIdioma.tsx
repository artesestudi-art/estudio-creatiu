'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IDIOMAS, NOMBRE_IDIOMA, PRINCIPAL, prefijo, type Idioma } from '@/lib/idioma'

/**
 * Cambio de idioma.
 *
 * Lleva a la MISMA página en el otro idioma, no a la portada: mandar a alguien
 * que está leyendo un curso de vuelta al inicio por cambiar de lengua es la
 * forma más rápida de que se vaya.
 *
 * Los cursos son el caso delicado, porque su dirección cambia con el idioma
 * (`/cursos/ceramica` ↔ `/ca/cursos/ceramica-torn`). Por eso la página del
 * curso pasa el enlace ya calculado en `equivalente`; para el resto basta con
 * poner o quitar el prefijo.
 */
export default function SelectorIdioma({
  idioma,
  equivalente,
  className = '',
}: {
  idioma: Idioma
  /** Ruta exacta del equivalente en el otro idioma, si no es un simple prefijo. */
  equivalente?: Partial<Record<Idioma, string>>
  className?: string
}) {
  const ruta = usePathname() ?? '/'

  function destino(otro: Idioma): string {
    if (equivalente?.[otro]) return equivalente[otro]!

    // Se quita el prefijo actual y se pone el nuevo.
    const sinPrefijo =
      idioma === PRINCIPAL ? ruta : ruta.replace(new RegExp(`^/${idioma}(?=/|$)`), '') || '/'
    const nuevo = `${prefijo(otro)}${sinPrefijo}`
    return nuevo === '' ? '/' : nuevo
  }

  return (
    <div className={`flex items-center gap-1 text-[0.8125rem] ${className}`}>
      {IDIOMAS.map((codigo, i) => (
        <span key={codigo} className="flex items-center">
          {i > 0 && <span className="mx-1.5 opacity-30">/</span>}
          {codigo === idioma ? (
            <span aria-current="true" className="font-medium">
              {NOMBRE_IDIOMA[codigo]}
            </span>
          ) : (
            <Link
              href={destino(codigo)}
              hrefLang={codigo}
              className="flex min-h-11 items-center opacity-55 transition-opacity hover:opacity-100"
            >
              {NOMBRE_IDIOMA[codigo]}
            </Link>
          )}
        </span>
      ))}
    </div>
  )
}
