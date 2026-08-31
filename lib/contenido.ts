import { leerContenido, guardarContenido } from './bd'
import { PRINCIPAL, type Idioma } from './idioma'

/**
 * Contenido editable de la portada.
 *
 * Vive en la tabla `contenidos` (una fila por sección, valor JSON) para que el
 * cliente lo cambie desde el panel sin desplegar nada, tal como promete el
 * presupuesto.
 *
 * ⚠️ Los valores por defecto están VACÍOS a propósito. La tentación es rellenar
 * la maqueta con «Más de 500 alumnos formados» y tres testimonios firmados con
 * nombre y apellido para que quede bonita en la demo; ese relleno acaba en
 * producción y el cliente termina publicando alumnos que no existen. Aquí, si
 * una sección está vacía, sencillamente NO SE PINTA.
 */

export type Punto = { titulo: string; texto: string }
export type Paso = { titulo: string; texto: string }
export type Profesor = { nombre: string; rol: string; bio: string; foto: string }
export type Testimonio = { texto: string; autor: string; curso: string }
export type Pregunta = { pregunta: string; respuesta: string }
/** Lo que no es un curso con matrícula: cumpleaños, empresas, un día suelto. */
export type Taller = { titulo: string; texto: string; precio: string }
export type Imagen = { url: string; alt: string }

export type Contenido = {
  hero: {
    antetitulo: string
    titular: string
    entradilla: string
    cta: string
    imagen: string
    imagenAlt: string
  }
  sobre: {
    titulo: string
    texto: string
    imagen: string
    imagenAlt: string
    puntos: Punto[]
  }
  cursos: { titulo: string; entradilla: string }
  talleres: { titulo: string; entradilla: string; lista: Taller[] }
  metodo: { titulo: string; entradilla: string; pasos: Paso[] }
  profesorado: { titulo: string; entradilla: string; personas: Profesor[] }
  galeria: { titulo: string; entradilla: string; imagenes: Imagen[] }
  testimonios: { titulo: string; opiniones: Testimonio[] }
  faq: { titulo: string; preguntas: Pregunta[] }
  contacto: { titulo: string; entradilla: string }
  newsletter: { titulo: string; entradilla: string }
}

export const CONTENIDO_VACIO: Contenido = {
  hero: { antetitulo: '', titular: '', entradilla: '', cta: '', imagen: '', imagenAlt: '' },
  sobre: { titulo: '', texto: '', imagen: '', imagenAlt: '', puntos: [] },
  cursos: { titulo: '', entradilla: '' },
  talleres: { titulo: '', entradilla: '', lista: [] },
  metodo: { titulo: '', entradilla: '', pasos: [] },
  profesorado: { titulo: '', entradilla: '', personas: [] },
  galeria: { titulo: '', entradilla: '', imagenes: [] },
  testimonios: { titulo: '', opiniones: [] },
  faq: { titulo: '', preguntas: [] },
  contacto: { titulo: '', entradilla: '' },
  newsletter: { titulo: '', entradilla: '' },
}

/** `portada` para el castellano, `portada-ca` para el catalán. */
export function clave(idioma: Idioma): string {
  return idioma === PRINCIPAL ? 'portada' : `portada-${idioma}`
}

/**
 * Rellena los huecos de la traducción con el castellano, campo a campo.
 *
 * No sirve con «si no hay catalán, usa el castellano entero»: el estudio puede
 * tener traducido el titular y no las preguntas frecuentes, y entonces la
 * portada catalana saldría con el titular en castellano por culpa de una FAQ
 * sin traducir.
 */
function conRespaldo<T extends Record<string, unknown>>(traducido: Partial<T>, base: T): T {
  const salida = { ...base }
  for (const campo of Object.keys(base) as (keyof T)[]) {
    const valor = traducido?.[campo]
    const vacio =
      valor === undefined ||
      valor === null ||
      (typeof valor === 'string' && !valor.trim()) ||
      (Array.isArray(valor) && valor.length === 0)
    if (!vacio) salida[campo] = valor as T[keyof T]
  }
  return salida
}

/**
 * Mezcla lo guardado con la forma vacía. Si mañana se añade una sección nueva
 * al tipo, las webs ya guardadas no revientan: la sección llega vacía y no se
 * pinta hasta que el cliente la rellene.
 */
export async function cargarContenido(idioma: Idioma = PRINCIPAL): Promise<Contenido> {
  const base = await leerContenido<Partial<Contenido>>('portada', {})

  const guardado =
    idioma === PRINCIPAL
      ? base
      : await (async () => {
          const t = await leerContenido<Partial<Contenido>>(clave(idioma), {})
          const mezcla: Partial<Contenido> = {}
          for (const seccion of Object.keys(CONTENIDO_VACIO) as (keyof Contenido)[]) {
            mezcla[seccion] = conRespaldo(
              (t[seccion] ?? {}) as Record<string, unknown>,
              { ...CONTENIDO_VACIO[seccion], ...base[seccion] } as Record<string, unknown>,
            ) as never
          }
          return mezcla
        })()

  return {
    hero: { ...CONTENIDO_VACIO.hero, ...guardado.hero },
    sobre: { ...CONTENIDO_VACIO.sobre, ...guardado.sobre },
    cursos: { ...CONTENIDO_VACIO.cursos, ...guardado.cursos },
    talleres: { ...CONTENIDO_VACIO.talleres, ...guardado.talleres },
    metodo: { ...CONTENIDO_VACIO.metodo, ...guardado.metodo },
    profesorado: { ...CONTENIDO_VACIO.profesorado, ...guardado.profesorado },
    galeria: { ...CONTENIDO_VACIO.galeria, ...guardado.galeria },
    testimonios: { ...CONTENIDO_VACIO.testimonios, ...guardado.testimonios },
    faq: { ...CONTENIDO_VACIO.faq, ...guardado.faq },
    contacto: { ...CONTENIDO_VACIO.contacto, ...guardado.contacto },
    newsletter: { ...CONTENIDO_VACIO.newsletter, ...guardado.newsletter },
  }
}

export async function guardarPortada(contenido: Contenido, idioma: Idioma = PRINCIPAL): Promise<void> {
  await guardarContenido(clave(idioma), contenido)
}

/** Lo guardado en un idioma SIN respaldo: es lo que se edita en el panel. */
export async function cargarContenidoCrudo(idioma: Idioma): Promise<Contenido> {
  const guardado = await leerContenido<Partial<Contenido>>(clave(idioma), {})
  const salida = {} as Contenido
  for (const seccion of Object.keys(CONTENIDO_VACIO) as (keyof Contenido)[]) {
    salida[seccion] = { ...CONTENIDO_VACIO[seccion], ...guardado[seccion] } as never
  }
  return salida
}

/** ¿Tiene esta sección algo que enseñar? Si no, la portada se la salta. */
export function hayAlgo(valor: unknown): boolean {
  if (typeof valor === 'string') return valor.trim().length > 0
  if (Array.isArray(valor)) return valor.length > 0
  if (valor && typeof valor === 'object') return Object.values(valor).some(hayAlgo)
  return false
}

/**
 * ¿Hay portada escrita en este idioma?
 *
 * Se mira lo GUARDADO, sin el respaldo del castellano: `cargarContenido` cae
 * al principal cuando falta la traducción, y para esto justamente hace falta
 * saber si falta.
 *
 * De aquí depende que la URL catalana se le ofrezca a Google o no. Una `/ca`
 * que repite el castellano palabra por palabra es contenido duplicado: dos
 * direcciones peleándose por la misma búsqueda. Los cursos ya seguían esta
 * regla (`tieneCatalan`); la portada se colaba.
 */
export async function hayTraduccion(idioma: Idioma): Promise<boolean> {
  if (idioma === PRINCIPAL) return true
  try {
    return hayAlgo(await cargarContenidoCrudo(idioma))
  } catch {
    // Sin base no se puede afirmar que haya traducción, y ante la duda no se
    // publica una alternativa que quizá no exista.
    return false
  }
}
