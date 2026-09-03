import type { NextConfig } from 'next'

const config: NextConfig = {
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
       * `artesespaicreatiu.es` no se pinta, así que el día que se apunte el
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
