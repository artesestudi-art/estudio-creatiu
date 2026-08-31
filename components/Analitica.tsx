'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ESTUDIO } from '@/data/estudio'
import { textos, type Idioma } from '@/lib/idioma'

/**
 * Medición de visitas con consentimiento, y el cartel que lo pide.
 *
 * Las dos cosas viven en el mismo fichero porque son la misma decisión: aquí
 * NO se carga Google hasta que alguien dice que sí, y por eso el cartel no
 * puede ser un adorno que se cierra con la X. Cargar la analítica antes de
 * preguntar —o darla por aceptada al seguir navegando— es justo lo que
 * sanciona la Agencia Española de Protección de Datos.
 *
 * Si `ESTUDIO.analitica.ga4` está vacío no se pinta nada y no hay cartel: una
 * web sin analítica no necesita pedir permiso para nada, y enseñar un cartel
 * de cookies que no gestiona ninguna cookie es engañar al visitante.
 *
 * La elección se guarda en `localStorage` y no en una cookie a propósito:
 * así la propia gestión del consentimiento no crea el problema que gestiona.
 */

const CLAVE = 'artes-analitica'

type Eleccion = 'si' | 'no' | null

function leer(): Eleccion {
  try {
    const valor = localStorage.getItem(CLAVE)
    return valor === 'si' || valor === 'no' ? valor : null
  } catch {
    // Navegación privada o almacenamiento bloqueado: se trata como si no
    // hubiera contestado nunca. Nunca como un sí.
    return null
  }
}

function guardar(eleccion: Exclude<Eleccion, null>) {
  try {
    localStorage.setItem(CLAVE, eleccion)
  } catch {
    // Si no se puede guardar, la elección vale para esta visita y se le
    // volverá a preguntar. Es el lado seguro del fallo.
  }
}

export default function Analitica() {
  const ruta = usePathname()
  const idioma: Idioma = ruta?.startsWith('/ca') ? 'ca' : 'es'
  const t = textos(idioma)
  const medida = ESTUDIO.analitica.ga4.trim()

  // `null` mientras no se ha leído el almacenamiento: en el primer render del
  // servidor no existe, y pintar el cartel para esconderlo un instante después
  // es un parpadeo en cada carga de página.
  const [eleccion, setEleccion] = useState<Eleccion | 'sin-leer'>('sin-leer')

  useEffect(() => {
    setEleccion(leer())
  }, [])

  /**
   * Mientras el cartel está abierto, el flotante de WhatsApp se aparta.
   *
   * Los dos viven pegados a la esquina de abajo y en un móvil el cartel ocupa
   * el ancho entero: el botón se queda debajo, asomando y sin poder pulsarse.
   * Es el mismo error de siempre —un flotante tapando lo que hay que tocar—,
   * sólo que aquí lo que tapa es la respuesta al consentimiento.
   */
  useEffect(() => {
    const pendiente = Boolean(medida) && eleccion === null
    if (pendiente) document.body.dataset.consentimiento = 'pendiente'
    else delete document.body.dataset.consentimiento
    return () => {
      delete document.body.dataset.consentimiento
    }
  }, [medida, eleccion])

  if (!medida) return null

  function decidir(valor: Exclude<Eleccion, null>) {
    guardar(valor)
    setEleccion(valor)
  }

  return (
    <>
      {eleccion === 'si' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${medida}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','${medida}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {eleccion === null && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label={t.cookiesTitulo}
          className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-[38rem] border border-[var(--color-linea-fuerte)] bg-[var(--color-papel)] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.18)] sm:inset-x-auto sm:left-6 sm:bottom-6"
        >
          <p className="t-etiqueta mb-2">{t.cookiesTitulo}</p>
          <p className="text-[0.9375rem] leading-relaxed">
            {t.cookiesTexto}{' '}
            <a
              href={`${idioma === 'ca' ? '/ca' : ''}/privacidad`}
              className="enlace-linea underline underline-offset-2"
            >
              {t.politicaDePrivacidad}
            </a>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button type="button" onClick={() => decidir('si')} className="boton boton-principal">
              {t.cookiesAceptar}
            </button>
            <button type="button" onClick={() => decidir('no')} className="boton">
              {t.cookiesRechazar}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
