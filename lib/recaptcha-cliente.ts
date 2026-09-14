/**
 * reCAPTCHA v3 en el navegador, cargado SOLO al pulsar enviar.
 *
 * No va en el layout a propósito. Cargarlo en cada página pone a Google a
 * mirar a todo el que entra a leer un curso, y eso ya obligaría a meterlo en
 * el cartel de cookies. Cargado al enviar, aparece cuando alguien decide
 * escribir al estudio, que es cuando la protección contra el abuso tiene
 * sentido y base legal (interés legítimo, no consentimiento).
 *
 * Si algo falla —bloqueador, red, Google caído— devuelve `undefined` y el
 * formulario se envía igual, sin token. El servidor lo marca como «sin
 * verificar», pero la inscripción NO se pierde.
 *
 * Sin `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` todo esto está apagado y no se carga
 * nada. ⚠️ Es `NEXT_PUBLIC_`: se incrusta al COMPILAR, así que después de
 * ponerla en Vercel hay que volver a desplegar.
 */

import { startTransition } from 'react'

const CLAVE = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

/** Para enseñar la atribución que Google exige a cambio de esconder el sello.
 *  Se puede importar también desde el servidor (las páginas legales). */
export const recaptchaActivo = Boolean(CLAVE)

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (clave: string, opciones: { action: string }) => Promise<string>
    }
  }
}

let cargando: Promise<boolean> | null = null

function cargar(): Promise<boolean> {
  if (!CLAVE) return Promise.resolve(false)
  if (window.grecaptcha) return Promise.resolve(true)
  // Una sola carga aunque se pulse enviar tres veces.
  if (cargando) return cargando

  cargando = new Promise<boolean>((resolver) => {
    const s = document.createElement('script')
    s.src = `https://www.google.com/recaptcha/api.js?render=${CLAVE}`
    s.async = true
    s.onload = () => resolver(true)
    s.onerror = () => {
      // Si falla, que el siguiente intento vuelva a probar.
      cargando = null
      resolver(false)
    }
    document.head.appendChild(s)
    // A los ocho segundos se sigue sin él: mejor una inscripción marcada «sin
    // verificar» que un botón de enviar que no responde.
    setTimeout(() => resolver(Boolean(window.grecaptcha)), 8000)
  })
  return cargando
}

export async function tokenRecaptcha(accion: string): Promise<string | undefined> {
  try {
    if (!CLAVE || !(await cargar())) return undefined
    const g = window.grecaptcha
    if (!g) return undefined
    await new Promise<void>((r) => g.ready(() => r()))
    // `execute` puede quedarse colgado si Google no contesta: se le pone techo.
    return await Promise.race([
      g.execute(CLAVE, { action: accion }),
      new Promise<undefined>((r) => setTimeout(() => r(undefined), 8000)),
    ])
  } catch {
    // Nunca se propaga: que reCAPTCHA falle no puede impedir un envío.
    return undefined
  }
}

/**
 * Envuelve la acción de un formulario para añadirle el token antes de enviar.
 *
 * Mientras se pide el token el formulario ya cuenta como «enviando»: React
 * trata la función de `action` como una transición, así que el botón se
 * desactiva desde el primer clic y no se manda dos veces.
 *
 * ⚠️ El `startTransition` no sobra: después de un `await` React ya no sabe que
 * sigue dentro de la transición del formulario, y llamar ahí a la función de
 * `useActionState` suelta un error en consola y deja de actualizar el estado
 * de «pendiente».
 */
export function conRecaptcha(accion: (datos: FormData) => void, nombre: string) {
  return async (datos: FormData) => {
    const token = await tokenRecaptcha(nombre)
    if (token) datos.set('recaptcha', token)
    startTransition(() => accion(datos))
  }
}
