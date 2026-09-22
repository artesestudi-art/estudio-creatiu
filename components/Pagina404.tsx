import Link from 'next/link'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Formas from '@/components/Formas'
import Revelar from '@/components/Revelar'
import { ESTUDIO, real } from '@/data/estudio'
import { prefijo, textos, type Idioma } from '@/lib/idioma'

/**
 * El 404, con la misma cara que la portada.
 *
 * Antes era un bloque de texto centrado en una página desnuda: ni cabecera ni
 * pie, así que quien llegaba de un curso retirado se quedaba encerrado con dos
 * botones. Ahora lleva la navegación, el selector de idioma, el pie con los
 * datos del estudio, y la rueda de color y la estrella de la marca en el mismo
 * sitio que en la portada: se lee como una página del estudio, no como un
 * error del servidor.
 *
 * ⛔ **Sin base de datos, a propósito.** Un 404 tiene que pintarse aunque Neon
 * esté dormida ([[feedback_neon_duerme_y_el_primer_intento_falla]]), y
 * `app/global-not-found.tsx` se sirve sin pasar por ningún layout. Por eso el
 * menú es el mínimo que existe siempre —los cursos y el contacto— en vez de
 * calcularse desde el panel como en la portada.
 *
 * ⚠️ `Revelar` no es adorno: los elementos con `revela` nacen en opacidad 0 y
 * los enciende él. Sin este componente, el 404 se serviría en blanco.
 *
 * Lo usan los tres: `app/(es)/not-found.tsx`, `app/(ca)/ca/not-found.tsx` y el
 * global. Los textos salen de `lib/idioma.ts`, donde estaban en las dos
 * lenguas desde el principio.
 */
export default function Pagina404({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const p = prefijo(idioma)
  const nombre = real(ESTUDIO.nombre) ?? 'Estudio'

  const enlaces = [
    { href: `${p}/#cursos`, texto: t.cursos },
    { href: `${p}/#contacto`, texto: t.contacto },
  ]

  /* El cambio de idioma lleva a la portada de la otra lengua: la dirección que
     falla no tiene equivalente, que justamente no existe. */
  const equivalente = { es: '/', ca: '/ca' }

  return (
    <>
      <Revelar />
      <Cabecera
        nombre={nombre}
        enlaces={enlaces}
        telefono={real(ESTUDIO.contacto.telefono)}
        idioma={idioma}
        equivalente={equivalente}
      />

      <main id="contenido">
        <section className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-[var(--color-papel)] pb-14 pt-32 md:pb-20">
          <Formas />

          <div className="contenedor relative z-10">
            <p className="t-etiqueta revela mb-7">Error 404</p>

            <h1
              className="t-gigante revela max-w-[13ch]"
              style={{ '--retraso': '40ms' } as React.CSSProperties}
            >
              {t.errorTitulo}
            </h1>

            <div className="mt-14 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p
                className="t-cuerpo revela max-w-[46ch]"
                style={{ '--retraso': '140ms' } as React.CSSProperties}
              >
                {t.errorTexto}
              </p>

              <div
                className="revela flex shrink-0 flex-wrap gap-3"
                style={{ '--retraso': '220ms' } as React.CSSProperties}
              >
                <Link href={`${p}/#cursos`} className="boton boton-principal">
                  {t.verLosCursos}
                </Link>
                {/* `boton-linea` y no `boton-suave`: esa clase no existe en la
                    hoja de estilos y el botón salía sin vestir. */}
                <Link href={p || '/'} className="boton boton-linea">
                  {t.irALaPortada}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Pie enlaces={enlaces} idioma={idioma} equivalente={equivalente} />
    </>
  )
}
