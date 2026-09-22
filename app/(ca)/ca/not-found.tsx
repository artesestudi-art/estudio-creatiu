import Pagina404 from '@/components/Pagina404'

/** El 404 de las rutas catalanas. Sin este archivo, `/ca/cursos/inventat`
 *  caía en el 404 de fábrica de Next, en inglés. */
export default function NoTrobada() {
  return <Pagina404 idioma="ca" />
}
