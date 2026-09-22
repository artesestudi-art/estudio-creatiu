import type { Metadata } from 'next'
import { AvisoLegal } from '@/components/PaginasLegales'
import { alternosDe } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Aviso legal',
  robots: { index: false, follow: true },
  alternates: alternosDe('es', { es: '/aviso-legal', ca: '/ca/aviso-legal' }),
}

export default function Pagina() {
  return <AvisoLegal idioma="es" />
}
