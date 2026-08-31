import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  convocatoriasDe,
  cursoPorSlug,
  cursoPorSlugCatalan,
  cursosPublicados,
  ocupacionPorConvocatoria,
} from '@/lib/bd'
import { cargarContenido } from '@/lib/contenido'
import { euros, lineas } from '@/lib/texto'
import { CODIGO, PRINCIPAL, prefijo, textos, type Idioma } from '@/lib/idioma'
import { convocatoriaEn, cursoEn, slugEn } from '@/lib/traduccion'
import { ESTUDIO, real } from '@/data/estudio'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import JsonLd from '@/components/JsonLd'
import Revelar from '@/components/Revelar'
import FormularioInscripcion, { type CursoElegible } from '@/components/FormularioInscripcion'
import BotonWhatsApp from '@/components/BotonWhatsApp'

/**
 * Página de un curso, compartida por los dos idiomas.
 *
 * Es la que trae alumnos de Google: nadie busca el nombre del estudio, busca
 * «curs de ceràmica a Artés». Por eso cada idioma tiene su URL, su título y su
 * schema, y no es un ancla dentro de la portada.
 */

const MODALIDAD_SCHEMA: Record<string, string> = {
  presencial: 'Onsite',
  online: 'Online',
  mixto: 'Blended',
}

export async function buscarCurso(slug: string, idioma: Idioma) {
  const base = idioma === 'ca' ? await cursoPorSlugCatalan(slug) : await cursoPorSlug(slug)
  if (!base || !base.publicado) return null
  return base
}

export default async function PaginaCurso({ slug, idioma }: { slug: string; idioma: Idioma }) {
  const t = textos(idioma)
  const p = prefijo(idioma)

  const base = await buscarCurso(slug, idioma)
  if (!base) notFound()
  const curso = cursoEn(base, idioma)

  const MODALIDAD_TEXTO: Record<string, string> = {
    presencial: t.presencial,
    online: t.online,
    mixto: t.mixto,
  }

  const [convocatoriasBase, ocupacion, otrosBase, contenido] = await Promise.all([
    convocatoriasDe(curso.id),
    ocupacionPorConvocatoria(),
    cursosPublicados(),
    cargarContenido(idioma),
  ])
  const convocatorias = convocatoriasBase.map((v) => convocatoriaEn(v, idioma))
  const otros = otrosBase.map((c) => cursoEn(c, idioma))

  const nombre = real(ESTUDIO.nombre) ?? 'Estudio'

  // La navegación se calcula igual que en la portada: si aquí se escribiera a
  // mano, al añadir una sección desde el panel el menú diría una cosa en la
  // portada y otra en el curso.
  const enlaces = [
    contenido.sobre.texto.trim() && { href: `${p}/#estudio`, texto: t.elEstudio },
    { href: `${p}/#cursos`, texto: t.cursos },
    contenido.metodo.pasos.length > 0 && { href: `${p}/#como-funciona`, texto: t.comoFunciona },
    contenido.profesorado.personas.length > 0 && {
      href: `${p}/#profesorado`,
      texto: t.profesorado,
    },
    { href: `${p}/#contacto`, texto: t.contacto },
  ].filter(Boolean) as { href: string; texto: string }[]

  // El equivalente en el otro idioma: el slug cambia, así que no vale con
  // poner o quitar el prefijo.
  const equivalente = {
    es: `/cursos/${slugEn(base, 'es')}`,
    ca: `/ca/cursos/${slugEn(base, 'ca')}`,
  }

  const puntosTemario = lineas(curso.temario)
  const precio = curso.precio_texto || euros(curso.precio_centimos)

  const abiertas = convocatorias
    .filter((v) => v.estado !== 'cerrada')
    .map((v) => ({
      ...v,
      libres: v.plazas === null ? null : v.plazas - (ocupacion[v.id] ?? 0),
    }))

  const elegible: CursoElegible = {
    id: curso.id,
    titulo: curso.titulo,
    convocatorias: abiertas.map((v) => ({
      id: v.id,
      texto: [v.etiqueta, v.horario].filter(Boolean).join(' · ') || 'Grupo sin nombre',
      completa: v.estado === 'completa' || (v.libres !== null && v.libres <= 0),
    })),
  }

  const relacionados = otros.filter((c) => c.id !== curso.id).slice(0, 3)

  // Schema.org del curso. Solo se declara el precio si existe de verdad: una
  // oferta inventada en los datos estructurados es motivo de penalización.
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    inLanguage: idioma === 'ca' ? 'ca-ES' : 'es-ES',
    name: curso.titulo,
    description: curso.seo_descripcion || curso.resumen || undefined,
    provider: {
      '@type': 'EducationalOrganization',
      name: nombre,
      url: real(ESTUDIO.url) || undefined,
    },
    ...(curso.imagen ? { image: curso.imagen } : {}),
    ...(abiertas.length > 0
      ? {
          hasCourseInstance: abiertas.map((v) => ({
            '@type': 'CourseInstance',
            courseMode: MODALIDAD_SCHEMA[v.modalidad ?? curso.modalidad] ?? 'Onsite',
            ...(v.inicio ? { startDate: v.inicio } : {}),
            ...(v.fin ? { endDate: v.fin } : {}),
            ...(curso.precio_centimos !== null
              ? {
                  offers: {
                    '@type': 'Offer',
                    price: (curso.precio_centimos / 100).toFixed(2),
                    priceCurrency: 'EUR',
                    availability:
                      v.libres !== null && v.libres <= 0
                        ? 'https://schema.org/SoldOut'
                        : 'https://schema.org/InStock',
                  },
                }
              : {}),
          })),
        }
      : {}),
  }

  return (
    /**
     * El `lang` va aquí y no en el `<html>` porque en Next solo el layout raíz
     * pinta esa etiqueta, y hacerla variar por ruta obliga a leer cabeceras,
     * lo que volvería dinámica toda la web y se llevaría por delante el
     * cacheado de las páginas. En un contenedor es HTML válido y los lectores
     * de pantalla lo respetan igual.
     */
    <div lang={idioma === PRINCIPAL ? undefined : CODIGO[idioma]}>
      <JsonLd datos={schema} />
      <Revelar />
      {/* `invertida`: la página de curso también arranca sobre fondo tinta, así
          que la cabecera nace en claro. Sin esto el logotipo salía marino sobre
          marino —invisible, sólo se veían las dos estrellas rosas— y «Pedir
          plaza» quedaba en un botón fantasma. */}
      <Cabecera
        nombre={nombre}
        enlaces={enlaces}
        telefono={real(ESTUDIO.contacto.telefono)}
        idioma={idioma}
        equivalente={equivalente}
        invertida
      />

      <main id="contenido">
        {/* ════════════ Cabecera del curso ════════════ */}
        <header className="en-tinta relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
          <div className="contenedor relative">
            <Link
              href={`${p}/#cursos`}
              className="enlace-linea mb-10 -ml-1 inline-flex min-h-11 items-center px-1 text-[0.9rem] opacity-65 hover:opacity-100"
            >
              ← {t.todosLosCursos}
            </Link>

            <p className="t-etiqueta revela mb-7">
              {[curso.disciplina, MODALIDAD_TEXTO[curso.modalidad], curso.nivel]
                .filter(Boolean)
                .join(' · ')}
            </p>

            <h1
              className="t-gigante revela !text-[clamp(2.6rem,8.5vw,7.5rem)]"
              style={{ '--retraso': '60ms' } as React.CSSProperties}
            >
              {curso.titulo}
            </h1>

            {curso.resumen && (
              <p
                className="t-cuerpo revela mt-10 !max-w-[42em] !text-[1.2rem] md:!text-[1.35rem]"
                style={{ '--retraso': '140ms' } as React.CSSProperties}
              >
                {curso.resumen}
              </p>
            )}

            {/* Los datos duros en fila, como una ficha técnica. */}
            <dl className="revela mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/12 pt-10 md:grid-cols-4">
              {precio && <Ficha etiqueta={t.precio} valor={precio} destacado />}
              {curso.duracion && <Ficha etiqueta={t.duracion} valor={curso.duracion} />}
              {curso.horario && <Ficha etiqueta={t.horario} valor={curso.horario} />}
              {curso.plazas !== null && (
                <Ficha etiqueta={t.grupo} valor={t.hastaPersonas(curso.plazas)} />
              )}
              {curso.profesor && <Ficha etiqueta={t.imparte} valor={curso.profesor} />}
            </dl>
          </div>
        </header>

        {curso.imagen && (
          <div className="relative aspect-16/9 w-full md:aspect-[21/9]">
            <Image
              src={curso.imagen}
              alt={curso.imagen_alt || ''}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        {/* ════════════ Cuerpo ════════════ */}
        <div className="contenedor grid gap-y-20 py-20 md:py-28 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-7">
            {curso.descripcion && (
              <div className="space-y-6">
                {curso.descripcion.split(/\n\s*\n/).map((parrafo, i) => (
                  <p
                    key={i}
                    className="t-cuerpo revela !max-w-none"
                    style={{ '--retraso': `${i * 80}ms` } as React.CSSProperties}
                  >
                    {parrafo}
                  </p>
                ))}
              </div>
            )}

            {puntosTemario.length > 0 && (
              <section className="mt-20">
                <p className="t-etiqueta revela mb-8">{t.queVasATrabajar}</p>
                <ol className="border-t border-[var(--color-linea)]">
                  {puntosTemario.map((punto, i) => (
                    <li
                      key={i}
                      className="revela flex items-baseline gap-6 border-b border-[var(--color-linea)] py-5"
                      style={{ '--retraso': `${i * 70}ms` } as React.CSSProperties}
                    >
                      <span className="cifra t-etiqueta shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[1.1rem] leading-snug">{punto}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {abiertas.length > 0 && (
              <section className="mt-20">
                <p className="t-etiqueta revela mb-8">{t.grupos}</p>
                <div className="border-t border-[var(--color-linea)]">
                  {abiertas.map((v, i) => {
                    const completa = v.estado === 'completa' || (v.libres !== null && v.libres <= 0)
                    return (
                      <div
                        key={v.id}
                        className="revela flex flex-wrap items-baseline gap-x-6 gap-y-1.5 border-b border-[var(--color-linea)] py-6"
                        style={{ '--retraso': `${i * 80}ms` } as React.CSSProperties}
                      >
                        <span className="text-[1.15rem] font-medium">{v.etiqueta || t.grupo}</span>
                        {v.inicio && (
                          <time
                            dateTime={v.inicio}
                            className="text-[0.95rem] text-[var(--color-tinta-60)]"
                          >
                            {t.desdeEl}{' '}
                            {new Date(v.inicio).toLocaleDateString(idioma === 'ca' ? 'ca-ES' : 'es-ES', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </time>
                        )}
                        {v.horario && (
                          <span className="text-[0.95rem] text-[var(--color-tinta-60)]">
                            {v.horario}
                          </span>
                        )}
                        <span
                          className={`ml-auto text-[0.9rem] ${
                            completa ? 'text-[var(--color-tinta-40)]' : 'text-[var(--color-acento)]'
                          }`}
                        >
                          {completa
                            ? t.completo
                            : v.libres !== null
                              ? t.plazas(v.libres)
                              : t.plazasAbiertas}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          {/* El formulario acompaña la lectura en pantalla ancha; en móvil cae
              debajo, que es donde se busca después de leerlo todo. */}
          <aside className="lg:col-span-4 lg:col-start-9 lg:sticky lg:top-32 lg:self-start">
            <div className="border-t-2 border-[var(--color-tinta)] pt-8">
              <h2 className="t-media mb-8">{t.pideTuPlaza}</h2>
              <FormularioInscripcion
                cursos={[elegible]}
                cursoFijo={curso.id}
                origen={`${p}/cursos/${curso.slug}`}
                idioma={idioma}
              />
            </div>
          </aside>
        </div>

        {/* ════════════ Otros cursos ════════════ */}
        {relacionados.length > 0 && (
          <section className="seccion bg-[var(--color-papel-2)]">
            <div className="contenedor">
              <h2 className="t-grande revela mb-14">{t.otrosCursos}</h2>
              <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {relacionados.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`${p}/cursos/${c.slug}`}
                    className="group revela border-t border-[var(--color-linea)] pt-6"
                    style={{ '--retraso': `${i * 90}ms` } as React.CSSProperties}
                  >
                    <p className="t-etiqueta mb-3">
                      {[c.disciplina, MODALIDAD_TEXTO[c.modalidad]].filter(Boolean).join(' · ')}
                    </p>
                    <h3 className="t-media transition-colors duration-300 group-hover:text-[var(--color-acento)]">
                      {c.titulo}
                    </h3>
                    {c.resumen && (
                      <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--color-tinta-60)]">
                        {c.resumen}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Pie enlaces={enlaces} idioma={idioma} equivalente={equivalente} />

      {real(ESTUDIO.contacto.whatsapp) && (
        <BotonWhatsApp
          numero={ESTUDIO.contacto.whatsapp.replace(/\D/g, '')}
          cursos={[]}
          idioma={idioma}
          cursoActual={curso.titulo}
        />
      )}
    </div>
  )
}

function Ficha({
  etiqueta,
  valor,
  destacado,
}: {
  etiqueta: string
  valor: string
  destacado?: boolean
}) {
  return (
    <div>
      <dt className="t-etiqueta mb-2">{etiqueta}</dt>
      <dd
        className={
          destacado
            ? 'cifra font-[family-name:var(--font-display)] text-[1.9rem] leading-none'
            : 'text-[1.05rem] leading-snug'
        }
      >
        {valor}
      </dd>
    </div>
  )
}
