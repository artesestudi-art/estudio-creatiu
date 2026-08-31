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
    ]
  },
}

export default config
