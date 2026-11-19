'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { Idioma } from '@/lib/idioma'

/**
 * El taller en fotos (19/11/2026). Sustituye al vídeo de 33 s, que a Sílvia
 * «no le acababa de convencer»: pidió fotos que fueran pasando.
 *
 * Las fotos son las de la cámara Sony de la visita del 13/11 (originales en
 * ~/Pictures/art-es-visita-2026-11-13/fotos), a 2400 px en webp. La primera
 * versión usaba fotogramas del vídeo y se veían borrosas: no volver a eso.
 *
 * Relevo cada 5 s con fundido y un acercamiento lento (solo `opacity` y
 * `transform`, como el fondo de la portada). Lleva botón de pausa —todo lo
 * que se mueve solo más de 5 s tiene que poder pararse— y se para al pasar el
 * ratón. Con «menos movimiento» no avanza sola: se pasa con las flechas.
 * Solo la primera se carga con prioridad; el resto, cuando toca.
 */
const FOTOS = [
  { src: '/taller/taller-fachada.webp', es: 'La entrada, en el Passeig Diagonal de Artés', ca: 'L’entrada, al Passeig Diagonal d’Artés', pos: '50% 50%' },
  { src: '/taller/taller-sala.webp', es: 'El taller por dentro', ca: 'El taller per dins', pos: '50% 55%' },
  { src: '/taller/taller-silvia-mostrador.webp', es: 'Sílvia, en el mostrador', ca: 'La Sílvia, al taulell', pos: '50% 35%' },
  { src: '/taller/taller-mostrador-logo.webp', es: 'El mostrador, con material a mano', ca: 'El taulell, amb material a mà', pos: '50% 50%' },
  { src: '/taller/taller-rinoneras.webp', es: 'Bolsos y riñoneras de costura', ca: 'Bosses i ronyoneres de costura', pos: '50% 40%' },
  { src: '/taller/taller-temperas.webp', es: 'Témperas y pinceles para pintura', ca: 'Tèmperes i pinzells per a pintura', pos: '50% 50%' },
  { src: '/taller/taller-hilos.webp', es: 'Hilos para costura', ca: 'Fils per a costura', pos: '50% 50%' },
] as const

const TEXTOS = {
  es: { etiqueta: 'El taller por dentro', titulo: 'Así es art-és', pausa: 'Pausar', seguir: 'Reproducir', ant: 'Foto anterior', sig: 'Foto siguiente', region: 'Fotos del taller de art-és en Artés' },
  ca: { etiqueta: 'El taller per dins', titulo: 'Així és art-és', pausa: 'Pausa', seguir: 'Reprodueix', ant: 'Foto anterior', sig: 'Foto següent', region: 'Fotos del taller d’art-és a Artés' },
} as const

const INTERVALO = 5000

export default function GaleriaTaller({ idioma }: { idioma: Idioma }) {
  const t = TEXTOS[idioma]
  const [actual, setActual] = useState(0)
  const [pausada, setPausada] = useState(false)
  const [encima, setEncima] = useState(false)
  const [quieta, setQuieta] = useState(false)
  // Las fotos que ya se han mostrado (o van a mostrarse) se montan; las demás no se piden aún.
  const [vistas, setVistas] = useState(() => new Set([0, 1]))

  useEffect(() => {
    setQuieta(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const ir = (i: number) => {
    const n = (i + FOTOS.length) % FOTOS.length
    setActual(n)
    setVistas((v) => new Set(v).add(n).add((n + 1) % FOTOS.length))
  }

  const corriendo = !pausada && !encima && !quieta
  useEffect(() => {
    if (!corriendo) return
    const id = window.setTimeout(() => ir(actual + 1), INTERVALO)
    return () => window.clearTimeout(id)
  }, [actual, corriendo])

  const foto = FOTOS[actual]

  return (
    <section id="taller" aria-label={t.titulo} className="relative bg-[var(--color-papel)] pt-20 md:pt-28">
      <div className="contenedor mb-8 md:mb-10">
        <p className="t-etiqueta revela">{t.etiqueta}</p>
        <h2 className="t-grande revela" style={{ '--retraso': '60ms' } as React.CSSProperties}>
          {t.titulo}
        </h2>
      </div>

      <div
        role="region"
        aria-roledescription="carrusel"
        aria-label={t.region}
        className="relative aspect-4/5 w-full overflow-hidden bg-[#14304f] sm:aspect-video md:max-h-[86vh]"
        onMouseEnter={() => setEncima(true)}
        onMouseLeave={() => setEncima(false)}
      >
        {FOTOS.map((f, i) =>
          vistas.has(i) ? (
            <div
              key={f.src}
              aria-hidden={i !== actual}
              className="galeria-taller-foto absolute inset-0"
              style={{ opacity: i === actual ? 1 : 0, transform: i === actual ? 'scale(1.07)' : 'scale(1)' }}
            >
              <Image
                src={f.src}
                alt={f[idioma]}
                fill
                quality={88}
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: f.pos }}
              />
            </div>
          ) : null,
        )}

        {/* Degradado abajo para que el pie se lea sobre cualquier foto. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0d2238]/80 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5 text-[var(--color-papel)] md:px-10 md:pb-8">
          <p key={actual} aria-live="polite" className="galeria-taller-pie max-w-[34ch] text-base leading-snug md:text-xl">
            {foto[idioma]}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <span className="mr-2 font-mono text-sm tabular-nums opacity-80">
              {String(actual + 1).padStart(2, '0')} / {String(FOTOS.length).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => ir(actual - 1)} aria-label={t.ant} className="galeria-taller-boton">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
            {!quieta && (
              <button type="button" onClick={() => setPausada((p) => !p)} aria-label={pausada ? t.seguir : t.pausa} className="galeria-taller-boton">
                {pausada ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M7 4l13 8-13 8z" fill="currentColor" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M7 4h3.5v16H7zM13.5 4H17v16h-3.5z" fill="currentColor" /></svg>
                )}
              </button>
            )}
            <button type="button" onClick={() => ir(actual + 1)} aria-label={t.sig} className="galeria-taller-boton">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
          </div>
        </div>

        {/* La barra de tiempo: se llena en lo que dura cada foto y se para con la pausa. */}
        {!quieta && (
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
            <div
              key={`${actual}-${corriendo}`}
              className="h-full origin-left bg-[var(--color-marca-mostaza)]"
              style={{
                animation: corriendo ? `galeria-taller-barra ${INTERVALO}ms linear forwards` : 'none',
                transform: corriendo ? undefined : 'scaleX(0)',
              }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
