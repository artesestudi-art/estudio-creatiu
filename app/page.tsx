import type { Metadata } from 'next'
import Portada from '@/components/Portada'
import JsonLd from '@/components/JsonLd'
import { alternosDe, schemaEstudio } from '@/lib/seo'
import { hayTraduccion } from '@/lib/contenido'

/** Portada en castellano, el idioma principal: vive en la raíz, sin prefijo. */

export const revalidate = 300

/**
 * El `hreflang` catalán solo se declara si hay catalán escrito. Anunciar `/ca`
 * como versión en otra lengua cuando repite esta palabra por palabra es
 * ofrecerle a Google dos direcciones con el mismo texto.
 */
export async function generateMetadata(): Promise<Metadata> {
  const hayCatalan = await hayTraduccion('ca')
  return {
    alternates: alternosDe('es', hayCatalan ? { es: '/', ca: '/ca' } : { es: '/' }),
  }
}

export default function Pagina() {
  return (
    <>
      <JsonLd datos={schemaEstudio('es')} />
      <Portada idioma="es" />
    </>
  )
}
