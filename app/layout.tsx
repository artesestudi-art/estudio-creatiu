import type { Metadata } from 'next'
import { Jost, Geist } from 'next/font/google'
import Analitica from '@/components/Analitica'
import { ESTUDIO } from '@/data/estudio'
import './globals.css'

/**
 * Jost para los titulares: es la familia del propio logotipo.
 *
 * «ESPAI CREATIU» está escrito en una geométrica de la escuela de Futura, y
 * Jost es justo eso. Así la web habla con la segunda voz de la marca y el SVG
 * del logotipo se queda con la manuscrita, en vez de meter una tercera voz.
 * Antes había una Fraunces —serif editorial— que no salía de ningún sitio del
 * kit del cliente.
 */
const display = Jost({
  subsets: ['latin'],
  variable: '--tipo-display',
  display: 'swap',
})

/**
 * Geist y no Inter a propósito: Inter está en tantas webs generadas que se ha
 * convertido en la firma de «esto lo ha hecho una IA». Geist tiene el mismo
 * rigor y algo de carácter propio.
 */
const texto = Geist({
  subsets: ['latin'],
  variable: '--tipo-texto',
  display: 'swap',
})

const url = ESTUDIO.url === 'PENDIENTE' ? 'http://localhost:3000' : ESTUDIO.url

// Mientras no haya nombre real, el título no puede escupir «PENDIENTE»: es
// lo que vería el cliente en la pestaña del navegador durante la demo.
const marca = ESTUDIO.nombre === 'PENDIENTE' ? 'Estudio' : ESTUDIO.nombre

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default:
      ESTUDIO.titular === 'PENDIENTE' ? marca : `${marca} · ${ESTUDIO.titular}`,
    template: `%s · ${marca}`,
  },
  description: ESTUDIO.descripcion === 'PENDIENTE' ? undefined : ESTUDIO.descripcion,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: marca,
    url: '/',
  },
  // Sin datos reales todavía: mejor que Google no indexe una web con
  // «PENDIENTE» en el título que tener que pedir su retirada después.
  robots: ESTUDIO.dominio === 'PENDIENTE' ? { index: false, follow: false } : undefined,
}

/**
 * Modo de consentimiento de Google (Consent Mode v2), en el `<head>` y ANTES
 * que cualquier otra cosa.
 *
 * Es la diferencia entre no cargar Google hasta que alguien acepte —que era lo
 * que hacíamos— y cargarlo siempre con el permiso NEGADO por defecto. Con el
 * permiso negado, Google no escribe ni lee ninguna cookie y no identifica a
 * nadie: solo manda un aviso anónimo de que alguien ha pasado por la página.
 * Al aceptar, el permiso se actualiza a `granted` y entonces sí mide como
 * siempre. Y la etiqueta existe desde el primer momento, que es lo que Google
 * busca cuando dice «no se ha detectado su etiqueta».
 *
 * Tiene que ir en un `<script>` normal del layout —no en `next/script`— porque
 * debe ejecutarse antes que `gtag.js`, y el layout se pinta en el servidor:
 * así llega en el HTML y el navegador lo ejecuta primero.
 *
 * `wait_for_update: 500` le dice a Google que espere medio segundo por si la
 * respuesta llega enseguida, para no mandar el aviso anónimo y luego otro.
 */
const CONSENTIMIENTO_POR_DEFECTO = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
gtag('set','url_passthrough',true);gtag('set','ads_data_redaction',true);`

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable}`}>
      <head>
        {ESTUDIO.analitica.ga4.trim() ? (
          <script dangerouslySetInnerHTML={{ __html: CONSENTIMIENTO_POR_DEFECTO }} />
        ) : null}
      </head>
      {/* `grano` pinta la textura fija sobre toda la web. */}
      <body className="grano">
        {/* Salto al contenido: sin esto, quien navega con teclado tiene que
            tabular por todo el menú en cada página. */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[var(--color-tinta)] focus:px-5 focus:py-3 focus:text-[var(--color-papel)]"
        >
          Saltar al contenido
        </a>
        {children}
        <Analitica />
      </body>
    </html>
  )
}
