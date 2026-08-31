import type { Metadata } from 'next'
import { Privacidad } from '@/components/PaginasLegales'
import { alternosDe } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Política de privacitat',
  robots: { index: false, follow: true },
  alternates: alternosDe('ca', { es: '/privacidad', ca: '/ca/privacidad' }),
}

export default function Pagina() {
  return <Privacidad idioma="ca" />
}
