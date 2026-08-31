import type { MetadataRoute } from 'next'
import { cursosPublicados, ultimaActualizacion } from '@/lib/bd'
import { hayTraduccion } from '@/lib/contenido'
import { slugEn, tieneCatalan } from '@/lib/traduccion'
import { ESTUDIO, real } from '@/data/estudio'

/**
 * Sitemap de las dos lenguas.
 *
 * Dos reglas que parecen detalles y no lo son:
 *
 *  - El `lastmod` sale de la fecha en que se editó el contenido, NUNCA de la
 *    del build. Si cada despliegue marca toda la web como modificada, Google
 *    deja de creerse el dato justo cuando de verdad cambia algo.
 *  - La URL catalana solo entra si está traducida de verdad. Una página que
 *    repite el castellano bajo otra dirección es contenido duplicado, y las
 *    dos compiten por la misma búsqueda. Vale para los cursos **y para la
 *    portada**: `/ca` entraba siempre, tuviera o no una sola palabra escrita
 *    en catalán.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = real(ESTUDIO.url)
  // Sin dominio real no hay sitemap: mejor vacío que lleno de localhost.
  if (!base) return []

  let cursos: Awaited<ReturnType<typeof cursosPublicados>> = []
  let ultima: Date | null = null
  let portadaCa = false
  try {
    ;[cursos, ultima, portadaCa] = await Promise.all([
      cursosPublicados(),
      ultimaActualizacion(),
      hayTraduccion('ca'),
    ])
  } catch {
    return [{ url: base, changeFrequency: 'weekly', priority: 1 }]
  }

  const alternos = (es: string, ca: string | null) => ({
    languages: ca ? { 'es-ES': `${base}${es}`, 'ca-ES': `${base}${ca}` } : { 'es-ES': `${base}${es}` },
  })

  const portada = alternos('/', portadaCa ? '/ca' : null)

  return [
    {
      url: base,
      lastModified: ultima ?? undefined,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: portada,
    },
    ...(portadaCa
      ? [
          {
            url: `${base}/ca`,
            lastModified: ultima ?? undefined,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
            alternates: portada,
          },
        ]
      : []),
    ...cursos.flatMap((c) => {
      const hayCa = tieneCatalan(c)
      const rutaEs = `/cursos/${c.slug}`
      const rutaCa = hayCa ? `/ca/cursos/${slugEn(c, 'ca')}` : null

      return [
        {
          url: `${base}${rutaEs}`,
          lastModified: new Date(c.actualizado),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
          alternates: alternos(rutaEs, rutaCa),
        },
        ...(rutaCa
          ? [
              {
                url: `${base}${rutaCa}`,
                lastModified: new Date(c.actualizado),
                changeFrequency: 'monthly' as const,
                priority: 0.75,
                alternates: alternos(rutaEs, rutaCa),
              },
            ]
          : []),
      ]
    }),
  ]
}
