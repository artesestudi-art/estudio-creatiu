import type { Idioma } from '@/lib/idioma'

/**
 * El taller en vídeo (13/11/2026): 33 s grabados con la Osmo 360, con música.
 *
 * A todo el ancho y sin marco, como una ventana al taller. No arranca solo:
 * lleva sonido y pesa 20 MB, así que solo se descarga la portada (`poster`)
 * hasta que alguien le da al play (`preload="none"`).
 */
const TEXTOS = {
  es: { etiqueta: 'El taller por dentro', titulo: 'Así es art-és', alt: 'Vídeo del taller de art-és en Artés' },
  ca: { etiqueta: 'El taller per dins', titulo: 'Així és art-és', alt: 'Vídeo del taller d’art-és a Artés' },
} as const

export default function VideoTaller({ idioma }: { idioma: Idioma }) {
  const t = TEXTOS[idioma]
  return (
    <section id="video" aria-label={t.titulo} className="relative bg-[var(--color-papel)] pt-20 md:pt-28">
      <div className="contenedor mb-8 md:mb-10">
        <p className="t-etiqueta revela">{t.etiqueta}</p>
        <h2 className="t-grande revela" style={{ '--retraso': '60ms' } as React.CSSProperties}>
          {t.titulo}
        </h2>
      </div>
      <video
        className="block aspect-video w-full bg-[#14304f] object-cover"
        src="/video/art-es-taller.mp4"
        poster="/video/art-es-taller.jpg"
        controls
        playsInline
        preload="none"
        aria-label={t.alt}
      />
    </section>
  )
}
