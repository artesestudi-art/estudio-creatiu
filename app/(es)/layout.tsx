import Cascara, { metadatosRaiz } from '@/components/Cascara'

/**
 * Layout raíz de la web en castellano. El `<html>` entero lo pinta `Cascara`,
 * compartida con `app/(ca)`: ahí está explicado por qué hay dos.
 *
 * El grupo `(es)` no aparece en ninguna URL: la portada sigue siendo `/`.
 */
export const metadata = metadatosRaiz('es')

export default function LayoutCastellano({ children }: { children: React.ReactNode }) {
  return <Cascara idioma="es">{children}</Cascara>
}
