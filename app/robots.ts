import type { MetadataRoute } from 'next'
import { ESTUDIO, real } from '@/data/estudio'

export default function robots(): MetadataRoute.Robots {
  const base = real(ESTUDIO.url)

  // Mientras no haya dominio real, la web está a medio hacer: que no la
  // indexe nadie. Retirar de Google una página con «PENDIENTE» dentro cuesta
  // semanas; no dejarla entrar cuesta esta línea.
  if (!base) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/baja', '/ca/baja'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
