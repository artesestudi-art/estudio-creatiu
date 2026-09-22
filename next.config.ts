import type { NextConfig } from 'next'
import { ESTUDIO } from './data/estudio'

/** `has.value` es una expresión regular (Next la ancla por los dos lados): sin
 *  escapar, el punto de `artesespaicreatiu.es` casaría con cualquier letra. */
const exacto = (dominio: string) => dominio.replace(/\./g, '\\.')

/**
 * Todo lo que no es el dominio principal va a él con un 301: el otro dominio
 * del estudio, con y sin `www`, y el `www` del principal.
 *
 * Sin esto, apuntar los dos dominios a Vercel sirve la web entera DOS veces
 * —y cuatro con los `www`—, y Google elige cuál es la buena por su cuenta.
 * La lista sale de `data/estudio.ts`: cambiar allí el dominio cambia esto.
 * La copia de `.vercel.app` NO se redirige: es la que se enseña mientras el
 * dominio no está apuntado, y ya lleva su `noindex` más abajo.
 */
const alternativos = [
  `www.${ESTUDIO.dominio}`,
  ...ESTUDIO.otrosDominios.flatMap((d) => [d, `www.${d}`]),
]

const config: NextConfig = {
  experimental: {
    /* Enciende `app/global-not-found.tsx`. Con dos layouts raíz (uno por
       lengua) no hay un layout único del que colgar el 404 de las direcciones
       que no casan con ninguna ruta, y Next servía el suyo de fábrica en
       inglés. Está marcado como experimental en esta versión. */
    globalNotFound: true,
  },
  async redirects() {
    return alternativos.map((host) => ({
      source: '/:ruta*',
      has: [{ type: 'host' as const, value: exacto(host) }],
      destination: `${ESTUDIO.url}/:ruta*`,
      permanent: true,
    }))
  },
  images: {
    remotePatterns: [
      // Las imágenes que sube el cliente desde el panel viven en Vercel Blob.
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
    // AVIF primero: pesa bastante menos que WebP en fotos, y aquí casi todo
    // son fotos de taller a pantalla completa.
    formats: ['image/avif', 'image/webp'],
  },
  // Cabeceras que no cuestan nada y evitan sustos.
  async headers() {
    return [
      {
        source: '/:ruta*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      /**
       * La copia de Vercel NO se indexa.
       *
       * `robots.txt` se genera con el dominio real, así que dice «Allow: /»
       * también cuando la web se sirve desde `algo.vercel.app`. Eso es la web
       * entera duplicada en Google en una dirección que no es la del estudio,
       * compitiendo consigo misma. La cabecera va condicionada al host: en
       * el dominio del estudio no se pinta, así que el día que se apunte el
       * dominio esto no estorba y no hay que acordarse de quitarlo.
       */
      {
        source: '/:ruta*',
        has: [{ type: 'host', value: '.*\\.vercel\\.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default config
