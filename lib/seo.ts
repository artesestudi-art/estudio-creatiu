import type { Metadata } from 'next'
import { CODIGO, IDIOMAS, PRINCIPAL, prefijo, type Idioma } from './idioma'
import { ESTUDIO, real } from '@/data/estudio'

/**
 * Enlaces alternos entre idiomas.
 *
 * Sin `hreflang`, Google ve `/` y `/ca` como dos páginas que dicen lo mismo y
 * se queda con una: la otra desaparece de los resultados. Con él entiende que
 * son la misma página en dos lenguas y enseña la que toca según quién busque.
 *
 * `x-default` apunta al castellano, que es el principal.
 */
export function alternos(rutas: Partial<Record<Idioma, string>>): Metadata['alternates'] {
  const idiomas: Record<string, string> = {}
  for (const idioma of IDIOMAS) {
    const ruta = rutas[idioma]
    if (ruta) idiomas[CODIGO[idioma]] = ruta
  }
  if (rutas[PRINCIPAL]) idiomas['x-default'] = rutas[PRINCIPAL]

  return {
    canonical: rutas[PRINCIPAL] ?? '/',
    languages: idiomas,
  }
}

/** Igual que `alternos`, pero con el canónico del idioma que se está sirviendo. */
export function alternosDe(
  idioma: Idioma,
  rutas: Partial<Record<Idioma, string>>,
): Metadata['alternates'] {
  const base = alternos(rutas)
  return { ...base, canonical: rutas[idioma] ?? (prefijo(idioma) || '/') }
}

/** Datos estructurados del estudio. Solo se declara lo que es real. */
export function schemaEstudio(idioma: Idioma): Record<string, unknown> {
  const url = real(ESTUDIO.url)
  const calle = real(ESTUDIO.direccion.calle)
  const lat = real(ESTUDIO.direccion.latitud)
  const lon = real(ESTUDIO.direccion.longitud)

  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: real(ESTUDIO.nombre) ?? undefined,
    url: url ? `${url}${prefijo(idioma)}` : undefined,
    inLanguage: CODIGO[idioma],
    ...(real(ESTUDIO.descripcion) ? { description: ESTUDIO.descripcion } : {}),
    ...(real(ESTUDIO.contacto.telefonoE164)
      ? { telephone: ESTUDIO.contacto.telefonoE164 }
      : {}),
    ...(real(ESTUDIO.contacto.email) ? { email: ESTUDIO.contacto.email } : {}),
    ...(calle
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: calle,
            postalCode: real(ESTUDIO.direccion.codigoPostal) ?? undefined,
            addressLocality: real(ESTUDIO.direccion.localidad) ?? undefined,
            addressRegion: real(ESTUDIO.direccion.provincia) ?? undefined,
            addressCountry: ESTUDIO.direccion.pais,
          },
        }
      : {}),
    // Las coordenadas solo si son reales: un punto inventado manda a la gente
    // a la puerta equivocada.
    ...(lat && lon
      ? { geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lon } }
      : {}),
    ...(real(ESTUDIO.horario.schema) ? { openingHours: ESTUDIO.horario.schema } : {}),
    sameAs: [real(ESTUDIO.redes.instagram), real(ESTUDIO.redes.facebook)].filter(Boolean),
  }
}
