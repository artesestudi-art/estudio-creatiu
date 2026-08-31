import type { Metadata } from 'next'
import { Privacidad } from '@/components/PaginasLegales'
import { alternosDe } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  robots: { index: false, follow: true },
  alternates: alternosDe('es', { es: '/privacidad', ca: '/ca/privacidad' }),
}

export default function Pagina() {
  return <Privacidad idioma="es" />
}
