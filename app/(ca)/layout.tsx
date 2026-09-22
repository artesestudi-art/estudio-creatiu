import Cascara, { metadatosRaiz } from '@/components/Cascara'

/**
 * Layout raíz de la web en catalán, para que `<html lang>` diga `ca-ES` en las
 * páginas de `/ca`. Antes lo heredaban todo de un layout único con `lang="es"`
 * escrito a mano.
 *
 * El grupo `(ca)` no aparece en ninguna URL: las páginas siguen colgando de
 * `/ca`, que es la carpeta de dentro.
 */
export const metadata = metadatosRaiz('ca')

export default function LayoutCatalan({ children }: { children: React.ReactNode }) {
  return <Cascara idioma="ca">{children}</Cascara>
}
