import type { Metadata } from 'next'
import { AvisoLegal } from '@/components/PaginasLegales'
import { alternosDe } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Avís legal',
  robots: { index: false, follow: true },
  alternates: alternosDe('ca', { es: '/aviso-legal', ca: '/ca/aviso-legal' }),
}

export default function Pagina() {
  return <AvisoLegal idioma="ca" />
}
