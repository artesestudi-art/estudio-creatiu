import Link from 'next/link'
import { prefijo, textos, type Idioma } from '@/lib/idioma'

/**
 * El cuerpo del 404, sin cáscara y en la lengua que toque.
 *
 * Lo usan tres sitios: los `not-found.tsx` de cada grupo de lengua —que ya van
 * dentro del layout de su grupo— y `app/global-not-found.tsx`, que se pinta
 * SIN layout y se trae el `<html>` por su cuenta.
 *
 * ⚠️ Los textos salen de `lib/idioma.ts`, donde estaban desde el principio en
 * las dos lenguas: el 404 viejo los tenía escritos a mano en castellano y los
 * catalanes no los usaba nadie.
 */
export default function Pagina404({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const raiz = prefijo(idioma) || '/'
  return (
    <main className="contenedor flex min-h-screen max-w-lg flex-col justify-center py-20 text-center">
      <p className="t-etiqueta mb-4">Error 404</p>
      <h1 className="t-grande mb-4">{t.errorTitulo}</h1>
      <p className="t-cuerpo">{t.errorTexto}</p>
      <p className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`${prefijo(idioma)}/#cursos`} className="boton boton-principal">
          {t.verLosCursos}
        </Link>
        <Link href={raiz} className="boton boton-suave">
          {t.irALaPortada}
        </Link>
      </p>
    </main>
  )
}
