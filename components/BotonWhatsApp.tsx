'use client'

import { useEffect, useRef, useState } from 'react'
import { textos, type Idioma } from '@/lib/idioma'

/**
 * Botón flotante de WhatsApp con mensaje ya escrito.
 *
 * ⚠️ El motivo de que este componente sea largo: **un flotante mal hecho tapa
 * los campos del formulario**. Ya ha pasado en otras webs del grupo. Aquí se
 * quita solo en los tres momentos en que estorba:
 *
 *  1. Cuando el formulario está en pantalla. Ahí ya hay un botón de enviar; el
 *     flotante solo puede tapar el último campo o el propio botón.
 *  2. Cuando hay un campo enfocado. En el móvil eso significa teclado abierto,
 *     y el flotante se queda justo encima de lo que se está escribiendo.
 *  3. Mientras no se ha bajado nada. Aparecer encima del titular de portada es
 *     de web de plantilla.
 *
 * Además abre un panel para elegir CURSO antes de saltar a WhatsApp: un
 * «Hola» sin contexto obliga al estudio a preguntar de qué va, y media
 * conversación se pierde ahí.
 */

export type CursoWhatsApp = { id: number; titulo: string }

export default function BotonWhatsApp({
  numero,
  cursos,
  idioma,
  cursoActual,
}: {
  /** En formato internacional sin signos: 34600111222. */
  numero: string
  cursos: CursoWhatsApp[]
  idioma: Idioma
  /** En la página de un curso se pregunta directamente por ese. */
  cursoActual?: string
}) {
  const t = textos(idioma)
  const [abierto, setAbierto] = useState(false)
  const [visible, setVisible] = useState(false)
  const [tapando, setTapando] = useState(false)
  const [escribiendo, setEscribiendo] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const flotante = useRef<HTMLDivElement>(null)

  /* ── 3. No aparecer hasta que se ha bajado un poco ── */
  useEffect(() => {
    const alRodar = () => setVisible(window.scrollY > window.innerHeight * 0.55)
    alRodar()
    window.addEventListener('scroll', alRodar, { passive: true })
    return () => window.removeEventListener('scroll', alRodar)
  }, [])

  /**
   * ── 1. Esconderse cuando debajo del botón hay algo que se pulsa ──
   *
   * Se mira QUÉ HAY DEBAJO, no en qué sección estamos. Una lista de secciones
   * («escóndete en #inscripcion») se queda vieja en cuanto se añade una página
   * o se mueve un formulario, y el fallo vuelve sin avisar.
   *
   * Cinco puntos del círculo con `elementsFromPoint` dentro de un `rAF`: es de
   * coste constante y no recorre el árbol. Los enlaces de navegación NO
   * cuentan; si contaran, el botón parpadearía al pasar por delante de cada
   * tarjeta, que es peor que la enfermedad.
   */
  useEffect(() => {
    let pedido = 0
    let posado = 0

    const ESTORBAN = 'input, select, textarea, button, [role="button"], a[href^="tel:"], a[href^="mailto:"]'

    const medir = () => {
      pedido = 0
      const caja = flotante.current
      if (!caja) return

      // Si ya está escondido, no se mide: si no, seguiría diciendo «tapa» para
      // siempre y parecería que el arreglo no funciona.
      if (getComputedStyle(caja).opacity === '0') return

      const c = caja.getBoundingClientRect()
      const puntos: [number, number][] = [
        [c.left + c.width / 2, c.top + c.height / 2],
        [c.left + 4, c.top + 4],
        [c.right - 4, c.top + 4],
        [c.left + 4, c.bottom - 4],
        [c.right - 4, c.bottom - 4],
      ]

      const estorba = puntos.some(([x, y]) =>
        document
          .elementsFromPoint(x, y)
          .filter((el) => !caja.contains(el))
          .some((el) => el.matches?.(ESTORBAN) || el.closest?.(ESTORBAN)),
      )
      setTapando(estorba)
    }

    const alMoverse = () => {
      if (!pedido) pedido = requestAnimationFrame(medir)
      // Segunda medida AL POSARSE: los revelados siguen moviendo contenido
      // bajo el botón después del último evento de scroll.
      clearTimeout(posado)
      posado = window.setTimeout(medir, 450)
    }

    medir()
    window.addEventListener('scroll', alMoverse, { passive: true })
    window.addEventListener('resize', alMoverse)
    return () => {
      window.removeEventListener('scroll', alMoverse)
      window.removeEventListener('resize', alMoverse)
      if (pedido) cancelAnimationFrame(pedido)
      clearTimeout(posado)
    }
  }, [visible])

  /* Cerrar el panel con Escape o al tocar fuera. */
  useEffect(() => {
    if (!abierto) return
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    const fuera = (e: MouseEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) setAbierto(false)
    }
    window.addEventListener('keydown', tecla)
    // En el siguiente ciclo: si no, el propio clic que abre lo cierra.
    const id = setTimeout(() => document.addEventListener('click', fuera), 0)
    return () => {
      window.removeEventListener('keydown', tecla)
      clearTimeout(id)
      document.removeEventListener('click', fuera)
    }
  }, [abierto])

  // El orden importa: primero se decide si se enseña, y solo entonces se mide
  // lo que hay debajo. Medir un botón ya invisible da siempre «tapa».
  const enseñar = visible && !tapando && !escribiendo

  useEffect(() => {
    if (!enseñar) setAbierto(false)
  }, [enseñar])

  function enlace(mensaje: string): string {
    // `wa.me` y no `api.whatsapp.com`: es el enlace oficial corto y el que
    // abre la aplicación en el móvil en vez de pasar por el navegador.
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
  }

  // En la página de un curso no hace falta preguntar: ya sabemos cuál es.
  const directo = cursoActual ? enlace(t.mensajeCurso(cursoActual)) : null

  return (
    <div
      ref={(nodo) => {
        panel.current = nodo
        flotante.current = nodo
      }}
      // `inert` además de quitar los eventos: sin él, el tabulador se para en
      // un botón que no se ve y quien navega con teclado se queda encallado.
      inert={!enseñar}
      style={{
        right: 'max(1.25rem, env(safe-area-inset-right))',
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom))',
      }}
      className={`fixed z-[45] flex flex-col items-end gap-3 transition-all duration-300 ${
        enseñar
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      {abierto && !directo && (
        <div
          role="dialog"
          aria-label={t.sobreQueCurso}
          className="w-[min(20rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-[var(--color-linea)] bg-[var(--color-papel)] shadow-[0_18px_50px_-12px_rgba(20,72,139,0.35)]"
        >
          <p className="border-b border-[var(--color-linea)] px-5 py-4 text-[0.9375rem] font-medium">
            {t.sobreQueCurso}
          </p>
          <ul className="max-h-[50vh] overflow-y-auto overscroll-contain">
            {cursos.map((c) => (
              <li key={c.id}>
                <a
                  href={enlace(t.mensajeCurso(c.titulo))}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setAbierto(false)}
                  className="flex min-h-12 items-center border-b border-[var(--color-linea)] px-5 py-3 text-[0.9375rem] transition-colors hover:bg-[var(--color-papel-2)]"
                >
                  {c.titulo}
                </a>
              </li>
            ))}
            <li>
              <a
                href={enlace(t.mensajeGeneral)}
                target="_blank"
                rel="noreferrer"
                onClick={() => setAbierto(false)}
                className="flex min-h-12 items-center px-5 py-3 text-[0.9375rem] opacity-65 transition-colors hover:bg-[var(--color-papel-2)]"
              >
                {t.consultaGeneral}
              </a>
            </li>
          </ul>
        </div>
      )}

      {directo ? (
        <a
          href={directo}
          target="_blank"
          rel="noreferrer"
          aria-label={t.escribirPorWhatsApp}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(20,72,139,0.5)] transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <Icono />
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-label={abierto ? t.cerrar : t.escribirPorWhatsApp}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(20,72,139,0.5)] transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          {abierto ? <Aspa /> : <Icono />}
        </button>
      )}
    </div>
  )
}

function Icono() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.896 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.549 4.14 1.595 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.585 0 11.946-5.359 11.949-11.945a11.87 11.87 0 00-3.421-8.4" />
    </svg>
  )
}

function Aspa() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
