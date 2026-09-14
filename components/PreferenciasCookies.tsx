'use client'

import { REABRIR_CARTEL } from '@/components/Analitica'
import { ESTUDIO } from '@/data/estudio'
import { textos, type Idioma } from '@/lib/idioma'

/**
 * Botón que vuelve a abrir el cartel de cookies.
 *
 * Solo existe si hay analítica: sin `ESTUDIO.analitica.ga4` no hay cartel, y
 * un botón de «preferencias de cookies» que no abre nada sería de adorno.
 */
export default function PreferenciasCookies({
  idioma,
  className = '',
}: {
  idioma: Idioma
  className?: string
}) {
  if (!ESTUDIO.analitica.ga4.trim()) return null
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(REABRIR_CARTEL))}
      className={className}
    >
      {textos(idioma).cookiesCambiar}
    </button>
  )
}
