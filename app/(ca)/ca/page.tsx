import type { Metadata } from 'next'
import Portada from '@/components/Portada'
import JsonLd from '@/components/JsonLd'
import { alternosDe, schemaEstudio } from '@/lib/seo'
import { hayTraduccion } from '@/lib/contenido'
import { ESTUDIO } from '@/data/estudio'

/** Portada en catalán. Mismo componente que la castellana: dos copias del
 *  mismo archivo acabarían divergiendo en cuanto se tocara una. */

export const revalidate = 300

/**
 * Mientras no haya portada en catalán, esta página existe —quien pulsa
 * «Català» tiene que llegar a algo— pero va en `noindex`: lo que enseña es el
 * castellano, y dos URLs con el mismo texto se quitan posiciones entre ellas.
 * En cuanto se escriba la portada catalana desde el panel, se indexa sola.
 */
export async function generateMetadata(): Promise<Metadata> {
  const hayCatalan = await hayTraduccion('ca')
  const marca = ESTUDIO.nombre === 'PENDIENTE' ? 'Estudio' : ESTUDIO.nombre
  return {
    /* El título y la descripción catalanes los pone ya el layout de `app/(ca)`;
       aquí sólo el `absolute`, para que la portada no salga con la plantilla
       «%s · marca». ⛔ NADA de `openGraph` suelto: el objeto se sustituye
       ENTERO, no se mezcla, y un `{ locale }` a secas dejó `/ca` sin `og:type`,
       `og:url`, `og:site_name` ni `og:image`. Comprobado en el HTML. */
    title: { absolute: `${marca} · ${ESTUDIO.catalan.titular}` },
    alternates: alternosDe('ca', hayCatalan ? { es: '/', ca: '/ca' } : { es: '/' }),
    robots: hayCatalan ? undefined : { index: false, follow: true },
  }
}

export default function PaginaCatalan() {
  return (
    <>
      <JsonLd datos={schemaEstudio('ca')} />
      <Portada idioma="ca" />
    </>
  )
}
