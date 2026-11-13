import type { Obra, Profesor } from '@/lib/contenido'
import type { Idioma } from '@/lib/idioma'

/**
 * Foto y trabajos de Jordina (Bünic Handmade), mandados el 13/11/2026.
 *
 * Su ficha —nombre, bio en los dos idiomas, Instagram— vive en la base de
 * producción, que está en el Vercel de la clienta y no se toca desde aquí. Esto
 * solo RELLENA lo que le falta: si la base ya tiene foto u obras, mandan las de
 * la base. Imágenes en `public/obra/`, `ancho`/`alto` = tamaño del fichero.
 */
export const esJordina = (p: { nombre?: string }) => /^jordina\b/i.test((p?.nombre ?? '').trim())

const FOTO = '/obra/jordina.jpg'

const OBRAS: Record<Idioma, Obra[]> = {
  es: [
    { url: '/obra/jordina-ronyonera-malla.jpg', ancho: 900, alto: 1600, alt: 'Riñonera de malla en verde, gris y mostaza con dos cremalleras', pie: 'Riñonera de malla' },
    { url: '/obra/jordina-ronyonera-flors.jpg', ancho: 900, alto: 1600, alt: 'Riñonera marrón abierta, con el forro de tela estampada de flores', pie: 'Riñonera con forro de flores' },
    { url: '/obra/jordina-banderetes-flora.jpg', ancho: 900, alto: 1600, alt: 'Guirnalda de banderines de tela floral con las letras FLORA', pie: 'Guirnalda personalizada' },
    { url: '/obra/jordina-fundes-vichy.jpg', ancho: 900, alto: 1600, alt: 'Fundas de tela de cuadros vichy en azul, verde, granate y marrón, con botón', pie: 'Fundas de cuadros vichy' },
  ],
  ca: [
    { url: '/obra/jordina-ronyonera-malla.jpg', ancho: 900, alto: 1600, alt: 'Ronyonera de malla en verd, gris i mostassa amb dues cremalleres', pie: 'Ronyonera de malla' },
    { url: '/obra/jordina-ronyonera-flors.jpg', ancho: 900, alto: 1600, alt: 'Ronyonera marró oberta, amb el folre de roba estampada de flors', pie: 'Ronyonera amb folre de flors' },
    { url: '/obra/jordina-banderetes-flora.jpg', ancho: 900, alto: 1600, alt: 'Garlanda de banderetes de roba floral amb les lletres FLORA', pie: 'Garlanda personalitzada' },
    { url: '/obra/jordina-fundes-vichy.jpg', ancho: 900, alto: 1600, alt: 'Fundes de roba de quadres vichy en blau, verd, granat i marró, amb botó', pie: 'Fundes de quadres vichy' },
  ],
}

export function completarJordina(p: Profesor, idioma: Idioma): Profesor {
  return {
    ...p,
    foto: p.foto || FOTO,
    obras: p.obras?.some((o) => o.url) ? p.obras : OBRAS[idioma],
  }
}
