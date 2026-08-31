import Image from 'next/image'
import Link from 'next/link'
import { convocatoriasDeVarios, cursosPublicados, ocupacionPorConvocatoria } from '@/lib/bd'
import { cargarContenido, hayAlgo } from '@/lib/contenido'
import { euros } from '@/lib/texto'
import { CODIGO, PRINCIPAL, prefijo, textos, type Idioma } from '@/lib/idioma'
import { cursoEn, convocatoriaEn, slugEn } from '@/lib/traduccion'
import { ESTUDIO, horarioEn, real } from '@/data/estudio'
import Cabecera from '@/components/Cabecera'
import Pie from '@/components/Pie'
import Revelar from '@/components/Revelar'
import ScrollHorizontal from '@/components/ScrollHorizontal'
import FormularioInscripcion, { type CursoElegible } from '@/components/FormularioInscripcion'
import FormularioContacto from '@/components/FormularioContacto'
import Newsletter from '@/components/Newsletter'
import BotonWhatsApp from '@/components/BotonWhatsApp'
import Disciplinas from '@/components/Disciplinas'
import Estrellas from '@/components/Estrellas'

/**
 * Las cuatro manchas del kit de marca, en rotación por ficha de curso.
 *
 * Es el marco de la foto, y se ve entero mientras el curso no tenga imagen.
 * Antes era un negro cálido suelto (`#1c1712`) heredado de la maqueta: sobre
 * el marino de la sección leía como un agujero. El velo negro que lleva debajo
 * el título sigue ahí, así que el texto blanco se lee igual sobre cualquiera
 * de los cuatro.
 */
/**
 * Los colores del kit, para lo que es adorno: los números de los pasos, el
 * marco de las fichas. Nunca para texto que haya que leer — [[globals.css]]
 * explica por qué: ninguno llega a 4,5:1 sobre el crema.
 */
const COLORES_MARCA = [
  'var(--color-marca-terracota)',
  'var(--color-marca-mostaza)',
  'var(--color-marca-malva)',
  'var(--color-marca-azul)',
  'var(--color-marca-salmon)',
]

const MANCHAS = [
  'var(--color-marca-mostaza)',
  'var(--color-marca-malva)',
  'var(--color-marca-azul)',
  'var(--color-marca-salmon)',
]

/**
 * Portada, compartida por los dos idiomas.
 *
 * Una sola página con navegación por scroll, como marca el encargo. Los cursos
 * SÍ tienen página propia (`/cursos/<slug>`): una one-page estricta deja sin
 * URL a lo único que la gente busca en Google, y sin URL no hay posicionamiento.
 *
 * Cada sección se pinta solo si tiene contenido. Un bloque con un título y
 * nada debajo se ve peor que no tener el bloque.
 */

export default async function Portada({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const raiz = prefijo(idioma) || '/'

  const MODALIDAD: Record<string, string> = {
    presencial: t.presencial,
    online: t.online,
    mixto: t.mixto,
  }

  const [contenido, todos] = await Promise.all([cargarContenido(idioma), cursosPublicados()])
  const cursos = todos.map((c) => cursoEn(c, idioma))
  const [convocatoriasBase, ocupacion] = await Promise.all([
    convocatoriasDeVarios(cursos.map((c) => c.id)),
    ocupacionPorConvocatoria(),
  ])
  const convocatorias = Object.fromEntries(
    Object.entries(convocatoriasBase).map(([id, lista]) => [
      id,
      lista.map((v) => convocatoriaEn(v, idioma)),
    ]),
  )

  const nombre = real(ESTUDIO.nombre) ?? 'Estudio'

  const hay = {
    sobre: hayAlgo(contenido.sobre),
    cursos: cursos.length > 0,
    metodo: contenido.metodo.pasos.length > 0,
    profesorado: contenido.profesorado.personas.length > 0,
    galeria: contenido.galeria.imagenes.length > 0,
    testimonios: contenido.testimonios.opiniones.length > 0,
    faq: contenido.faq.preguntas.length > 0,
  }

  const p = prefijo(idioma)
  const enlaces = [
    hay.sobre && { href: `${p}/#estudio`, texto: t.elEstudio },
    hay.cursos && { href: `${p}/#cursos`, texto: t.cursos },
    hay.metodo && { href: `${p}/#como-funciona`, texto: t.comoFunciona },
    hay.profesorado && { href: `${p}/#profesorado`, texto: t.profesorado },
    { href: `${p}/#contacto`, texto: t.contacto },
  ].filter(Boolean) as { href: string; texto: string }[]

  const elegibles: CursoElegible[] = cursos.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    convocatorias: (convocatorias[c.id] ?? [])
      .filter((v) => v.estado !== 'cerrada')
      .map((v) => ({
        id: v.id,
        texto: [v.etiqueta, v.horario].filter(Boolean).join(' · ') || 'Grupo sin nombre',
        completa:
          v.estado === 'completa' || (v.plazas !== null && v.plazas - (ocupacion[v.id] ?? 0) <= 0),
      })),
  }))

  // Las disciplinas salen de los cursos REALES que imparte el estudio, no
  // de una lista decorativa: si mañana deja de dar acuarela, deja de aparecer.
  const disciplinas = [...new Set(cursos.map((c) => c.disciplina).filter(Boolean) as string[])]

  return (
    /**
     * El `lang` va aquí y no en el `<html>` porque en Next solo el layout raíz
     * pinta esa etiqueta, y hacerla variar por ruta obliga a leer cabeceras,
     * lo que volvería dinámica toda la web y se llevaría por delante el
     * cacheado de las páginas. En un contenedor es HTML válido y los lectores
     * de pantalla lo respetan igual.
     */
    <div lang={idioma === PRINCIPAL ? undefined : CODIGO[idioma]}>
      <Revelar />
      <Cabecera
        nombre={nombre}
        enlaces={enlaces}
        telefono={real(ESTUDIO.contacto.telefono)}
        idioma={idioma}
        invertida={!contenido.hero.imagen}
      />

      <main id="contenido">
        {/* ════════════ Portada ════════════ */}
        <section className="portada en-tinta relative flex min-h-[100dvh] flex-col justify-end overflow-hidden pb-12 pt-32 md:pb-16">
          {contenido.hero.imagen && (
            <>
              <Image
                src={contenido.hero.imagen}
                alt={contenido.hero.imagenAlt || ''}
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-tinta)] via-[var(--color-tinta)]/45 to-transparent" />
            </>
          )}

          <div className="contenedor relative">
            {contenido.hero.antetitulo && (
              <p className="t-etiqueta revela mb-8">{contenido.hero.antetitulo}</p>
            )}

            <h1 className="t-gigante revela" style={{ '--retraso': '80ms' } as React.CSSProperties}>
              {contenido.hero.titular || nombre}
            </h1>

            <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              {contenido.hero.entradilla && (
                <p
                  className="t-cuerpo revela"
                  style={{ '--retraso': '180ms' } as React.CSSProperties}
                >
                  {contenido.hero.entradilla}
                </p>
              )}

              <div
                className="revela flex shrink-0 flex-wrap gap-3"
                style={{ '--retraso': '260ms' } as React.CSSProperties}
              >
                <Link
                  href={hay.cursos ? `${p}/#cursos` : `${p}/#inscripcion`}
                  className="boton boton-principal"
                >
                  {contenido.hero.cta || t.verLosCursos}
                </Link>
                <Link href={`${p}/#inscripcion`} className="boton boton-linea border-white/25">
                  {t.pedirPlaza}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ Disciplinas ════════════ */}
        <Disciplinas palabras={disciplinas} />

        {/* ════════════ El estudio ════════════ */}
        {hay.sobre && (
          <section id="estudio" className="seccion relative">
            <Estrellas
              estrellas={[
                { y: '6%', x: '4%', tam: 34, color: 'var(--color-marca-mostaza)', deriva: 70 },
                { y: '78%', x: '46%', tam: 22, color: 'var(--color-marca-rosa)', variante: 2, deriva: -50 },
                { y: '58%', x: '13%', tam: 46, color: 'var(--color-marca-azul-claro)', deriva: -90 },
              ]}
            />
            <div className="contenedor relative z-10">
              <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-10">
                <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
                  <p className="t-etiqueta revela mb-6">01 — {t.elEstudio}</p>
                  {contenido.sobre.titulo && (
                    <h2
                      className="t-grande revela"
                      style={{ '--retraso': '60ms' } as React.CSSProperties}
                    >
                      {contenido.sobre.titulo}
                    </h2>
                  )}
                </div>

                <div className="lg:col-span-6 lg:col-start-7">
                  {contenido.sobre.texto && (
                    <div className="space-y-5">
                      {contenido.sobre.texto.split(/\n\s*\n/).map((parrafo, i) => (
                        <p
                          key={i}
                          className="t-cuerpo revela"
                          style={{ '--retraso': `${i * 90}ms` } as React.CSSProperties}
                        >
                          {parrafo}
                        </p>
                      ))}
                    </div>
                  )}

                  {contenido.sobre.imagen && (
                    // Se sale del contenedor por la derecha: rompe la caja y da
                    // profundidad sin necesidad de sombras.
                    <div className="revela relative mt-14 aspect-4/3 overflow-hidden lg:-mr-24">
                      <Image
                        src={contenido.sobre.imagen}
                        alt={contenido.sobre.imagenAlt || ''}
                        fill
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  {contenido.sobre.puntos.length > 0 && (
                    <dl className="mt-16 grid gap-x-10 gap-y-10 sm:grid-cols-2">
                      {contenido.sobre.puntos.map((p, i) => (
                        <div
                          key={i}
                          className="revela border-t border-[var(--color-linea)] pt-5"
                          style={{ '--retraso': `${i * 80}ms` } as React.CSSProperties}
                        >
                          <dt className="mb-2 text-[1.0625rem] font-medium">{p.titulo}</dt>
                          <dd className="text-[0.95rem] leading-relaxed text-[var(--color-tinta-60)]">
                            {p.texto}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════════════ Cursos, en horizontal ════════════ */}
        {hay.cursos && (
          <section id="cursos" className="en-tinta pt-24 md:pt-36">
            <div className="contenedor mb-16 md:mb-24">
              <p className="t-etiqueta revela mb-6">02 — {t.cursos}</p>
              <div className="grid gap-8 lg:grid-cols-12">
                <h2 className="t-grande revela lg:col-span-7">
                  {contenido.cursos.titulo || t.cursos}
                </h2>
                {contenido.cursos.entradilla && (
                  <p
                    className="t-cuerpo revela lg:col-span-5 lg:self-end"
                    style={{ '--retraso': '90ms' } as React.CSSProperties}
                  >
                    {contenido.cursos.entradilla}
                  </p>
                )}
              </div>
            </div>

            <ScrollHorizontal etiqueta={t.cursosDelEstudio} total={cursos.length}>
              {cursos.map((c, i) => {
                const suyas = convocatorias[c.id] ?? []
                const abierta = suyas.find(
                  (v) =>
                    v.estado === 'abierta' &&
                    (v.plazas === null || v.plazas - (ocupacion[v.id] ?? 0) > 0),
                )
                const precio = c.precio_texto || euros(c.precio_centimos)

                return (
                  <article
                    key={c.id}
                    data-panel
                    className="group relative shrink-0 snap-start will-change-transform w-[84vw] sm:w-[62vw] lg:h-[76vh] lg:w-[46vw] lg:max-w-[42rem]"
                  >
                    <Link href={`${p}/cursos/${c.slug}`} className="flex h-full flex-col">
                      {/* La foto sangra y se recorta: el marco es la ventana,
                          la imagen se mueve por detrás. */}
                      <div
                        className="relative aspect-3/4 overflow-hidden lg:aspect-auto lg:min-h-0 lg:flex-1"
                        style={{ background: MANCHAS[i % MANCHAS.length] }}
                      >
                        {c.imagen ? (
                          <div data-parallax className="absolute inset-0 will-change-transform">
                            <Image
                              src={c.imagen}
                              alt={c.imagen_alt || ''}
                              fill
                              sizes="(min-width: 1024px) 46vw, 84vw"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            data-parallax
                            className="absolute inset-0 flex items-end will-change-transform"
                          >
                            {/* Sin foto, el hueco lo llena el número del curso
                                a tamaño de póster. Mejor eso que un icono roto. */}
                            <span className="t-hueca font-[family-name:var(--font-display)] text-[26vh] leading-[0.75] tracking-[-0.04em] pl-[3vw] pb-[2vh]">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                          </div>
                        )}

                        {/* Velo inferior para que el título se lea sobre
                            cualquier foto, clara u oscura. */}
                        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />

                        <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
                          <p className="t-etiqueta mb-3 !text-white/65">
                            {[c.disciplina, MODALIDAD[c.modalidad]].filter(Boolean).join(' · ')}
                          </p>
                          <h3 className="t-grande !text-[clamp(1.7rem,3.1vw,2.9rem)] text-white">
                            {c.titulo}
                          </h3>
                        </div>

                        <span className="cifra absolute right-6 top-6 text-[0.75rem] tracking-[0.2em] text-white/70">
                          {String(i + 1).padStart(2, '0')} / {String(cursos.length).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="shrink-0 pt-6">
                        {c.resumen && (
                          <p className="mb-5 max-w-[38em] text-[0.95rem] leading-relaxed opacity-65">
                            {c.resumen}
                          </p>
                        )}
                        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-current/15 pt-5">
                          {precio && <span className="cifra text-[1.2rem]">{precio}</span>}
                          {c.duracion && <span className="text-[0.875rem] opacity-55">{c.duracion}</span>}
                          {abierta && (
                            <span className="ml-auto text-[0.875rem] text-[var(--color-acento)]">
                              {t.plazasAbiertas}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              })}

              {/* Panel de cierre. Sin él, el recorrido termina en medio
                  pantallazo de aire muerto justo cuando alguien acaba de ver
                  los tres cursos: el mejor momento para pedir plaza. */}
              <article
                data-panel
                key="cierre"
                className="group relative flex shrink-0 snap-start flex-col justify-center will-change-transform w-[84vw] sm:w-[62vw] lg:h-[76vh] lg:w-[34vw]"
              >
                <p className="t-etiqueta mb-6">{t.finDelCatalogo}</p>
                <p className="t-grande !text-[clamp(1.9rem,3.4vw,3.2rem)] mb-8">
                  {t.teHasQuedado}
                </p>
                <p className="t-cuerpo mb-10 !text-[1rem]">
                  {t.rellenaYConfirmamos}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href={`${p}/#inscripcion`} className="boton boton-principal">
                    {t.pedirPlaza}
                  </Link>
                  {real(ESTUDIO.contacto.telefono) && (
                    <a
                      href={`tel:${real(ESTUDIO.contacto.telefonoE164) ?? ''}`}
                      className="boton boton-linea border-white/25"
                    >
                      {t.llamar}
                    </a>
                  )}
                </div>
              </article>
            </ScrollHorizontal>

            <div className="contenedor pb-24 pt-8 md:pb-32 md:pt-14">
              <p className="flex items-center gap-2 text-[0.875rem] opacity-45 lg:hidden">
                <span aria-hidden>→</span>
                {t.deslizaParaVer(cursos.length)}
              </p>
            </div>
          </section>
        )}

        {/* ════════════ Cómo funciona ════════════ */}
        {hay.metodo && (
          <section id="como-funciona" className="seccion relative">
            <Estrellas
              estrellas={[
                { y: '10%', x: '90%', tam: 40, color: 'var(--color-marca-malva)', deriva: 80 },
                { y: '64%', x: '3%', tam: 26, color: 'var(--color-marca-mostaza)', variante: 2, deriva: -70 },
              ]}
            />
            <div className="contenedor relative z-10">
              <p className="t-etiqueta revela mb-6">03 — {t.comoFunciona}</p>
              <div className="mb-16 grid gap-8 lg:grid-cols-12 md:mb-24">
                <h2 className="t-grande revela lg:col-span-6">
                  {contenido.metodo.titulo || t.comoFunciona}
                </h2>
                {contenido.metodo.entradilla && (
                  <p className="t-cuerpo revela lg:col-span-5 lg:col-start-8 lg:self-end">
                    {contenido.metodo.entradilla}
                  </p>
                )}
              </div>

              <ol className="border-t border-[var(--color-linea)]">
                {contenido.metodo.pasos.map((p, i) => (
                  <li
                    key={i}
                    className="revela grid items-baseline gap-x-10 gap-y-3 border-b border-[var(--color-linea)] py-8 md:grid-cols-12 md:py-11"
                    style={{ '--retraso': `${i * 90}ms` } as React.CSSProperties}
                  >
                    {/* Cada paso, un color del logotipo. El número es puro
                        contorno, así que el color va de adorno y el texto que
                        hay que leer sigue en marino. */}
                    <span
                      className="t-grande t-hueca t-hueca-marca cifra md:col-span-2 !text-[3.5rem] md:!text-[4.5rem]"
                      style={
                        { '--color-hueco': COLORES_MARCA[i % COLORES_MARCA.length] } as React.CSSProperties
                      }
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="t-media md:col-span-4">{p.titulo}</h3>
                    <p className="text-[1rem] leading-relaxed text-[var(--color-tinta-60)] md:col-span-6">
                      {p.texto}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ════════════ Profesorado ════════════ */}
        {hay.profesorado && (
          <section id="profesorado" className="seccion relative bg-[var(--color-papel-2)]">
            <Estrellas
              estrellas={[
                { y: '12%', x: '86%', tam: 30, color: 'var(--color-marca-salmon)', deriva: 60 },
                { y: '70%', x: '6%', tam: 38, color: 'var(--color-marca-azul)', deriva: -60 },
              ]}
            />
            <div className="contenedor relative z-10">
              <p className="t-etiqueta revela mb-6">04 — {t.profesorado}</p>
              <div className="mb-16 grid gap-8 lg:grid-cols-12">
                <h2 className="t-grande revela lg:col-span-7">
                  {contenido.profesorado.titulo || t.quienDaLasClases}
                </h2>
                {contenido.profesorado.entradilla && (
                  <p className="t-cuerpo revela lg:col-span-5 lg:self-end">
                    {contenido.profesorado.entradilla}
                  </p>
                )}
              </div>

              <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {contenido.profesorado.personas.map((p, i) => (
                  <article
                    key={i}
                    className="revela"
                    // Escalonado en diagonal: las de la fila de abajo bajan un
                    // poco más, para que la rejilla no se lea como una tabla.
                    style={
                      {
                        '--retraso': `${i * 90}ms`,
                        marginTop: i % 3 === 1 ? '2.5rem' : undefined,
                      } as React.CSSProperties
                    }
                  >
                    {p.foto && (
                      <div className="relative mb-6 aspect-4/5 overflow-hidden">
                        <Image
                          src={p.foto}
                          alt={p.nombre}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="t-media">{p.nombre}</h3>
                    {p.rol && <p className="t-etiqueta mt-2">{p.rol}</p>}
                    {p.bio && (
                      <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--color-tinta-60)]">
                        {p.bio}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ════════════ Galería ════════════ */}
        {hay.galeria && (
          <section id="galeria" className="seccion">
            <div className="contenedor">
              <p className="t-etiqueta revela mb-6">05 — {t.elTaller}</p>
              <h2 className="t-grande revela mb-16 max-w-3xl">
                {contenido.galeria.titulo || t.elTallerPorDentro}
              </h2>

              {/* Columnas de mampostería: las fotos conservan su proporción en
                  vez de recortarse todas al mismo cuadrado. */}
              <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
                {contenido.galeria.imagenes.map((img, i) => (
                  <div
                    key={i}
                    className="revela mb-5 break-inside-avoid overflow-hidden"
                    style={{ '--retraso': `${(i % 3) * 90}ms` } as React.CSSProperties}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || ''}
                      width={800}
                      height={i % 3 === 0 ? 1000 : 600}
                      sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ════════════ Testimonios ════════════ */}
        {hay.testimonios && (
          <section className="seccion bg-[var(--color-papel-2)]">
            <div className="contenedor">
              <h2 className="t-grande revela mb-16 max-w-3xl">
                {contenido.testimonios.titulo || t.loQueCuentan}
              </h2>
              <div className="columns-1 gap-8 md:columns-2 lg:columns-3">
                {contenido.testimonios.opiniones.map((o, i) => (
                  <figure
                    key={i}
                    className="revela mb-8 break-inside-avoid border-t border-[var(--color-linea-fuerte)] pt-6"
                    style={{ '--retraso': `${(i % 3) * 90}ms` } as React.CSSProperties}
                  >
                    <blockquote className="text-[1.15rem] leading-relaxed">«{o.texto}»</blockquote>
                    <figcaption className="mt-5 text-[0.875rem] text-[var(--color-tinta-60)]">
                      <span className="font-medium text-[var(--color-tinta)]">{o.autor}</span>
                      {o.curso && ` · ${o.curso}`}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ════════════ Inscripción ════════════ */}
        <section id="inscripcion" className="en-tinta seccion">
          <div className="contenedor grid gap-y-16 lg:grid-cols-12 lg:gap-x-16">
            <div className="lg:col-span-5">
              <p className="t-etiqueta revela mb-6">06 — {t.pedirPlaza}</p>
              <h2 className="t-grande revela">{t.pideTuPlaza}</h2>
              <p className="t-cuerpo revela mt-8">
                {t.rellenaYConfirmamos}
              </p>

              {real(ESTUDIO.contacto.telefono) && (
                <p className="revela mt-10 text-[1.05rem]">
                  {t.prefieresHablarlo}{' '}
                  <a
                    href={`tel:${real(ESTUDIO.contacto.telefonoE164) ?? ''}`}
                    className="enlace-linea font-medium"
                  >
                    {ESTUDIO.contacto.telefono}
                  </a>
                </p>
              )}
            </div>

            <div className="revela lg:col-span-6 lg:col-start-7">
              <FormularioInscripcion cursos={elegibles} origen={raiz} idioma={idioma} />
            </div>
          </div>
        </section>

        {/* ════════════ Preguntas ════════════ */}
        {hay.faq && (
          <section id="preguntas" className="seccion relative">
            <Estrellas
              estrellas={[
                { y: '16%', x: '92%', tam: 24, color: 'var(--color-marca-terracota)', variante: 2, deriva: 70 },
                { y: '76%', x: '2%', tam: 34, color: 'var(--color-marca-rosa)', deriva: -55 },
              ]}
            />
            <div className="contenedor relative z-10">
              <p className="t-etiqueta revela mb-6">07 — {t.preguntasFrecuentes}</p>
              <h2 className="t-grande revela mb-16 max-w-3xl">
                {contenido.faq.titulo || t.preguntasFrecuentes}
              </h2>

              {/* Todas las respuestas a la vista, sin acordeón: quien duda si
                  hace falta saber dibujar no va a abrir seis pestañas para
                  encontrarlo, y Google indexa lo que está desplegado. */}
              <div className="grid gap-x-16 gap-y-12 md:grid-cols-2">
                {contenido.faq.preguntas.map((p, i) => (
                  <div
                    key={i}
                    className="revela"
                    style={{ '--retraso': `${(i % 2) * 90}ms` } as React.CSSProperties}
                  >
                    <h3 className="mb-3 flex gap-4 text-[1.15rem] font-medium">
                      <span className="cifra t-etiqueta mt-1.5 shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {p.pregunta}
                    </h3>
                    <p className="pl-9 text-[1rem] leading-relaxed text-[var(--color-tinta-60)]">
                      {p.respuesta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ════════════ Contacto ════════════ */}
        <section id="contacto" className="seccion relative bg-[var(--color-papel-2)]">
          <Estrellas
            estrellas={[
              { y: '14%', x: '4%', tam: 42, color: 'var(--color-marca-mostaza)', deriva: 75 },
              { y: '72%', x: '40%', tam: 26, color: 'var(--color-marca-malva)', variante: 2, deriva: -65 },
            ]}
          />
          <div className="contenedor relative z-10 grid gap-y-16 lg:grid-cols-12 lg:gap-x-16">
            <div className="lg:col-span-5">
              <p className="t-etiqueta revela mb-6">08 — {t.contacto}</p>
              <h2 className="t-grande revela">{contenido.contacto.titulo || t.hablamos}</h2>
              {contenido.contacto.entradilla && (
                <p className="t-cuerpo revela mt-8">{contenido.contacto.entradilla}</p>
              )}

              <dl className="revela mt-12 space-y-7">
                {real(ESTUDIO.contacto.telefono) && (
                  <div>
                    <dt className="t-etiqueta mb-1.5">{t.telefono}</dt>
                    <dd className="text-[1.15rem]">
                      <a
                        href={`tel:${real(ESTUDIO.contacto.telefonoE164) ?? ''}`}
                        className="enlace-linea"
                      >
                        {ESTUDIO.contacto.telefono}
                      </a>
                    </dd>
                  </div>
                )}
                {real(ESTUDIO.contacto.email) && (
                  <div>
                    <dt className="t-etiqueta mb-1.5">{t.correo}</dt>
                    <dd className="text-[1.15rem]">
                      <a href={`mailto:${ESTUDIO.contacto.email}`} className="enlace-linea">
                        {ESTUDIO.contacto.email}
                      </a>
                    </dd>
                  </div>
                )}
                {real(ESTUDIO.direccion.calle) && (
                  <div>
                    <dt className="t-etiqueta mb-1.5">{t.elTaller}</dt>
                    <dd className="text-[1.15rem] leading-relaxed">
                      {ESTUDIO.direccion.calle}
                      <br />
                      {[real(ESTUDIO.direccion.codigoPostal), real(ESTUDIO.direccion.localidad)]
                        .filter(Boolean)
                        .join(' ')}
                    </dd>
                  </div>
                )}
                {real(horarioEn(idioma)) && (
                  <div>
                    <dt className="t-etiqueta mb-1.5">{t.horario}</dt>
                    <dd className="text-[1.15rem]">{horarioEn(idioma)}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="revela lg:col-span-6 lg:col-start-7">
              <FormularioContacto origen={raiz} idioma={idioma} />
            </div>
          </div>
        </section>

        {/* ════════════ Newsletter ════════════ */}
        {hayAlgo(contenido.newsletter) && (
          <section className="seccion !py-20 md:!py-24">
            <div className="contenedor grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-6">
                <h2 className="t-media revela">{contenido.newsletter.titulo}</h2>
                {contenido.newsletter.entradilla && (
                  <p className="t-cuerpo revela mt-4">{contenido.newsletter.entradilla}</p>
                )}
              </div>
              <div className="revela lg:col-span-5 lg:col-start-8">
                <Newsletter origen={raiz} idioma={idioma} />
              </div>
            </div>
          </section>
        )}
      </main>

      <Pie enlaces={enlaces} idioma={idioma} />

      {/* Solo si hay número real: un flotante que abre un chat con un número
          inventado es peor que no tenerlo. */}
      {real(ESTUDIO.contacto.whatsapp) && (
        <BotonWhatsApp
          numero={ESTUDIO.contacto.whatsapp.replace(/\D/g, '')}
          cursos={cursos.map((c) => ({ id: c.id, titulo: c.titulo }))}
          idioma={idioma}
        />
      )}
    </div>
  )
}
