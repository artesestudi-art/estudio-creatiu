import Pagina404 from '@/components/Pagina404'

/** El 404 de las rutas castellanas: un curso retirado, una dirección mal
 *  escrita. Va dentro del layout de `app/(es)`, que ya pinta el `<html>`. */
export default function NoEncontrada() {
  return <Pagina404 idioma="es" />
}
