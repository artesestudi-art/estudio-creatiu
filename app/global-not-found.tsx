import type { Metadata } from 'next'
import Cascara from '@/components/Cascara'
import Pagina404 from '@/components/Pagina404'

/**
 * El 404 de las direcciones que no casan con NINGUNA ruta.
 *
 * ⛔ Hace falta porque la web tiene dos layouts raíz, uno por lengua: sin un
 * único layout del que colgar, Next servía su 404 de fábrica —«404: This page
 * could not be found.», en inglés y en blanco y negro— en vez del nuestro.
 * Es la salida que documenta esta versión de Next para este caso exacto
 * (`experimental.globalNotFound`, en `next.config.ts`).
 *
 * Se pinta SIN pasar por ningún layout, así que la cáscara se trae aquí a mano.
 */
export const metadata: Metadata = {
  title: 'Esta página ya no existe',
  robots: { index: false, follow: true },
}

export default function Global404() {
  return (
    <Cascara idioma="es">
      <Pagina404 idioma="es" />
    </Cascara>
  )
}
