'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Recorrido horizontal anclado, con inercia.
 *
 * En pantallas anchas la sección se queda pegada y los paneles cruzan la
 * pantalla de lado mientras la rueda baja. Tres cosas lo separan de un
 * carrusel corriente:
 *
 *  1. **Inercia.** El desplazamiento no sigue al scroll al milímetro: lo
 *     persigue con un suavizado. Es lo que hace que se sienta una cámara con
 *     peso en vez de una hoja de cálculo moviéndose.
 *  2. **Parallax.** La foto de cada panel se mueve más despacio que el panel.
 *     Ese desfase es lo que da profundidad; sin él son cromos deslizándose.
 *  3. **Enfoque.** El panel que pasa por el centro se levanta un poco y los de
 *     los lados se apagan, como una lente que enfoca a uno cada vez.
 *
 * En móvil y con movimiento reducido NO se ancla nada: es un carrusel de
 * arrastre con puntos de anclaje, que es como se navega de lado en un
 * teléfono. Todo con `transform`: mover `left` recalcularía la maquetación en
 * cada fotograma y se vería a tirones.
 */
/**
 * Dónde se enfoca, en fracción del ancho de pantalla.
 *
 * No es el centro exacto: la pista arranca pegada a la izquierda, así que con
 * el foco en 0,5 el primer curso nunca se iluminaba, empezaba a media luz y se
 * apagaba. A 0,40 cae justo donde está el primer panel al empezar.
 */
const FOCO = 0.4

export default function ScrollHorizontal({
  children,
  etiqueta,
  total,
}: {
  children: React.ReactNode
  etiqueta: string
  /** Cuántos paneles hay, para el contador «01 — 03». */
  total: number
}) {
  const marco = useRef<HTMLDivElement>(null)
  const pista = useRef<HTMLDivElement>(null)
  const [anclado, setAnclado] = useState(false)
  const [altura, setAltura] = useState<number | null>(null)
  const [avance, setAvance] = useState(0)
  const [actual, setActual] = useState(0)

  useEffect(() => {
    const ancha = window.matchMedia('(min-width: 1024px)')
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)')
    const decidir = () => setAnclado(ancha.matches && !quieto.matches)
    decidir()
    ancha.addEventListener('change', decidir)
    quieto.addEventListener('change', decidir)
    return () => {
      ancha.removeEventListener('change', decidir)
      quieto.removeEventListener('change', decidir)
    }
  }, [])

  useEffect(() => {
    if (!anclado) {
      // Al pasar de escritorio a móvil hay que limpiar los estilos que dejó
      // el anclaje, o el carrusel se queda con paneles medio transparentes y
      // encogidos.
      const rail = pista.current
      if (rail) {
        rail.style.transform = ''
        rail.querySelectorAll<HTMLElement>('[data-panel]').forEach((panel) => {
          panel.style.opacity = ''
          panel.style.transform = ''
          const foto = panel.querySelector<HTMLElement>('[data-parallax]')
          if (foto) foto.style.transform = ''
        })
      }
      return
    }

    let vivo = true
    let animacion = 0
    // Posición perseguida y posición real: la distancia entre las dos es la
    // inercia.
    let objetivo = 0
    let suave = 0
    let recorrido = 0

    const medir = () => {
      const rail = pista.current
      if (!rail) return

      /**
       * El recorrido no es «lo que sobresale»: es lo justo para que el ÚLTIMO
       * panel acabe posado en el punto de enfoque.
       *
       * Calculándolo como el desborde a secas, la pista se paraba antes y el
       * último curso se quedaba a media luz, sin llegar nunca a tener su
       * momento. Así todos pasan por el foco, el primero y el último incluidos.
       */
      const paneles = rail.querySelectorAll<HTMLElement>('[data-panel]')
      const ultimo = paneles[paneles.length - 1]

      if (ultimo) {
        const centroUltimo = ultimo.offsetLeft + ultimo.offsetWidth / 2
        recorrido = centroUltimo - window.innerWidth * FOCO
      } else {
        recorrido = rail.scrollWidth - window.innerWidth
      }
      if (recorrido < 0) recorrido = 0

      // Se estira un 15%: da margen para que la inercia termine el recorrido
      // antes de que la sección se despegue.
      setAltura(window.innerHeight + recorrido * 1.15)
    }

    const paso = () => {
      if (!vivo) return
      const caja = marco.current
      const rail = pista.current
      if (!caja || !rail) {
        animacion = requestAnimationFrame(paso)
        return
      }

      const alto = caja.offsetHeight - window.innerHeight
      const bruto = alto <= 0 ? 0 : -caja.getBoundingClientRect().top / alto
      objetivo = Math.min(1, Math.max(0, bruto))

      // Persecución exponencial. 0.085 es el punto donde se nota el peso sin
      // que llegue a sentirse que la página va con retraso.
      suave += (objetivo - suave) * 0.085
      if (Math.abs(objetivo - suave) < 0.0002) suave = objetivo

      const x = -suave * recorrido
      rail.style.transform = `translate3d(${x}px, 0, 0)`

      // Parallax y enfoque, panel a panel.
      const centroVentana = window.innerWidth * FOCO
      const paneles = rail.querySelectorAll<HTMLElement>('[data-panel]')
      let masCentrado = 0
      let menorDistancia = Infinity

      paneles.forEach((panel, i) => {
        const caja = panel.getBoundingClientRect()
        const centro = caja.left + caja.width / 2
        const desvio = (centro - centroVentana) / window.innerWidth

        const distancia = Math.abs(desvio)
        if (distancia < menorDistancia) {
          menorDistancia = distancia
          masCentrado = i
        }

        const foto = panel.querySelector<HTMLElement>('[data-parallax]')
        if (foto) {
          // La foto va a contracorriente: se mueve un 14% de lo que se mueve
          // el panel, en sentido opuesto. Ahí está la profundidad.
          foto.style.transform = `translate3d(${desvio * 14}%, 0, 0) scale(1.18)`
        }

        // Al pasar por el centro el panel se levanta; a los lados se apaga.
        const cerca = Math.max(0, 1 - distancia * 1.7)
        panel.style.opacity = String(0.42 + cerca * 0.58)
        panel.style.transform = `scale(${0.94 + cerca * 0.06})`
      })

      setAvance(suave)
      // El panel de cierre también entra en el foco y el parallax, pero no
      // es un curso: el contador no debe llegar a decir «04 — 03».
      setActual(Math.min(masCentrado, total - 1))

      animacion = requestAnimationFrame(paso)
    }

    medir()
    animacion = requestAnimationFrame(paso)
    window.addEventListener('resize', medir)
    return () => {
      vivo = false
      cancelAnimationFrame(animacion)
      window.removeEventListener('resize', medir)
    }
  }, [anclado, total])

  if (!anclado) {
    return (
      <div
        role="region"
        aria-label={etiqueta}
        tabIndex={0}
        style={{
          // El anclaje del snap tiene que coincidir con el margen lateral, o
          // cada tarjeta se para pegada al borde en vez de alineada.
          scrollPaddingLeft: '1.25rem',
          scrollPaddingRight: '1.25rem',
          // Sin esto, seguir deslizando al llegar al último curso dispara el
          // gesto de «atrás» del navegador y el visitante pierde la página.
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
        className="sin-barra flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:gap-8 md:px-10"
      >
        {children}
      </div>
    )
  }

  return (
    <div ref={marco} style={{ height: altura ? `${altura}px` : '100vh' }} className="relative">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div ref={pista} className="flex items-center gap-[6vw] pl-[8vw] will-change-transform">
          {children}
        </div>

        {/* Contador y barra. Sin ellos, una página que deja de bajar se lee
            como que se ha colgado. */}
        <div className="pointer-events-none absolute inset-x-[8vw] bottom-10 flex items-center gap-6">
          <span className="cifra text-[0.8125rem] tracking-[0.18em] opacity-70">
            {String(actual + 1).padStart(2, '0')} — {String(total).padStart(2, '0')}
          </span>
          <div className="h-px flex-1 bg-current/20">
            <div
              className="h-[2px] origin-left bg-[var(--color-acento)]"
              style={{ transform: `scaleX(${avance})` }}
            />
          </div>
          <span className="text-[0.75rem] uppercase tracking-[0.2em] opacity-45">
            Sigue bajando
          </span>
        </div>
      </div>
    </div>
  )
}
